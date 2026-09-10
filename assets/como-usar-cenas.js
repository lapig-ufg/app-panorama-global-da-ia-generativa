/* ═══════════════════════════════════════════════════════════════
   Panorama Global da IA Generativa — Cenas da aba "Como usar"

   Cada cena é UMA tarefa real, feita nos DOIS lugares:
     · à esquerda, o chat do navegador;
     · à direita, o mesmo pedido para um programa instalado na
       máquina, com acesso aos arquivos.

   DE ONDE VEM ISTO
   Lado do navegador
     automation/capturas/gemini-2026-09-09.json
     Cinco conversas novas no Gemini 3.6, capturadas em 09/set/2026.
   Lado do programa instalado
     automation/capturas/antigravity-2026-09-10-forma-agente.json
     automation/capturas/claude-code-deepseek-2026-09-10-forma-agente.json
     As mesmas tarefas, em 10/set/2026, numa pasta de teste montada
     por automation/cenario-teste/preparar.py. O resultado de cada
     uma foi conferido NO DISCO por conferir.py — não pela conversa.

   A REGRA QUE SUSTENTA A SEÇÃO INTEIRA
   Todo texto em `txt` de um bloco `voce`, `ia`, `sandbox`, `cmd` ou
   `chips` é TRECHO LITERAL da captura. Não parafraseie, não
   conserte a gramática nem a acentuação, não encurte no meio de uma
   frase — corte só no fim, e marque `corte: true`.
   `automation/valida-cenas.mjs` confere isso beat por beat e FALHA
   se um trecho não existir na captura. Rode antes de commitar.

   Os blocos `marca` são a voz do site, não da conversa: é o único
   lugar onde há interpretação, e a tela os desenha diferente por
   isso mesmo.
   ═══════════════════════════════════════════════════════════════ */

