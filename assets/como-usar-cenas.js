/* ═══════════════════════════════════════════════════════════════
   Panorama Global da IA Generativa — Exemplos da aba "Como usar"

   Cada exemplo é UMA pergunta que aparece de verdade no trabalho, e
   a resposta em dois lugares: numa aba do navegador e num programa
   instalado no computador.

   COMO ESTA SEÇÃO MUDOU EM 12/set/2026, E POR QUÊ
   Antes ela narrava os testes: transcrição das duas conversas,
   contagem de arquivos, armadilha de cada cenário, quantas abas de
   planilha se perderam. Ficou técnica e chata, e transformou a aba
   num relatório de medição em vez de uma explicação.

   Agora a seção NARRA A DIFERENÇA, em linguagem de quem trabalha, e
   a medição vira lastro: ela continua inteira no repositório e a
   seção 05 conta como foi feita. A regra: aqui se diz o que dá para
   fazer de cada lado, não o que deu errado em qual execução.

   O QUE FOI USADO
   Navegador: Gemini, em conversas capturadas em 09/set/2026.
   Terminal: Antigravity CLI, em 10/set/2026, numa pasta de teste
   com arquivos de verdade. O Claude Code rodou as mesmas tarefas e
   aparece só no "saiba mais" que compara os dois.
   Transcrições e relatórios: automation/capturas/.
   ═══════════════════════════════════════════════════════════════ */

