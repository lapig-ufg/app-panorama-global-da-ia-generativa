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

      /* ── O QUE CADA LADO DEVOLVEU ──────────────────────────
         Resultado, não transcrição. A conversa inteira continua
         disponível num clique, mas ela é o SEGUNDO nível: quem só
         passa os olhos tem de sair daqui sabendo o que aconteceu. */
      eixo: "navegador × instalado",
      resultado: {
        esquerda: {
          rotulo: "No navegador",
          sub: "Gemini 3.6",
          fez: [
            "Escreveu um comando para você copiar.",
            "Chutou que você usa Windows — você está no Ubuntu.",
            "Você rodou, deu erro, e voltou para contar.",
            "Você percebeu que faltavam 3 fotos, e voltou de novo."
          ],
          desfecho: { valor: "3 mensagens suas", nota: "Resolveu — com você fazendo o papel de olhos.", tom: "neutro" }
        },
        direita: {
          rotulo: "Instalado na máquina",
          sub: "Antigravity",
          fez: [
            "Abriu a pasta e achou as fotos sozinho, entre quatro subpastas.",
            "Contou 1.240 arquivos.",
            "Testou se a biblioteca de imagens existe nesta máquina.",
            "Separou por data — e voltou para conferir o resultado."
          ],
          desfecho: { valor: "11 comandos, zero perguntas", nota: "Nenhuma foto ficou para trás.", tom: "bom" }
        }
      },

      explicacao: {
        titulo: "O que aconteceu",
        paragrafos: [
          "Esta é a tarefa em que o programa instalado ganha sem asterisco. Ele não precisou que ninguém dissesse quantas fotos eram, onde estavam nem qual era o sistema — foi olhar.",
          "Três fotos tinham nome fora do padrão: <code>foto final (1).jpg</code>, <code>sem nome.JPG</code> e <code>IMG-corrompida.jpeg</code>. Um programa que procure só por arquivos começados em <code>IMG_</code> deixa as três para trás. Os dois programas instalados acharam as três — o Antigravity mandou cada uma pela data do arquivo, o Claude Code criou uma pasta <code>_sem-data</code> para você decidir depois.",
          "No navegador, essas mesmas três viraram a frase <em>“ficaram 1.237 fotos e não 1.240”</em> — que a pessoa só pôde escrever porque foi conferir. Ele acertou o diagnóstico depois, e acertou bem. Mas quem descobriu o problema foi ela."
        ],
        licao: "O navegador respondeu bem. Ele só não tinha como saber quantas fotos eram, nem que três estavam fora do padrão."
      },

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
        ]
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
        ]
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

    },

    /* ══════════════════════════════════════════════════════════
       2. A ARMADILHA — O ACHADO MAIS FORTE DA MEDIÇÃO
       ══════════════════════════════════════════════════════════ */
    {
      id: "planilhas",
      aba: "40 planilhas → CSV",
      pergunta: "Como converto 40 arquivos .xlsx em .csv de uma vez?",
      emJogo: "Os 40 arquivos têm 97 abas no total. Um CSV só guarda uma aba. Quem converter arquivo por arquivo gera 40 CSVs, perde 57 abas — e não vê erro nenhum na tela.",

      eixo: "navegador × instalado",
      resultado: {
        esquerda: {
          rotulo: "No navegador",
          sub: "Gemini 3.6",
          fez: [
            "Deu o comando certo para o seu sistema.",
            "Sugeriu conferir contando quantos CSVs saíram.",
            "Avisou que a conversão pega só a primeira aba — <strong>quando você perguntou</strong>.",
            "Não podia converter nada: mandou você trocar o caminho à mão."
          ],
          desfecho: { valor: "nada convertido", nota: "Sabia do problema o tempo todo. Só não disse antes.", tom: "neutro" }
        },
        direita: {
          rotulo: "Instalado na máquina",
          sub: "Claude Code",
          fez: [
            "Achou os 40 arquivos sozinho, varrendo a árvore.",
            "Conferiu que as bibliotecas existem nesta máquina.",
            "Converteu tudo e escreveu <strong>“primeira aba”</strong> na própria explicação do que fez.",
            "Conferiu contando os CSVs: 40. Passou."
          ],
          desfecho: { valor: "40 CSVs · 57 abas perdidas", nota: "E a resposta dele diz “com 0 erros”.", tom: "ruim" }
        }
      },

      explicacao: {
        titulo: "O que aconteceu",
        paragrafos: [
          "Os 40 arquivos tinham 97 abas. Um CSV só guarda uma aba. Quem converte arquivo por arquivo gera 40 CSVs, perde 57 abas e <strong>não vê erro nenhum na tela</strong>.",
          "O detalhe que incomoda: o Claude Code escreveu “primeira aba” na descrição do próprio método e mesmo assim entregou “0 erros”. Não foi ignorância — ninguém tinha pedido para preservar as abas, e ele não tratou a própria observação como um requisito. Repetindo a mesma frase cinco vezes em cada programa, <strong>ele avisou em 5 de 5 e errou em 5 de 5</strong>.",
          "E a conferência que ele fez foi contar quantos CSVs existiam — exatamente a checagem que esta armadilha engana, e exatamente a que o Gemini tinha sugerido do outro lado."
        ],
        licao: "Peça pelo resultado, não pela ferramenta. “Converta em CSV” descreve um meio; “sem perder nenhuma aba” descreve o que você não aceita perder — e é isso que o programa consegue verificar depois."
      },
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
        ]
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
        ]
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

    },

    /* ══════════════════════════════════════════════════════════
       3. OS DOIS OLHAM — E OS DOIS ERRAM DE JEITOS DIFERENTES
       ══════════════════════════════════════════════════════════ */
    {
      id: "disco",
      aba: "O que lotou a pasta",
      pergunta: "Minha pasta de trabalho encheu e não sei o que está ocupando espaço. Como descubro?",
      emJogo: "A maior pasta da árvore é a das fotos de campo — o dado primário, que não pode ser apagado. A resposta certa são 84 arquivos byte a byte idênticos, escondidos numa subpasta, todos com mais de um ano.",

      eixo: "navegador × instalado",
      resultado: {
        esquerda: {
          rotulo: "No navegador",
          sub: "Gemini 3.6",
          fez: [
            "Chutou que era Windows e entregou o procedimento inteiro.",
            "Perguntou qual é o seu sistema — no fim da resposta.",
            "Ofereceu três atalhos de resposta: Windows 10, Windows 11 e Mac. Sem Linux.",
            "Gastou três mensagens tentando descobrir em que máquina você está."
          ],
          desfecho: { valor: "travou", nota: "O disco não andou um passo.", tom: "ruim" }
        },
        direita: {
          rotulo: "Instalado na máquina",
          sub: "Antigravity",
          fez: [
            "Mediu o tamanho de cada subpasta, sem perguntar nada.",
            "Listou os maiores arquivos e a distribuição por tipo.",
            "Entregou um mapa da pasta com números da sua máquina.",
            "Não comparou nenhum arquivo com nenhum outro."
          ],
          desfecho: { valor: "5 comandos", nota: "Diagnóstico bem-feito da pergunta errada.", tom: "neutro" }
        }
      },

      explicacao: {
        titulo: "O que aconteceu",
        paragrafos: [
          "A resposta certa eram <strong>84 arquivos byte a byte idênticos</strong> escondidos numa subpasta, todos com mais de um ano. A maior pasta da árvore é a das fotos de campo — o dado primário, que não pode ser apagado.",
          "Nenhum dos cinco comandos calcula a impressão digital de um arquivo. Nem <code>Get-FileHash</code>, nem <code>md5</code>, nem <code>Compare-Object</code>. Em <strong>onze execuções no dia, nos dois programas, nenhum comparou arquivos entre si</strong> — é o resultado mais repetido de toda a medição.",
          "E os dois recomendaram apagar uma pasta de imagens de satélite que era produto final."
        ],
        licao: "Existe uma classe inteira de problema que ele não enxerga porque ela exige olhar <strong>dois arquivos ao mesmo tempo</strong>. Ele examina cada um com cuidado — nome, tamanho, data, conteúdo — e não pergunta se dois deles são a mesma coisa."
      },

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
        ]
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
        ]
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

    },

    /* ══════════════════════════════════════════════════════════
       4. O MESMO CÓDIGO, EM ARQUIVOS QUE EXISTEM
       ══════════════════════════════════════════════════════════ */
    {
      id: "nomes",
      aba: "340 nomes bagunçados",
      pergunta: "Preciso padronizar o nome de 340 arquivos .tif: sem acento, sem espaço, tudo minúsculo. Como faço?",
      emJogo: "Dois arquivos da pasta se chamam “Área Teste 01.tif” e “Area Teste 01.tif”. Tirando o acento, os dois viram o mesmo nome — e um apaga o outro.",

      eixo: "navegador × instalado",
      resultado: {
        esquerda: {
          rotulo: "No navegador",
          sub: "Gemini 3.6",
          fez: [
            "Escreveu o código certo, e do melhor jeito possível.",
            "Rodou o código para testar — sobre nomes que ele mesmo inventou.",
            "Explicou o risco de colisão de nomes, em tese.",
            "Sugeriu fazer cópia de segurança antes."
          ],
          desfecho: { valor: "código certo, arquivos intocados", nota: "Resolveu na primeira resposta.", tom: "neutro" }
        },
        direita: {
          rotulo: "Instalado na máquina",
          sub: "Antigravity",
          fez: [
            "Varreu a árvore e achou os 340.",
            "Parou no meio do trabalho para abrir os dois arquivos que colidem.",
            "Renomeou tudo sem perder nenhum.",
            "Avisou o que tinha feito com o par que colidia."
          ],
          desfecho: { valor: "340 arquivos · nenhum perdido", nota: "Achou a colisão nos arquivos de verdade.", tom: "bom" }
        }
      },

      explicacao: {
        titulo: "O que aconteceu",
        paragrafos: [
          "Dois arquivos da pasta se chamam <code>Área Teste 01.tif</code> e <code>Area Teste 01.tif</code>. Tirando o acento, os dois viram o mesmo nome — e um apaga o outro.",
          "O navegador escreveu o código certo e chegou a explicar esse risco. Mas ele não podia rodá-lo nos arquivos que importavam, e é neles que o caso mora.",
          "Os dois programas instalados acharam a colisão, e cada um escolheu uma saída: o Antigravity renomeou um dos dois com sufixo e seguiu, relatando; o Claude Code parou, explicou e perguntou como você preferia resolver — oferecendo salvar uma planilha com o mapa de antigo→novo para poder desfazer. Os dois são defensáveis. A diferença não é competência: é quanto cada um assume por conta própria."
        ],
        licao: "O código estava certo dos dois lados. O que só existe de um lado é rodá-lo nos arquivos de verdade — e descobrir ali o caso que quebra."
      },

      navegador: {
        beats: [
          { t: "voce", txt: "Preciso padronizar o nome de 340 arquivos .tif no Ubuntu: sem acento, sem espaço, tudo minúsculo. Como faço?" },
          { t: "sandbox", txt: "nfkd = unicodedata.normalize('NFKD', filename)" },
          { t: "marca", tom: "bom", txt: "Código correto, e da melhor maneira possível — normalização Unicode, que não depende da configuração de idioma do sistema." },
          { t: "sandbox", txt: "Relatório Final Água.tif -> relatorio_final_agua.tif" },
          { t: "marca", tom: "chave", txt: "Mas olhe <em>sobre o que</em> ele rodou: nomes que ele mesmo inventou. Os 340 arquivos da pessoa continuam invisíveis — e é neles que mora o par que colide." },
          { t: "marca", tom: "neutro", txt: "Explicou o risco de colisão de nomes e sugeriu cópia de segurança antes de renomear. Não sugeriu ensaiar nos arquivos reais — não teria como." }
        ]
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
        ]
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

    },
    /* ══════════════════════════════════════════════════════════
       5. O LIMITE DO "PEÇA MELHOR"
       ══════════════════════════════════════════════════════════
       Este exemplo é DIFERENTE dos quatro acima, e a diferença
       está escrita na tela: as duas colunas não são navegador ×
       instalado, e sim duas MANEIRAS DE PEDIR, as duas para
       programas instalados.

       Por quê: a conversa nº 5 da captura do navegador era sobre
       recorte com GDAL — outra tarefa —, e a máquina do teste não
       tinha GDAL. O cenário foi trocado por conformidade de série,
       que tem resposta verificável no disco. Não existe lado do
       navegador para comparar aqui, e inventar um seria fraude.

       Também não há transcrição por execução: são 20 execuções
       agregadas em 2026-09-10-roteiro5-serie.md. Por isso
       `semTranscricao` — o validador exige a justificativa.
       ══════════════════════════════════════════════════════════ */
    {
      id: "serie",
      aba: "240 imagens de satélite",
      pergunta: "Nesta série de 244 imagens de satélite, quais arquivos estão fora do padrão?",
      emJogo: "Quatro arquivos destoam, e nada no nome denuncia. Três são pegos por uma listagem simples: têm tamanho diferente dos outros. O quarto tem **exatamente o mesmo tamanho** dos outros 236, abre normalmente e mostra a mesma imagem — só está gravado com os bytes na ordem inversa.",

      eixo: "duas formas de pedir",
      avisoEixo: "Aqui as duas colunas <strong>não são</strong> navegador × instalado. São dois jeitos de fazer o mesmo pedido, os dois a programas instalados — porque é isso que este teste mede, e não havia conversa de navegador equivalente para comparar.",

      resultado: {
        esquerda: {
          rotulo: "Pedido como pergunta",
          sub: "“quais estão fora do padrão?”",
          fez: [
            "Listou os arquivos e comparou os tamanhos.",
            "Abriu as imagens e comparou dimensões, tipo de dado, média e desvio.",
            "Achou os três que têm tamanho diferente.",
            "Não abriu o cabeçalho de nenhum arquivo."
          ],
          desfecho: { valor: "3 de 4", nota: "10 execuções, sempre os mesmos três.", tom: "ruim" }
        },
        direita: {
          rotulo: "Pedido como ordem explícita",
          sub: "“separe os que estão fora do padrão”",
          fez: [
            "Fez a mesma análise, com cerca do dobro de comandos.",
            "Chegou a listar os eixos que ia verificar, um por um.",
            "Separou os três numa pasta <code>fora-do-padrao/</code>.",
            "Também não abriu o cabeçalho de nenhum arquivo."
          ],
          desfecho: { valor: "3 de 4", nota: "10 execuções, exatamente o mesmo resultado.", tom: "ruim" }
        }
      },

      placar: {
        titulo: "O que o disco diz",
        linhas: [
          { rotulo: "Arquivos fora do padrão que existiam", valor: "4", bom: null },
          { rotulo: "Encontrados, nas 20 execuções", valor: "sempre os mesmos 3", bom: false },
          { rotulo: "Respostas que mencionam ordem de bytes", valor: "0 de 20", bom: false }
        ],
        nota: "Somando com as 12 execuções da versão anterior do cenário, são <strong>32 execuções sem ninguém achar o mesmo arquivo</strong>. O placar do disco repetiu dez vezes a mesma linha: <code>não achou ['ndvi_2026_203.tif']</code>."
      },

      explicacao: {
        titulo: "Por que ninguém achou",
        paragrafos: [
          "Não foi preguiça. Os dois programas fizeram análise séria — o Claude Code comparou dimensões, tipo de dado, média, desvio, mínimo, máximo e contagem de zeros dos 240 arquivos.",
          "O problema é que <strong>a biblioteca que eles usaram para abrir as imagens corrige a ordem dos bytes sozinha</strong>, em silêncio. Depois de aberto, o arquivo devolve exatamente os mesmos números que qualquer outro da série. O desvio existe só em dois bytes no começo do arquivo, e ninguém foi lá.",
          "É o mesmo movimento do caso das planilhas, numa fatia diferente: lá a biblioteca entrega a primeira aba e o programa não pergunta se há outras; aqui ela entrega a imagem certa e ele não pergunta como o arquivo estava escrito. <strong>Todos pararam na camada em que a ferramenta já tinha resolvido o problema para eles.</strong>"
        ],
        licao: "Pedir melhor resolve uma classe grande de erro — e não resolve outra. Nas planilhas a informação que faltava estava ao alcance dele, e o pedido fez ele ir buscar. Aqui ela estava <strong>abaixo da ferramenta que ele escolheu</strong>, e nenhuma formulação faz ele descer um nível."
      },

      contraste: {
        titulo: "Os dois casos, lado a lado",
        linhas: [
          { caso: "As 40 planilhas", pergunta: "pedir melhor resolve?", resposta: "sim", detalhe: "“sem perder nenhuma aba” → 97 CSVs, 10 de 10 execuções", bom: true },
          { caso: "As 244 imagens", pergunta: "pedir melhor resolve?", resposta: "não", detalhe: "ordem explícita → os mesmos 3 de 4, 10 de 10 execuções", bom: false }
        ]
      },

      semTranscricao: "São 20 execuções agregadas, sem transcrição individual. O relatório completo, com a tabela por execução, está em automation/capturas/2026-09-10-roteiro5-serie.md."
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
