/* ═══════════════════════════════════════════════════════════════
   Panorama Global da IA Generativa — "Como usar fora do navegador"
   Dados da página: a abertura, o catálogo de ferramentas
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
     0. O ESSENCIAL, ANTES DE TUDO
     Fica no topo, antes da seção 01, e é a única parte da página
     escrita para quem não vai ler a página. Três conclusões e a
     linha que diz de onde elas vêm — porque "fizemos o teste" e
     "achamos que é assim" precisam ser distinguíveis de relance.
     ───────────────────────────────────────────────────────────── */
  essencial: {
    rotulo: "Comece por aqui",

    /* A ARMADILHA QUE ESTE BLOCO JÁ CAIU UMA VEZ: conclusão só funciona
       depois da premissa. A primeira versão abria em "No navegador, descreva
       a sua máquina" e citava "dizer no Ubuntu numa máquina Windows" —
       frases escritas da cadeira de quem já leu a página inteira e já sabe
       o que foram os testes. Quem chega não sabe nem que existem dois jeitos
       de usar IA.

       Regra para editar daqui em diante: cada frase deste bloco tem de fazer
       sentido para alguém que NUNCA leu o resto. Nada de vocabulário que só
       existe dentro da medição — sem "Ubuntu", sem "zero comandos", sem "os
       dois programas". Se precisar de contexto, o contexto vem antes. */
    intro: "Há dois jeitos de usar inteligência artificial. No primeiro, que é o que quase todo mundo usa, você abre uma aba do navegador e conversa: ela responde, você copia o que serve. No segundo, você <strong>instala um programa no seu computador</strong> e ele abre os seus arquivos e trabalha neles. Esta página compara os dois, e as comparações são testes de verdade, não opinião.",

    conclusoesRotulo: "Se você só ler isto, leve estas três coisas",

    conclusoes: [
      {
        n: "1",
        frase: "No navegador, a IA não faz ideia de como é o seu computador.",
        prova: "Ela não sabe qual sistema você usa, onde ficam os seus arquivos nem quantos são. Por isso você precisa contar. E se contar errado, a resposta vem errada sem ninguém perceber. O programa instalado não precisa: ele vai olhar."
      },
      {
        n: "2",
        frase: "Diga o que não pode ser perdido.",
        prova: "Pedimos “converta estas 40 planilhas para CSV”. Vieram 40 arquivos, e 57 abas de dados sumiram sem nenhum aviso. Pedindo a mesma coisa com “sem perder nenhuma aba”, vieram os 97 arquivos certos. Repetimos dez vezes: o resultado foi sempre esse."
      },
      {
        n: "3",
        frase: "Confira o resultado, não o relatório.",
        prova: "Nesse mesmo teste, a resposta na tela dizia “pronto, 0 erros” no exato momento em que os dados já tinham se perdido. Abrir a pasta e contar os arquivos leva dez segundos, e é a única conferência que vale."
      }
    ],

    procedencia: {
      titulo: "De onde vêm estes números",
      texto: "Cinco tarefas comuns de trabalho — organizar fotos, converter planilhas, descobrir o que lotou uma pasta — feitas de verdade em setembro de 2026. Primeiro num chat de navegador, depois em dois programas instalados numa máquina com os arquivos na frente. As tarefas que mais importavam foram repetidas cinco vezes em cada programa. <strong>Quem diz se deu certo é a pasta no disco, não a resposta da IA.</strong>",
      numeros: [
        { valor: "5", rotulo: "tarefas" },
        { valor: "60+", rotulo: "execuções" },
        { valor: "3", rotulo: "programas" }
      ],
      link: { texto: "as transcrições e os relatórios estão no repositório", href: "automation/capturas/" }
    }
  },

  /* ─────────────────────────────────────────────────────────────
     1. A DIFERENÇA, EXPLICADA
     Esta seção existe para uma pessoa que nunca instalou nada e só
     usa IA em aba de navegador. Ela abre EXPLICANDO, com um exemplo,
     e não discutindo como chamar as duas coisas — essa discussão é
     legítima, mas cabe num "saiba mais" no fim.

     Os dois eixos abaixo não foram inventados na mesa: saíram de
     doze execuções controladas em 10/set/2026, registradas em
     automation/capturas/2026-09-10-diagnostico-so.md, que mostraram
     que OLHAR e AGIR são independentes um do outro. A medição
     anterior confundia os dois num só.
     ───────────────────────────────────────────────────────────── */
  abertura: {
    titulo: "A diferença, explicada",

    lede: "Você já usa IA. Provavelmente numa aba do navegador: abre o site, escreve o que precisa, lê a resposta, copia o que serve. Esta aba é sobre o outro jeito: <strong>instalar a IA no seu computador e deixar que ela abra os seus arquivos</strong>.",

    /* Os parágrafos de abertura. Texto corrido de propósito: a versão
       anterior desta seção era um quadro comparativo, e o leitor
       chegava na seção 02 sem ter entendido o que estava comparando. */
    paragrafos: [
      "A diferença entre os dois não é a inteligência do modelo. Pode ser o mesmo modelo nos dois lugares, e nesta página, em boa parte dos testes, foi.",
      "A diferença são duas coisas bem concretas: <strong>se ela consegue olhar</strong> os seus arquivos, e <strong>se ela pode mexer</strong> neles. As duas mudam o que você precisa escrever no pedido, e mudam em direções opostas, e é isso que costuma confundir quem está começando.",
      "Vale a pena entender uma de cada vez."
    ],

    eixos: [
      {
        n: 1,
        nome: "Olhar",
        pergunta: "Ela consegue ver os seus arquivos?",

        navegador: {
          titulo: "No navegador, não",
          texto: "Ela não enxerga nada do seu computador. Nada mesmo. Por isso <strong>você</strong> precisa contar: qual é o seu sistema, onde fica a pasta, quantos arquivos são, quais programas você tem instalados. Ela responde com o que você contou.",
          consequencia: "Se você contar errado, a resposta vem errada, e nem você nem ela têm como perceber."
        },

        instalada: {
          titulo: "Instalada, sim",
          texto: "Ela roda um comando, lê a lista de arquivos, mede o tamanho de cada pasta, abre um arquivo para ver o que tem dentro. Você não precisa contar nada disso.",
          consequencia: "E não adianta contar: se o que você disser não bater com o que está no disco, ela acredita em você e para de olhar."
        },

        medida: {
          chamada: "O que a medição mostrou",
          texto: "Fizemos o mesmo pedido de três jeitos, numa máquina <strong>Windows</strong>, em doze execuções:",
          linhas: [
            { pedido: "“…no Ubuntu”", valor: "0 comandos", detalhe: "os dois programas responderam de cabeça, sem abrir um arquivo sequer", bom: false },
            { pedido: "“…no Windows”", valor: "5 a 12 comandos", detalhe: "foram olhar", bom: true },
            { pedido: "sem citar sistema", valor: "3 a 15 comandos", detalhe: "foram olhar", bom: true }
          ],
          conclusao: "Dizer o sistema <em>não</em> atrapalha. Dizer o sistema <strong>errado</strong> atrapalha muito, porque a IA conclui, com razão, que os arquivos da sua pergunta não são os que estão ali na frente dela."
        },

        regra: "No navegador, descreva a sua máquina. No programa instalado, não precisa, e descrever errado piora."
      },

      {
        n: 2,
        nome: "Agir",
        pergunta: "Ela pode mexer nos seus arquivos?",

        navegador: {
          titulo: "No navegador, não",
          texto: "Ela escreve o comando; a mão é sua. Você copia, cola no <strong>terminal</strong>, aperta enter, olha o que aconteceu e volta para contar.",
          glossario: {
            termo: "terminal",
            texto: "É a janela em que você <strong>digita</strong> o que quer, em vez de clicar. Todo computador tem uma, já instalada: no Windows chama-se PowerShell, no Mac e no Linux chama-se Terminal. Ela parece intimidante e não é: é só um lugar onde você escreve uma linha e aperta enter. A seção 05 desta página abre uma e faz o primeiro comando com você."
          },
          consequencia: "Quem confere o resultado é sempre você. Se você não conferir, ninguém confere."
        },

        instalada: {
          titulo: "Instalada, sim, com a sua autorização",
          texto: "Ela executa o comando e <strong>lê a saída</strong>. Se der errado, ela vê o erro e tenta outro caminho, sem precisar te perguntar. Cada comando que mexe em alguma coisa aparece na tela para você aprovar antes de rodar.",
          consequencia: "Isso é mais do que poupar digitação: é ela poder corrigir o próprio passo seguinte."
        },

        medida: {
          chamada: "O que a medição mostrou",
          texto: "Com o sistema certo no pedido, o que decidiu se ela <em>executava</em> ou só <em>explicava</em> foi a forma da frase:",
          linhas: [
            { pedido: "“Como eu faço para…?”", valor: "explicou", detalhe: "os dois programas olharam a pasta, montaram o plano e pararam", bom: null },
            { pedido: "“Faça isto nesta pasta.”", valor: "executou", detalhe: "os dois foram até o fim", bom: null }
          ],
          conclusao: "Nenhum dos dois é errado. Perguntar é útil quando você ainda está decidindo; mandar é útil quando já decidiu. Só é bom saber qual dos dois você está fazendo."
        },

        regra: "Pergunta faz ela explicar. Ordem faz ela executar. As duas coisas são úteis, em momentos diferentes."
      }
    ],

    /* A frase que junta os dois eixos e que, segundo a auditoria da
       medição, explica também os três erros que a própria medição
       cometeu. Ver automation/capturas/2026-09-10-auditoria-de-artefatos.md */
    fecho: {
      titulo: "A regra que junta as duas",
      frase: "Ela age sobre o que consegue verificar que existe.",
      texto: "É o mesmo princípio nos dois eixos. Se o pedido descreve algo que não está na máquina — um sistema que não é o seu, um disco que não é esse, uma pasta que não existe —, ela sai do modo “vou olhar” e volta para o modo “vou responder do que eu sei”. E ela está certa em fazer isso: você disse que era outra coisa."
    },

    /* O que a pessoa GANHA, em coisas que ela reconhece. A seção explicava
       muito bem o mecanismo e não respondia "e daí?" — quem chegava aqui saía
       entendendo a diferença e sem saber se valia a pena para ela. */
    ganho: {
      titulo: "O que você ganha com isso",
      lede: "A diferença deixa de ser abstrata em três situações que aparecem toda semana:",
      itens: [
        {
          titulo: "Tarefa com muitos arquivos",
          texto: "Mil fotos para separar por data, quarenta planilhas para converter, trezentos nomes para padronizar. No navegador você recebe um comando e faz o trabalho; instalada, ela faz e depois confere."
        },
        {
          titulo: "Você não precisa mais descrever nada",
          texto: "Nada de “tenho uma pasta com mais ou menos mil fotos, acho que no Ubuntu”. Ela abre a pasta e conta. E o que ela responde é sobre a <em>sua</em> máquina, não sobre uma máquina genérica."
        },
        {
          titulo: "O trabalho fica",
          texto: "O que sobra é um programinha no disco, numa pasta organizada, com o registro do que mudou. Na semana seguinte você roda de novo. É a seção 03 desta página."
        }
      ],
      custo: "O preço é real e vale dizer: instalar leva uns quinze minutos na primeira vez, e você passa a aprovar comandos em vez de só ler respostas. Para uma dúvida avulsa, o navegador continua sendo mais rápido. A seção 02 tem um bloco só sobre isso."
    },

    saibaMais: [
      {
        titulo: "A diferença é o acesso, não o modelo, e dá para ligar e desligar",
        corpo: "Isto apareceu por acidente na medição, e virou a demonstração mais limpa da página inteira.<br><br>O programa que usamos precisa de uma opção para receber a pasta de trabalho. Sem essa opção, ele abre numa pasta interna dele, vazia. Com ela, abre na sua pasta.<br><br>Rodamos os cinco pedidos <strong>sem</strong> essa opção. Resultado: <strong>zero comandos</strong> nos cinco, e respostas que ficaram indistinguíveis das do chat de navegador.<br><br>Mesmo programa, mesmo modelo, mesma pergunta, mesmo computador. A única coisa que mudou foi ele conseguir ou não ver o disco, e isso bastou para transformar um lado no outro. É por isso que esta página fala em <em>alcance</em>, e não em <em>inteligência</em>."
      },
      {
        titulo: "E como se chama isso, afinal?",
        corpo: "Quase todo mundo diz “usar IA no navegador” contra “usar IA no computador”. O par é intuitivo e é falso, porque o navegador também está no computador.<br><br>Pior: ele erra os casos de fronteira. O Antigravity é um programa instalado na sua máquina, mas o modelo que responde está num data center. E com o Ollama Cloud o programa é configurado para falar com <code>http://localhost:11434</code> — um endereço local, de verdade, na sua máquina — enquanto o modelo pensa num servidor da empresa. O endereço é local; o pensamento, não.<br><br>Nesta página usamos <strong>“no navegador”</strong> e <strong>“instalada na máquina”</strong> porque é como as pessoas falam, e porque o que separa os dois não é onde o modelo pensa: é <strong>até onde vai a mão dele</strong>. Se fosse para escolher um par mais preciso, seria <em>IA de conversa × IA de execução</em>; se fosse para escolher o que ensina mais rápido, <em>IA sem mãos × IA com mãos</em>. Nenhum dos três é oficial, e esta escolha é uma proposta, não uma decisão."
      }
    ]
  },

  /* A DIFERENÇA NA PRÁTICA mora agora em assets/como-usar-cenas.js.
     Até 09/set/2026 ela era uma reconstituição escrita à mão aqui —
     cinco tarefas com transcrição, tempo, vaivém e risco estimados por
     mim. As capturas de 09 e 10/set substituíram tudo por medição, e
     metade daqueles números não sobreviveu. O bloco saiu inteiro em vez
     de ficar comentado: número desmentido que continua no repositório
     volta para a página quando ninguém está olhando. O que a medição
     mudou está escrito, item a item, no `balanco` do arquivo de cenas. */

  /* ─────────────────────────────────────────────────────────────
     2b. O OUTRO LADO
     Cinco seções defendendo uma tese, sem nenhuma linha a favor do
     lado oposto, é panfleto — e público acadêmico desconfia de
     panfleto com razão. Este bloco não é ressalva de rodapé: são os
     casos em que a aba do navegador é honestamente a escolha certa,
     e ele mora logo depois da comparação, onde o texto está mais
     enviesado e o leitor mais precisa da contraprova.
     ───────────────────────────────────────────────────────────── */
  contraponto: {
    titulo: "O outro lado: onde a aba ganha",
    lede: "A seção acima tem quatro tarefas: o programa instalado ganha em duas, empata numa e perde feio na das planilhas. Mesmo nas que ele ganha, ele ganha por um motivo específico: havia ARQUIVO para abrir e REPETIÇÃO para automatizar. Quando a tarefa não tem nenhum dos dois, a aba do navegador costuma ganhar, e por motivos que não são consolo.",
    itens: [
      {
        titulo: "Pensar em voz alta",
        texto: "Rascunhar um argumento, achar o nome de um método, discutir um desenho experimental, encontrar a palavra que falta num parágrafo. Não há arquivo para abrir nem comando para rodar: o cinto de ferramentas inteiro fica ocioso, e a aba responde sem pedir instalação, permissão nem pasta."
      },
      {
        titulo: "Quando os arquivos não são seus",
        texto: "Um PDF que chegou por e-mail, uma tabela que um colega mandou no chat, uma foto tirada agora no celular. Arrastar para a conversa leva três segundos; baixar, escolher uma pasta e abrir um agente ali leva bem mais, e não melhora a resposta."
      },
      {
        titulo: "Uma pergunta só",
        texto: "Instalar um desses programas, entrar na conta e escolher o modelo custa uns 15 minutos na primeira vez. Para uma dúvida avulsa, a aba responde antes de o `npm install` terminar. O agente compensa quando a mesma tarefa volta, e aí compensa muito."
      },
      {
        titulo: "Aprender fazendo",
        texto: "Quem está aprendendo o terminal aprende mais colando o comando, errando e lendo a mensagem de erro do que aprovando o comando de outra pessoa. O agente é ótimo para produzir e péssimo para ensinar: ele resolve rápido demais para você ver o que aconteceu."
      },
      {
        titulo: "Onde você não pode instalar nada",
        texto: "Computador de laboratório com política travada, máquina emprestada, terminal de um servidor onde você não é dono do ambiente. A aba funciona em qualquer navegador, que é, aliás, a maior vantagem que ela tem. Nenhuma seção desta página tira isso dela."
      }
    ],
    fecho: "A regra prática cabe em uma linha: <strong>tem arquivo e vai repetir, instale; é conversa e é uma vez só, abra o navegador.</strong> As duas coisas convivem no mesmo dia de trabalho, e quem só usa uma das duas está pagando caro em algum dos dois lados."
  },

  /* ─────────────────────────────────────────────────────────────
     3. O QUE FICA DEPOIS
     A seção 02 mede UMA tarefa: mais rápido, mais certo. Faltava o
     outro eixo, o do tempo — o que sobra quando a tarefa acaba. É o
     argumento mais forte para um laboratório e era o mais ausente da
     página: `git` aparecia seis vezes e nas seis como rede de
     segurança, "reprodutibilidade" não aparecia nenhuma.

     O mecanismo desta seção é real e verificável, não retórica: um
     agente LÊ o repositório antes de agir. A estrutura que fica é o
     que faz a próxima sessão começar sabendo o que esta aprendeu.
     ───────────────────────────────────────────────────────────── */
  permanencia: {
    titulo: "O que fica depois",
    lede: "Tudo até aqui compara uma tarefa: quem termina antes, quem termina certo. Falta a pergunta que só aparece na segunda-feira seguinte: <strong>o que sobrou daquilo?</strong> A distância entre os dois modos deixa de ser de minutos e passa a ser de anos.",

    restaTitulo: "O que resta, uma semana depois",
    resta: {
      conversaRotulo: "De uma conversa na aba",
      conversa: [
        { ok: false, v: "O fio da conversa, se você lembrar em qual das 300 conversas foi." },
        { ok: false, v: "O resultado, colado em algum lugar: um e-mail, um documento, a área de transferência." },
        { ok: false, v: "A lembrança de que funcionou. Não de por quê." },
        { ok: false, v: "Nada que outra pessoa consiga abrir e continuar." }
      ],
      agenteRotulo: "De uma sessão com acesso aos arquivos",
      agente: [
        { ok: true, v: "O script que fez o trabalho, no disco, pronto para rodar de novo." },
        { ok: true, v: "As pastas do jeito que ficaram, e o jeito que ficaram é a decisão registrada." },
        { ok: true, v: "Um commit por passo, com a mensagem dizendo o que mudou e por quê." },
        { ok: true, v: "Um arquivo de convenções que a PRÓXIMA sessão vai ler antes de agir." }
      ],
      nota: "Não é que a conversa seja pior: é que ela não tem onde deixar nada. O agente escreve no mesmo lugar em que você trabalha, e é por isso que o trabalho dele se acumula em vez de recomeçar."
    },

    mecanismos: [
      {
        titulo: "O git deixa de ser rede e vira registro",
        texto: "Na seção 04 o versionamento aparece como proteção, e é. Mas o ganho maior é outro: com o histórico, cada coisa que o agente fez tem uma linha com data, autor e motivo. `git diff` revisa antes de aceitar, `git log` conta o que aconteceu semanas depois, e `git revert` desfaz UM passo sem derrubar os outros. A aprovação deixa de ser um clique que some da tela e vira uma decisão auditável.",
        artefato: {
          tipo: "terminal",
          linhas: [
            "$ git log --oneline -6",
            "a3f19c2 organiza campo-2026 por data (1240 fotos, mv -n)",
            "7b2e410 indice.py: data vem da pasta, nao do nome do arquivo",
            "c8d0a95 recorte GO: reprojeta o vetor, nao os 60 rasters",
            "2e1f883 padroniza 340 nomes (locale C.UTF-8 no iconv)",
            "9a44d17 converte 40 xlsx -> 97 csv (uma aba por arquivo)",
            "5c0b621 estrutura inicial do projeto de campo"
          ]
        },
        nota: "Cada linha desse histórico é uma das tarefas da seção 02. O que no navegador seriam conversas perdidas, aqui é o registro de um projeto."
      },
      {
        titulo: "A pasta é metade da documentação",
        texto: "Uma estrutura previsível — bruto separado de processado, script separado de saída — faz duas coisas ao mesmo tempo. Para a pessoa, diz onde procurar sem perguntar a ninguém. Para o agente, elimina o chute: ele não precisa adivinhar onde os dados estão nem onde pode escrever, e a taxa de acerto dele sobe junto. Organizar pastas parece burocracia até a primeira vez em que alguém pergunta \"cadê o dado original?\" e a resposta é imediata.",
        artefato: {
          tipo: "arvore",
          linhas: [
            "campo-2026/",
            "├── AGENTS.md          ← as regras da casa",
            "├── dados/",
            "│   ├── brutos/        ← somente leitura, nunca alterado",
            "│   └── processados/",
            "├── scripts/",
            "│   └── indice.py",
            "└── saidas/",
            "    └── recorte/"
          ]
        }
      },
      {
        titulo: "Um arquivo de convenções é a memória do agente",
        texto: "Este é o mecanismo que quase ninguém conhece, e é o que mais muda o resultado no mês seguinte: **agentes leem o repositório antes de agir**. Um arquivo de convenções na raiz do projeto — `AGENTS.md`, `CLAUDE.md`, ou o próprio `README.md` — é lido no começo de cada sessão. Ou seja: é o único jeito de ensinar alguma coisa ao agente que sobrevive ao fim da conversa. Cada erro que você corrigiu uma vez vira uma linha ali, e não volta a acontecer.",
        artefato: {
          tipo: "arquivo",
          nome: "AGENTS.md",
          linhas: [
            "# Convenções deste projeto",
            "",
            "- `dados/brutos/` é somente leitura. Nunca escreva aqui.",
            "- Nome de arquivo: minúsculo, sem acento, separado por _",
            "- Raster: EPSG:4326, nodata -3000, COMPRESS=DEFLATE",
            "- Antes de mover em lote, rode o laço com `echo` e me mostre",
            "  a lista antes de trocar por `mv`."
          ]
        },
        nota: "Repare de onde saiu cada linha: são as lições dos cenários 2, 5 e 1 desta página, viradas em regra permanente. É assim que uma correção deixa de ser um episódio e vira comportamento."
      },
      {
        titulo: "E, no fim, a reprodutibilidade",
        texto: "Uma conversa não é um método. Se o resultado vai para um artigo, um relatório ou a tese de alguém, em algum momento vai ser preciso responder quatro perguntas, e um fio de chat não responde nenhuma delas. Uma pasta versionada responde as quatro sem esforço extra, porque as respostas foram sendo escritas enquanto o trabalho acontecia. Para trabalho publicado, isso é requisito.",
        artefato: {
          tipo: "arvore",
          linhas: [
            "campo-2026/ @ a3f19c2",
            "  ├─ o que foi feito ..... git log",
            "  ├─ por quê ............. mensagens de commit + AGENTS.md",
            "  ├─ como refazer ........ scripts/",
            "  └─ com quais dados ..... dados/brutos/ (intocado)"
          ]
        }
      }
    ],

    fecho: "Junte isto com o diagrama da seção 02 e aparecem <strong>dois ciclos, não um</strong>. O curto acontece dentro da tarefa: a IA executa, lê a saída e corrige. O longo acontece entre tarefas: o que ficou no disco — o script, a pasta, o histórico, as convenções — é o que a próxima sessão lê antes de começar. O primeiro ciclo é o que faz a tarefa dar certo hoje; <strong>o segundo é o que faz o trabalho compor em vez de recomeçar do zero toda vez.</strong>"
  },

  /* ─────────────────────────────────────────────────────────────
     4. O CINTO DE FERRAMENTAS
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
     5. O CATÁLOGO
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
      explicacao: "São programas que você instala e roda dentro da pasta do projeto. Enxergam os arquivos daquela pasta, executam comandos e pedem sua aprovação antes de agir. O modo de operação é sempre propor, você confirmar, ela executar, e as duas partes verem o resultado.",
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
        nome: "Antigravity CLI",
        empresa: "Google",
        instala: "curl -fsSL https://antigravity.google/cli/install.sh | bash",
        comando: true,
        instalaAlt: "Windows (PowerShell): irm https://antigravity.google/cli/install.ps1 | iex · O programa instalado chama-se `agy`, não `antigravity`.",
        precisa: "Conta Google. Prévia pública, sem custo.",
        acesso: "O mesmo agente do aplicativo de janela, no terminal: lê, escreve, roda comando e navega. Tem um modo `--print` para usar dentro de script, e nesse modo é preciso passar `--add-dir`, senão ele não enxerga a sua pasta.",
        codigoAberto: false,
        link: "https://antigravity.google/docs/cli/install/"
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
      subtitulo: "Janela, botão e diff. O terminal está lá dentro, em graus bem diferentes.",
      explicacao: "Para quem não quer viver numa janela preta. Vale ler a coluna de acesso com atenção: \"ver o terminal\" e \"usar o terminal\" são coisas diferentes, e a distância entre elas é justamente o assunto desta página.",
      itens: [
        {
          nome: "Claude Desktop (aba Code)",
          empresa: "Anthropic",
          instala: "Baixar o instalador para macOS, Windows ou Linux (apt/.deb)",
          instalaAlt: "Já traz o Claude Code embutido, sem precisar instalar Node nem a CLI à parte.",
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
          acesso: "Assimétrico, e é o detalhe mais importante deste quadro: ele LÊ a tela do terminal (as últimas ~200 linhas da janela ativa) e aplica mudanças em editores, mas não digita no terminal por você.",
          codigoAberto: false,
          link: "https://help.openai.com/en/articles/10119604-work-with-apps-on-macos"
        },
        {
          nome: "Antigravity",
          empresa: "Google",
          instala: "Baixar em antigravity.google/download (macOS, Windows, Linux)",
          instalaAlt: "Prévia pública, sem custo, com cotas generosas do Gemini 3 Pro.",
          precisa: "Conta Google.",
          acesso: "IDE onde o agente é o elemento central: editor, terminal e navegador embutido ficam à disposição dele, com um gerenciador para tocar várias tarefas em paralelo. O mesmo agente existe em versão de terminal: o Antigravity CLI, na família acima, que é a versão medida na seção 02 e ensinada na seção 05.",
          codigoAberto: false,
          link: "https://antigravity.google/"
        }
      ]
    },
    {
      id: "local",
      titulo: "O motor: de onde vem o modelo",
      subtitulo: "Quem pensa, e onde. É o único lugar da página em que \"na sua máquina\" pode ser literal, mas não é sempre.",
      explicacao: "Nas duas famílias acima o programa é local e o modelo é remoto, sem escolha. Aqui a escolha existe, e o Ollama a coloca atrás do MESMO comando: `ollama run qwen3.5:4b` carrega os pesos do seu disco e calcula na sua CPU ou GPU; `ollama run gemma4:cloud` manda a conta para o servidor da Ollama e devolve a resposta. Nos dois casos quem atende é o mesmo processo local, na porta 11434. O sufixo do nome do modelo é a única coisa que diz onde o pensamento aconteceu. Modelo local ganha em privacidade e em não ter fatura; modelo na nuvem ganha em tamanho, e é o que torna a assinatura interessante para trabalho de verdade.",
      itens: [
        {
          nome: "Ollama",
          empresa: "Ollama",
          licenca: "código aberto",
          instala: "curl -fsSL https://ollama.com/install.sh | sh",
          comando: true,
          instalaAlt: "macOS e Windows têm instalador próprio em ollama.com/download",
          precisa: "Para rodar local: 8 GB de RAM dão conta de um modelo de 3–4B; 16 GB abrem os de 7–9B; GPU acelera, mas não é obrigatória. Para os modelos de nuvem, nenhum requisito de máquina, só a conta.",
          acesso: "Serve os dois mundos na mesma API local (127.0.0.1:11434), que todos os programas desta página sabem consumir. E `ollama launch` conecta essa API a elas sem você editar um arquivo de configuração.",
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
     5b. A PONTE — `ollama launch`
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
    lede: "Até aqui são dois problemas separados: escolher o <strong>programa que dá as mãos</strong> à IA — o que a indústria chama de <em>harness</em> — e escolher o <strong>motor</strong>, que é o modelo que pensa. Ligar um no outro sempre foi a parte chata: variável de ambiente, URL de API, arquivo de configuração por ferramenta. O `ollama launch` (a partir da versão 0.15) faz isso sozinho: instala a harness se ela não estiver instalada, aponta para o servidor local do Ollama, escolhe o modelo e abre o programa.",

    comandos: [
      {
        cmd: "ollama launch",
        oQueFaz: "Sem argumento, abre o menu: lista as integrações que a sua versão conhece, marca as que já estão instaladas e deixa escolher o modelo. É por aqui que se começa. A lista real, e não a tabela abaixo, é a que vale para a sua máquina."
      },
      {
        cmd: "ollama launch claude",
        oQueFaz: "Abre o Claude Code falando com o Ollama. Se o Claude Code não estiver instalado, ele se oferece para instalar. Por baixo, o que muda é `ANTHROPIC_BASE_URL=http://localhost:11434`. O programa pensa que está falando com a Anthropic e está falando com o processo local."
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
        oQueFaz: "Tudo depois de `--` vai direto para o programa, sem o Ollama interpretar. É como se passam as opções próprias de cada ferramenta."
      },
      {
        cmd: "ollama launch claude --model gemma4:cloud --yes -- -p \"como este repositório funciona?\"",
        oQueFaz: "`--yes` pula as confirmações e baixa o modelo se precisar (exige `--model`). É a forma de usar tudo isso dentro de um script ou de um pipeline de CI."
      }
    ],

    integracoesTitulo: "As integrações que o `ollama launch` conhece",
    integracoesNota: "Lista do `ollama launch --help`. Ela cresce a cada versão. Rode o comando sem argumento para ver a da sua.",
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
    planosNota: "Preços da página oficial de planos, conferidos em 6 de setembro de 2026. Os créditos não acumulam de um mês para o outro, então confira antes de fechar o orçamento do laboratório.",
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
    planosExtra: "Acima disso há Team (US$ 500/mês, US$ 1.000 de crédito compartilhado, faturamento centralizado) e Enterprise sob consulta, com controle de acesso a modelos e teto de gasto, que é a conversa que um laboratório com várias pessoas acaba tendo.",

    fecho: "A tese da página fecha em uma frase: <strong>o programa e o modelo são escolhas independentes</strong>. Você pode trocar de agente sem trocar de assinatura, e trocar de modelo sem reaprender o agente. O que não muda em nenhuma das combinações é o que dá potência a todas elas: a IA continua enxergando os seus arquivos e executando comandos."
  },

  /* ─────────────────────────────────────────────────────────────
     6. TUTORIAIS DO SIMULADOR
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
      legenda: "Uma assinatura, qualquer programa",
      resumo: "Do zero a um modelo grande dirigindo o Claude Code, o OpenCode ou o Pi, sem editar um arquivo de configuração.",
      minutos: 9,

      /* O tutorial declara o que você terá no fim. Sem isto, a pessoa passa
         oito passos sem saber para onde está indo. */
      objetivo: "No fim você tem um modelo grande demais para a sua máquina rodando pela assinatura da Ollama, dirigindo a ferramenta que você preferir. E sabe como trocar para um modelo local quando o dado não puder sair daí.",

      passos: [
        {
          ato: "Instalar",
          janela: "dialogo",
          titulo: "Abrir o terminal",
          explicacao: "É a janela onde você digita comandos em vez de clicar. No Ubuntu, Ctrl+Alt+T. No macOS, Cmd+Espaço e \"Terminal\". No Windows, o PowerShell serve, mas para acompanhar este tutorial letra por letra vale ativar o WSL, que é um Linux dentro do Windows.",
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
          ato: "Instalar",
          janela: "terminal",
          titulo: "Instalar o Ollama",
          explicacao: "Uma linha só. O `curl` baixa o script oficial e o `sh` executa. Antes de rodar um `curl | sh` vindo de qualquer lugar, confira que o endereço é mesmo o do site oficial. Esse hábito vale para o resto da sua vida no terminal.",
          cmd: "curl -fsSL https://ollama.com/install.sh | sh",
          saida: [
            { t: "out", v: ">>> Installing ollama to /usr/local" },
            { t: "out", v: ">>> Downloading Linux amd64 bundle" },
            { t: "out", v: "######################################################### 100.0%" },
            { t: "out", v: ">>> Creating ollama systemd service..." },
            { t: "out", v: ">>> The Ollama API is now available at 127.0.0.1:11434." },
            { t: "out", v: ">>> Install complete. Run \"ollama\" from the command line." }
          ],
          nota: "Guarde esse endereço: 127.0.0.1:11434 é a sua própria máquina falando com ela mesma. Ele vai reaparecer no passo mais importante deste tutorial."
        },
        {
          ato: "Ligar na conta",
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
          ato: "Ligar na conta",
          janela: "terminal",
          titulo: "Rodar um modelo que não caberia aqui",
          explicacao: "O sufixo é tudo: `-cloud` (ou `:cloud`, nos modelos sem variante de tamanho) manda a conta para o servidor da Ollama. Repare no que NÃO acontece: não tem barra de download, porque não há nada para baixar.",
          cmd: "ollama run gpt-oss:120b-cloud \"Explique em duas frases o que é o Cerrado.\"",
          saida: [
            { t: "out", v: "O Cerrado é o segundo maior bioma da América do Sul, ocupando cerca de" },
            { t: "out", v: "dois milhões de km² no Brasil central, com vegetação de savana adaptada" },
            { t: "out", v: "a solos ácidos e ao fogo. É considerado um hotspot de biodiversidade e" },
            { t: "out", v: "abriga as nascentes de três das maiores bacias hidrográficas do país." }
          ],
          nota: "120 bilhões de parâmetros responderam em segundos numa máquina que não teria memória para carregá-los. O comando é local, o processo é local, a porta é local. O pensamento aconteceu num data center."
        },
        {
          ato: "Usar",
          janela: "terminal",
          titulo: "Abrir o menu do launch",
          explicacao: "Este é o comando que muda o jogo. Sem argumento, `ollama launch` mostra os programas de IA que a sua versão conhece, marca as que já estão instaladas e deixa escolher o modelo. Nada de variável de ambiente, nada de arquivo de configuração.",
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
          nota: "A lista completa está no catálogo, na seção 06. Ela cresce a cada versão do Ollama, então vale rodar o comando e olhar a sua, em vez de confiar em qualquer tabela publicada (esta inclusive)."
        },
        {
          ato: "Usar",
          janela: "terminal",
          titulo: "Dirigir o Claude Code com o modelo da Ollama",
          explicacao: "Instala o programa se ele faltar, aponta para o endereço local e abre. Repare na terceira linha da saída: o endereço é a sua máquina, e o modelo que vai responder está num servidor da Ollama. Onde ela pensa e até onde vai a mão dela são coisas diferentes.",
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
          nota: "`ANTHROPIC_BASE_URL=http://localhost:11434`: o programa acha que está falando com a Anthropic e está falando com o processo do Ollama, na sua máquina, que por sua vez fala com o data center. Endereço local, modelo remoto, as duas coisas ao mesmo tempo e no mesmo comando."
        },
        {
          ato: "Usar",
          janela: "terminal",
          titulo: "Trocar de programa sem trocar de assinatura",
          explicacao: "A mesma conta serve qualquer um dos programas da lista. Aqui o Pi, que nem precisava estar instalado: o launch instala e abre. Vale igual para `ollama launch opencode`, `ollama launch codex`, `ollama launch droid`.",
          cmd: "ollama launch pi --model gpt-oss:120b-cloud",
          saida: [
            { t: "out", v: "Pi is not installed. Install it now? [Y/n] y" },
            { t: "out", v: "npm install -g @earendil-works/pi-coding-agent@latest" },
            { t: "out", v: "added 1 package in 6s" },
            { t: "out", v: "Starting Pi with gpt-oss:120b-cloud" },
            { t: "out", v: "" },
            { t: "out", v: "pi › " }
          ],
          nota: "É este o ganho prático da assinatura: programa e modelo viram escolhas independentes. Dá para trocar de agente sem trocar de plano, e trocar de modelo sem reaprender o agente."
        },
        {
          ato: "Quando o dado não pode sair",
          janela: "terminal",
          titulo: "E quando o dado não pode sair",
          explicacao: "O mesmo programa faz o contrário: sem sufixo de nuvem, os pesos vêm para o seu disco e a conta roda na sua máquina. É a opção para prontuário, entrevista e qualquer dado sob termo de consentimento, e a razão pela qual esta família existe na página.",
          cmd: "ollama pull qwen3.5:4b && ollama run qwen3.5:4b \"Resuma este trecho de entrevista.\"",
          saida: [
            { t: "out", v: "pulling manifest" },
            { t: "out", v: "pulling 4c2a1f8d... 100%  ▕████████████████▏ 2.4 GB" },
            { t: "out", v: "success" },
            { t: "out", v: "" },
            { t: "out", v: "[resposta gerada localmente]" }
          ],
          nota: "Desligue o wi-fi e rode de novo: este continua funcionando, o `:cloud` não. É o teste de uma linha que separa as duas coisas, e a única prova que vale antes de confiar um dado sensível a qualquer ferramenta desta página."
        }
      ],
      fecho: "Duas conclusões, e elas não se anulam. A assinatura Cloud resolve o problema de potência: modelos grandes demais para a sua máquina, dirigindo a harness que você preferir, por um comando só. O modelo local resolve o problema de sigilo: mais fraco, sem fatura, e nada sai do disco. A escolha entre os dois é por tarefa, não de uma vez, e dá para alternar no meio do dia trocando o sufixo do modelo."
    },
    {
      id: "antigravity",
      nome: "Antigravity CLI",
      nomeCurto: "Antigravity",
      icone: "janela",
      legenda: "O agente do Google, no seu terminal",
      resumo: "Da instalação à primeira tarefa, e à armadilha que a medição desta página encontrou.",
      minutos: 8,

      /* O tutorial declara o que você terá no fim. Sem isto, a pessoa passa
         oito passos sem saber para onde está indo — foi a crítica que
         motivou esta reescrita. */
      objetivo: "No fim você tem um agente do Google rodando no seu terminal, olhando a sua pasta. E sabe a diferença entre ele enxergar os seus arquivos e não enxergar, que é a única coisa que separa os dois lados desta página inteira.",

      /* É o CLI, não o aplicativo de janela. Foi o CLI (`agy`) que a medição
         da seção 02 usou, e é ele que tem a mesma forma do tutorial do
         Ollama: tudo acontece no terminal, do começo ao fim.
         Comandos conferidos em antigravity.google/docs/cli/install/ e
         .../getting-started/ em 11/set/2026. O passo 7 usa a saída REAL
         medida em 10/set (ver automation/capturas/2026-09-10-leia-me.md). */
      passos: [
        {
          ato: "Instalar",
          janela: "dialogo",
          titulo: "Abrir o terminal",
          explicacao: "A mesma janela do tutorial anterior. No Ubuntu, Ctrl+Alt+T. No macOS, Cmd+Espaço e \"Terminal\". No Windows, o PowerShell.",
          dialogo: {
            titulo: "Onde fica o terminal",
            linhas: [
              "Ubuntu / Linux — tecle Ctrl + Alt + T",
              "macOS — Cmd + Espaço, digite Terminal, Enter",
              "Windows — menu Iniciar, digite PowerShell"
            ],
            botao: "Abri o terminal"
          }
        },
        {
          ato: "Instalar",
          janela: "terminal",
          titulo: "Instalar",
          explicacao: "Uma linha, como o Ollama. O instalador detecta o seu sistema e deixa um programa chamado `agy`, e não `antigravity`.",
          cmd: "curl -fsSL https://antigravity.google/cli/install.sh | bash",
          saida: [
            { t: "out", v: "==> Detecting platform… linux-x64" },
            { t: "out", v: "==> Downloading Antigravity CLI v1.2.0" },
            { t: "out", v: "==> Installed to ~/.local/bin/agy" },
            { t: "out", v: "" },
            { t: "out", v: "Run 'agy' to get started." }
          ],
          nota: "No Windows a linha é outra: `irm https://antigravity.google/cli/install.ps1 | iex`, no PowerShell. Se o terminal disser que não achou o `agy` depois de instalar, é a pasta `~/.local/bin` que não está no PATH. O próprio instalador imprime a linha que resolve."
        },
        {
          ato: "Primeiro arranque",
          janela: "terminal",
          titulo: "Abrir pela primeira vez",
          explicacao: "Sem argumento nenhum, o `agy` abre uma tela dentro do terminal. Na primeira vez ele pergunta o esquema de cores e se prefere tela cheia ou embutida. Pode escolher qualquer coisa, dá para trocar depois.",
          cmd: "agy",
          saida: [
            { t: "out", v: "  Antigravity CLI v1.2.0" },
            { t: "out", v: "" },
            { t: "out", v: "  Esquema de cores:  ● Dark   ○ Solarized   ○ Solarized Light   ○ Terminal" },
            { t: "out", v: "  Modo de tela:      ● Tela cheia   ○ Embutido" }
          ],
          nota: "Repare que ele abriu **na pasta em que você estava**. Isso decide o que ele vai poder enxergar."
        },
        {
          ato: "Primeiro arranque",
          janela: "dialogo",
          titulo: "Entrar na conta",
          explicacao: "Na primeira execução ele abre o seu navegador sozinho para você entrar com a Conta Google. Depois disso a sessão fica guardada na máquina e ele não pergunta mais.",
          dialogo: {
            titulo: "Entrar com o Google",
            linhas: [
              "O navegador abriu em accounts.google.com",
              "Escolha a conta e autorize o Antigravity CLI",
              "Volte ao terminal: ele já está autenticado"
            ],
            botao: "Autorizei no navegador"
          },
          nota: "Aqui fica visível de novo o ponto da seção 01: o programa está instalado na sua máquina e enxerga os seus arquivos, mas quem responde é um modelo num servidor do Google. Onde ele pensa e até onde vai a mão dele são coisas diferentes."
        },
        {
          ato: "Primeiro arranque",
          janela: "dialogo",
          titulo: "Autorizar a pasta",
          explicacao: "Antes de qualquer coisa ele pergunta se pode ler a pasta em que foi aberto. É a pergunta mais importante do tutorial inteiro, e a resposta define todo o resto.",
          dialogo: {
            titulo: "Confiar nesta pasta?",
            linhas: [
              "~/laboratorio-teste",
              "O agente vai poder ler os arquivos daqui.",
              "Comandos que alteram arquivos continuam pedindo aprovação."
            ],
            botao: "Confiar nesta pasta"
          },
          nota: "Abra no projeto, e só nele. Abrir na raiz do disco ou na sua pasta pessoal é dar acesso a chave de SSH, a e-mail e a tudo mais. Ver a seção 04."
        },
        {
          ato: "Usar",
          janela: "terminal",
          titulo: "A primeira tarefa, em português",
          explicacao: "Você escreve o que quer. Ele olha a pasta antes de propor qualquer coisa, que é o que o chat do navegador não consegue fazer.",
          prompt: "Quantas fotos tem na pasta campo-2026 e de quantos dias diferentes elas são?",
          cmd: "ls campo-2026 | wc -l",
          saida: [
            { t: "out", v: "1240" },
            { t: "out", v: "" },
            { t: "out", v: "São 1.240 fotos. Vou olhar as datas de modificação para" },
            { t: "out", v: "contar quantos dias diferentes elas cobrem." }
          ],
          nota: "Ninguém disse que eram 1.240. Ele contou."
        },
        {
          ato: "Usar",
          janela: "terminal",
          titulo: "O modo sem tela, e a armadilha dele",
          explicacao: "Para rodar o agente dentro de um script existe o modo `--print`: ele responde e sai, sem abrir tela. **Neste modo ele não herda a pasta em que você está.** Foi assim que a medição desta página descobriu, sem querer, a demonstração mais limpa do argumento todo.",
          cmd: "agy --print \"Rode: pwd\"",
          saida: [
            { t: "out", v: "/home/voce/.antigravity/scratch" },
            { t: "nota", v: "Você está em ~/laboratorio-teste. Ele não está." }
          ],
          nota: "Sem a pasta, os mesmos cinco pedidos da seção 02 deram **zero comandos** e respostas indistinguíveis das do chat de navegador. Mesmo programa, mesmo modelo, mesma pergunta. Só muda se ele consegue ver o disco."
        },
        {
          ato: "Usar",
          janela: "terminal",
          titulo: "Dar a pasta, e ver a diferença",
          explicacao: "A opção `--add-dir` entrega a pasta ao agente. Compare a saída com a do passo anterior: é o mesmo comando, no mesmo computador, no mesmo segundo.",
          cmd: "agy --print --add-dir . \"Rode: pwd\"",
          saida: [
            { t: "out", v: "/home/voce/laboratorio-teste" },
            { t: "nota", v: "Agora sim. A partir daqui ele enxerga os seus arquivos." }
          ],
          nota: "Guarde este par de saídas: é a aba inteira em duas linhas. A diferença entre \"IA no navegador\" e \"IA na sua máquina\" não é o modelo nem a inteligência: é **se ela alcança o seu disco**, e isso liga e desliga numa opção de linha de comando."
        }
      ],
      fecho: "Você tem o agente instalado, autenticado e apontado para uma pasta. O que fazer com ele é a seção 02 desta página, e o que NÃO deixar ele fazer é a seção 04. Se quiser dirigir este mesmo agente com outro modelo, ou usar um modelo da Ollama dentro de outro programa, o quadro do `ollama launch` no catálogo mostra como."
    }
  ],

  /* ─────────────────────────────────────────────────────────────
     7. O QUE VOCÊ ESTÁ AUTORIZANDO
     Dar mãos à IA é dar mãos à IA. Esta seção não é aviso legal:
     são as cinco regras que evitam os acidentes que a gente já viu
     acontecer.
     ───────────────────────────────────────────────────────────── */
  seguranca: [
    {
      titulo: "Confira o resultado, não o relatório",
      texto: "É a regra mais cara de aprender e a mais medida desta página. O programa terminou, escreveu \"pronto, 0 erros\", e o disco discorda. Abra a pasta, conte os arquivos, abra um deles. O relatório é a opinião dele sobre o que fez; a pasta é o que aconteceu.",
      saibaMais: {
        titulo: "O caso em que isso foi medido, e por que ele não é um azar",
        corpo: "Na tarefa das planilhas da seção 02, o programa entregou <strong>40 arquivos e a frase “com 0 erros”</strong>, e tinha perdido 57 abas. A conferência que ele mesmo fez foi contar quantos CSV existiam: 40. Passa.<br><br>Não foi uma execução azarada. A mesma frase foi repetida cinco vezes em cada um dos dois programas: <strong>nove execuções erradas em nove</strong> entre as que chegaram a executar.<br><br>Vale também um aviso menos confortável: duas execuções idênticas podem terminar diferente. Numa delas o programa <em>travou no meio</em> ao tentar abrir uma foto como se fosse texto, gastando 97 segundos e deixando a tarefa pela metade. Em outra, ele descreveu numa tabela 97 abas cujas linhas somam 101. Os arquivos no disco estavam certos; a explicação, não.<br><br>Por isso a regra não é “desconfie deste programa”. É: <strong>o relatório e o disco são duas coisas, e só uma delas é o resultado.</strong>"
      }
    },
    {
      titulo: "Aprovar é o recurso, não o obstáculo",
      texto: "Todos os agentes desta página pedem permissão antes de rodar comando ou alterar arquivo. A tentação de desligar isso (\"aceitar tudo\") aparece na segunda hora de uso. Desligar transforma um assistente que erra e mostra num assistente que erra e some com a evidência."
    },
    {
      titulo: "Diga a pasta, e confira qual ele abriu",
      texto: "O programa enxerga a pasta em que foi aberto. Abrir na raiz do disco ou na sua pasta pessoal é dar acesso a chaves, a e-mail e a tudo mais. Abra no projeto, e só nele. E não confie na sua intenção: pergunte a ele em que pasta está, antes do primeiro pedido.",
      saibaMais: {
        titulo: "O que aconteceu quando ninguém disse a pasta",
        corpo: "Durante a preparação da medição desta página, um pedido para organizar fotos foi feito <strong>sem indicar a pasta</strong>. O programa foi procurar fotos onde achou: encontrou a pasta de imagens do OneDrive do dono da máquina e <strong>reorganizou 154 arquivos reais em 64 subpastas por data</strong>.<br><br>Nada foi apagado, não houve colisão de nome, e o dono acabou optando por manter a organização. Mas ninguém tinha pedido aquilo.<br><br>O detalhe que interessa: havia uma trava de isolamento ligada, e ela barrava a Área de Trabalho, os Downloads e os Documentos. <strong>Não barrava o OneDrive.</strong> Uma trava protege o que alguém lembrou de listar.<br><br>Um programa sem âncora de pasta vai procurar o que você descreveu, onde ele achar. Diga a pasta."
      }
    },
    {
      titulo: "Git (ou uma cópia) antes de soltar",
      texto: "Com o histórico versionado, todo estrago tem `git diff` e tem volta. Sem ele, um `mv` bem-intencionado em 1.240 arquivos é irreversível. Se o material não é código, uma cópia da pasta resolve. Vale lembrar que aqui o versionamento é só a rede de segurança. A seção 03 mostra o que ele faz quando nada dá errado."
    },
    {
      titulo: "Comando destrutivo merece leitura",
      texto: "`rm`, `mv` sobre arquivo existente, `>` que trunca, `git reset --hard`, `DROP`. Quando a aprovação pedir algo dessa lista, leia o caminho até o fim antes de dizer sim. É o único momento da interação em que a pressa cobra caro."
    },
    {
      titulo: "O que você cola no terminal é seu",
      texto: "Vale tanto para script que veio do chat quanto para `curl | sh` copiado de um blog. Se a origem não é a página oficial do projeto, não rode. O agente com terminal reduz o vaivém de copiar e colar porque testa antes, mas a responsabilidade final continua na cadeira."
    },
    {
      titulo: "Dado sensível pede modelo local, e `:cloud` não é local",
      texto: "Prontuário, entrevista, dado de terceiro sob termo de consentimento: aqui a pergunta não é qual modelo é melhor, e sim qual não manda nada para fora. Cuidado com a armadilha de nome: `ollama run qwen3.5:4b` roda na sua máquina, `ollama run gemma4:cloud` roda no servidor da Ollama. É o mesmo programa, o mesmo comando e o mesmo endereço `localhost`. Só o sufixo do modelo separa uma coisa da outra. Em dado sensível, confira o sufixo antes de confiar."
    }
  ],

  /* ─────────────────────────────────────────────────────────────
     8. COMO ISTO FOI MEDIDO
     A parte que separa medição de propaganda. Ela é curta de
     propósito: o material completo está em automation/capturas/, e
     quem quiser conferir procedência tem o caminho. O que precisa
     estar NA PÁGINA é o método em três frases e a lista do que NÃO
     foi medido — porque é essa lista que dá crédito ao resto.
     ───────────────────────────────────────────────────────────── */
  medicao: {
    titulo: "Como isto foi medido",
    lede: "Todos os números desta página vieram de execuções reais em setembro de 2026, e as transcrições estão no repositório. Vale saber como, porque o método explica tanto o que a página afirma quanto o que ela evita afirmar.",

    passos: [
      {
        titulo: "Uma pasta de teste com armadilhas de verdade",
        texto: "Um programa monta sempre a mesma pasta: 1.240 fotos JPEG reais, 340 arquivos com nomes bagunçados, 40 planilhas somando 97 abas, 84 arquivos idênticos escondidos entre outros. Cada armadilha é um erro que acontece de verdade em laboratório, e nenhuma delas aparece na tela como erro."
      },
      {
        titulo: "O placar é o disco, não a conversa",
        texto: "Depois que o programa termina, outro programa vai contar o que ficou na pasta: quantos arquivos sobraram, quantos foram para subpasta, quantos CSVs existem. É isso que vale. Se ele disser “pronto” e a pasta discordar, ganha a pasta."
      },
      {
        titulo: "Os dois lados, com as mesmas frases",
        texto: "As mesmas tarefas foram levadas ao Gemini no navegador em 09/set e a dois programas instalados em 10/set. As tarefas que mais importavam foram repetidas cinco vezes em cada programa, para separar resultado de sorte."
      }
    ],

    naoMedidoTitulo: "O que NÃO foi medido",
    naoMedidoLede: "Esta lista é o que separa medição de propaganda. Ela fica na página de propósito.",
    naoMedido: [
      {
        item: "Tempo e custo comparáveis",
        porque: "o lado do navegador não teve tempo cronometrado. Um lado medido e outro estimado foi exatamente o que tirou o gráfico de custos desta página; não vamos repetir."
      },
      {
        item: "Um cenário de geoprocessamento com GDAL",
        porque: "a máquina do teste não tinha GDAL instalado, e as tentativas de instalar esbarraram em pacotes sem versão para o Python de lá. O cenário está descrito no repositório e volta em qualquer máquina que tenha."
      },
      {
        item: "Linux de verdade",
        porque: "tudo rodou em Windows. Enunciados que citavam Ubuntu mediram um desencontro, não o comportamento do programa. Esse desencontro virou o achado da seção 01."
      },
      {
        item: "Com que frequência ele falha",
        porque: "as tarefas repetidas foram estáveis; a variação apareceu em tarefas rodadas uma ou duas vezes. Não há número honesto para isso aqui, então esta página não dá nenhum."
      }
    ],

    saibaMais: {
      titulo: "Três conclusões desta medição estavam erradas. Como elas foram descobertas",
      corpo: "Medir IA é fácil de errar, e a maneira mais comum de errar é atribuir ao programa um comportamento que na verdade foi o teste que causou. Aconteceu três vezes aqui, e as três foram corrigidas antes de qualquer número chegar a esta página.<br><br><strong>1. “A palavra Ubuntu desliga o programa.”</strong> Errado. Nomear um sistema não desliga nada. Nomear o sistema <em>errado</em> desliga. A máquina era Windows e o enunciado dizia Ubuntu.<br><br><strong>2. “A trava de isolamento não distorce nada.”</strong> Errado, e este foi o pior: a trava <em>escondia o Python</em> de um dos programas. O outro enxergava as bibliotecas instaladas e parecia mais rápido. Não era programa melhor; era ambiente diferente, e eu tinha creditado o mérito ao programa.<br><br><strong>3. “Os dois programas saem da pasta e varrem o disco todo.”</strong> Errado. Era o enunciado, que falava de um HD de 500 GB inexistente. Corrigido o texto, os dois ficaram dentro da pasta.<br><br>O fio comum das três é a mesma frase da seção 01: <strong>o programa age sobre o que consegue verificar que existe.</strong> Pedido que descreve o que não está na máquina vira resposta de conhecimento; ambiente que esconde uma ferramenta vira “a máquina não tem”.<br><br>O cenário de teste também precisou de conserto. Numa versão anterior as fotos tinham 91 bytes cada, e um programa concluiu, corretamente, que eram arquivos quebrados e recomendou apagar as 1.240. O erro era do teste. Com fotos JPEG de verdade, nenhuma das vinte execuções seguintes chamou o dado de sintético.<br><br>Tudo isso está registrado por escrito em <code>automation/capturas/</code>, inclusive nos arquivos que ficaram errados: eles têm um bloco de retificação no topo em vez de terem sido reescritos."
    }
  }
};
