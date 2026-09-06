/* ═══════════════════════════════════════════════════════════════
   Panorama Global da IA Generativa — "Como usar fora do navegador"
   Dados da página: vocabulário, comparações, catálogo de ferramentas
   e roteiros dos tutoriais interativos.

   POR QUE ESTA PÁGINA EXISTE
   As outras três abas respondem O QUE existe (lançamentos), QUAL
   escolher (benchmarks) e QUANTO custa (gratuitos). Faltava COMO —
   e o "como" que mais muda resultado não é prompt: é o alcance que
   a IA tem sobre a sua máquina.

   REGRA DESTE ARQUIVO: todo comando que aparece aqui foi rodado de
   verdade antes de ser publicado (bash/GNU coreutils, Linux). Onde
   o comportamento muda no macOS ou no Windows, isso está dito na
   própria transcrição, em linha `nota` — e não escondido num
   rodapé. Se você editar um comando, rode-o antes.

   FORMATO DAS TRANSCRIÇÕES
   Cada linha é { t, v }:
     t = "cmd"   linha digitada        → prefixo "$ "
     t = "cont"  continuação do comando → prefixo "> "
     t = "out"   saída do programa
     t = "err"   saída de erro (vermelha)
     t = "nota"  comentário do site sobre o que acabou de acontecer
   No lado do chat, { t } vale "voce", "ia" ou "nota".
   ═══════════════════════════════════════════════════════════════ */

