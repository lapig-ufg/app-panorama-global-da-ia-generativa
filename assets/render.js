/* ═══════════════════════════════════════════════════════════════
   Panorama Global da IA Generativa — Renderização do SVG
   ═══════════════════════════════════════════════════════════════ */

// Estado global compartilhado com app.js
let GLOBAL_MAX_DIAS = 1220;
let RAW = [];
window.tooltipData = {};

// ─── HELPERS ───
function escapeXml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function fmtPill(dStr) {
  const d = new Date(dStr + 'T00:00:00');
  return `${MESES[d.getMonth()]} '${d.getFullYear().toString().slice(2)}`;
}

function fmtFull(dStr) {
  const d = new Date(dStr + 'T00:00:00');
  return `${d.getDate().toString().padStart(2, '0')} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

// Largura estimada de texto da pílula. Usa medidas aproximadas por caractere,
// dando folga para evitar que o colchete de lanes encoste no vizinho.
function estimatePillWidth(ev) {
  const textPad = 34;           // espaço entre ícone e início do texto
  const textEndPad = 16;        // folga direita interna
  const charW = 7.4;            // média Inter 11.5px com peso bold
  // Adiciona uma pequena folga proporcional ao tamanho do nome
  return Math.max(90, Math.round(textPad + ev.mod.length * charW + textEndPad));
}

// ─── PRÉ-CÁLCULO DO LAYOUT VERTICAL ───
// Retorna, para cada track, o número máximo de lanes usadas e o topo de cada pílula.
function computeTrackLayout(maxDias, pxPerDay) {
  const xOf = (dias) => CONFIG.PAD_L + Math.round(dias * pxPerDay);
  const PILL_H = 32;
  const LANE_STEP = 40;        // distância vertical entre centros das lanes
  const GAP_BETWEEN_PILLS = 10; // espaço horizontal mínimo entre pílulas na mesma lane

  const layout = [];

  LAYOUT_GROUPS.forEach((group, gIdx) => {
    const groupLayout = { tracks: [] };

    group.tracks.forEach(track => {
      // Régua opcional (catch-all): só é desenhada quando tem eventos
      if (track.hideIfEmpty && !(track.events || []).length) return;

      const lanes = []; // lanes[l] = x final (right) da última pílula na lane l
      const events = [];
      let maxLane = 0;

      // Ordena eventos por dia para processar da esquerda para a direita
      const sorted = [...(track.events || [])].sort((a, b) => a.dias - b.dias);

      sorted.forEach((ev, idx) => {
        const x = xOf(ev.dias);
        const w = estimatePillWidth(ev);

        // Encontra uma lane onde a pílula caiba sem encostar na anterior
        let lane = 0;
        for (let l = 0; l < CONFIG.MAX_LANES; l++) {
          if (!lanes[l] || x >= lanes[l] + GAP_BETWEEN_PILLS) {
            lane = l;
            break;
          }
        }
        lanes[lane] = x + w;
        if (lane > maxLane) maxLane = lane;

        // Offset vertical em torno do eixo: lanes ímpares para cima, pares para baixo
        const laneOffset = lane === 0
          ? 0
          : (lane % 2 === 1
              ? -Math.ceil(lane / 2) * LANE_STEP
              : Math.ceil(lane / 2) * LANE_STEP);

        events.push({ ev, idx, x, w, lane, laneOffset });
      });

      // Altura mínima garante espaço para o eixo central + lanes para cima e para baixo
      const lanesUp = Math.ceil(maxLane / 2);
      const lanesDown = Math.floor(maxLane / 2);
      const trackHeight = Math.max(
        CONFIG.MIN_TRACK_H,
        PILL_H + 24 + lanesUp * LANE_STEP + lanesDown * LANE_STEP
      );

      groupLayout.tracks.push({ track, events, trackHeight });
    });

    layout.push(groupLayout);
  });

  return layout;
}

// ─── FUNÇÃO PRINCIPAL DE DESENHO ───
function rebuildV2(customMaxDias, pxPerDay) {
  const maxDias = customMaxDias !== undefined ? customMaxDias : GLOBAL_MAX_DIAS;
  const scale = (pxPerDay !== undefined && !isNaN(pxPerDay)) ? pxPerDay : CONFIG.PX_PER_DAY;
  const usableW = Math.round(maxDias * scale);
  const SVG_W = CONFIG.PAD_L + usableW + CONFIG.PAD_R;
  const xOf = (dias) => CONFIG.PAD_L + Math.round(dias * scale);

  window.tooltipData = {};
  let bgSvg = '', gridSvg = '', elementsSvg = '';

  const HEADER_H = 48;
  const GROUP_TITLE_H = 76;
  const GROUP_GAP = 10;
  const PILL_H = 32;
  const ICON_R = 11;

  // Pré-calcula alturas dinâmicas de cada track
  const layout = computeTrackLayout(maxDias, scale);

  // ─── DEFS: gradientes + filtro de sombra ───
  let defsSvg = `<defs>
    <filter id="pillShadow" x="-20%" y="-50%" width="140%" height="200%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="1.2"/>
      <feOffset dx="0" dy="1.5" result="off"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.18"/></feComponentTransfer>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>`;
  LAYOUT_GROUPS.forEach((g, i) => {
    defsSvg += `<linearGradient id="bg-grad-${i}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${g.bg}" stop-opacity="1"/>
      <stop offset="100%" stop-color="${g.bg}" stop-opacity="0.55"/>
    </linearGradient>`;
  });
  defsSvg += `</defs>`;

  // ─── PASS 1: Backgrounds dos grupos ───
  let currentY = HEADER_H;
  LAYOUT_GROUPS.forEach((g, gIdx) => {
    const groupH = GROUP_TITLE_H + layout[gIdx].tracks.reduce((acc, t) => acc + t.trackHeight, 0) + 16;
    bgSvg += `<rect x="0" y="${currentY}" width="${SVG_W}" height="${groupH}" fill="url(#bg-grad-${gIdx})"/>`;
    currentY += groupH + GROUP_GAP;
  });
  const SVG_H = currentY + 32;

  // ─── PASS 2: Grade temporal refinada ───
  gridSvg += `<g aria-hidden="true">`;
  gridSvg += `<rect x="0" y="0" width="${SVG_W}" height="${HEADER_H}" fill="#fff"/>`;

  const startYear = CONFIG.MARCO.getFullYear();
  const endYear = new Date(CONFIG.MARCO.getTime() + maxDias * 86400000).getFullYear() + 1;

  // Linhas verticais de ano + labels; ticks trimestrais sutis
  let firstYearX = null; // x do primeiro selo de ano desenhado, usado para não colidir com o selo do marco zero
  for (let y = startYear; y <= endYear; y++) {
    const diasAno = Math.round((Date.UTC(y, 0, 1) - CONFIG.MARCO.getTime()) / 86400000);
    if (diasAno >= 0 && diasAno <= maxDias) {
      const x = xOf(diasAno);
      if (firstYearX === null) firstYearX = x;
      // Linha de ano sólida e mais suave
      gridSvg += `<line x1="${x}" y1="${HEADER_H}" x2="${x}" y2="${SVG_H - 30}" stroke="#d6d2c6" stroke-width="1"/>`;
      // Label do ano com destaque
      gridSvg += `<g transform="translate(${x}, 20)">
        <rect x="-22" y="-14" width="44" height="22" rx="11" fill="#f4f2ec"/>
        <text font-family="Inter,sans-serif" font-size="13" font-weight="700" fill="#0c0c0c" text-anchor="middle" letter-spacing="-0.3">${y}</text>
      </g>`;
      gridSvg += `<text x="${x}" y="${SVG_H - 12}" font-family="DM Mono,monospace" font-size="10" font-weight="500" fill="#9b9890" text-anchor="middle" letter-spacing="0.08em">${y}</text>`;

      // Ticks trimestrais sutis
      for (let q = 1; q <= 3; q++) {
        const mes = q * 3;
        const diasQ = Math.round((Date.UTC(y, mes, 1) - CONFIG.MARCO.getTime()) / 86400000);
        if (diasQ > 0 && diasQ <= maxDias) {
          const xq = xOf(diasQ);
          gridSvg += `<line x1="${xq}" y1="${HEADER_H}" x2="${xq}" y2="${SVG_H - 30}" stroke="#e8e4da" stroke-width="1" stroke-dasharray="2,6"/>`;
        }
      }
    }
  }

  // Marco zero — selo sólido "preso" ao poste vertical, como uma bandeirinha na régua.
  // O selo fica colado ao marcador (mesma altura, mesmo eixo), não solto no espaço.
  const marcoDias = 0;
  if (marcoDias <= maxDias) {
    const xMarco = xOf(marcoDias);
    const tickY = 17; // mesma faixa vertical dos selos de ano (centro em y=20)

    // O selo usa o MESMO sistema de tooltip das pílulas (hover/click/teclado/touch).
    // O <title> nativo de SVG era pouco confiável: só aparece com o ponteiro parado
    // por ~1s no desktop e não existe em telas de toque.
    const marcoAria = `Marco zero — ${fmtFull(CONFIG.MARCO.toISOString().slice(0, 10))}, lançamento do ChatGPT`;
    window.tooltipData['marco-zero'] = {
      date: '2022-11-30',
      dias: 0,
      mod: 'ChatGPT',
      emp: 'OpenAI',
      impact: 'Marco zero da régua: o lançamento do ChatGPT em 30/11/2022 deflagrou a corrida global da IA generativa. Todas as distâncias temporais da timeline são contadas a partir deste dia.',
      color: '#10a37f'
    };
    const marcoAttrs = `class="pill-group" data-pill-id="marco-zero" role="button" tabindex="0" aria-label="${escapeXml(marcoAria)}" style="cursor:pointer"`;

    // Poste único, do topo da régua de rótulos até o fim do gráfico — atravessa o selo
    gridSvg += `<line x1="${xMarco}" y1="6" x2="${xMarco}" y2="${SVG_H - 30}" stroke="#10a37f" stroke-width="1" opacity="0.25" stroke-dasharray="2,5"/>`;

    const label = 'MARCO ZERO';
    const pillW = 76;
    const gap = 5; // respiro entre o selo e o poste
    // O selo cresce para a esquerda (para dentro da régua de rótulos) e o marcador fica
    // sobre o poste em x=xMarco; ambos só cabem sem tocar o selo do primeiro ano (raio 22 +
    // margem) quando há pelo menos ~26px de folga. Abaixo disso o selo de "2023" já alcança
    // esse ponto, então não há como desenhar nada ali sem sobrepor — a linha tracejada basta.
    const clearance = firstYearX !== null ? firstYearX - xMarco : Infinity;

    if (clearance >= 26) {
      // Espaço suficiente: selo cheio, encostado no poste como uma bandeira
      gridSvg += `<g ${marcoAttrs}>
        <rect x="${xMarco - gap - pillW}" y="6" width="${pillW}" height="22" rx="11" fill="#0c7a5c"/>
        <text x="${xMarco - gap - pillW / 2}" y="${tickY + 4}" font-family="Inter,sans-serif" font-size="10" font-weight="700" fill="#fff" text-anchor="middle" letter-spacing="0.03em">${label}</text>
        <circle cx="${xMarco}" cy="${tickY}" r="3" fill="#10a37f" stroke="#fff" stroke-width="1.5"/>
      </g>`;
    } else {
      // Zoom extremo: o selo do primeiro ano já cobre esse ponto — evita sobrepor, mantém a área clicável
      gridSvg += `<g ${marcoAttrs}><rect x="${xMarco - 6}" y="6" width="12" height="22" fill="transparent"/></g>`;
    }
  }

  // Sublinha do header
  gridSvg += `<line x1="0" y1="${HEADER_H}" x2="${SVG_W}" y2="${HEADER_H}" stroke="#0c0c0c" stroke-width="1"/>`;
  gridSvg += `</g>`;

  // ─── PASS 3: Conteúdo (grupos + tracks + pílulas) ───
  currentY = HEADER_H;
  LAYOUT_GROUPS.forEach((group, gIdx) => {
    const groupLayout = layout[gIdx];
    const groupHeight = GROUP_TITLE_H + groupLayout.tracks.reduce((acc, t) => acc + t.trackHeight, 0) + 16;

    // Barra de acento regional
    elementsSvg += `<rect x="20" y="${currentY + 14}" width="44" height="3" rx="1.5" fill="${group.accent}"/>`;

    // Bandeira + título do grupo
    let titleX = 20;
    if (group.flag && FLAG_SVG[group.flag]) {
      const flagLabel = group.flag === 'US' ? 'Bandeira dos EUA' : group.flag === 'CN' ? 'Bandeira da China' : 'Mundo';
      elementsSvg += `<g transform="translate(20, ${currentY + 24})" role="img" aria-label="${flagLabel}"><title>${flagLabel}</title>${FLAG_SVG[group.flag]}</g>`;
      titleX = 20 + 30 + 12;
    }
    // Título com halo branco para ficar legível sobre qualquer fundo
    elementsSvg += `<text x="${titleX}" y="${currentY + 41}" font-family="Inter,sans-serif" font-size="17" font-weight="800" fill="#0c0c0c" letter-spacing="0.6" text-transform="uppercase" stroke="white" stroke-width="4" stroke-linejoin="round" paint-order="stroke">${escapeXml(group.title)}</text>`;
    elementsSvg += `<text x="20" y="${currentY + 63}" font-family="Inter,sans-serif" font-size="11" font-weight="500" fill="#444" letter-spacing="0.01em" stroke="white" stroke-width="4" stroke-linejoin="round" paint-order="stroke">${escapeXml(group.subtitle)}</text>`;

    // Linha separadora
    elementsSvg += `<line x1="0" y1="${currentY + GROUP_TITLE_H - 4}" x2="${SVG_W}" y2="${currentY + GROUP_TITLE_H - 4}" stroke="${group.accent}" stroke-width="0.75" opacity="0.30"/>`;

    let trackY = currentY + GROUP_TITLE_H;

    groupLayout.tracks.forEach((trackLayout, tIdx) => {
      const track = trackLayout.track;
      const trackHeight = trackLayout.trackHeight;
      const axisY = trackY + trackHeight / 2;
      const trackColor = COMPANY_COLORS[track.events[0]?.emp] || '#a5a297';

      // Fundo sutil alternado para facilitar leitura horizontal
      if (tIdx % 2 === 1) {
        elementsSvg += `<rect x="0" y="${trackY - 4}" width="${SVG_W}" height="${trackHeight + 8}" fill="${group.accent}" opacity="0.04"/>`;
      }

      // Eixo do track
      elementsSvg += `<line x1="${CONFIG.PAD_L - 20}" y1="${axisY}" x2="${SVG_W - 20}" y2="${axisY}" stroke="${trackColor}" opacity="0.22" stroke-width="1.25"/>`;

      // Rótulo do track + contagem
      const countLabel = track.events.length ? ` (${track.events.length})` : '';
      elementsSvg += `<text x="${CONFIG.PAD_L - 28}" y="${axisY + 4}" text-anchor="end" font-family="Inter,sans-serif" font-size="12" font-weight="700" fill="#1a1a1a" letter-spacing="-0.005em">${escapeXml(track.name)}<tspan font-weight="500" fill="#a5a297" font-size="10" font-family="DM Mono,monospace">${escapeXml(countLabel)}</tspan></text>`;

      // Pílulas já pré-computadas
      trackLayout.events.forEach(({ ev, idx, x, w, lane, laneOffset }) => {
        const color = COMPANY_COLORS[ev.emp] || '#999';
        const logoKey = LOGO_MAP[ev.emp];
        const textPad = 32;
        const pillY = axisY - PILL_H / 2 + laneOffset;
        const pillCy = pillY + PILL_H / 2;

        const globalId = `${gIdx}-${idx}-${ev.emp.replace(/\s+/g, '_')}`;
        window.tooltipData[globalId] = { ...ev, color };

        const ariaLabel = `${ev.mod} — ${ev.emp}, ${fmtFull(ev.date)}`;
        elementsSvg += `<g class="pill-group" data-pill-id="${globalId}" role="button" tabindex="0" aria-label="${escapeXml(ariaLabel)}" style="cursor:pointer">`;

        // Marcador no eixo
        elementsSvg += `<circle cx="${x + ICON_R + 2}" cy="${axisY}" r="2.5" fill="${color}" opacity="0.55"/>`;

        // Conector se a pílula estiver fora do eixo
        if (lane !== 0) {
          elementsSvg += `<line x1="${x + ICON_R + 2}" y1="${axisY}" x2="${x + ICON_R + 2}" y2="${pillCy + (laneOffset > 0 ? -PILL_H / 2 : PILL_H / 2)}" stroke="${color}" stroke-width="1.25" opacity="0.40" stroke-dasharray="2,2"/>`;
        }

        // Pílula com sombra
        elementsSvg += `<g filter="url(#pillShadow)">`;
        elementsSvg += `<rect x="${x}" y="${pillY}" width="${w}" height="${PILL_H}" rx="16" fill="#fff"/>`;
        elementsSvg += `<rect x="${x}" y="${pillY}" width="${w}" height="${PILL_H}" rx="16" fill="${color}" opacity="0.09" stroke="${color}" stroke-width="1.25" class="pill-bg"/>`;
        elementsSvg += `</g>`;

        // Ícone (logo SVG ou inicial)
        elementsSvg += `<circle cx="${x + ICON_R + 2}" cy="${pillCy}" r="${ICON_R}" fill="${color}"/>`;
        if (logoKey && LOGO_PATHS[logoKey]) {
          const s = ICON_R * 1.1;
          elementsSvg += `<g transform="translate(${x + ICON_R + 2 - s / 2},${pillCy - s / 2}) scale(${s / 24})" fill="#fff">${LOGO_PATHS[logoKey]}</g>`;
        } else {
          const initial = ev.emp === 'DeepSeek' ? 'DS' : ev.emp === 'OpenClaw' ? 'OC' : ev.emp[0];
          elementsSvg += `<text x="${x + ICON_R + 2}" y="${pillCy + 1}" text-anchor="middle" dominant-baseline="central" font-family="Inter,sans-serif" font-size="${initial.length > 1 ? 9 : 13}" font-weight="800" fill="#fff">${escapeXml(initial)}</text>`;
        }

        // Nome do modelo + data
        elementsSvg += `<text x="${x + textPad}" y="${pillY + 14}" font-family="Inter,sans-serif" font-size="11.5" font-weight="700" fill="#0c0c0c" letter-spacing="-0.01em">${escapeXml(ev.mod)}</text>`;
        elementsSvg += `<text x="${x + textPad}" y="${pillY + 26}" font-family="DM Mono,monospace" font-size="9" font-weight="500" fill="#807d75" letter-spacing="0.04em">${escapeXml(fmtPill(ev.date))}</text>`;

        // Pontinho âmbar: adicionado recentemente à régua (vale também p/ exportações)
        if (ev.isNew) {
          elementsSvg += `<circle cx="${x + w - 3}" cy="${pillY + 3}" r="4.5" fill="#f59e0b" stroke="#fff" stroke-width="1.5"/>`;
        }

        elementsSvg += `</g>`;
      });

      trackY += trackHeight;
    });

    currentY += groupHeight + GROUP_GAP;
  });

  const finalSvg = `<svg id="global-svg" class="global-svg" viewBox="0 0 ${SVG_W} ${SVG_H}" xmlns="http://www.w3.org/2000/svg" width="${SVG_W}" height="${SVG_H}" role="img" aria-label="Linha do tempo dos lançamentos de modelos de IA generativa">
    <title>Panorama Global da IA Generativa — Linha do Tempo</title>
    ${defsSvg}
    <rect width="100%" height="100%" fill="#fff"/>
    ${bgSvg}
    ${gridSvg}
    ${elementsSvg}
  </svg>`;

  document.getElementById('svg-wrap').innerHTML = finalSvg;

  // Reinstala os listeners das pílulas (delegação não é trivial em SVG)
  attachPillHandlers();
}
