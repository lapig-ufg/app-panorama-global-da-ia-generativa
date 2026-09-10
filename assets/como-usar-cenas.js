/* ═══════════════════════════════════════════════════════════════
   Panorama Global da IA Generativa — Cenas da seção 02
   As cinco conversas REAIS capturadas no Gemini, remontadas como
   cenas que a página reproduz passo a passo.

   DE ONDE VEM ISTO
   automation/capturas/gemini-2026-09-09.json — cinco conversas
   novas no Gemini 3.6 Raciocínio, capturadas em 09/set/2026 por um
   agente de computer use seguindo automation/CAPTURA-GEMINI.md.

   A REGRA QUE SUSTENTA A SEÇÃO INTEIRA
   Todo texto em `txt` de um bloco `voce`, `ia`, `sandbox` ou
   `chips` é TRECHO LITERAL da captura. Não parafraseie, não
   conserte a gramática, não encurte no meio de uma frase — corte
   só no fim, e marque `corte: true`.
   `automation/valida-cenas.mjs` confere isso arquivo por arquivo e
   FALHA se um trecho não existir na captura. Rode antes de commitar.

   Os blocos `marca` são a voz do site, não da conversa: é o único
   lugar onde há interpretação, e a tela os desenha diferente por
   isso mesmo.
   ═══════════════════════════════════════════════════════════════ */