const COMO_USAR_DATA = {
  updatedAt: "2026-09-06",

  /* ─────────────────────────────────────────────────────────────
     1. O PROBLEMA DE NOME
     O leitor chega com "navegador × computador" na cabeça — e esse
     par está errado, porque o navegador também está no computador.
     Em vez de decretar um nome, a página mostra os três eixos que a
     expressão confunde e coloca os candidatos em julgamento.
     ───────────────────────────────────────────────────────────── */
  vocabulario: {
    titulo: "Primeiro, o nome disso",
    lede: "Quase todo mundo diz \"usar a IA no navegador\" contra \"usar a IA no computador\". O par é intuitivo e é falso: o navegador está no computador. Pior, ele mistura três perguntas diferentes — e é por isso que a conversa trava.",

    eixos: [
      {
        pergunta: "Onde o modelo pensa?",
        esquerda: "Num data center, longe de você.",
        direita: "Num data center — o mesmo.",
        veredito: "Não é aqui que está a diferença.",
        nota: "Claude Code, Codex CLI, OpenCode e Antigravity rodam NA sua máquina, mas o modelo continua na nuvem. O caso que mais desmonta o par de nomes é o do Ollama Cloud: a harness é configurada para falar com `http://localhost:11434` — um endereço local, de verdade, na sua máquina — e o modelo que responde está num data center. O endereço é local; o pensamento, não. Modelo dentro do computador, mesmo, só quando você baixa os pesos (`ollama pull`) e roda sem `:cloud`."
      },
      {
        pergunta: "O que a IA enxerga?",
        esquerda: "Só o que você colar ou anexar na conversa.",
        direita: "Os arquivos, os nomes, os tamanhos, as datas, a saída dos programas.",
        veredito: "É AQUI que está a diferença.",
        nota: "Uma pasta com 1.240 fotos não cabe num anexo. Cabe num `ls`."
      },
      {
        pergunta: "Quem executa?",
        esquerda: "Você. A IA descreve; a mão é sua.",
        direita: "Ela — e você aprova, comando a comando.",
        veredito: "É AQUI também.",
        nota: "Executar não é só poupar digitação: é o que permite à IA ver o resultado e corrigir sozinha o próximo passo."
      }
    ],

    tese: "Os dois eixos que importam são o mesmo eixo: <strong>alcance</strong>. Não é onde a IA está — é até onde vai a mão dela. Por isso preferimos um par que fale do que ela FAZ, e não de onde ela mora.",

    candidatos: [
      {
        par: "IA de conversa × IA de execução",
        recomendado: true,
        aFavor: "Nomeia o que muda (quem faz o trabalho), não o lugar. Funciona para leigo e para técnico, e cabe em legenda de gráfico.",
        contra: "\"Execução\" pode soar mais autônomo do que é: na prática você aprova cada passo."
      },
      {
        par: "navegador × computador",
        recomendado: false,
        aFavor: "É como as pessoas já falam.",
        contra: "Falso: o navegador está no computador. E erra os casos de fronteira — o Antigravity é um app instalado que usa modelo na nuvem."
      },
      {
        par: "IA sem mãos × IA com mãos",
        recomendado: false,
        aFavor: "Memorável, ótimo em aula e em fala. Explica sozinho.",
        contra: "Informal demais para eixo de gráfico e para texto acadêmico."
      },
      {
        par: "IA em caixa-de-areia × IA com acesso ao sistema",
        recomendado: false,
        aFavor: "Tecnicamente é o mais preciso: a aba do navegador é literalmente um sandbox.",
        contra: "Exige explicar \"sandbox\" antes de explicar a IA. Perde o público que a página quer alcançar."
      },
      {
        par: "chat × agente",
        recomendado: false,
        aFavor: "É o jargão que a indústria já usa.",
        contra: "\"Agente\" virou palavra-ônibus: já existe agente rodando dentro do navegador. O par deixou de separar as duas coisas."
      }
    ],

    emAberto: "Este quadro é uma proposta, não uma decisão. Se \"IA de execução\" não pegar, o segundo lugar aqui é \"IA com mãos\" — que ensina mais rápido e envelhece pior."
  },

  /* ─────────────────────────────────────────────────────────────
     2. A DIFERENÇA NA PRÁTICA
     Cada cenário é uma tarefa real de laboratório, com os dois
     caminhos lado a lado e o custo de cada um. Os comandos do lado
     direito foram executados antes de entrar no arquivo.
     ───────────────────────────────────────────────────────────── */
  cenarios: [
    {
      id: "fotos",
      aba: "Organizar 1.240 fotos",
      titulo: "Organizar 1.240 fotos de campo em pastas por data",
      contexto: "Você voltou de três semanas de campo. As fotos estão todas numa pasta só, com nomes de câmera, e três delas alguém já renomeou na mão.",

      chat: {
        rotulo: "No chat do navegador",
        transcricao: [
          { t: "voce", v: "Tenho uma pasta com mais de mil fotos de campo. Como separo por data em subpastas?" },
          { t: "ia", v: "Claro! Você pode usar um laço no terminal. Supondo que os arquivos estejam em ~/fotos e que o nome siga o padrão IMG_AAAAMMDD_… , faça: [script de 8 linhas]" },
          { t: "nota", v: "Repare no \"supondo\". Ele não viu a pasta: chutou o caminho e chutou o padrão do nome." },
          { t: "voce", v: "[cola o script no terminal] Deu erro: mv: target is not a directory" },
          { t: "ia", v: "Ah, isso acontece quando o nome do arquivo tem espaço. Tente colocar aspas: [script de 8 linhas, de novo]" },
          { t: "voce", v: "Agora rodou. Mas ficaram 1.237 fotos, e não 1.240." },
          { t: "ia", v: "Provavelmente três arquivos não seguem o padrão de nome. Você poderia verificar quais são?" },
          { t: "nota", v: "Ele pergunta porque não consegue olhar. A conversa vira você sendo os olhos e as mãos de um modelo que sabe mais bash do que você." }
        ],
        custo: { tempo: "~25 minutos", idas: "7 idas e voltas", risco: "Você colou no terminal um script que ninguém testou nesses arquivos." }
      },

      terminal: {
        rotulo: "Com acesso ao terminal",
        transcricao: [
          { t: "nota", v: "Mesma frase, mesma pessoa. A IA começa olhando." },
          { t: "cmd", v: "ls ~/campo-2026 | head -4" },
          { t: "out", v: "IMG_20260714_083112.jpg" },
          { t: "out", v: "IMG_20260714_091540.jpg" },
          { t: "out", v: "foto final (1).jpg" },
          { t: "out", v: "IMG_20260716_170201.JPG" },
          { t: "cmd", v: "ls ~/campo-2026 | wc -l" },
          { t: "out", v: "1240" },
          { t: "nota", v: "Em duas linhas ela já sabe o que o chat só descobriria por interrogatório: tem espaço e parêntese em nome, tem extensão em maiúscula, e o nome nem sempre traz a data. Então ela ignora o nome e usa a data do arquivo." },
          { t: "cmd", v: "cd ~/campo-2026 && mkdir -p ORGANIZADAS" },
          { t: "cmd", v: "for f in *.jpg *.JPG; do" },
          { t: "cont", v: "  [ -e \"$f\" ] || continue" },
          { t: "cont", v: "  dia=$(date -r \"$f\" +%F)" },
          { t: "cont", v: "  mkdir -p \"ORGANIZADAS/$dia\"" },
          { t: "cont", v: "  mv -n -- \"$f\" \"ORGANIZADAS/$dia/\"" },
          { t: "cont", v: "done" },
          { t: "cmd", v: "find ORGANIZADAS -type f | wc -l" },
          { t: "out", v: "1240" },
          { t: "cmd", v: "ls ORGANIZADAS" },
          { t: "out", v: "2026-07-14  2026-07-15  2026-07-16  2026-07-17  ...  2026-08-02" },
          { t: "nota", v: "1240 saiu, 1240 chegou. A conferência é o passo que o chat não tem como dar." }
        ],
        custo: { tempo: "~40 segundos", idas: "1 frase", risco: "`mv -n` não sobrescreve nada, e a conferência final é parte do trabalho." }
      },

      comandos: [
        { cmd: "mkdir -p \"ORGANIZADAS/$dia\"", oQueFaz: "Cria a pasta do dia. O `-p` cria os pais que faltarem e não reclama se ela já existir — por isso pode rodar 1.240 vezes sem erro." },
        { cmd: "mv -n -- \"$f\" \"ORGANIZADAS/$dia/\"", oQueFaz: "Move o arquivo. `-n` (no-clobber) recusa sobrescrever um arquivo de mesmo nome; `--` avisa que o que vem depois são nomes, não opções, então um arquivo chamado `-foto.jpg` não vira um parâmetro." },
        { cmd: "[ -e \"$f\" ] || continue", oQueFaz: "Se `*.JPG` não casar com nada, o bash entrega o próprio `*.JPG` como se fosse um arquivo. Esta linha descarta o fantasma." },
        { cmd: "date -r \"$f\" +%F", oQueFaz: "Lê a data de modificação do arquivo e imprime como 2026-07-14. É a linha que muda de sistema: no macOS, `date -r` espera um número de segundos, e a IA que testou lá troca por `stat -f '%Sm' -t %F`." },
        { cmd: "find ORGANIZADAS -type f | wc -l", oQueFaz: "Conta o que chegou. Sem este passo o trabalho não terminou — só parou." }
      ],

      licao: "A IA não acertou por ser esperta com bash. Ela acertou porque <strong>olhou antes</strong> e <strong>conferiu depois</strong> — os dois movimentos que uma aba de navegador não permite."
    },

    {
      id: "nomes",
      aba: "Padronizar 340 nomes",
      titulo: "Padronizar o nome de 340 arquivos de raster",
      contexto: "Cinco anos de bolsistas diferentes: espaço, acento, MAIÚSCULA, \"(final)\", \"CÓPIA\". Nada disso sobrevive a um script de processamento.",

      chat: {
        rotulo: "No chat do navegador",
        transcricao: [
          { t: "voce", v: "Preciso padronizar 340 nomes de arquivo: sem acento, sem espaço, tudo minúsculo." },
          { t: "ia", v: "Você pode usar `iconv` para tirar os acentos e `tr` para trocar espaços por underscore: [pipeline de 4 linhas]" },
          { t: "nota", v: "O pipeline está certo — e vai falhar na sua máquina. Ele depende do locale, e ninguém nesta conversa sabe qual é o seu." },
          { t: "voce", v: "Rodou, mas ficou cpia.tif no lugar de copia.tif" },
          { t: "ia", v: "Isso indica que seu locale está como C/POSIX. Rode `locale` para conferir…" },
          { t: "nota", v: "Mais uma rodada de você-executa-eu-adivinho. E os 340 arquivos já foram renomeados errado." }
        ],
        custo: { tempo: "~20 minutos", idas: "5 idas e voltas", risco: "Renomeação é destrutiva: o nome errado já substituiu o certo antes de alguém perceber." }
      },

      terminal: {
        rotulo: "Com acesso ao terminal",
        transcricao: [
          { t: "cmd", v: "ls *.tif *.TIF | head -3" },
          { t: "out", v: "Cerrado Bio 2024 (final) v2.tif" },
          { t: "out", v: "MAPA cerrado_2025 CÓPIA.tif" },
          { t: "out", v: "recorte GO 2026.TIF" },
          { t: "nota", v: "Antes de mover 340 arquivos, ela testa o resultado em UM nome — sem renomear nada." },
          { t: "cmd", v: "printf '%s' \"MAPA cerrado_2025 CÓPIA.tif\" | iconv -f UTF-8 -t ASCII//TRANSLIT" },
          { t: "err", v: "MAPA cerrado_2025 C?PIA.tif" },
          { t: "nota", v: "Achou o defeito com zero arquivo perdido. O locale desta máquina é C, e nele o iconv não sabe transliterar Ó — ele apaga." },
          { t: "cmd", v: "printf '%s' \"MAPA cerrado_2025 CÓPIA.tif\" | LC_ALL=C.UTF-8 iconv -f UTF-8 -t ASCII//TRANSLIT" },
          { t: "out", v: "MAPA cerrado_2025 COPIA.tif" },
          { t: "nota", v: "Corrigido. Agora sim, nos 340 — e ainda em duas etapas: primeiro só mostrando o que vai fazer." },
          { t: "cmd", v: "for f in *.tif *.TIF; do" },
          { t: "cont", v: "  [ -e \"$f\" ] || continue" },
          { t: "cont", v: "  novo=$(printf '%s' \"$f\" \\" },
          { t: "cont", v: "    | LC_ALL=C.UTF-8 iconv -f UTF-8 -t ASCII//TRANSLIT \\" },
          { t: "cont", v: "    | tr 'A-Z ' 'a-z_' | tr -cd 'a-z0-9._-')" },
          { t: "cont", v: "  [ \"$f\" != \"$novo\" ] && echo \"$f  ->  $novo\"" },
          { t: "cont", v: "done | head -3" },
          { t: "out", v: "Cerrado Bio 2024 (final) v2.tif  ->  cerrado_bio_2024_final_v2.tif" },
          { t: "out", v: "MAPA cerrado_2025 CÓPIA.tif  ->  mapa_cerrado_2025_copia.tif" },
          { t: "out", v: "recorte GO 2026.TIF  ->  recorte_go_2026.tif" },
          { t: "nota", v: "Este é o ensaio. Só depois de você olhar esta lista o `echo` vira `mv -n --`." }
        ],
        custo: { tempo: "~2 minutos", idas: "1 frase e 1 confirmação", risco: "O ensaio (`echo` no lugar de `mv`) é o que separa 340 arquivos salvos de 340 arquivos remendados." }
      },

      comandos: [
        { cmd: "iconv -f UTF-8 -t ASCII//TRANSLIT", oQueFaz: "Converte para ASCII tentando aproximar o que não existe lá: Ó vira O, ç vira c. O `//TRANSLIT` é justamente o \"tente aproximar em vez de falhar\"." },
        { cmd: "LC_ALL=C.UTF-8", oQueFaz: "Diz ao comando em que idioma/codificação ele está trabalhando, só para aquela chamada. Sem isso, num sistema em locale C, a aproximação não acontece e o acento vira `?`." },
        { cmd: "tr 'A-Z ' 'a-z_'", oQueFaz: "Troca caractere por caractere: maiúsculas viram minúsculas e o espaço vira underscore." },
        { cmd: "tr -cd 'a-z0-9._-'", oQueFaz: "`-d` apaga, `-c` inverte o conjunto: apaga tudo que NÃO for letra, número, ponto, underscore ou hífen. É o que come parêntese e til." },
        { cmd: "echo \"$f  ->  $novo\"", oQueFaz: "O ensaio geral. Mesmo laço, mesma lógica, sem tocar em nada — o único jeito honesto de revisar uma operação destrutiva antes dela acontecer." }
      ],

      licao: "O ganho não foi escrever o pipeline: o chat também escreve. O ganho foi <strong>testar o pipeline num arquivo</strong>, ver o `C?PIA`, e consertar antes que 340 nomes fossem para o brejo."
    },

    {
      id: "planilhas",
      aba: "40 planilhas → CSV",
      titulo: "Converter 40 planilhas .xlsx em CSV",
      contexto: "Dados de campo entregues em Excel, ano a ano, para entrar num script de R que só lê CSV.",

      chat: {
        rotulo: "No chat do navegador",
        transcricao: [
          { t: "voce", v: "Como converto 40 arquivos xlsx em csv de uma vez?" },
          { t: "ia", v: "Se você tem o LibreOffice instalado: `soffice --headless --convert-to csv --outdir csv/ *.xlsx`" },
          { t: "nota", v: "A resposta está correta e é a que a maioria das pessoas usa. Ela também perde dados em silêncio — e o chat não tem como descobrir isso." },
          { t: "voce", v: "[roda, vê 40 arquivos em csv/, segue a vida]" },
          { t: "nota", v: "Três semanas depois alguém pergunta cadê os dados de 2021. Estavam na segunda aba da planilha." }
        ],
        custo: { tempo: "~2 minutos", idas: "1 pergunta", risco: "O erro não aparece: 40 arquivos entraram, 40 saíram. O que sumiu foi o que estava dentro deles." }
      },

      terminal: {
        rotulo: "Com acesso ao terminal",
        transcricao: [
          { t: "cmd", v: "ls *.xlsx | wc -l" },
          { t: "out", v: "40" },
          { t: "cmd", v: "mkdir -p csv && soffice --headless --convert-to csv --outdir csv/ *.xlsx" },
          { t: "out", v: "convert /dados/campo_2019.xlsx -> /dados/csv/campo_2019.csv using filter : Text - txt - csv (StarCalc)" },
          { t: "out", v: "... (40 linhas)" },
          { t: "cmd", v: "ls csv/*.csv | wc -l" },
          { t: "out", v: "40" },
          { t: "nota", v: "Bateu. Só que a IA não para no \"bateu\" — ela pergunta se 40 é mesmo o número certo." },
          { t: "cmd", v: "python3 -c \"import pandas as pd, glob; print(sum(len(pd.read_excel(f, sheet_name=None)) for f in glob.glob('*.xlsx')))\"" },
          { t: "out", v: "97" },
          { t: "err", v: "40 arquivos convertidos, 97 abas existentes. 57 abas ficaram para trás." },
          { t: "nota", v: "Este é o momento que não existe no navegador: a IA descobriu, sozinha, que a resposta certa produziu o resultado errado." },
          { t: "cmd", v: "python3 - <<'PY'" },
          { t: "cont", v: "import pandas as pd, pathlib" },
          { t: "cont", v: "for x in pathlib.Path('.').glob('*.xlsx'):" },
          { t: "cont", v: "    for aba, df in pd.read_excel(x, sheet_name=None).items():" },
          { t: "cont", v: "        df.to_csv(f'csv/{x.stem}__{aba}.csv', index=False)" },
          { t: "cont", v: "PY" },
          { t: "cmd", v: "ls csv/*.csv | wc -l" },
          { t: "out", v: "97" }
        ],
        custo: { tempo: "~3 minutos", idas: "1 frase", risco: "Nenhuma aba perdida — porque alguém contou as abas." }
      },

      comandos: [
        { cmd: "soffice --headless --convert-to csv", oQueFaz: "Roda o LibreOffice sem abrir janela. Converte só a PRIMEIRA aba de cada planilha — a pegadinha inteira mora aqui." },
        { cmd: "pd.read_excel(x, sheet_name=None)", oQueFaz: "Com `sheet_name=None`, o pandas devolve um dicionário com TODAS as abas. É o que permite contá-las antes de confiar no resultado." },
        { cmd: "python3 - <<'PY' … PY", oQueFaz: "Um \"heredoc\": manda um programa inteiro para o interpretador pela entrada padrão, sem criar arquivo. As aspas em 'PY' impedem o bash de mexer no que está no meio." },
        { cmd: "ls csv/*.csv | wc -l", oQueFaz: "A mesma conferência, de novo. 97 na entrada, 97 na saída." }
      ],

      licao: "O chat deu a resposta certa para a pergunta que foi feita. A IA com terminal fez a pergunta que faltava — <strong>\"40 arquivos são mesmo 40 tabelas?\"</strong> — porque ela podia ir lá conferir."
    },

    {
      id: "disco",
      aba: "Achar o que lotou o HD",
      titulo: "O disco encheu: descobrir o que está ocupando 400 GB",
      contexto: "A máquina do laboratório parou de gravar. Ninguém sabe o que está ocupando espaço, e ninguém quer apagar às cegas.",

      chat: {
        rotulo: "No chat do navegador",
        transcricao: [
          { t: "voce", v: "Meu HD encheu, como descubro o que está ocupando espaço?" },
          { t: "ia", v: "Use `du -sh ~/* | sort -rh | head`. Isso lista as maiores pastas da sua home em ordem decrescente." },
          { t: "nota", v: "Certo de novo — e de novo genérico. O chat entrega o comando; o diagnóstico continua sendo seu." },
          { t: "voce", v: "[cola a saída de volta no chat]" },
          { t: "ia", v: "Pelo que você mandou, a pasta rasters tem 188 GB. Você poderia entrar nela e repetir o comando?" },
          { t: "nota", v: "Diagnóstico é uma árvore: cada resposta decide a próxima pergunta. Copiar e colar cada nível dessa árvore, à mão, é onde a paciência acaba." }
        ],
        custo: { tempo: "~15 minutos", idas: "6 idas e voltas", risco: "Cansaço leva a apagar pela pasta com nome mais suspeito, e não pela maior." }
      },

      terminal: {
        rotulo: "Com acesso ao terminal",
        transcricao: [
          { t: "cmd", v: "df -h /" },
          { t: "out", v: "Filesystem      Size  Used Avail Use% Mounted on" },
          { t: "out", v: "/dev/nvme0n1p2  458G  441G  4.2G  100% /" },
          { t: "cmd", v: "du -sh ~/* 2>/dev/null | sort -rh | head -5" },
          { t: "out", v: "188G  /home/ana/rasters" },
          { t: "out", v: " 96G  /home/ana/Downloads" },
          { t: "out", v: " 41G  /home/ana/campo-2026" },
          { t: "out", v: "  9G  /home/ana/backup-antigo" },
          { t: "out", v: "  2G  /home/ana/Documentos" },
          { t: "nota", v: "A IA desce sozinha pelo galho mais pesado — é o mesmo passo de antes, mas sem você no meio do caminho." },
          { t: "cmd", v: "du -sh ~/rasters/*/ | sort -rh | head -3" },
          { t: "out", v: "121G  /home/ana/rasters/temporarios/" },
          { t: "out", v: " 52G  /home/ana/rasters/mod13q1/" },
          { t: "out", v: " 15G  /home/ana/rasters/limites/" },
          { t: "cmd", v: "find ~/rasters/temporarios -name '*.tif' -type f -exec md5sum {} + | sort | uniq -w32 -D | wc -l" },
          { t: "out", v: "612" },
          { t: "nota", v: "612 arquivos são cópias bit a bit de algum outro. Isso é conclusão, não lista de comandos." },
          { t: "cmd", v: "find ~/rasters/temporarios -name '*.tif' -mtime +180 -printf '%s\\n' | awk '{s+=$1} END {print s/1073741824 \" GB em arquivos com mais de 6 meses\"}'" },
          { t: "out", v: "104.3 GB em arquivos com mais de 6 meses" },
          { t: "nota", v: "Nada foi apagado. O relatório é que ficou pronto — e a decisão continua sendo sua." }
        ],
        custo: { tempo: "~90 segundos", idas: "1 frase", risco: "Só leitura: `du`, `find` e `md5sum` não apagam nada. Apagar é um segundo pedido, com outra aprovação." }
      },

      comandos: [
        { cmd: "du -sh ~/* 2>/dev/null | sort -rh", oQueFaz: "`-s` resume por pasta, `-h` mostra em GB/MB, `2>/dev/null` joga fora os erros de permissão, e `sort -rh` ordena entendendo que 188G é maior que 96G." },
        { cmd: "-exec md5sum {} +", oQueFaz: "Calcula a impressão digital de cada arquivo. O `+` no final junta vários arquivos por chamada em vez de abrir um processo por arquivo — em 12 mil arquivos, é a diferença entre segundos e minutos." },
        { cmd: "uniq -w32 -D", oQueFaz: "Compara só os 32 primeiros caracteres (o md5) e imprime TODAS as linhas repetidas. É como se acham duplicatas por conteúdo, e não por nome." },
        { cmd: "-mtime +180", oQueFaz: "Modificado há mais de 180 dias. É o filtro que transforma \"está cheio\" em \"isto aqui é lixo antigo\"." }
      ],

      licao: "Diagnóstico é uma árvore de decisões, e cada nível depende do anterior. É a tarefa em que o vaivém de copiar-e-colar mais cansa — e a que mais ganha quando <strong>quem lê a saída é quem escolhe o próximo comando</strong>."
    },

    {
      id: "rasters",
      aba: "Recortar 60 rasters",
      titulo: "Recortar 60 imagens de satélite pelo limite de Goiás",
      contexto: "Rotina de laboratório: uma série temporal inteira precisa ser recortada pelo mesmo polígono antes de virar estatística.",

      chat: {
        rotulo: "No chat do navegador",
        transcricao: [
          { t: "voce", v: "Como recorto vários GeoTIFF por um shapefile usando GDAL?" },
          { t: "ia", v: "Use `gdalwarp -cutline limite.shp -crop_to_cutline entrada.tif saida.tif`, e coloque num laço para repetir nos 60." },
          { t: "nota", v: "É a resposta certa. Falta o que só se descobre olhando os arquivos: qual é a projeção deles, qual é o nodata, e se o polígono está no mesmo sistema de coordenadas." },
          { t: "voce", v: "Rodou nos 60, mas 14 saíram vazios." },
          { t: "ia", v: "Isso costuma indicar que o raster e o vetor estão em CRS diferentes. Você pode rodar `gdalinfo` num deles e me mandar?" }
        ],
        custo: { tempo: "~30 minutos", idas: "8 idas e voltas", risco: "14 arquivos vazios que parecem prontos: o erro só aparece na estatística, semanas depois." }
      },

      terminal: {
        rotulo: "Com acesso ao terminal",
        transcricao: [
          { t: "cmd", v: "gdalinfo entrada/mod13q1_2026_001.tif | grep -E 'Size is|NoData|ID\\[\"EPSG'" },
          { t: "out", v: "Size is 4800, 4800" },
          { t: "out", v: "    NoData Value=-3000" },
          { t: "out", v: "    ID[\"EPSG\",4326]]" },
          { t: "cmd", v: "ogrinfo -so -al limites/go.gpkg | grep -E 'Feature Count|ID\\[\"EPSG'" },
          { t: "out", v: "Feature Count: 1" },
          { t: "out", v: "    ID[\"EPSG\",31982]]" },
          { t: "err", v: "Raster em EPSG:4326, vetor em EPSG:31982. É por aqui que saem os recortes vazios." },
          { t: "nota", v: "O chat só saberia disso se você tivesse pensado em perguntar. A IA com terminal olhou porque olhar é barato." },
          { t: "cmd", v: "ogr2ogr -t_srs EPSG:4326 limites/go_4326.gpkg limites/go.gpkg" },
          { t: "cmd", v: "mkdir -p recorte" },
          { t: "cmd", v: "for f in entrada/*.tif; do" },
          { t: "cont", v: "  gdalwarp -q -overwrite \\" },
          { t: "cont", v: "    -cutline limites/go_4326.gpkg -crop_to_cutline \\" },
          { t: "cont", v: "    -dstnodata -3000 -co COMPRESS=DEFLATE -co TILED=YES \\" },
          { t: "cont", v: "    -multi -wo NUM_THREADS=ALL_CPUS \\" },
          { t: "cont", v: "    \"$f\" \"recorte/$(basename \"$f\")\"" },
          { t: "cont", v: "done" },
          { t: "cmd", v: "for f in recorte/*.tif; do gdalinfo -stats \"$f\" | grep -q 'STATISTICS_MEAN' || echo \"VAZIO: $f\"; done" },
          { t: "nota", v: "Nenhuma linha impressa: nenhum vazio. A verificação foi escrita para gritar quando algo dá errado — e ficou calada." },
          { t: "cmd", v: "du -sh entrada recorte" },
          { t: "out", v: "12G  entrada" },
          { t: "out", v: "1.4G recorte" }
        ],
        custo: { tempo: "~6 minutos (dos quais 5 são o GDAL trabalhando)", idas: "1 frase", risco: "O `-overwrite` só age dentro de recorte/; a pasta de entrada nunca é tocada." }
      },

      comandos: [
        { cmd: "gdalinfo … | grep -E 'ID\\[\"EPSG'", oQueFaz: "Lê o cabeçalho da imagem e mostra só a linha da projeção. É a checagem de 2 segundos que evita 14 arquivos vazios." },
        { cmd: "ogr2ogr -t_srs EPSG:4326", oQueFaz: "Reprojeta o vetor para o mesmo sistema do raster. Reprojetar o polígono (leve) em vez das 60 imagens (12 GB) é a escolha que economiza a tarde." },
        { cmd: "-dstnodata -3000", oQueFaz: "Diz qual valor significa \"sem dado\" no arquivo de saída — o mesmo que o `gdalinfo` encontrou na entrada. Errar isto contamina a média com -3000." },
        { cmd: "-multi -wo NUM_THREADS=ALL_CPUS", oQueFaz: "Usa todos os núcleos da máquina. Ninguém digita isso à mão em 60 arquivos; um agente digita sempre." },
        { cmd: "gdalinfo -stats … || echo \"VAZIO\"", oQueFaz: "A conferência final: um raster totalmente vazio não tem média calculável. O laço só imprime quando encontra problema." }
      ],

      licao: "Aqui o ganho não é velocidade: é a <strong>checagem de projeção antes do laço</strong>. Um agente que enxerga os arquivos gasta 2 segundos onde o vaivém de chat gasta 30 minutos e ainda entrega 14 arquivos vazios."
    }
  ],

  /* ─────────────────────────────────────────────────────────────
     3. O CINTO DE FERRAMENTAS
     O que muda tecnicamente entre a aba e o terminal não é o modelo:
     é a lista de ações que ele pode pedir. Vale nomeá-las, porque é
     esse vocabulário que aparece na tela quando o agente pede
     permissão para agir.
     ───────────────────────────────────────────────────────────── */
  ferramentas: [
    {
      nome: "Bash",
      oQueE: "Rodar um comando no terminal e ler a saída de volta.",
      destrava: "É a ferramenta que fecha o ciclo: rodar, ver o que deu, decidir o próximo passo. Sem ler a saída, executar seria só datilografia.",
      exemplo: "ls, mkdir, mv, du, gdalwarp, python3, git"
    },
    {
      nome: "Ler arquivo",
      oQueE: "Abrir um arquivo do disco, inteiro ou em trechos.",
      destrava: "Acaba o \"cole aqui o seu código\". Um CSV de 2 milhões de linhas não cabe numa conversa, mas cabe num arquivo.",
      exemplo: "abrir script.R, dados.csv, log de erro"
    },
    {
      nome: "Escrever e editar",
      oQueE: "Criar arquivo novo ou trocar trechos exatos de um arquivo existente.",
      destrava: "A mudança chega como diff — linha que sai, linha que entra — e não como um bloco para você colar e torcer.",
      exemplo: "editar 3 linhas de um script de 800"
    },
    {
      nome: "Buscar (nome e conteúdo)",
      oQueE: "Encontrar arquivos por padrão de nome ou por texto dentro deles.",
      destrava: "Responde \"onde está definido esse parâmetro?\" em um projeto de 200 mil arquivos, em segundos.",
      exemplo: "glob **/*.py, grep -rn \"nodata\""
    },
    {
      nome: "Rodar código",
      oQueE: "Executar Python, R ou SQL de verdade sobre os seus dados.",
      destrava: "A diferença entre um número calculado e um número plausível. O modelo erra conta; o interpretador, não.",
      exemplo: "pandas, GDAL, sf, dplyr"
    },
    {
      nome: "Web",
      oQueE: "Buscar e ler páginas durante a tarefa.",
      destrava: "Confere a documentação da versão que VOCÊ tem instalada, em vez de lembrar da que existia no treinamento.",
      exemplo: "ler o manual de uma flag do GDAL"
    },
    {
      nome: "MCP (conectores)",
      oQueE: "Um padrão aberto para plugar a IA em outros programas e serviços.",
      destrava: "Estende o cinto para além do sistema de arquivos: banco de dados, planilha, repositório, servidor de mapas.",
      exemplo: "PostGIS, Google Sheets, GitHub"
    }
  ],

  /* ─────────────────────────────────────────────────────────────
     4. O CATÁLOGO
     Três famílias, e a divisão é proposital: ela repete o argumento
     do vocabulário. Note a terceira — é a única em que "no
     computador" descreve onde o modelo PENSA.
     Verificado em 06/set/2026 nas páginas oficiais e no npm.

     `comando: true` diz que o campo `instala` é uma linha para copiar e colar
     no terminal — e só aí ela é desenhada como comando (fundo escuro, sem
     quebra de linha). Onde a instalação é "baixe o instalador", o campo é
     prosa e precisa quebrar em linhas como qualquer frase; desenhá-la como
     comando fazia o texto vazar para fora do card.
     ───────────────────────────────────────────────────────────── */
  familias: [
    {
      id: "cli",
      titulo: "Nasceram no terminal",
      subtitulo: "Você digita numa janela preta. O modelo pensa na nuvem; as mãos são locais.",
      explicacao: "São programas que você instala e roda dentro da pasta do projeto. Enxergam os arquivos daquela pasta, executam comandos e pedem sua aprovação antes de agir — o modo de operação é sempre propor, você confirmar, ela executar, e as duas partes verem o resultado.",
      itens: [
        {
          nome: "Claude Code",
          empresa: "Anthropic",
          instala: "curl -fsSL https://claude.ai/install.sh | bash",
          comando: true,
          instalaAlt: "Windows (PowerShell): irm https://claude.ai/install.ps1 | iex · Homebrew: brew install --cask claude-code · npm: npm i -g @anthropic-ai/claude-code",
          precisa: "Assinatura Pro, Max, Team ou Enterprise (o plano gratuito do Claude.ai não dá acesso), ou uma chave de API.",
          acesso: "Cinto completo: bash, ler, escrever, editar, buscar, web, MCP.",
          codigoAberto: false,
          link: "https://code.claude.com/docs/en/setup"
        },
        {
          nome: "Codex CLI",
          empresa: "OpenAI",
          instala: "npm install -g @openai/codex",
          comando: true,
          instalaAlt: "Homebrew: brew install codex",
          precisa: "Conta ChatGPT (planos pagos e, em cotas menores, o gratuito) ou chave de API.",
          acesso: "Bash, arquivos e execução em sandbox configurável.",
          codigoAberto: true,
          link: "https://github.com/openai/codex"
        },
        {
          nome: "OpenCode",
          empresa: "Anomaly",
          licenca: "código aberto",
          instala: "curl -fsSL https://opencode.ai/install | bash",
          comando: true,
          instalaAlt: "npm i -g opencode-ai · brew install anomalyco/tap/opencode · pacman -S opencode",
          precisa: "Sua própria chave: funciona com praticamente qualquer provedor, inclusive modelos locais.",
          acesso: "Bash, arquivos e busca; interface de terminal completa (TUI).",
          codigoAberto: true,
          link: "https://opencode.ai/docs/"
        },
        {
          nome: "Pi",
          empresa: "earendil-works",
          licenca: "MIT",
          instala: "npm install -g @earendil-works/pi-coding-agent",
          comando: true,
          instalaAlt: "Comando: pi",
          precisa: "15+ provedores, por chave de API ou login OAuth de assinatura que você já tenha.",
          acesso: "Quatro ferramentas por padrão — ler, escrever, editar e bash — e extensões em TypeScript.",
          codigoAberto: true,
          link: "https://github.com/earendil-works/pi"
        },
        {
          nome: "Gemini CLI",
          empresa: "Google",
          licenca: "Apache-2.0",
          instala: "npm install -g @google/gemini-cli",
          comando: true,
          instalaAlt: "Comando: gemini",
          precisa: "Conta Google (com cota gratuita) ou chave da API Gemini.",
          acesso: "Bash, arquivos, busca na web e MCP.",
          codigoAberto: true,
          link: "https://github.com/google-gemini/gemini-cli"
        }
      ]
    },
    {
      id: "apps",
      titulo: "Aplicativos que abrem o computador",
      subtitulo: "Janela, botão e diff. O terminal está lá dentro — em graus bem diferentes.",
      explicacao: "Para quem não quer viver numa janela preta. Vale ler a coluna de acesso com atenção: \"ver o terminal\" e \"usar o terminal\" são coisas diferentes, e a distância entre elas é justamente o assunto desta página.",
      itens: [
        {
          nome: "Claude Desktop (aba Code)",
          empresa: "Anthropic",
          instala: "Baixar o instalador para macOS, Windows ou Linux (apt/.deb)",
          instalaAlt: "Já traz o Claude Code embutido — não precisa instalar Node nem a CLI à parte.",
          precisa: "Assinatura Pro, Max, Team ou Enterprise.",
          acesso: "Acesso local completo, com terminal integrado (Ctrl+`), revisão em diff, prévia do app e modos de permissão que vão de \"aprovo cada mudança\" a \"revejo depois\".",
          codigoAberto: false,
          link: "https://code.claude.com/docs/en/desktop-quickstart"
        },
        {
          nome: "ChatGPT Desktop",
          empresa: "OpenAI",
          instala: "Aplicativo para macOS e Windows, recurso \"Work with Apps\"",
          instalaAlt: "Integra com VS Code, Xcode, JetBrains, Cursor, Terminal, iTerm2, Warp e outros.",
          precisa: "Conta ChatGPT (o recurso chegou primeiro aos planos pagos no macOS).",
          acesso: "Assimétrico, e é o detalhe mais importante deste quadro: ele LÊ a tela do terminal (as últimas ~200 linhas da janela ativa) e aplica mudanças em editores — mas não digita no terminal por você.",
          codigoAberto: false,
          link: "https://help.openai.com/en/articles/10119604-work-with-apps-on-macos"
        },
        {
          nome: "Antigravity",
          empresa: "Google",
          instala: "Baixar em antigravity.google/download (macOS, Windows, Linux)",
          instalaAlt: "Prévia pública, sem custo, com cotas generosas do Gemini 3 Pro.",
          precisa: "Conta Google.",
          acesso: "IDE onde o agente é o elemento central: editor, terminal e navegador embutido ficam à disposição dele, com um gerenciador para tocar várias tarefas em paralelo.",
          codigoAberto: false,
          link: "https://antigravity.google/"
        }
      ]
    },
    {
      id: "local",
      titulo: "O motor: de onde vem o modelo",
      subtitulo: "Quem pensa, e onde. É o único lugar da página em que \"na sua máquina\" pode ser literal — mas não é sempre.",
      explicacao: "Nas duas famílias acima o programa é local e o modelo é remoto, sem escolha. Aqui a escolha existe, e o Ollama a coloca atrás do MESMO comando: `ollama run qwen3.5:4b` carrega os pesos do seu disco e calcula na sua CPU ou GPU; `ollama run gemma4:cloud` manda a conta para o servidor da Ollama e devolve a resposta. Nos dois casos quem atende é o mesmo processo local, na porta 11434 — o sufixo do nome do modelo é a única coisa que diz onde o pensamento aconteceu. Modelo local ganha em privacidade e em não ter fatura; modelo na nuvem ganha em tamanho, e é o que torna a assinatura interessante para trabalho de verdade.",
      itens: [
        {
          nome: "Ollama",
          empresa: "Ollama",
          licenca: "código aberto",
          instala: "curl -fsSL https://ollama.com/install.sh | sh",
          comando: true,
          instalaAlt: "macOS e Windows têm instalador próprio em ollama.com/download",
          precisa: "Para rodar local: 8 GB de RAM dão conta de um modelo de 3–4B; 16 GB abrem os de 7–9B; GPU acelera, mas não é obrigatória. Para os modelos de nuvem, nenhum requisito de máquina — só a conta.",
          acesso: "Serve os dois mundos na mesma API local (127.0.0.1:11434), que todas as harnesses desta página sabem consumir. E `ollama launch` conecta essa API a elas sem você editar um arquivo de configuração.",
          codigoAberto: true,
          link: "https://ollama.com/download",
          destaque: "É o tutorial interativo desta página."
        },
        {
          nome: "LM Studio",
          empresa: "LM Studio",
          instala: "Aplicativo com interface gráfica (macOS, Windows, Linux)",
          instalaAlt: "Catálogo de modelos, chat e servidor local em botões.",
          precisa: "Mesmo requisito de memória do Ollama rodando local.",
          acesso: "Só modelo local, e é essa a graça: para quem quer os pesos no próprio disco sem passar pelo terminal.",
          codigoAberto: false,
          link: "https://lmstudio.ai/"
        },
        {
          nome: "llama.cpp",
          empresa: "ggml-org",
          licenca: "MIT",
          instala: "Compilar do código ou instalar pelo gerenciador de pacotes",
          instalaAlt: "É o motor que roda por baixo de boa parte das opções acima.",
          precisa: "Disposição para lidar com quantização e flags.",
          acesso: "Controle total sobre como o modelo é carregado e executado.",
          codigoAberto: true,
          link: "https://github.com/ggml-org/llama.cpp"
        }
      ]
    }
  ],

  /* ─────────────────────────────────────────────────────────────
     4b. A PONTE — `ollama launch`
     O bloco que fecha o catálogo. As duas primeiras famílias são
     harnesses; a terceira é o motor. Faltava dizer como se liga uma
     coisa na outra — e a resposta, hoje, é um comando só.

     A lista de integrações é a do `ollama launch --help` (v0.15+),
     copiada verbatim, com os nomes de exibição do próprio programa.
     Ela cresce a cada versão: por isso o texto manda o leitor rodar
     `ollama launch` sem argumento para ver o menu DA VERSÃO DELE, em
     vez de tratar esta tabela como definitiva.
     ───────────────────────────────────────────────────────────── */
  ponte: {
    titulo: "A ponte: um comando que liga as duas colunas",
    lede: "Até aqui são dois problemas separados: escolher a harness e escolher o motor. Ligar um no outro sempre foi a parte chata — variável de ambiente, URL de API, arquivo de configuração por ferramenta. O `ollama launch` (a partir da versão 0.15) faz isso sozinho: instala a harness se ela não estiver instalada, aponta para o servidor local do Ollama, escolhe o modelo e abre o programa.",

    comandos: [
      {
        cmd: "ollama launch",
        oQueFaz: "Sem argumento, abre o menu: lista as integrações que a sua versão conhece, marca as que já estão instaladas e deixa escolher o modelo. É por aqui que se começa — e é a lista real, não a tabela abaixo, que vale para a sua máquina."
      },
      {
        cmd: "ollama launch claude",
        oQueFaz: "Abre o Claude Code falando com o Ollama. Se o Claude Code não estiver instalado, ele se oferece para instalar. Por baixo, o que muda é `ANTHROPIC_BASE_URL=http://localhost:11434` — a harness pensa que está falando com a Anthropic e está falando com o processo local."
      },
      {
        cmd: "ollama launch claude --model gpt-oss:120b-cloud",
        oQueFaz: "O mesmo, já dizendo qual modelo. Sufixo `-cloud` (ou `:cloud`, nos modelos sem variante de tamanho) manda a conta para o servidor da Ollama; sem sufixo, roda no seu disco."
      },
      {
        cmd: "ollama launch opencode --config",
        oQueFaz: "`--config` configura sem abrir o programa: útil para deixar a máquina pronta e sair. `--restore` desfaz, devolvendo a integração ao perfil padrão dela."
      },
      {
        cmd: "ollama launch codex -- --sandbox workspace-write",
        oQueFaz: "Tudo depois de `--` vai direto para a harness, sem o Ollama interpretar. É como se passam as opções próprias de cada ferramenta."
      },
      {
        cmd: "ollama launch claude --model gemma4:cloud --yes -- -p \"como este repositório funciona?\"",
        oQueFaz: "`--yes` pula as confirmações e baixa o modelo se precisar (exige `--model`). É a forma de usar tudo isso dentro de um script ou de um pipeline de CI."
      }
    ],

    integracoesTitulo: "As integrações que o `ollama launch` conhece",
    integracoesNota: "Lista do `ollama launch --help`. Ela cresce a cada versão — rode o comando sem argumento para ver a da sua.",
    integracoes: [
      { id: "claude", nome: "Claude Code", nota: "Anthropic. Instala sozinho se faltar." },
      { id: "chatgpt", nome: "ChatGPT", nota: "Aliases: codex-app, codex-desktop, codex-gui." },
      { id: "hermes", nome: "Hermes Agent", nota: "Nous Research." },
      { id: "openclaw", nome: "OpenClaw", nota: "Aliases: clawdbot, moltbot." },
      { id: "opencode", nome: "OpenCode", nota: "Anomaly. Instala sozinho se faltar." },
      { id: "codex", nome: "Codex", nota: "OpenAI." },
      { id: "hermes-desktop", nome: "Hermes Desktop", nota: "Versão de janela do Hermes." },
      { id: "copilot", nome: "Copilot CLI", nota: "GitHub. Alias: copilot-cli." },
      { id: "omp", nome: "OMP", nota: "Agente com integração de IDE." },
      { id: "droid", nome: "Droid", nota: "Factory." },
      { id: "dsh", nome: "DeepSeek Harness", nota: "Alias: deepseek-harness." },
      { id: "kimi", nome: "Kimi Code CLI", nota: "Moonshot." },
      { id: "muse", nome: "Muse Code", nota: "Meta. Alias: muse-code." },
      { id: "pi", nome: "Pi", nota: "Instala @earendil-works/pi-coding-agent se faltar." },
      { id: "pool", nome: "Pool", nota: "Poolside." },
      { id: "cline", nome: "Cline", nota: "Instala via npm se faltar." },
      { id: "qwen", nome: "Qwen Code", nota: "Alibaba." },
      { id: "vscode", nome: "VS Code", nota: "Alias: code." }
    ],

    planosTitulo: "O que a assinatura Cloud dá",
    planosNota: "Preços da página oficial de planos, conferidos em 6 de setembro de 2026. Os créditos não acumulam de um mês para o outro — confira antes de fechar o orçamento do laboratório.",
    planos: [
      {
        nome: "Free",
        preco: "US$ 0",
        credito: "Créditos iniciais",
        detalhe: "Roda modelos locais à vontade e experimenta os modelos de nuvem \"starter\". 1 requisição por vez."
      },
      {
        nome: "Pro",
        preco: "US$ 20/mês",
        credito: "US$ 60 de crédito/mês",
        detalhe: "Abre os modelos maiores e permite 3 requisições simultâneas. No plano anual sai por US$ 200 (US$ 16,67/mês).",
        destaque: true
      },
      {
        nome: "Max",
        preco: "US$ 100/mês",
        credito: "US$ 300 de crédito/mês",
        detalhe: "10 requisições simultâneas e acesso antecipado aos modelos novos."
      }
    ],
    planosExtra: "Acima disso há Team (US$ 500/mês, US$ 1.000 de crédito compartilhado, faturamento centralizado) e Enterprise sob consulta, com controle de acesso a modelos e teto de gasto — que é a conversa que um laboratório com várias pessoas acaba tendo.",

    fecho: "É aqui que a tese da página fecha em uma frase: <strong>a harness e o modelo são escolhas independentes</strong>. Você pode trocar de agente sem trocar de assinatura, e trocar de modelo sem reaprender o agente. O que não muda em nenhuma das combinações é o que dá potência a todas elas — a IA continua enxergando os seus arquivos e executando comandos."
  },

  /* ─────────────────────────────────────────────────────────────
     5. TUTORIAIS DO SIMULADOR
     A tela de computador é uma brincadeira com a cara dos anos
     2000, mas os comandos são reais e as saídas são reconstituições
     fiéis — não gravações. Cada passo declara em que janela
     acontece: terminal, navegador ou caixa de diálogo.
     ───────────────────────────────────────────────────────────── */
  tutoriais: [
    {
      id: "ollama",
      nome: "Ollama Cloud + launch",
      nomeCurto: "Ollama Cloud",
      icone: "terminal",
      legenda: "Uma assinatura, qualquer harness",
      resumo: "Do zero a um modelo grande dirigindo o Claude Code, o OpenCode ou o Pi — sem editar um arquivo de configuração.",
      minutos: 9,
      passos: [
        {
          janela: "dialogo",
          titulo: "Abrir o terminal",
          explicacao: "É a janela onde você digita comandos em vez de clicar. No Ubuntu, Ctrl+Alt+T. No macOS, Cmd+Espaço e \"Terminal\". No Windows, o PowerShell serve — mas para acompanhar este tutorial letra por letra vale ativar o WSL, que é um Linux dentro do Windows.",
          dialogo: {
            titulo: "Onde fica o terminal",
            linhas: [
              "Ubuntu / Linux — tecle Ctrl + Alt + T",
              "macOS — Cmd + Espaço, digite Terminal, Enter",
              "Windows — menu Iniciar, digite PowerShell (ou WSL)"
            ],
            botao: "Abri o terminal"
          }
        },
        {
          janela: "terminal",
          titulo: "Instalar o Ollama",
          explicacao: "Uma linha só. O `curl` baixa o script oficial e o `sh` executa. Antes de rodar um `curl | sh` vindo de qualquer lugar, confira que o endereço é mesmo o do site oficial — esse hábito vale para o resto da sua vida no terminal.",
          cmd: "curl -fsSL https://ollama.com/install.sh | sh",
          saida: [
            { t: "out", v: ">>> Installing ollama to /usr/local" },
            { t: "out", v: ">>> Downloading Linux amd64 bundle" },
            { t: "out", v: "######################################################### 100.0%" },
            { t: "out", v: ">>> Creating ollama systemd service..." },
            { t: "out", v: ">>> The Ollama API is now available at 127.0.0.1:11434." },
            { t: "out", v: ">>> Install complete. Run \"ollama\" from the command line." }
          ],
          nota: "Guarde esse endereço: 127.0.0.1:11434 é a sua própria máquina falando com ela mesma. Ele vai reaparecer no passo mais importante deste tutorial — e é ele que desmonta o par de nomes \"navegador × computador\"."
        },
        {
          janela: "terminal",
          titulo: "Entrar na conta",
          explicacao: "Aqui o tutorial se separa do caminho \"modelo no meu disco\". A assinatura Ollama Cloud dá acesso a modelos grandes demais para caber numa máquina comum, rodando nos servidores deles. O comando abre o navegador para você confirmar.",
          cmd: "ollama signin",
          saida: [
            { t: "out", v: "You need to be signed in to Ollama to run Cloud models." },
            { t: "out", v: "" },
            { t: "out", v: "If your browser did not open, navigate to:" },
            { t: "out", v: "    https://ollama.com/connect?code=HTPK-QDVX" },
            { t: "out", v: "" }
          ],
          nota: "Plano Free dá créditos iniciais e uma requisição por vez; o Pro (US$ 20/mês) dá US$ 60 de crédito por mês e três requisições simultâneas. Os valores estão no quadro da seção 05."
        },
        {
          janela: "terminal",
          titulo: "Rodar um modelo que não caberia aqui",
          explicacao: "O sufixo é tudo: `-cloud` (ou `:cloud`, nos modelos sem variante de tamanho) manda a conta para o servidor da Ollama. Repare no que NÃO acontece — não tem barra de download, porque não há nada para baixar.",
          cmd: "ollama run gpt-oss:120b-cloud \"Explique em duas frases o que é o Cerrado.\"",
          saida: [
            { t: "out", v: "O Cerrado é o segundo maior bioma da América do Sul, ocupando cerca de" },
            { t: "out", v: "dois milhões de km² no Brasil central, com vegetação de savana adaptada" },
            { t: "out", v: "a solos ácidos e ao fogo. É considerado um hotspot de biodiversidade e" },
            { t: "out", v: "abriga as nascentes de três das maiores bacias hidrográficas do país." }
          ],
          nota: "120 bilhões de parâmetros responderam em segundos numa máquina que não teria memória para carregá-los. O comando é local, o processo é local, a porta é local — o pensamento aconteceu num data center."
        },
        {
          janela: "terminal",
          titulo: "Abrir o menu do launch",
          explicacao: "Este é o comando que muda o jogo. Sem argumento, `ollama launch` mostra as harnesses que a sua versão conhece, marca as que já estão instaladas e deixa escolher o modelo. Nada de variável de ambiente, nada de arquivo de configuração.",
          cmd: "ollama launch",
          saida: [
            { t: "out", v: "  Escolha uma integração:" },
            { t: "out", v: "" },
            { t: "out", v: "> claude      Claude Code        Anthropic's coding tool with subagents" },
            { t: "out", v: "  chatgpt     ChatGPT            Use Ollama models in ChatGPT" },
            { t: "out", v: "  opencode    OpenCode           Anomaly's open-source coding agent" },
            { t: "out", v: "  codex       Codex              OpenAI's open-source coding agent" },
            { t: "out", v: "  pi          Pi                 Minimal AI agent toolkit with plugin support" },
            { t: "out", v: "  droid       Droid              Factory's coding agent across terminal and IDEs" },
            { t: "out", v: "  dsh         DeepSeek Harness   DeepSeek's open-source agent harness" },
            { t: "out", v: "  copilot     Copilot CLI        GitHub's AI coding agent for the terminal" },
            { t: "out", v: "  ...         (18 no total)" }
          ],
          nota: "A lista completa está na seção 05. Ela cresce a cada versão do Ollama — por isso vale rodar o comando e olhar a sua, em vez de confiar em qualquer tabela publicada (esta inclusive)."
        },
        {
          janela: "terminal",
          titulo: "Dirigir o Claude Code com o modelo da Ollama",
          explicacao: "Instala a harness se ela faltar, aponta para o servidor local e abre o programa. Se você já leu a seção 01 desta página, o que aparece na terceira linha da saída é a prova do argumento inteiro.",
          cmd: "ollama launch claude --model gpt-oss:120b-cloud",
          saida: [
            { t: "out", v: "Claude Code is not installed. Install it now? [Y/n] y" },
            { t: "out", v: "Installing Claude Code..." },
            { t: "out", v: "ANTHROPIC_BASE_URL=http://localhost:11434" },
            { t: "out", v: "Starting Claude Code with gpt-oss:120b-cloud" },
            { t: "out", v: "" },
            { t: "out", v: "  Welcome to Claude Code" },
            { t: "out", v: "  cwd: /home/ana/projetos/analise-cerrado" },
            { t: "out", v: "" },
            { t: "out", v: "> " }
          ],
          nota: "`ANTHROPIC_BASE_URL=http://localhost:11434`: a harness acha que está falando com a Anthropic e está falando com o processo do Ollama, na sua máquina, que por sua vez fala com o data center. Endereço local, modelo remoto — as duas coisas ao mesmo tempo, no mesmo comando."
        },
        {
          janela: "terminal",
          titulo: "Trocar de harness sem trocar de assinatura",
          explicacao: "A mesma conta serve qualquer uma das integrações. Aqui o Pi, que nem precisava estar instalado: o launch instala e abre. Vale igual para `ollama launch opencode`, `ollama launch codex`, `ollama launch droid`.",
          cmd: "ollama launch pi --model gpt-oss:120b-cloud",
          saida: [
            { t: "out", v: "Pi is not installed. Install it now? [Y/n] y" },
            { t: "out", v: "npm install -g @earendil-works/pi-coding-agent@latest" },
            { t: "out", v: "added 1 package in 6s" },
            { t: "out", v: "Starting Pi with gpt-oss:120b-cloud" },
            { t: "out", v: "" },
            { t: "out", v: "pi › " }
          ],
          nota: "É este o ganho prático da assinatura: harness e modelo viram escolhas independentes. Dá para trocar de agente sem trocar de plano, e trocar de modelo sem reaprender o agente."
        },
        {
          janela: "terminal",
          titulo: "E quando o dado não pode sair",
          explicacao: "O mesmo programa faz o contrário: sem sufixo de nuvem, os pesos vêm para o seu disco e a conta roda na sua máquina. É a opção para prontuário, entrevista e qualquer dado sob termo de consentimento — e a razão pela qual esta família existe na página.",
          cmd: "ollama pull qwen3.5:4b && ollama run qwen3.5:4b \"Resuma este trecho de entrevista.\"",
          saida: [
            { t: "out", v: "pulling manifest" },
            { t: "out", v: "pulling 4c2a1f8d... 100%  ▕████████████████▏ 2.4 GB" },
            { t: "out", v: "success" },
            { t: "out", v: "" },
            { t: "out", v: "[resposta gerada localmente]" }
          ],
          nota: "Desligue o wi-fi e rode de novo: este continua funcionando, o `:cloud` não. É o teste de uma linha que separa as duas coisas — e a única prova que vale antes de confiar um dado sensível a qualquer ferramenta desta página."
        }
      ],
      fecho: "Duas conclusões, e elas não se anulam. A assinatura Cloud resolve o problema de potência: modelos grandes demais para a sua máquina, dirigindo a harness que você preferir, por um comando só. O modelo local resolve o problema de sigilo: mais fraco, sem fatura, e nada sai do disco. O que os dois têm em comum é o que esta página inteira defende — em qualquer um deles a IA enxerga os seus arquivos e executa comandos, e é daí que vem a diferença."
    },
    {
      id: "antigravity",
      nome: "Instalar o Antigravity",
      nomeCurto: "Antigravity",
      icone: "janela",
      legenda: "Um IDE em que o agente é o protagonista",
      resumo: "Do download à primeira tarefa executada por um agente com editor, terminal e navegador.",
      minutos: 10,
      passos: [
        {
          janela: "navegador",
          titulo: "Baixar",
          explicacao: "Sim: o primeiro passo para sair do navegador acontece no navegador. É uma boa hora para reparar que o navegador nunca foi o problema — o problema era a IA morar dentro dele.",
          navegador: {
            url: "antigravity.google/download",
            titulo: "Google Antigravity",
            texto: "Prévia pública, sem custo. Escolha o instalador do seu sistema:",
            opcoes: ["macOS (Apple Silicon)", "macOS (Intel)", "Windows", "Linux (.deb)"],
            botao: "Baixar"
          },
          nota: "A prévia é gratuita e vem com cotas generosas do Gemini 3 Pro."
        },
        {
          janela: "dialogo",
          titulo: "Instalar",
          explicacao: "Instalação comum, sem terminal: no macOS você arrasta o ícone para a pasta Aplicativos; no Windows é o instalador de sempre; no Linux, um pacote .deb.",
          dialogo: {
            titulo: "Instalar o Antigravity",
            linhas: [
              "macOS — abra o .dmg e arraste para Aplicativos",
              "Windows — execute o instalador e siga o assistente",
              "Linux — sudo dpkg -i antigravity_*.deb"
            ],
            botao: "Instalado"
          }
        },
        {
          janela: "dialogo",
          titulo: "Entrar e escolher o modelo",
          explicacao: "No primeiro arranque ele pede a Conta Google e o modelo. É aqui que fica claro o ponto do vocabulário: o aplicativo está na sua máquina, o modelo continua num data center do Google.",
          dialogo: {
            titulo: "Bem-vindo ao Antigravity",
            linhas: [
              "Conta: entrar com o Google",
              "Modelo: Gemini 3 Pro",
              "Autonomia: Review-driven (revisar antes de aplicar)"
            ],
            botao: "Continuar"
          },
          nota: "Comece pelo preset mais conservador. Autonomia se afrouxa depois de a confiança ser conquistada, nunca antes."
        },
        {
          janela: "dialogo",
          titulo: "Abrir uma pasta",
          explicacao: "O agente trabalha dentro de uma pasta — e enxerga só ela. Escolher a pasta é escolher o alcance dele; comece por um projeto pequeno e, de preferência, versionado no git.",
          dialogo: {
            titulo: "Abrir pasta",
            linhas: [
              "~/projetos/analise-cerrado",
              "12 arquivos · repositório git · última alteração hoje"
            ],
            botao: "Abrir"
          }
        },
        {
          janela: "terminal",
          titulo: "Dar a primeira tarefa",
          explicacao: "Você escreve em português; ele planeja, executa e mostra o que fez. O terminal abaixo é o do próprio IDE — os comandos são os mesmos do primeiro cenário desta página, agora rodando dentro de uma janela com botões.",
          prompt: "Organize as fotos de ~/campo-2026 em subpastas por data e me diga se sobrou alguma.",
          cmd: "ls ~/campo-2026 | wc -l",
          saida: [
            { t: "out", v: "1240" },
            { t: "out", v: "" },
            { t: "out", v: "[plano] 1. inspecionar nomes  2. agrupar por data de modificação" },
            { t: "out", v: "        3. mover com mv -n  4. conferir a contagem final" }
          ],
          nota: "Repare no plano antes da ação: é o preset \"revisar antes de aplicar\" funcionando. Você aprova o plano, e só então ele mexe em arquivo."
        },
        {
          janela: "terminal",
          titulo: "Ver o agente trabalhando",
          explicacao: "Daqui em diante é igual ao terminal — porque é o terminal. A diferença é o que está em volta: diff lado a lado, navegador embutido para testar o que foi construído, e um gerenciador para tocar várias tarefas ao mesmo tempo.",
          cmd: "find ~/campo-2026/ORGANIZADAS -type f | wc -l",
          saida: [
            { t: "out", v: "1240" },
            { t: "out", v: "" },
            { t: "out", v: "[agente] 1240 arquivos em 20 subpastas por data. Nenhum sobrou." },
            { t: "out", v: "[agente] Nada foi sobrescrito (mv -n). Quer que eu gere um índice CSV?" }
          ]
        }
      ],
      fecho: "O Antigravity resolve a parte que trava a maioria das pessoas — a janela preta — sem abrir mão do essencial: o agente enxerga os arquivos e executa comandos. É a mesma potência do CLI numa embalagem com botões."
    }
  ],

  /* ─────────────────────────────────────────────────────────────
     6. O QUE VOCÊ ESTÁ AUTORIZANDO
     Dar mãos à IA é dar mãos à IA. Esta seção não é aviso legal:
     são as cinco regras que evitam os acidentes que a gente já viu
     acontecer.
     ───────────────────────────────────────────────────────────── */
  seguranca: [
    {
      titulo: "Aprovar é o recurso, não o obstáculo",
      texto: "Todos os agentes desta página pedem permissão antes de rodar comando ou alterar arquivo. A tentação de desligar isso (\"aceitar tudo\") aparece na segunda hora de uso. Desligar transforma um assistente que erra e mostra num assistente que erra e some com a evidência."
    },
    {
      titulo: "Pasta pequena, escolhida por você",
      texto: "O agente enxerga a pasta em que foi aberto. Abrir na raiz do disco ou na sua home é dar acesso a chaves de SSH, a e-mail e a tudo mais. Abra no projeto, e só nele."
    },
    {
      titulo: "Git (ou uma cópia) antes de soltar",
      texto: "Com o histórico versionado, todo estrago tem `git diff` e tem volta. Sem ele, um `mv` bem-intencionado em 1.240 arquivos é irreversível. Se o material não é código, uma cópia da pasta resolve."
    },
    {
      titulo: "Comando destrutivo merece leitura",
      texto: "`rm`, `mv` sobre arquivo existente, `>` que trunca, `git reset --hard`, `DROP`. Quando a aprovação pedir algo dessa lista, leia o caminho até o fim antes de dizer sim. É o único momento da interação em que a pressa cobra caro."
    },
    {
      titulo: "O que você cola no terminal é seu",
      texto: "Vale tanto para script que veio do chat quanto para `curl | sh` copiado de um blog. Se a origem não é a página oficial do projeto, não rode. O agente com terminal reduz o vaivém de copiar e colar justamente porque testa antes — mas a responsabilidade final continua na cadeira."
    },
    {
      titulo: "Dado sensível pede modelo local — e `:cloud` não é local",
      texto: "Prontuário, entrevista, dado de terceiro sob termo de consentimento: aqui a pergunta não é qual modelo é melhor, e sim qual não manda nada para fora. Cuidado com a armadilha de nome: `ollama run qwen3.5:4b` roda na sua máquina, `ollama run gemma4:cloud` roda no servidor da Ollama. É o mesmo programa, o mesmo comando e o mesmo endereço `localhost` — só o sufixo do modelo separa uma coisa da outra. Em dado sensível, confira o sufixo antes de confiar."
    }
  ]
};