const COMO_USAR_CENAS = {
  fontes: {
    navegador: {
      arquivo: "automation/capturas/gemini-2026-09-09.json",
      rotulo: "Gemini 3.6, no navegador",
      curto: "no navegador",
      data: "09/set/2026",
      nota: "Conta Workspace institucional da UFG. Cinco conversas novas, sem contexto cruzado, sem anexar arquivo."
    },
    agente: {
      arquivos: [
        "automation/capturas/antigravity-2026-09-10-forma-agente.json",
        "automation/capturas/claude-code-deepseek-2026-09-10-forma-agente.json"
      ],
      rotulo: "Instalado na máquina, com acesso à pasta",
      curto: "instalado na máquina",
      data: "10/set/2026",
      nota: "Windows 11. Antigravity CLI com Gemini 3.6 Flash e Claude Code com DeepSeek V4 Flash pelo Ollama Cloud. Pasta de teste regenerada antes de cada execução."
    },
    /* Capturas do mesmo dia que NÃO entram nas cenas — são outras
       execuções da mesma tarefa. Só podem ser citadas em `saibaMais`,
       e a citação tem de dizer que veio de outra execução. */
    extras: {
      arquivos: [
        "automation/capturas/claude-code-deepseek-2026-09-10-B.json"
      ]
    }
  },

  cenas: [
    /* ══════════════════════════════════════════════════════════
       1. ONDE O PROGRAMA INSTALADO GANHA LIMPO
       ══════════════════════════════════════════════════════════ */
    {
      id: "fotos",
      aba: "1.240 fotos de campo",
      pergunta: "Tenho uma pasta com mais de mil fotos de campo, tiradas em três semanas. Como separo elas em subpastas por data?",
      emJogo: "As fotos vieram de câmeras diferentes. Três delas têm nome fora do padrão. Se o programa procurar só por “IMG_”, essas três ficam para trás — e ninguém percebe.",

      navegador: {
        beats: [
          { t: "voce", txt: "Tenho uma pasta com mais de mil fotos de campo, tiradas em três semanas. Como separo elas em subpastas por data?" },
          { t: "ia", txt: "Antes de executar qualquer comando de movimentação em lote, faça uma cópia de segurança de toda a pasta de fotos em outro local para evitar perdas acidentais." },
          { t: "marca", tom: "bom", txt: "Começou pelo backup, sem ninguém pedir. Bom conselho." },
          { t: "ia", txt: "Opção 1: No Windows (PowerShell)" },
          { t: "marca", tom: "ruim", txt: "Windows como opção 1, macOS como opção 2. <strong>Linux não aparece</strong> — e quem perguntou está no Ubuntu. Ele não tinha como saber: ninguém disse, e ele não pode olhar." },
          { t: "voce", txt: "Deu erro: mv: target is not a directory" },
          { t: "ia", txt: "Esse erro ocorre quando a variável da data é criada vazia ou com caracteres inválidos" },
          { t: "marca", tom: "neutro", txt: "Diagnosticou bem e trocou por um comando em Python, que funciona. Consertou um problema que ele mesmo criou ao chutar o sistema." },
          { t: "voce", txt: "Agora rodou. Mas ficaram 1.237 fotos e não 1.240." },
          { t: "ia", txt: "A diferença de 3 arquivos geralmente ocorre por dois motivos: arquivos ocultos/sistema que foram ignorados pelo script ou fotos com nomes idênticos na mesma data que se sobrescreveram ao serem movidas para a mesma pasta." },
          { t: "marca", tom: "chave", txt: "Quem descobriu que faltavam três fotos foi <strong>a pessoa</strong>. Ele acertou o diagnóstico depois — mas só porque alguém foi lá conferir e voltou para contar." }
        ],
        fecho: "Três mensagens. Resolveu — com a pessoa fazendo o papel de olhos."
      },

      agente: {
        ferramenta: "Antigravity",
        beats: [
          { t: "voce", txt: "Tenho uma pasta com mais de mil fotos de campo, tiradas em tres semanas. Como separo elas em subpastas por data?" },
          { t: "cmd", tipo: "olhar", txt: "[list_dir] C:\\Users\\amara\\laboratorio-teste" },
          { t: "marca", tom: "bom", txt: "Primeiro movimento: abrir a pasta. Havia quatro subpastas ali; ele identificou sozinho que as fotos estavam em <code>campo-2026</code>, e que eram 1.240. Ninguém contou isso a ele." },
          { t: "cmd", tipo: "olhar", txt: "python -c \"import PIL; print(PIL.__version__)\"" },
          { t: "marca", tom: "chave", txt: "Testou se a biblioteca de imagens existe <em>nesta</em> máquina antes de propor usá-la. É o que o navegador não consegue fazer — lá, a frase é sempre “caso não esteja instalado, instale”." },
          { t: "ia", txt: "Isso é fundamental em fotos de campo porque a data do arquivo no computador pode mudar ao copiar, mas a data gravada pela câmera/celular não muda." },
          { t: "voce", txt: "Pode." },
          { t: "cmd", tipo: "mexer", txt: "python C:\\Users\\amara\\.gemini\\antigravity-cli\\brain\\5bd9e8ea-429d-4a67-a0c0-d96023a9b845\\scratch\\organize_photos.py" },
          { t: "cmd", tipo: "olhar", txt: "[list_dir] C:\\Users\\amara\\laboratorio-teste\\campo-2026" },
          { t: "marca", tom: "bom", txt: "Depois de mexer, voltou para olhar. Essa última linha é a diferença entre entregar e conferir." }
        ],
        fecho: "Onze comandos. As três fotos fora do padrão entraram pela data do arquivo. Nenhuma ficou solta."
      },

      placar: {
        titulo: "O que o disco diz",
        linhas: [
          { rotulo: "Fotos que continuavam lá", valor: "1.240 de 1.240", bom: true },
          { rotulo: "Fotos que ficaram fora de alguma subpasta", valor: "nenhuma", bom: true },
          { rotulo: "Subpastas de data criadas", valor: "20", bom: true }
        ],
        nota: "Conferido por <code>conferir.py --avaliar</code>, contando arquivos no disco depois da execução. O Claude Code fez a mesma tarefa e também não perdeu nenhuma: criou 21 subpastas, sendo uma <code>_sem-data</code> para as três sem data confiável."
      },

      licao: "Aqui o programa instalado ganha sem asterisco. Ele não precisou que ninguém dissesse quantas fotos eram, onde estavam nem qual era o sistema — foi olhar. E, no fim, foi conferir.",

      saibaMais: {
        titulo: "As três fotos fora do padrão, e o que cada um fez com elas",
        corpo: "Entre as 1.240, três tinham nome quebrado: <code>foto final (1).jpg</code>, <code>sem nome.JPG</code> e <code>IMG-corrompida.jpeg</code>. Um programa que procure só por arquivos começados em <code>IMG_</code> deixa as três para trás.<br><br>Os dois programas instalados acharam as três. O Antigravity usou a data de modificação do arquivo e mandou cada uma para a subpasta correspondente. O Claude Code preferiu criar uma pasta <code>_sem-data</code> e separá-las ali, para a pessoa decidir depois. Soluções diferentes, nenhum arquivo perdido nas duas.<br><br>No navegador, essas mesmas três viraram a frase “ficaram 1.237 fotos e não 1.240” — que a pessoa só pôde escrever porque foi olhar."
      }
    },

    /* ══════════════════════════════════════════════════════════
       2. A ARMADILHA — O ACHADO MAIS FORTE DA MEDIÇÃO
       ══════════════════════════════════════════════════════════ */
    {
      id: "planilhas",
      aba: "40 planilhas → CSV",
      pergunta: "Como converto 40 arquivos .xlsx em .csv de uma vez?",
      emJogo: "Os 40 arquivos têm 97 abas no total. Um CSV só guarda uma aba. Quem converter arquivo por arquivo gera 40 CSVs, perde 57 abas — e não vê erro nenhum na tela.",
      destaque: true,

      navegador: {
        beats: [
          { t: "voce", txt: "Como converto 40 arquivos .xlsx em .csv de uma vez, no Ubuntu?" },
          { t: "ia", txt: "A forma mais rápida e simples no Ubuntu é utilizar o LibreOffice via terminal, que já vem pré-instalado na maioria das distribuições Linux." },
          { t: "ia", txt: "for f in *.xlsx; do libreoffice --headless --convert-to csv \"$f\"; done" },
          { t: "ia", txt: "Verificação: Digite ls *.csv no terminal para verificar se os 40 arquivos .csv correspondentes foram gerados na pasta." },
          { t: "marca", tom: "ruim", txt: "A conferência que ele mesmo sugere <strong>passa</strong>: 40 entraram, 40 saíram. O que ficou para trás foi o conteúdo das outras 57 abas." },
          { t: "voce", txt: "Isso pega todas as abas de cada planilha?" },
          { t: "ia", txt: "Não. O comando do LibreOffice via terminal converte apenas a primeira aba (ou a aba ativa) de cada planilha." },
          { t: "marca", tom: "chave", txt: "Resposta certa e direta — <strong>depois de perguntado</strong>. Ele sabia o tempo todo. Só não disse antes." }
        ],
        fecho: "Sabia do problema. Avisou quando questionado. Não podia converter nada: mandou a pessoa substituir “/caminho/para/sua/pasta” à mão."
      },

      agente: {
        ferramenta: "Claude Code",
        beats: [
          { t: "voce", txt: "Como converto 40 arquivos .xlsx em .csv de uma vez?" },
          { t: "cmd", tipo: "olhar", txt: "find \"C:/Users/amara/laboratorio-teste\" -iname \"*.xlsx\" -o -iname \"*.xls\" 2>/dev/null | head -60" },
          { t: "marca", tom: "bom", txt: "Achou os 40 arquivos varrendo a árvore inteira, sem perguntar onde estavam." },
          { t: "cmd", tipo: "olhar", txt: "python -c \"import pandas; print('pandas', pandas.__version__)\" 2>&1; python -c \"import openpyxl; print('openpyxl', openpyxl.__version__)\" 2>&1" },
          { t: "marca", tom: "bom", txt: "Conferiu que as bibliotecas existem nesta máquina. Até aqui, tudo melhor que no navegador." },
          { t: "cmd", tipo: "mexer", txt: "cd \"C:/Users/amara/laboratorio-teste\" && python \"C:/Users/amara/AppData/Local/Temp/claude/C--Users-amara-laboratorio-teste/d9b4821a-6eef-41ce-bb7a-f50064574a48/scratchpad/converter_xlsx_csv.py\"" },
          { t: "ia", txt: "Pronto! ✅ Os **40 arquivos .xlsx** foram convertidos para `.csv` de uma vez, todos em `planilhas-campo/` (mesmo nome, extensão `.csv`), com 0 erros." },
          { t: "marca", tom: "ruim", txt: "“Com 0 erros”. Não houve erro nenhum na tela. E 57 abas acabaram de sumir." },
          { t: "ia", txt: "**Como foi feito:** um script Python que usa `pandas` para ler cada `.xlsx` (primeira aba) e salvar como CSV UTF-8, sem o índice." },
          { t: "marca", tom: "chave", txt: "Leia de novo: <strong>“primeira aba”</strong>. Ele escreveu o problema na própria explicação do que fez — e mesmo assim entregou “0 erros”. Não foi ignorância." },
          { t: "cmd", tipo: "olhar", txt: "cd \"C:/Users/amara/laboratorio-teste/planilhas-campo\" && cat campo_2019_00.csv && echo \"---\" && ls *.csv | wc -l" },
          { t: "marca", tom: "ruim", txt: "A conferência dele foi contar quantos CSV existem. Devolve 40. <strong>Passa.</strong> É exatamente a checagem que esta armadilha engana — a mesma que o Gemini tinha sugerido no navegador." }
        ],
        fecho: "Oito comandos, tudo verde na tela, 57 abas perdidas em silêncio."
      },

      placar: {
        titulo: "O que o disco diz",
        linhas: [
          { rotulo: "CSVs gerados", valor: "40", bom: false },
          { rotulo: "Abas que existiam nos 40 arquivos", valor: "97", bom: null },
          { rotulo: "Abas perdidas, sem nenhum aviso", valor: "57", bom: false }
        ],
        nota: "Os dois programas instalados caíram igual. Repetindo a mesma frase cinco vezes em cada um: <strong>9 execuções erradas em 9</strong> que chegaram a executar."
      },

      viradaTitulo: "A frase que conserta",
      virada: {
        antes: "Como converto 40 arquivos .xlsx em .csv de uma vez?",
        antesResultado: "40 arquivos. 57 abas perdidas.",
        depois: "Converta todas as planilhas desta pasta para CSV, sem perder nenhuma aba.",
        depoisResultado: "97 arquivos, um por aba.",
        selo: "10 acertos em 10 execuções, nos dois programas",
        texto: "Mesma pasta, mesmo programa, mesmo dia. O que mudou foi <strong>dizer o que não podia ser perdido</strong>. Não é sobre esforço: com a ordem ele roda cerca do dobro de comandos, mas o que muda o resultado é ele ir contar as abas antes de converter — e isso só acontece quando o pedido diz que elas importam."
      },

      licao: "Peça pelo resultado, não pela ferramenta. “Converta em CSV” descreve um meio; “sem perder nenhuma aba” descreve o que você não aceita perder. É essa segunda parte que o programa consegue verificar depois.",

      saibaMais: {
        titulo: "O achado incômodo: ele explicou o problema e caiu nele assim mesmo",
        corpo: "A mesma frase foi repetida cinco vezes em cada programa. Marcando quais execuções <strong>avisaram por escrito</strong> que a conversão pega só a primeira aba:<br><br>O Claude Code avisou em <strong>5 de 5</strong> — e errou em <strong>5 de 5</strong>. O Antigravity avisou em 2 de 5 e errou nas 5.<br><br>Nas dez execuções feitas com a ordem “sem perder nenhuma aba”, <em>nenhuma</em> avisou — porque não havia o que avisar. Elas simplesmente fizeram certo.<br><br>E há um detalhe que resume a aba inteira: das vinte execuções, uma única não produziu CSV nenhum, porque não olhou a pasta e não executou nada — entregou só texto, como um chat de navegador faria. Foi justamente uma das duas que <strong>avisou</strong> sobre as abas.<br><br><strong>O que faz é o que não avisa.</strong> O aviso apareceu quando o programa estava sem as mãos."
      }
    },

    /* ══════════════════════════════════════════════════════════
       3. OS DOIS OLHAM — E OS DOIS ERRAM DE JEITOS DIFERENTES
       ══════════════════════════════════════════════════════════ */
    {
      id: "disco",
      aba: "O que lotou a pasta",
      pergunta: "Minha pasta de trabalho encheu e não sei o que está ocupando espaço. Como descubro?",
      emJogo: "A maior pasta da árvore é a das fotos de campo — o dado primário, que não pode ser apagado. A resposta certa são 84 arquivos byte a byte idênticos, escondidos numa subpasta, todos com mais de um ano.",

      navegador: {
        beats: [
          { t: "voce", txt: "Meu HD de 500 GB encheu e não sei o que está ocupando espaço. Como descubro?" },
          { t: "ia", txt: "Pressione as teclas Windows + I para abrir as Configurações, clique em Sistema e selecione Armazenamento.", corte: true },
          { t: "marca", tom: "ruim", txt: "Ninguém perguntou o sistema. Ele decidiu que era Windows e entregou o procedimento inteiro — atalho de teclado, programa para instalar, unidade C:." },
          { t: "ia", txt: "Qual é o sistema operacional exato do seu computador (Windows 10, Windows 11, macOS ou Linux)?" },
          { t: "marca", tom: "ruim", txt: "A pergunta veio no <em>fim</em> da resposta. Primeiro a recomendação, depois a informação que decide se ela vale alguma coisa." },
          { t: "voce", txt: "Não sei, como eu vejo isso?" },
          { t: "ia", txt: "Observe o teclado e a tela. Se o seu computador tiver um símbolo de maçã no canto superior esquerdo da tela ou no teclado, é um Mac." },
          { t: "chips", ops: ["Apareceu Windows 10", "Apareceu Windows 11", "É um Mac (macOS)"] },
          { t: "marca", tom: "ruim", txt: "Os três atalhos de resposta oferecidos. <strong>Linux não está entre eles</strong> — e ele mesmo tinha listado Linux uma resposta antes." },
          { t: "voce", txt: "Não sei, como eu vejo isso?" },
          { t: "marca", tom: "chave", txt: "Terceira resposta seguida sobre qual é o computador. A pergunta era sobre um disco cheio, e o disco não andou um passo." }
        ],
        fecho: "Travou. Três mensagens tentando descobrir em que máquina a pessoa está."
      },

      agente: {
        ferramenta: "Antigravity",
        beats: [
          { t: "voce", txt: "Minha pasta de trabalho encheu e nao sei o que esta ocupando espaco. Como descubro?" },
          { t: "cmd", tipo: "olhar", txt: "Get-ChildItem -Path . -Directory | ForEach-Object { $dir = $_ $size = (Get-ChildItem -Path $dir.FullName -Recurse -File -ErrorAction SilentlyContinue | Measure-", corte: true },
          { t: "marca", tom: "bom", txt: "Zero perguntas. Mediu o tamanho de cada subpasta e a distribuição por tipo de arquivo, e respondeu com números da máquina de quem perguntou." },
          { t: "ia", txt: "O tamanho total acumulado no diretório é de aproximadamente **~2,61 GB**." },
          { t: "marca", tom: "chave", txt: "Compare com o outro lado: lá, três mensagens sem sair do lugar; aqui, cinco comandos e um mapa da pasta. É a mesma pergunta." },
          { t: "marca", tom: "ruim", txt: "Mas olhe o que <strong>não</strong> aparece em nenhum dos cinco comandos: nada que compare dois arquivos entre si. Nenhum cálculo de impressão digital, nenhum <code>Compare-Object</code>." },
          { t: "marca", tom: "ruim", txt: "Os 84 arquivos idênticos — que são a resposta do exercício — nunca foram encontrados. E ele recomendou apagar uma pasta de imagens de satélite que era produto final." }
        ],
        fecho: "Cinco comandos, um diagnóstico bem-feito da pergunta errada."
      },

      placar: {
        titulo: "O que o disco diz",
        linhas: [
          { rotulo: "Pastas medidas corretamente", valor: "todas", bom: true },
          { rotulo: "Grupos de arquivos idênticos encontrados", valor: "nenhum", bom: false },
          { rotulo: "Execuções, no dia, que compararam arquivos entre si", valor: "0 de 11", bom: false }
        ],
        nota: "Este é o resultado mais repetido de toda a medição: em onze execuções, nos dois programas, nenhum calculou a impressão digital de um arquivo sequer."
      },

      licao: "Existe uma classe inteira de problema que o programa não enxerga porque ela exige <strong>olhar dois arquivos ao mesmo tempo</strong>. Ele examina cada um com cuidado — nome, tamanho, data, conteúdo — e não pergunta se dois deles são a mesma coisa.",

      saibaMais: {
        titulo: "Um detalhe de teste que virou achado",
        corpo: "A pergunta original dizia <em>“meu HD de 500 GB encheu”</em>. A pasta de teste tinha 415 MB. Com essa frase, os dois programas <strong>saíram da pasta e varreram o disco C: inteiro</strong> — só lendo, nada apagado, mas longe de onde deviam estar.<br><br>Trocando só o tamanho descrito, e mantendo a forma da pergunta — <em>“minha pasta de trabalho encheu”</em> —, o Antigravity rodou 4 comandos e o Claude Code 6, <strong>todos dentro da pasta</strong>.<br><br>Isso não é defeito do programa. É a regra desta aba aparecendo de novo: descrever para ele uma coisa que não existe na máquina o manda procurar essa coisa onde ele achar."
      }
    },

    /* ══════════════════════════════════════════════════════════
       4. O MESMO CÓDIGO, EM ARQUIVOS QUE EXISTEM
       ══════════════════════════════════════════════════════════ */
    {
      id: "nomes",
      aba: "340 nomes bagunçados",
      pergunta: "Preciso padronizar o nome de 340 arquivos .tif: sem acento, sem espaço, tudo minúsculo. Como faço?",
      emJogo: "Dois arquivos da pasta se chamam “Área Teste 01.tif” e “Area Teste 01.tif”. Tirando o acento, os dois viram o mesmo nome — e um apaga o outro.",

      navegador: {
        beats: [
          { t: "voce", txt: "Preciso padronizar o nome de 340 arquivos .tif no Ubuntu: sem acento, sem espaço, tudo minúsculo. Como faço?" },
          { t: "sandbox", txt: "nfkd = unicodedata.normalize('NFKD', filename)" },
          { t: "marca", tom: "bom", txt: "Código correto, e da melhor maneira possível — normalização Unicode, que não depende da configuração de idioma do sistema." },
          { t: "sandbox", txt: "Relatório Final Água.tif -> relatorio_final_agua.tif" },
          { t: "marca", tom: "chave", txt: "Mas olhe <em>sobre o que</em> ele rodou: nomes que ele mesmo inventou. Os 340 arquivos da pessoa continuam invisíveis — e é neles que mora o par que colide." },
          { t: "marca", tom: "neutro", txt: "Explicou o risco de colisão de nomes e sugeriu cópia de segurança antes de renomear. Não sugeriu ensaiar nos arquivos reais — não teria como." }
        ],
        fecho: "Resolveu na primeira resposta. O código estava certo; ele só não pôde rodá-lo onde importava."
      },

      agente: {
        ferramenta: "Antigravity",
        beats: [
          { t: "voce", txt: "Preciso padronizar o nome de 340 arquivos .tif: sem acento, sem espaco, tudo minusculo. Como faco?" },
          { t: "cmd", tipo: "olhar", txt: "[find_by_name] C:\\Users\\amara\\laboratorio-teste" },
          { t: "voce", txt: "Na pasta que voce ja esta." },
          { t: "cmd", tipo: "mexer", txt: "python -c \" from pathlib import Path base = Path(r'C:\\Users\\amara\\laboratorio-teste\\rasters-brutos') for f in base.glob('*Teste*'): print(f.name, f.stat().st_si", corte: true },
          { t: "marca", tom: "chave", txt: "Esse comando é o achado da cena. Ele parou no meio do trabalho para abrir <strong>especificamente os dois arquivos que colidem</strong> e olhar o tamanho de cada um. Foi checar se eram cópias ou arquivos diferentes." },
          { t: "ia", txt: "**Prevenção de sobrescrita:** Caso houvesse arquivos duplicados (como `Area Teste 01.tif` e `Área Teste 01.tif`), eles receberam sufixo numérico `_1` para evitar perda de dados." },
          { t: "marca", tom: "bom", txt: "Achou a colisão sozinho, resolveu sem perder arquivo e avisou o que tinha feito. O navegador só pôde <em>descrever</em> esse risco em tese." }
        ],
        fecho: "Dez comandos. 340 arquivos, todos normalizados, nenhum perdido."
      },

      placar: {
        titulo: "O que o disco diz",
        linhas: [
          { rotulo: "Arquivos ainda na pasta", valor: "340 de 340", bom: true },
          { rotulo: "Nomes normalizados", valor: "todos", bom: true },
          { rotulo: "Arquivos perdidos na colisão", valor: "nenhum", bom: true }
        ],
        nota: "O Claude Code também achou a colisão — e escolheu <strong>parar e perguntar</strong> como a pessoa preferia resolver, oferecendo por conta própria salvar uma planilha com o mapa de antigo→novo para poder desfazer."
      },

      licao: "O navegador escreveu o código certo. O programa instalado rodou o mesmo código <strong>nos arquivos de verdade</strong> — e foi nos arquivos de verdade que apareceu o caso que quebra.",

      saibaMais: {
        titulo: "Parar e perguntar também é uma resposta",
        corpo: "Os dois programas acharam a colisão. Cada um escolheu uma saída:<br><br>O <strong>Antigravity</strong> renomeou um dos dois com um sufixo e seguiu, relatando o que fez. O <strong>Claude Code</strong> parou, explicou a colisão e perguntou como a pessoa queria resolver — sem renomear nada.<br><br>Para o placar automático da medição, parar conta como tarefa não executada. Para quem está usando, pode ser exatamente o comportamento certo. Vale registrar que os dois são defensáveis, e que a diferença entre eles não é competência: é quanto cada um assume por conta própria.<br><br>Numa outra execução da mesma tarefa, o Claude Code escreveu, sem ninguém perguntar: <em>“mantive parênteses, hífens e `(2)`/`CÓPIA` como estão (só minúsculo, sem acento, espaço→`_`), já que você não pediu para removê-los”</em>. Ele delimitou o próprio escopo e avisou — o oposto do que fez nas planilhas. O comportamento não é fixo: responde ao que o pedido especifica."
      }
    }
  ],

  /* ─────────────────────────────────────────────────────────────
     O que a medição mudou nesta página. Fica visível na tela: uma
     seção que mede a si mesma e não corrige o resultado é propaganda.
     ───────────────────────────────────────────────────────────── */
  balanco: {
    titulo: "O que a medição mudou nesta página",
    lede: "Até 09/set/2026 as duas colunas acima eram reconstituições escritas à mão. Depois vieram as capturas reais — primeiro do navegador, depois dos programas instalados — e elas derrubaram parte do que estava escrito aqui. O texto acima já é a versão corrigida.",
    itens: [
      {
        antes: "“O chat patina e precisa de sete idas e voltas”",
        depois: "Em 4 dos 5 casos ele resolveu, em 1 a 3 mensagens. A página exagerava — e o exagero foi removido."
      },
      {
        antes: "“O programa instalado resolve o que o chat só explica”",
        depois: "Nas planilhas, os dois programas instalados perderam as 57 abas igual. O que separou acerto de erro não foi o lugar: foi a frase do pedido."
      },
      {
        antes: "“Ele não avisa da limitação das abas”",
        depois: "Pior que isso: o Claude Code avisou em 5 de 5 e errou em 5 de 5. Saber não bastou."
      },
      {
        antes: "Um gráfico comparando custo e tempo dos dois lados",
        depois: "Removido. Metade dos números não sobreviveu à medição, e o lado do navegador nunca foi cronometrado. Um lado medido e outro estimado não é um gráfico."
      },
      {
        antes: "“Os dois programas saem da pasta e varrem o disco todo”",
        depois: "Era a pergunta, não o programa. Ela descrevia um HD de 500 GB que não existia ali. Corrigido o enunciado, os dois ficaram dentro da pasta."
      }
    ],
    fecho: "Três conclusões desta medição estavam erradas pelo mesmo motivo, e foram corrigidas antes de chegar aqui: <strong>o programa age sobre o que consegue verificar que existe</strong>. Enunciado que descreve o que não está na máquina vira resposta de conhecimento — e ele está certo em fazer isso. O registro completo, com o que foi retirado e por quê, está em <code>automation/capturas/</code>."
  }
};