const COMO_USAR_CENAS = {
  fontes: {
    navegador: {
      arquivo: "automation/capturas/gemini-2026-09-09.json",
      rotulo: "Gemini, numa aba do navegador",
      curto: "no navegador",
      data: "09/set/2026"
    },
    agente: {
      arquivos: [
        "automation/capturas/antigravity-2026-09-10-forma-agente.json",
        "automation/capturas/claude-code-deepseek-2026-09-10-forma-agente.json"
      ],
      rotulo: "Antigravity, no terminal",
      curto: "no terminal",
      data: "10/set/2026"
    }
  },

  cenas: [
    /* ─────────────────────────────────────────────────────────── */
    {
      id: "fotos",
      aba: "Mil fotos para separar",
      pergunta: "Voltei de três semanas de campo com mais de mil fotos numa pasta só. Como separo por data?",

      navegador: {
        rotulo: "Numa aba do navegador",
        sub: "Gemini",
        narrativa: "Ele escreve um comando e explica o que cada pedaço faz. Como não sabe qual é o seu sistema nem onde está a pasta, ele escolhe um sistema por você e deixa o caminho em branco para você preencher. Você abre o terminal, cola, roda, e volta para contar o que apareceu na tela. Se o comando não servir para o seu caso, essa ida e volta se repete.",
        bom: "Responde em segundos, sem instalar nada, e explica o raciocínio.",
        limite: "Quem executa e quem confere é você."
      },

      instalado: {
        rotulo: "Com um programa instalado",
        sub: "Antigravity, no terminal",
        narrativa: "Ele abre a pasta antes de propor qualquer coisa. Conta quantas fotos são, vê que há arquivos com nome fora do padrão, confere se a biblioteca de imagens existe na sua máquina e então mostra o plano. Você autoriza, ele executa, e no fim volta para conferir quantas fotos ficaram em cada subpasta.",
        bom: "Trabalha sobre os seus arquivos de verdade, e confere o resultado.",
        limite: "Você aprova cada passo que altera alguma coisa."
      },

      diferenca: "Nas duas pontas a IA sabe o mesmo tanto. O que muda é quem faz o trabalho braçal e quem descobre os casos que não estavam no plano: as fotos que a câmera nomeou diferente, a que veio de outro celular, a que alguém já tinha renomeado à mão. No navegador, essas só aparecem quando você vai conferir e volta para contar. No terminal, elas aparecem para quem está fazendo.",

      quandoUsar: {
        navegador: "Quando você quer entender o comando antes de rodar, ou está em uma máquina onde não pode instalar nada.",
        instalado: "Quando são muitos arquivos e você vai repetir isso outras vezes."
      }
    },

    /* ─────────────────────────────────────────────────────────── */
    {
      id: "planilhas",
      aba: "Planilhas para CSV",
      pergunta: "Tenho quarenta planilhas de campo e preciso de todas em CSV. Como converto de uma vez?",

      navegador: {
        rotulo: "Numa aba do navegador",
        sub: "Gemini",
        narrativa: "Ele dá o comando certo e sugere como conferir depois. Só que ele não pode abrir as suas planilhas, então responde sobre planilhas em geral: quantas são, quantas abas cada uma tem, se alguma está protegida, nada disso entra na conta. Quando você pergunta especificamente, ele explica muito bem o que pode dar errado.",
        bom: "Explica o método e os riscos, se você perguntar.",
        limite: "A resposta é sobre planilhas em geral, não sobre as suas."
      },

      instalado: {
        rotulo: "Com um programa instalado",
        sub: "Antigravity, no terminal",
        narrativa: "Ele abre os arquivos antes de converter. Vê que são quarenta, vê quantas abas existem no total e pode dizer isso para você antes de começar. Converte, e depois conta o que saiu para comparar com o que entrou.",
        bom: "Trabalha sobre os seus arquivos e pode comparar antes e depois.",
        limite: "Ele faz o que você pediu. Se o pedido não menciona as abas, ele não trata as abas como requisito."
      },

      diferenca: "Este é o exemplo que mais ensina sobre como pedir. Planilha tem abas, e CSV não tem: cada aba vira um arquivo separado, ou se perde. Nos dois lugares, dizer <strong>o que não pode ser perdido</strong> muda o resultado — e no programa instalado a diferença é visível, porque ele vai contar as abas antes de converter em vez de sair convertendo.",

      quandoUsar: {
        navegador: "Quando você quer entender o formato antes de mexer nos arquivos.",
        instalado: "Quando os arquivos são seus, são muitos, e você precisa saber se sobrou tudo."
      },

      saibaMais: [{
        titulo: "A frase que muda o resultado, e o número por trás dela",
        corpo: "Este é o achado mais sólido da medição, e vale o parágrafo técnico para quem quiser.<br><br>As quarenta planilhas do teste tinham <strong>97 abas no total</strong>. Pedindo <em>“converta estas planilhas para CSV”</em>, saíram 40 arquivos: um por planilha, e as outras 57 abas ficaram para trás sem nenhum aviso na tela. Pedindo a mesma coisa com <em>“sem perder nenhuma aba”</em>, saíram os 97 arquivos.<br><br>Repetimos cinco vezes em cada um dos dois programas instalados. Com a frase completa, acertou nas dez. Sem ela, errou em todas as que chegaram a executar.<br><br>A lição não é sobre esse programa nem sobre esse formato: é que <strong>o pedido precisa dizer o que você não aceita perder</strong>, porque essa é a parte que a máquina consegue conferir depois."
      }, {
        /* O antigo quinto exemplo. Como exemplo de superfície ele era
           inteiramente sobre um erro específico, que é o que a seção deixou
           de fazer em 12/set. Como contrapeso do box acima, ele é necessário:
           sem ele a página sugere que basta pedir direito. */
        titulo: "Pedir melhor ajuda muito. Não resolve tudo",
        corpo: "Seria confortável terminar em “basta pedir direito”. Um outro teste não deixa.<br><br>Numa pasta com <strong>244 imagens de satélite</strong>, quatro estavam fora do padrão da série. Pedimos das duas formas, com pergunta e com ordem explícita, cinco vezes cada, nos dois programas. As vinte execuções acharam as mesmas três, e nenhuma achou a quarta.<br><br>O motivo é instrutivo: aquele arquivo abria normalmente e mostrava a mesma imagem. A diferença estava em como os bytes tinham sido gravados, e a biblioteca que os programas usaram para abrir corrige isso sozinha, em silêncio. Depois de aberto, o arquivo era idêntico aos outros.<br><br><strong>Há problema que só aparece para quem já sabe o que procurar.</strong> Essa parte do trabalho continua sendo de quem entende do assunto, e nenhuma formulação do pedido substitui isso."
      }]
    },

    /* ─────────────────────────────────────────────────────────── */
    {
      id: "espaco",
      aba: "A pasta lotou",
      pergunta: "Minha pasta de trabalho encheu e eu não sei o que está ocupando espaço. Como descubro?",

      navegador: {
        rotulo: "Numa aba do navegador",
        sub: "Gemini",
        narrativa: "Aqui a conversa trava de um jeito que ilustra bem o problema. Ele não sabe em que computador você está, e o procedimento é diferente em cada sistema. Então ou ele escolhe um por você, ou gasta a resposta perguntando qual é. Na captura que fizemos, foram três mensagens seguidas sobre qual era a máquina, e a pasta continuou do mesmo tamanho.",
        bom: "Explica muito bem os métodos, depois de saber qual é o seu sistema.",
        limite: "Descobrir qual é o seu sistema custa a conversa inteira."
      },

      instalado: {
        rotulo: "Com um programa instalado",
        sub: "Antigravity, no terminal",
        narrativa: "Ele está dentro da pasta, então mede. Em poucos comandos devolve o tamanho de cada subpasta, os maiores arquivos e o que há em cada canto, com os números da sua máquina. Sem perguntar nada.",
        bom: "Responde com os números reais da sua pasta.",
        limite: "Ele te mostra o que é grande. Decidir o que pode sair continua sendo seu."
      },

      diferenca: "Esta é a tarefa em que a diferença fica mais nítida, porque a pergunta depende inteiramente de informação que só existe na sua máquina. Um chat pode ensinar o método; ele não pode olhar. E note o que o programa instalado <em>não</em> resolve: ele diz o que ocupa espaço, e a decisão sobre o que apagar continua sendo de quem conhece o trabalho.",

      quandoUsar: {
        navegador: "Quando você quer aprender a fazer essa medição sozinho.",
        instalado: "Quando você quer a resposta agora, sobre esta pasta."
      }
    },

    /* ─────────────────────────────────────────────────────────── */
    {
      id: "nomes",
      aba: "Nomes bagunçados",
      pergunta: "Tenho trezentos e poucos arquivos com nome cheio de espaço, acento e maiúscula. Como padronizo tudo?",

      navegador: {
        rotulo: "Numa aba do navegador",
        sub: "Gemini",
        narrativa: "Ele escreve um código muito bom, e ainda roda um teste para mostrar que funciona. Só que o teste roda sobre nomes que ele inventou, porque os seus ele não vê. Ele avisa, em tese, que dois arquivos podem acabar com o mesmo nome depois de tirar o acento.",
        bom: "Código correto, explicado, e com o risco antecipado.",
        limite: "O teste é sobre exemplos, não sobre os seus arquivos."
      },

      instalado: {
        rotulo: "Com um programa instalado",
        sub: "Antigravity, no terminal",
        narrativa: "Ele lê a lista real e encontra o caso concreto: dois arquivos que, sem o acento, viram o mesmo nome. Em vez de descobrir isso depois de sobrescrever um deles, ele para no meio, abre os dois para comparar e trata o caso antes de continuar.",
        bom: "Encontra o caso problemático nos seus arquivos, antes de mexer.",
        limite: "Você precisa autorizar a renomeação, um bloco por vez."
      },

      diferenca: "O código era igualmente bom nos dois lugares. A diferença apareceu no encontro com os arquivos de verdade — e é assim quase sempre: o que quebra uma automação não costuma ser o método, é o caso esquisito que só existe na sua pasta.",

      quandoUsar: {
        navegador: "Quando você quer o código para adaptar e rodar por conta própria.",
        instalado: "Quando os arquivos importam e sobrescrever um deles seria caro."
      },

      saibaMais: {
        titulo: "Antigravity e Claude Code: dois jeitos de tratar o mesmo problema",
        corpo: "Rodamos as mesmas tarefas em dois programas de terminal: o <strong>Antigravity</strong>, do Google, e o <strong>Claude Code</strong>, da Anthropic. Os dois encontraram o par de arquivos que colide. O que fizeram em seguida foi diferente, e vale saber que essa escolha existe.<br><br>O <strong>Antigravity</strong> resolveu sozinho: renomeou um dos dois com um sufixo, seguiu o trabalho e relatou o que tinha feito no fim.<br><br>O <strong>Claude Code</strong> parou, explicou a situação e perguntou como você preferia resolver. Ofereceu, por conta própria, salvar uma planilha com o mapa de nome antigo para nome novo, para o caso de você querer desfazer.<br><br>Nenhum dos dois está errado. Um assume mais e te interrompe menos; o outro te interrompe mais e assume menos. É o tipo de diferença que só aparece usando, e que costuma pesar mais na escolha do que qualquer comparação de modelo."
      }
    }
  ]
};