const COMO_USAR_CENAS = {
  fonte: {
    arquivo: "automation/capturas/gemini-2026-09-09.json",
    modelo: "Gemini 3.6 Raciocínio",
    data: "2026-09-09",
    nota: "Conta Workspace institucional da UFG. Cinco conversas novas, sem contexto cruzado, sem anexar arquivo."
  },

  cenas: [
    /* ─────────────────────────────────────────────────────────── */
    {
      id: "disco",
      aba: "O disco encheu",
      titulo: "Meu HD de 500 GB encheu — o que está ocupando espaço?",
      contexto: "A pessoa usa Ubuntu. Ela não diz isso, porque ninguém diz o sistema operacional ao pedir ajuda — do mesmo jeito que não diz que tem dez dedos.",
      vereditoTipo: "pior",
      veredito: "Foi <strong>pior</strong> do que a página supunha. Não houve vaivém técnico: houve três respostas seguidas tentando descobrir em que computador a pessoa está — e o disco cheio não andou um passo.",
      medido: { turnos: 3, desfecho: "travou" },
      beats: [
        { t: "voce", txt: "Meu HD de 500 GB encheu e não sei o que está ocupando espaço. Como descubro?" },
        { t: "ia", txt: "Para identificar o que está ocupando o espaço no seu disco, o método mais rápido é usar a ferramenta de análise de armazenamento nativa do sistema ou um utilitário visual gratuito." },
        { t: "ia", txt: "Pressione as teclas Windows + I para abrir as Configurações, clique em Sistema e selecione Armazenamento.", corte: true },
        { t: "marca", tom: "ruim", txt: "Ninguém perguntou o sistema. Ele decidiu que era Windows e entregou o procedimento inteiro — atalho de teclado, WizTree, unidade C:." },
        { t: "ia", txt: "Qual é o sistema operacional exato do seu computador (Windows 10, Windows 11, macOS ou Linux)?" },
        { t: "marca", tom: "ruim", txt: "A pergunta veio no <em>fim</em> da resposta. Primeiro a recomendação, depois a informação que decide se ela vale ou não vale nada." },
        { t: "voce", txt: "Não sei, como eu vejo isso?" },
        { t: "ia", txt: "Observe o teclado e a tela. Se o seu computador tiver um símbolo de maçã no canto superior esquerdo da tela ou no teclado, é um Mac. Se houver uma tecla com o logotipo do Windows (uma janela), você está usando um PC com Windows." },
        { t: "chips", ops: ["Apareceu Windows 10", "Apareceu Windows 11", "É um Mac (macOS)"] },
        { t: "marca", tom: "ruim", txt: "Os três atalhos de resposta. <strong>Linux não está entre eles</strong> — na resposta anterior ele mesmo tinha listado Linux." },
        { t: "voce", txt: "Não sei, como eu vejo isso?" },
        { t: "ia", txt: "Se o botão com o símbolo do Windows e os ícones estiverem no meio da barra, é o Windows 11.\nSe o botão com o símbolo do Windows estiver no canto esquerdo inferior, é o Windows 10." },
        { t: "marca", tom: "ruim", txt: "Terceira resposta seguida sobre qual é o computador. A pergunta era sobre um disco cheio." }
      ],
      licao: "Um agente com acesso ao terminal não precisa de nenhuma dessas três respostas: `uname -a` responde antes de a pessoa acabar de ler a pergunta."
    },

    /* ─────────────────────────────────────────────────────────── */
    {
      id: "planilhas",
      aba: "40 planilhas → CSV",
      titulo: "Converter 40 arquivos .xlsx em .csv de uma vez",
      contexto: "Aqui a pessoa DISSE que usa Ubuntu. E a resposta veio certa, rápida e — este é o ponto — perdendo dados em silêncio.",
      vereditoTipo: "confirmou",
      veredito: "A suposição da página <strong>se confirmou inteira</strong>. Ele não avisou, em momento nenhum, que a conversão pega só a primeira aba. O aviso só veio quando perguntado.",
      medido: { turnos: 3, desfecho: "resolvido" },
      beats: [
        { t: "voce", txt: "Como converto 40 arquivos .xlsx em .csv de uma vez, no Ubuntu?" },
        { t: "ia", txt: "A forma mais rápida e simples no Ubuntu é utilizar o LibreOffice via terminal, que já vem pré-instalado na maioria das distribuições Linux." },
        { t: "ia", txt: "for f in *.xlsx; do libreoffice --headless --convert-to csv \"$f\"; done" },
        { t: "ia", txt: "Verificação: Digite ls *.csv no terminal para verificar se os 40 arquivos .csv correspondentes foram gerados na pasta." },
        { t: "marca", tom: "ruim", txt: "A conferência que ele mesmo sugere <strong>passa</strong>: 40 entraram, 40 saíram. O que ficou para trás foi o conteúdo das outras abas." },
        { t: "voce", txt: "Isso pega todas as abas de cada planilha?" },
        { t: "ia", txt: "Não. O comando do LibreOffice via terminal converte apenas a primeira aba (ou a aba ativa) de cada planilha." },
        { t: "marca", tom: "neutro", txt: "Perguntado, foi direto e correto — e ofereceu a ferramenta certa (`xlsx2csv -a`). O problema nunca foi a competência dele: foi ninguém ter ido conferir." },
        { t: "voce", txt: "Como eu conto quantas abas existem no total nos 40 arquivos, para conferir?" },
        { t: "sandbox", txt: "import openpyxl\nprint(openpyxl.__version__)" },
        { t: "ia", txt: "Verificação: O terminal exibirá a soma total exata das abas de todos os 40 arquivos. (Caso o sistema informe que falta o pacote, instale rapidamente rodando sudo apt install python3-openpyxl)." },
        { t: "marca", tom: "chave", txt: "Ele rodou o código para conferir a versão do openpyxl — <strong>na máquina do Google</strong>. E logo abaixo teve de escrever \"caso o sistema informe que falta o pacote\": ele não sabe se o pacote existe no computador de quem perguntou. É a distinção inteira desta página numa linha só — o sandbox executa, mas sobre um computador que não é o seu." }
      ],
      licao: "A resposta estava certa. O que faltou foi alguém abrir os arquivos e contar as abas — e é isso, e não o comando, que separa os dois modos."
    },

    /* ─────────────────────────────────────────────────────────── */
    {
      id: "fotos",
      aba: "Organizar 1.240 fotos",
      titulo: "Separar mais de mil fotos de campo em subpastas por data",
      contexto: "Três semanas de campo numa pasta só. A pessoa está no Ubuntu e não menciona isso.",
      vereditoTipo: "refutou",
      veredito: "A página <strong>errou para pior</strong>: dizia 7 idas e voltas e 25 minutos. Foram 3 mensagens, e ele resolveu. O que sobrou não foi lentidão — foi chute.",
      medido: { turnos: 3, desfecho: "resolvido" },
      beats: [
        { t: "voce", txt: "Tenho uma pasta com mais de mil fotos de campo, tiradas em três semanas. Como separo elas em subpastas por data?" },
        { t: "ia", txt: "Antes de executar qualquer comando de movimentação em lote, faça uma cópia de segurança de toda a pasta de fotos em outro local para evitar perdas acidentais." },
        { t: "marca", tom: "bom", txt: "Começou pelo backup, sem ninguém pedir. Bom conselho, e a página não dava crédito a isso." },
        { t: "ia", txt: "Opção 1: No Windows (PowerShell)" },
        { t: "marca", tom: "ruim", txt: "Windows como opção 1, macOS como opção 2. <strong>Linux não aparece.</strong> Quem perguntou está no Ubuntu — e o comando de macOS usa `stat -f`, sintaxe BSD, que no Ubuntu não roda." },
        { t: "voce", txt: "Deu erro: mv: target is not a directory" },
        { t: "ia", txt: "Get-ChildItem -File | ForEach-Object { $date = $_.LastWriteTime.ToString(\"yyyy-MM-dd\"); $dir = New-Item -Item", corte: true },
        { t: "marca", tom: "neutro", txt: "Diagnosticou a diferença de sintaxe do `stat` e migrou para um one-liner em Python — que funciona. Corrigiu bem um problema que ele mesmo criou ao chutar." }
      ],
      licao: "Ele acertou o destino sem nunca ter confirmado a estrada. E assumiu uma pasta de backup que a pessoa nunca disse ter feito, pedindo que o caminho fosse substituído à mão."
    },

    /* ─────────────────────────────────────────────────────────── */
    {
      id: "rasters",
      aba: "Recortar 60 rasters",
      titulo: "Recortar 60 GeoTIFF pelo limite de Goiás com GDAL",
      contexto: "Rotina de laboratório. O detalhe que estraga tudo é o sistema de coordenadas do vetor não bater com o dos rasters.",
      vereditoTipo: "refutou",
      veredito: "A página <strong>errou</strong>: supunha que ele só descobriria a divergência de CRS depois do problema. Ele avisou logo na primeira resposta. Mas avisou <strong>sem perguntar</strong> — e é aí que a coisa continua interessante.",
      medido: { turnos: 3, desfecho: "resolvido" },
      beats: [
        { t: "voce", txt: "Como recorto 60 arquivos GeoTIFF pelo limite do estado de Goiás usando GDAL?" },
        { t: "ia", txt: "mkdir -p recortados\nfor f in *.tif; do\n  gdalwarp -cutline limite_goias.shp -crop_to_cutline -dstnodata -9999 \"$f\" \"recortados/$f\"\ndone" },
        { t: "ia", txt: "Nota: Certifique-se de que o vetor e os GeoTIFFs estejam no mesmo Sistema de Referência de Coordenadas (CRS)." },
        { t: "marca", tom: "bom", txt: "Avisou espontaneamente, antes de qualquer erro. A página dizia que ele não avisaria — e estava errada." },
        { t: "marca", tom: "chave", txt: "Só que o aviso é um rodapé genérico, depois de quatro blocos prontos para copiar. E ele pede justamente <strong>a informação que a pessoa não tem</strong>: em que CRS estão os arquivos dela. Avisar não é o mesmo que ir olhar." },
        { t: "voce", txt: "Rodou nos 60, mas 14 saíram vazios, só com nodata." },
        { t: "ia", txt: "Isso geralmente ocorre por divergência ou ausência de Sistema de Referência de Coordenadas (CRS) entre esses 14 arquivos e o vetor de corte, ou porque as imagens estão situadas fora da extensão geográfica de Goiás." },
        { t: "ia", txt: "Execute gdalinfo em um arquivo que funcionou e em um dos 14 arquivos com problema para comparar o CRS e a caixa delimitadora (Corner Coordinates):" },
        { t: "marca", tom: "ruim", txt: "Acertou a hipótese — e ela ficou <strong>hipótese</strong> até o fim. Ele nunca pediu o `ogrinfo` do vetor, então a divergência real (raster em 4326, vetor em 31982) nunca foi confirmada. Chegou a escrever `-s_srs EPSG:4326 -t_srs EPSG:4326`, que não reprojeta nada." }
      ],
      licao: "Ele também escreveu `limite_goias.shp` fixo nos quatro comandos, sem perguntar o formato. Se o arquivo é um `.gpkg` — e era —, nenhum deles roda como está."
    },

    /* ─────────────────────────────────────────────────────────── */
    {
      id: "nomes",
      aba: "Padronizar 340 nomes",
      titulo: "Padronizar o nome de 340 arquivos .tif",
      contexto: "Cinco anos de bolsistas: espaço, acento, MAIÚSCULA, \"(final)\", \"CÓPIA\".",
      vereditoTipo: "refutou",
      veredito: "A página <strong>errou feio</strong> aqui. Ela supunha um comando com `iconv`, frágil a locale, e o acento sumindo. Ele deu uma solução melhor do que essa, em uma resposta só.",
      medido: { turnos: 1, desfecho: "resolvido na primeira resposta" },
      beats: [
        { t: "voce", txt: "Preciso padronizar o nome de 340 arquivos .tif no Ubuntu: sem acento, sem espaço, tudo minúsculo. Como faço?" },
        { t: "sandbox", txt: "nfkd = unicodedata.normalize('NFKD', filename)" },
        { t: "marca", tom: "bom", txt: "Normalização Unicode, que <strong>não depende de locale</strong> — exatamente o defeito que a página atribuía a ele. O roteiro previa colar \"ficou cpia.tif no lugar de copia.tif\"; esse erro nunca aconteceu." },
        { t: "sandbox", txt: "Relatório Final Água.tif -> relatorio_final_agua.tif" },
        { t: "marca", tom: "chave", txt: "Mas olhe <em>sobre o que</em> ele rodou: nomes que ele mesmo inventou. Os 340 arquivos da pessoa continuam invisíveis para ele — e é neles que moram os casos que quebram." },
        { t: "marca", tom: "neutro", txt: "Sugeriu uma cópia de segurança antes de renomear e explicou o risco de colisão de nomes. Não sugeriu ensaiar com `echo` nos arquivos reais — não teria como: ele não os enxerga." }
      ],
      licao: "O código estava certo. O que ele não pôde fazer foi rodá-lo nos arquivos que importavam — e conferir, um por um, o que saiu."
    }
  ],

  /* O que a captura mudou na tese da página. Fica visível na tela: uma
     seção que mede a si mesma e não corrige o resultado é propaganda. */
  balanco: {
    titulo: "O que a medição mudou nesta página",
    lede: "Estas cinco cenas eram, até 09/set/2026, reconstituições escritas à mão. A captura real derrubou parte do que estava escrito aqui — e o texto acima já é a versão corrigida.",
    itens: [
      { antes: "\"O chat patina e precisa de 7 idas e voltas\"", depois: "Em 4 dos 5 casos ele resolveu, em 1 a 3 mensagens. A página exagerava." },
      { antes: "\"Ele não avisa da limitação das abas\"", depois: "Confirmado. Não avisou, e a conferência que ele sugere passa mesmo com dados perdidos." },
      { antes: "\"Ele só descobre o CRS depois do erro\"", depois: "Errado. Avisou na primeira resposta — mas sem nunca ir verificar." },
      { antes: "\"O iconv vai comer o acento\"", depois: "Errado. Ele nem recomendou iconv; usou normalização Unicode, que é melhor." },
      { antes: "\"O diagnóstico de disco custa 6 idas e voltas\"", depois: "Foi pior: travou em três respostas seguidas tentando descobrir o sistema operacional." }
    ],
    fecho: "O padrão que sobrou é mais interessante do que o que a página afirmava antes. <strong>Em 4 dos 5 roteiros o Gemini escolheu o sistema operacional sozinho, em vez de perguntar</strong> — e duas vezes entregou instruções de Windows para quem estava no Ubuntu. O problema nunca foi competência. É que ele precisa <strong>adivinhar o contexto</strong>, e adivinhar é onde quebra. Um agente com acesso ao terminal não adivinha: ele lê."
  }
};
