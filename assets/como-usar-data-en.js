/* ═══════════════════════════════════════════════════════════════
   Global Panorama of Generative AI — "How to use outside the browser"
   Page data: the opening, the tool catalog
   and scripts for the interactive tutorials.

   WHY THIS PAGE EXISTS
   The other three tabs answer WHAT exists (launches), WHICH
   to choose (benchmarks) and HOW MUCH it costs (free ones). What was missing was HOW —
   and the "how" that changes the result the most is not the prompt: it is the reach that
   the AI has over your machine.

   RULE OF THIS FILE: every command shown here was actually run
   before being published (bash/GNU coreutils, Linux). Where
   behavior differs on macOS or Windows, this is stated in the
   transcription itself, in an inline `nota` — and not hidden in a
   footnote. If you edit a command, run it first.

   FORMAT OF THE TRANSCRIPTIONS
   Each line is { t, v }:
     t = "cmd"   typed line        → prefix "$ "
     t = "cont"  command continuation → prefix "> "
     t = "out"   program output
     t = "err"   error output (red)
     t = "nota"  site comment about what just happened
   On the chat side, { t } is "voce", "ia", or "nota".
   ═══════════════════════════════════════════════════════════════ */

const COMO_USAR_DATA = {
  updatedAt: "2026-09-06",

  /* ─────────────────────────────────────────────────────────────
     7. THE SUMMARY (closes the page)
     It was born at the top, as "Start here", and became the prime example of
     the error the user pointed out: it cited the measurement numbers (40
     spreadsheets, 57 tabs, "we repeated ten times") to a reader who didn't
     even know a measurement existed. As a summary at the end, each
     conclusion can point backward: the three sentences below say what
     the entire page showed, and each has a link to the section where
     the reader saw (or can see) the proof.

     Rule for editing from here on: each sentence still has to
     make sense to someone who DID NOT read the page — but now the missing
     context has a place to be found, which is the sentence's link.
     ───────────────────────────────────────────────────────────── */
  essencial: {
    rotulo: "End of page",

    intro: "If you read this far, these three sentences are already familiar. If you skipped straight to the summary, they are the page in miniature — and each one leads to the section where the demonstration is.",

    conclusoesRotulo: "What this page showed, in three sentences",

    conclusoes: [
      {
        n: "1",
        frase: "In the browser, the AI has no idea what your computer is like.",
        prova: "It doesn't know which system you use, where your files are, or how many there are. That's why you need to tell it — and whoever gives the wrong description gets the wrong answer with no warning. The installed program doesn't need a description: it opens the folder and sees for itself.",
        link: { texto: "the demonstration", href: "#abertura" }
      },
      {
        n: "2",
        frase: "State what cannot be lost.",
        prova: "Spreadsheet conversion is the clearest example: requested without caveats, the AI delivers one file per spreadsheet and the data tabs silently disappear, with the response saying \"done\" the whole time. With \"without losing any tabs\" in the request, everything comes out. The difference is one sentence.",
        link: { texto: "the example, with the numbers", href: "#comparacao" }
      },
      {
        n: "3",
        frase: "Check the result, not the report.",
        prova: "The response on the screen can say \"completed\" at the exact moment the wrong file is already saved. Opening the folder and looking takes ten seconds — and it's the only check that the AI itself cannot falsify, because files don't chat.",
        link: { texto: "where this appeared", href: "#medicao" }
      }
    ],

    procedencia: {
      titulo: "Where these numbers come from",
      texto: "Five common work tasks — organizing photos, converting spreadsheets, finding out what filled up a folder — actually performed in September 2026. First in a browser chat, then in two installed programs on a machine with the files right in front of it. The tasks that mattered most were repeated five times in each program. <strong>What determines whether it worked are the files in the folder, not the AI's response.</strong> The section above explains the method; here is the scale.",
      numeros: [
        { valor: "5", rotulo: "tasks" },
        { valor: "60+", rotulo: "executions" },
        { valor: "3", rotulo: "programs" }
      ],
      link: { texto: "the transcripts and reports are in the repository", href: "automation/capturas/" }
    }
  },

  /* ─────────────────────────────────────────────────────────────
     1. THE DIFFERENCE, EXPLAINED
     This section exists for someone who has never installed anything and only
     uses AI in a browser tab. It opens by EXPLAINING, with an example,
     and not by discussing what to call the two things — that discussion is
     legitimate, but belongs in a "learn more" at the end.

     The two axes below were not invented at a desk: they came from
     twelve controlled executions on 09/10/2026, recorded in
     automation/capturas/2026-09-10-diagnostico-so.md, which showed
     that LOOKING and ACTING are independent of each other. The previous
     measurement confused the two into one.
     ───────────────────────────────────────────────────────────── */
  abertura: {
    titulo: "The difference, explained",

    lede: "You already use AI. Probably in a browser tab: you open the site, type what you need, read the response, copy what works. This tab is about the other way: <strong>installing the AI on your computer and letting it open your files</strong>.",

    /* The opening paragraphs. Running text on purpose: the previous
        version of this section was a comparison table, and the reader
        would reach section 02 without having understood what was being compared. */
    paragrafos: [
      "The difference between the two is not the intelligence of the model. It can be the same model in both places — and, when we compare the two ways of working, that's what usually happens.",
      "The difference is two very concrete things: <strong>whether it can look</strong> at your files, and <strong>whether it can touch</strong> them. Both change what you need to write in the prompt, and they change in opposite directions, which is exactly what tends to confuse beginners.",
      "It's worth understanding them one at a time."
    ],

    eixos: [
      {
        n: 1,
        nome: "Look",
        pergunta: "Can it see your files?",

        navegador: {
          titulo: "In the browser, no",
          texto: "It cannot see anything on your computer. Nothing at all. That's why <strong>you</strong> need to tell it: what your system is, where the folder is, how many files there are, which programs you have installed. It responds based on what you told it.",
          consequencia: "If you describe it wrong, the answer comes out wrong, and neither you nor it can notice."
        },

        instalada: {
          titulo: "Installed, yes",
          texto: "It runs a command, reads the list of files, measures the size of each folder, opens a file to see what's inside. You don't need to tell it any of this.",
          consequencia: "And it's pointless to describe it: if what you say doesn't match what's there, it believes you and stops looking."
        },

        /* Before here there was a dark box with twelve executions and the lesson
           "don't say you use Ubuntu if you use Windows". It was an internal test
           conclusion presented as a general rule, and the reader had no way of knowing
           what it was about. It became a grounding sentence:
           it says what we saw, names the tools, and sends whoever wants the detail
           to the measurement section. */
        lastro: "We took the same tasks to <strong>Gemini</strong>, in a browser tab, and to <strong>Antigravity</strong>, in the terminal. In the browser, every response started by assuming something about the asker's machine. In the terminal, none did: it opened the folder and looked.",

        regra: "In the browser, you need to describe your machine. In the installed program, you don't."
      },

      {
        n: 2,
        nome: "Act",
        pergunta: "Can it touch your files?",

        navegador: {
          titulo: "In the browser, no",
          texto: "It writes the command; the hand is yours. You copy, paste it into the <strong>terminal</strong>, press enter, see what happened, and come back to report it.",
          glossario: {
            termo: "terminal",
            texto: "It's the window where you <strong>type</strong> what you want, instead of clicking. Every computer has one, already installed: on Windows it's called PowerShell, on Mac and Linux it's called Terminal. It looks intimidating and it isn't: it's just a place where you write a line and press enter. Section 04 of this page opens one and runs the first command with you."
          },
          consequencia: "Whoever checks the result is always you. If you don't check, no one checks."
        },

        instalada: {
          titulo: "Installed, yes, with your authorization",
          texto: "It executes the command and <strong>reads the output</strong>. If it goes wrong, it sees the error and tries another path, without needing to ask you. Each command that changes something appears on the screen for you to approve before it runs.",
          consequencia: "This is more than saving keystrokes: it's being able to correct its own next step."
        },

        lastro: "In both places, the phrasing of the sentence decides what happens. A question (\"how do I…?\") gets an explanation. A command (\"do this in this folder\") makes the installed program go all the way, stopping for you to authorize each step that changes something.",

        regra: "A question makes it explain. A command makes it execute. Both are useful, at different times."
      }
    ],

    /* What the person GAINS, in things they recognize. The section explained
       the mechanism very well and didn't answer "so what?" — people arriving here
       left understanding the difference and not knowing if it was worth it for them. */
    ganho: {
      titulo: "What you gain from this",
      lede: "The difference stops being abstract in three situations that come up every week:",
      itens: [
        {
          titulo: "Task with many files",
          texto: "A thousand photos to sort by date, forty spreadsheets to convert, three hundred names to standardize. In the browser you receive a command and do the work. Installed, it proposes what it will do, waits for your authorization, executes, and then checks the result."
        },
        {
          titulo: "You don't need to describe anything anymore",
          texto: "No more \"I have a folder with about a thousand photos, I think on Ubuntu\". It opens the folder and counts. And what it responds is about <em>your</em> machine, not a generic machine."
        },
        {
          titulo: "The work remains",
          texto: "What's left is a saved little program, in an organized folder, with a record of what changed. The following week you run it again. That's section 03 of this page."
        }
      ],
      custo: "The cost is real and worth stating: installing takes about fifteen minutes the first time, and you start approving commands instead of just reading responses. For a one-off question, the browser is still faster. After the examples in section 02 there is an entire block about the cases where the tab wins."
    },

    saibaMais: [
      {
        titulo: "So what do you call this, anyway?",
        corpo: "Almost everyone says \"using AI in the browser\" versus \"using AI on the computer\". The pair is intuitive and it's false, because the browser is also on the computer.<br><br>Worse: it gets the edge cases wrong. Antigravity is a program installed on your machine, but the model that responds is in a data center. And with Ollama Cloud the program is configured to talk to <code>http://localhost:11434</code> — a local address, for real, on your machine — while the model thinks on a company server. The address is local; the thinking is not.<br><br>On this page we use <strong>\"in the browser\"</strong> and <strong>\"installed on the machine\"</strong> because that's how people talk, and because what separates the two is not where the model thinks: it's <strong>how far its reach goes</strong>. If we had to choose a more accurate pair, it would be <em>conversational AI × execution AI</em>; if we had to choose what teaches faster, <em>AI without hands × AI with hands</em>. None of the three is official, and this choice is a proposal, not a decision."
      }
    ]
  },

  /* THE DIFFERENCE IN PRACTICE now lives in assets/como-usar-cenas.js.
     Until 09/10/2026 it was a hand-written reconstruction here —
     five tasks with transcript, time, back-and-forth, and risk estimated by
     me. The captures from 09/10 and 09/11 replaced everything with measurement, and
     half of those numbers didn't survive. The block was removed entirely instead
     of staying commented out: a disproved number that remains in the repository
     creeps back onto the page when no one is looking. What the measurement changed is written,
     item by item, in the `balanco` of the scenes file. */

  /* ─────────────────────────────────────────────────────────────
     2b. THE OTHER SIDE
     Five sections defending a thesis, without a single line in favor of the
     opposite side, is a pamphlet — and an academic audience distrusts
     pamphlets for good reason. This block is not a footnote caveat: it's the
     cases where the browser tab is honestly the right choice, and it lives
     right after the comparison, where the text is most biased and the reader
     most needs the counter-evidence.
     ───────────────────────────────────────────────────────────── */
  contraponto: {
    titulo: "The other side: where the tab wins",
    lede: "In the four questions above, the installed program has the advantage for a specific reason: there were files to open and repetition to automate. When the task has neither, the browser tab is the better choice, and for reasons that are not consolation.",
    itens: [
      {
        titulo: "Thinking out loud",
        texto: "Sketching an argument, finding the name of a method, discussing an experimental design, finding the missing word in a paragraph. There is no file to open and no command to run: the entire toolbelt sits idle, and the tab responds without asking for installation, permissions, or a folder."
      },
      {
        titulo: "When the files aren't yours",
        texto: "A PDF that came by email, a spreadsheet a colleague sent in chat, a photo just taken on your phone. Dragging it into the conversation takes three seconds; downloading, choosing a folder, and opening an agent there takes much longer, and doesn't improve the answer."
      },
      {
        titulo: "A single question",
        texto: "Installing one of these programs, logging in, and choosing the model takes about 15 minutes the first time. For a one-off question, the tab answers before the `npm install` finishes. The agent pays off when the same task comes back, and then it pays off a lot."
      },
      {
        titulo: "Learning by doing",
        texto: "Someone learning the terminal learns more by pasting the command, getting it wrong, and reading the error message than by approving someone else's command. The agent is great at producing and terrible at teaching: it solves things too fast for you to see what happened."
      },
      {
        titulo: "Where you can't install anything",
        texto: "A lab computer with a locked-down policy, a borrowed machine, a terminal on a server where you aren't the owner of the environment. The tab works in any browser, which is, by the way, its biggest advantage. No section on this page takes that away from it."
      }
    ],
    fecho: "The practical rule fits in one line: <strong>if there are files and it will repeat, install; if it's a conversation and a one-off, open the browser.</strong> The two coexist in the same workday, and whoever uses only one is paying a high price on one of the two sides."
  },

  /* ─────────────────────────────────────────────────────────────
     3. WHAT REMAINS AFTERWARDS
     Section 02 measures ONE task: faster, more correct. The other axis was missing,
     the axis of time — what remains when the task is over. It's the strongest
     argument for a lab and was the most absent from the page: `git` appeared six
     times and all six as a safety net, "reproducibility" didn't appear at all.

     The mechanism of this section is real and verifiable, not rhetoric: an
     agent READS the repository before acting. The structure that remains is what
     makes the next session start knowing what this one learned.
     ───────────────────────────────────────────────────────────── */
  permanencia: {
    titulo: "What remains afterwards",
    lede: "Everything up to here compares one task: who finishes faster, who finishes correctly. Missing is the question that only comes up the following Monday: <strong>what remained of that?</strong> The distance between the two modes stops being measured in minutes and starts being measured in years.",

    restaTitulo: "What remains, a week later",
    resta: {
      conversaRotulo: "From a tab conversation",
      conversa: [
        { ok: false, v: "The thread of the conversation, if you remember which of the 300 conversations it was in." },
        { ok: false, v: "The result, pasted somewhere: an email, a document, the clipboard." },
        { ok: false, v: "The memory that it worked. Not why." },
        { ok: false, v: "Nothing that someone else can open and continue." }
      ],
      agenteRotulo: "From a session with file access",
      agente: [
        { ok: true, v: "The script that did the work, saved in the folder, ready to run again." },
        { ok: true, v: "The folders the way they were left, and the way they were left is the recorded decision." },
        { ok: true, v: "A commit per step, with the message saying what changed and why." },
        { ok: true, v: "A conventions file that the NEXT session will read before acting." }
      ],
      nota: "It's not that the conversation is worse: it's that it has nowhere to leave anything. The agent writes in the same place where you work, and that's why its work accumulates instead of starting over."
    },

    mecanismos: [
      {
        titulo: "It uses the programs you already have",
        texto: "In the browser, the AI only has what fits in the conversation. On your computer, it can reach whatever is installed there: <code>git</code> for versioning, the Python libraries the lab uses, QGIS, GDAL, R. It doesn't need to reimplement anything — it uses the same tool you would use, with the same version, and the output comes out in the format the rest of your work already expects. Installing a new tool now benefits both of you.",
        artefato: {
          tipo: "terminal",
          linhas: [
            "$ python -c \"import geopandas; print(geopandas.__version__)\"",
            "1.0.1",
            "$ which gdalwarp",
            "/usr/bin/gdalwarp",
            "",
            "→ it checks what exists on your machine before proposing,",
            "  instead of writing \"if not installed, install it\"."
          ]
        }
      },
      {
        titulo: "The folder is half the documentation",
        texto: "A predictable structure — raw separated from processed, script separated from output — does two things at once. For the person, it says where to look without asking anyone. For the agent, it eliminates guessing: it doesn't need to guess where the data is or where it can write, and its success rate goes up accordingly. Organizing folders seems like bureaucracy until the first time someone asks \"where's the original data?\" and the answer is immediate.",
        artefato: {
          tipo: "arvore",
          linhas: [
            "campo-2026/",
            "├── AGENTS.md          ← the house rules",
            "├── dados/",
            "│   ├── brutos/        ← read-only, never altered",
            "│   └── processados/",
            "├── scripts/",
            "│   └── indice.py",
            "└── saidas/",
            "    └── recorte/"
          ]
        }
      },
      {
        titulo: "A conventions file is the agent's memory",
        texto: "This is the mechanism almost no one knows, and it's what changes the result the most the following month: **agents read the repository before acting**. A conventions file in the project root — `AGENTS.md`, `CLAUDE.md`, or the `README.md` itself — is read at the start of every session. That is: it's the only way to teach something to the agent that survives the end of the conversation. Every mistake you corrected once becomes a line there, and it never happens again.",
        artefato: {
          tipo: "arquivo",
          nome: "AGENTS.md",
          linhas: [
            "# Conventions of this project",
            "",
            "- `dados/brutos/` is read-only. Never write here.",
            "- File naming: lowercase, no accents, separated by _",
            "- Raster: EPSG:4326, nodata -3000, COMPRESS=DEFLATE",
            "- Before moving in bulk, run the loop with `echo` and show me",
            "  the list before swapping to `mv`."
          ]
        },
        nota: "Notice where each line comes from: they are the mistakes and near-misses that the examples on this page showed — raw data that should never be touched, name collision when standardizing, spreadsheet tabs that disappear — turned into a permanent rule. This is how a correction stops being an episode and becomes behavior."
      },
      {
        titulo: "And, in the end, reproducibility",
        texto: "A conversation is not a method. If the result goes into a paper, a report, or someone's thesis, at some point you will need to answer four questions, and a chat thread answers none of them. A versioned folder answers all four with no extra effort, because the answers were being written while the work was happening. For published work, this is a requirement.",
        artefato: {
          tipo: "arvore",
          linhas: [
            "campo-2026/ @ a3f19c2",
            "  ├─ what was done ..... git log",
            "  ├─ why ............... commit messages + AGENTS.md",
            "  ├─ how to redo ........ scripts/",
            "  └─ with which data ..... dados/brutos/ (untouched)"
          ]
        }
      }
    ],

    fecho: "Combine this with the diagram from section 02 and <strong>two cycles emerge, not one</strong>. The short one happens within the task: the AI executes, reads the output, and corrects itself. The long one happens between tasks: what was saved — the script, the folder, the history, the conventions — is what the next session reads before starting. The first cycle is what makes the task succeed today; <strong>the second is what makes the work compound instead of starting from scratch every time.</strong>"
  },

  /* ─────────────────────────────────────────────────────────────
     4. THE TOOLBELT
     What technically changes between the tab and the terminal is not the model:
     it's the list of actions it can request. It's worth naming them, because this
     is the vocabulary that appears on the screen when the agent asks for
     permission to act.
     ───────────────────────────────────────────────────────────── */
  ferramentas: [
    {
      nome: "Bash",
      oQueE: "Run a command in the terminal and read the output back.",
      destrava: "It's the tool that closes the loop: run, see the result, decide the next step. Without reading the output, executing would just be typing.",
      exemplo: "ls, mkdir, mv, du, gdalwarp, python3, git"
    },
    {
      nome: "Read file",
      oQueE: "Open one of your files, in whole or in parts.",
      destrava: "Ends \"paste your code here\". A 2-million-line CSV doesn't fit in a conversation, but it fits in a file.",
      exemplo: "open script.R, dados.csv, error log"
    },
    {
      nome: "Write and edit",
      oQueE: "Create a new file or swap exact sections of an existing file.",
      destrava: "The change arrives as a diff — line out, line in — and not as a block for you to paste and hope.",
      exemplo: "edit 3 lines of an 800-line script"
    },
    {
      nome: "Search (name and content)",
      oQueE: "Find files by name pattern or by text inside them.",
      destrava: "Answers \"where is this parameter defined?\" in a 200,000-file project, in seconds.",
      exemplo: "glob **/*.py, grep -rn \"nodata\""
    },
    {
      nome: "Run code",
      oQueE: "Actually execute Python, R, or SQL over your data.",
      destrava: "The difference between a calculated number and a plausible number. The model gets math wrong; the interpreter doesn't.",
      exemplo: "pandas, GDAL, sf, dplyr"
    },
    {
      nome: "Web",
      oQueE: "Search and read pages during the task.",
      destrava: "Checks the documentation for the version YOU have installed, instead of recalling the one that existed during training.",
      exemplo: "read the manual for a GDAL flag"
    },
    {
      nome: "MCP (connectors)",
      oQueE: "An open standard for plugging the AI into other programs and services.",
      destrava: "Extends the toolbelt beyond the file system: database, spreadsheet, repository, map server.",
      exemplo: "PostGIS, Google Sheets, GitHub"
    }
  ],

  /* ─────────────────────────────────────────────────────────────
     5. THE CATALOG
     Three families, and the division is intentional: it repeats the vocabulary
     argument. Note the third — it's the only one where "on the computer"
     describes where the model THINKS.
     Verified on 09/06/2026 on official pages and on npm.

     `comando: true` says that the `instala` field is a line to copy and paste
     in the terminal — and only there is it drawn as a command (dark background, no
     line break). Where the installation is "download the installer", the field is
     prose and needs to break into lines like any sentence; drawing it as
     a command made the text overflow the card.
     ───────────────────────────────────────────────────────────── */
  familias: [
    {
      id: "cli",
      titulo: "Born in the terminal",
      subtitulo: "You type in a black window. The model thinks in the cloud; the hands are local.",
      explicacao: "These are programs you install and run inside the project folder. They see the files in that folder, execute commands, and ask for your approval before acting. The mode of operation is always propose, you confirm, it executes, and both sides see the result.",
      itens: [
        {
          nome: "Claude Code",
          empresa: "Anthropic",
          instala: "curl -fsSL https://claude.ai/install.sh | bash",
          comando: true,
          instalaAlt: "Windows (PowerShell): irm https://claude.ai/install.ps1 | iex · Homebrew: brew install --cask claude-code · npm: npm i -g @anthropic-ai/claude-code",
          precisa: "Pro, Max, Team, or Enterprise subscription (the free Claude.ai plan does not give access), or an API key.",
          acesso: "Full toolbelt: bash, read, write, edit, search, web, MCP.",
          codigoAberto: false,
          link: "https://code.claude.com/docs/en/setup"
        },
        {
          nome: "Codex CLI",
          empresa: "OpenAI",
          instala: "npm install -g @openai/codex",
          comando: true,
          instalaAlt: "Homebrew: brew install codex",
          precisa: "ChatGPT account (paid plans and, in smaller quotas, the free one) or API key.",
          acesso: "Bash, files, and execution in configurable sandbox.",
          codigoAberto: true,
          link: "https://github.com/openai/codex"
        },
        {
          nome: "OpenCode",
          empresa: "Anomaly",
          licenca: "open source",
          instala: "curl -fsSL https://opencode.ai/install | bash",
          comando: true,
          instalaAlt: "npm i -g opencode-ai · brew install anomalyco/tap/opencode · pacman -S opencode",
          precisa: "Your own key: works with practically any provider, including local models.",
          acesso: "Bash, files, and search; full terminal interface (TUI).",
          codigoAberto: true,
          link: "https://opencode.ai/docs/"
        },
        {
          nome: "Pi",
          empresa: "earendil-works",
          licenca: "MIT",
          instala: "npm install -g @earendil-works/pi-coding-agent",
          comando: true,
          instalaAlt: "Command: pi",
          precisa: "15+ providers, via API key or OAuth login for a subscription you already have.",
          acesso: "Four tools by default — read, write, edit, and bash — and TypeScript extensions.",
          codigoAberto: true,
          link: "https://github.com/earendil-works/pi"
        },
        {
        nome: "Antigravity CLI",
        empresa: "Google",
        instala: "curl -fsSL https://antigravity.google/cli/install.sh | bash",
        comando: true,
        instalaAlt: "Windows (PowerShell): irm https://antigravity.google/cli/install.ps1 | iex · The installed program is called `agy`, not `antigravity`.",
        precisa: "Google account. Public preview, no cost.",
        acesso: "The same agent from the window app, in the terminal: reads, writes, runs commands, and browses. Has a `--print` mode for use inside scripts, and in that mode you need to pass `--add-dir`, otherwise it can't see your folder.",
        codigoAberto: false,
        link: "https://antigravity.google/docs/cli/install/"
      },
      {
          nome: "Gemini CLI",
          empresa: "Google",
          licenca: "Apache-2.0",
          instala: "npm install -g @google/gemini-cli",
          comando: true,
          instalaAlt: "Command: gemini",
          precisa: "Google account (with free quota) or Gemini API key.",
          acesso: "Bash, files, web search, and MCP.",
          codigoAberto: true,
          link: "https://github.com/google-gemini/gemini-cli"
        }
      ]
    },
    {
      id: "apps",
      titulo: "Apps that open up the computer",
      subtitulo: "Window, button, and diff. The terminal is in there, to very different degrees.",
      explicacao: "For those who don't want to live in a black window. Worth reading the access column carefully: \"seeing the terminal\" and \"using the terminal\" are different things, and the distance between them is precisely the subject of this page.",
      itens: [
        {
          nome: "Claude Desktop (Code tab)",
          empresa: "Anthropic",
          instala: "Download the installer for macOS, Windows, or Linux (apt/.deb)",
          instalaAlt: "Comes with Claude Code built-in, no need to install Node or the CLI separately.",
          precisa: "Pro, Max, Team, or Enterprise subscription.",
          acesso: "Full local access, with integrated terminal (Ctrl+`), diff review, app preview, and permission modes ranging from \"approve every change\" to \"review later\".",
          codigoAberto: false,
          link: "https://code.claude.com/docs/en/desktop-quickstart"
        },
        {
          nome: "ChatGPT Desktop",
          empresa: "OpenAI",
          instala: "App for macOS and Windows, \"Work with Apps\" feature",
          instalaAlt: "Integrates with VS Code, Xcode, JetBrains, Cursor, Terminal, iTerm2, Warp, and others.",
          precisa: "ChatGPT account (the feature arrived first on paid plans on macOS).",
          acesso: "Asymmetric, and it's the most important detail in this table: it READS the terminal screen (the last ~200 lines of the active window) and applies changes in editors, but does not type in the terminal for you.",
          codigoAberto: false,
          link: "https://help.openai.com/en/articles/10119604-work-with-apps-on-macos"
        },
        {
          nome: "Antigravity",
          empresa: "Google",
          instala: "Download at antigravity.google/download (macOS, Windows, Linux)",
          instalaAlt: "Public preview, no cost, with generous quotas for Gemini 3 Pro.",
          precisa: "Google account.",
          acesso: "IDE where the agent is the central element: editor, terminal, and embedded browser are at its disposal, with a manager to run several tasks in parallel. The same agent exists in a terminal version: the Antigravity CLI, in the family above, which is the version measured in section 02 and taught in section 04.",
          codigoAberto: false,
          link: "https://antigravity.google/"
        }
      ]
    },
    {
      id: "local",
      titulo: "The engine: where the model comes from",
      subtitulo: "Who thinks, and where. This is the only place on the page where \"on your machine\" can be literal, but isn't always.",
      explicacao: "In the two families above the program is local and the model is remote, with no choice. Here the choice exists, and Ollama puts it behind the SAME command: `ollama run qwen3.5:4b` loads the model from your computer and computes on your CPU or GPU; `ollama run gemma4:cloud` sends the bill to the Ollama server and returns the response. In both cases, who responds is the same local process, on port 11434. The model name suffix is the only thing that says where the thinking happened. A local model wins on privacy and on having no bill; a cloud model wins on size, and that's what makes the subscription interesting for real work.",
      itens: [
        {
          nome: "Ollama",
          empresa: "Ollama",
          licenca: "open source",
          instala: "curl -fsSL https://ollama.com/install.sh | sh",
          comando: true,
          instalaAlt: "macOS and Windows have their own installer at ollama.com/download",
          precisa: "To run locally: 8 GB of RAM handles a 3–4B model; 16 GB opens the 7–9B ones; GPU speeds things up, but isn't mandatory. For cloud models, no machine requirements, just the account.",
          acesso: "Serves both worlds on the same local API (127.0.0.1:11434), which all the programs on this page know how to consume. And `ollama launch` connects that API to them without you editing a config file.",
          codigoAberto: true,
          link: "https://ollama.com/download",
          destaque: "It's the interactive tutorial on this page."
        },
        {
          nome: "LM Studio",
          empresa: "LM Studio",
          instala: "App with graphical interface (macOS, Windows, Linux)",
          instalaAlt: "Model catalog, chat, and local server in buttons.",
          precisa: "Same memory requirement as Ollama running locally.",
          acesso: "Local models only, and that's the charm: for those who want the weights in their own files without going through the terminal.",
          codigoAberto: false,
          link: "https://lmstudio.ai/"
        },
        {
          nome: "llama.cpp",
          empresa: "ggml-org",
          licenca: "MIT",
          instala: "Compile from source or install via package manager",
          instalaAlt: "It's the engine that runs underneath most of the options above.",
          precisa: "Willingness to deal with quantization and flags.",
          acesso: "Total control over how the model is loaded and executed.",
          codigoAberto: true,
          link: "https://github.com/ggml-org/llama.cpp"
        }
      ]
    }
  ],

  /* ─────────────────────────────────────────────────────────────
     5b. THE BRIDGE — `ollama launch`
     The block that closes the catalog. The first two families are
     harnesses; the third is the engine. What was missing was saying how to connect
     one to the other — and the answer, today, is a single command.

     The integration list is from `ollama launch --help` (v0.15+),
     copied verbatim, with the display names from the program itself.
     It grows with each version: that's why the text tells the reader to run
     `ollama launch` with no argument to see THEIR VERSION'S menu, instead
     of treating this table as definitive.
     ───────────────────────────────────────────────────────────── */
  ponte: {
    titulo: "The bridge: one command that connects the two columns",
    lede: "Up to here these are two separate problems: choosing the <strong>program that gives hands</strong> to the AI — what the industry calls a <em>harness</em> — and choosing the <strong>engine</strong>, which is the model that thinks. Connecting one to the other was always the annoying part: environment variable, API URL, config file per tool. `ollama launch` (from version 0.15) does this by itself: it installs the harness if it's not installed, points it to the local Ollama server, chooses the model, and opens the program.",

    comandos: [
      {
        cmd: "ollama launch",
        oQueFaz: "With no argument, opens the menu: lists the integrations your version knows, marks the ones already installed, and lets you choose the model. This is where to start. The real list, not the table below, is the one valid for your machine."
      },
      {
        cmd: "ollama launch claude",
        oQueFaz: "Opens Claude Code talking to Ollama. If Claude Code is not installed, it offers to install it. Under the hood, what changes is `ANTHROPIC_BASE_URL=http://localhost:11434`. The program thinks it's talking to Anthropic and it's talking to the local process."
      },
      {
        cmd: "ollama launch claude --model gpt-oss:120b-cloud",
        oQueFaz: "The same thing, already specifying the model. The `-cloud` suffix (or `:cloud`, for models without a size variant) sends the bill to the Ollama server; without the suffix, it runs on your computer."
      },
      {
        cmd: "ollama launch opencode --config",
        oQueFaz: "`--config` configures without opening the program: useful for getting the machine ready and walking away. `--restore` undoes it, returning the integration to its default profile."
      },
      {
        cmd: "ollama launch codex -- --sandbox workspace-write",
        oQueFaz: "Everything after `--` goes straight to the program, without Ollama interpreting it. This is how you pass each tool's own options."
      },
      {
        cmd: "ollama launch claude --model gemma4:cloud --yes -- -p \"how does this repository work?\"",
        oQueFaz: "`--yes` skips confirmations and downloads the model if needed (requires `--model`). This is how you use all of this inside a script or a CI pipeline."
      }
    ],

    integracoesTitulo: "The integrations that `ollama launch` knows",
    integracoesNota: "List from `ollama launch --help`. It grows with each version. Run the command with no argument to see yours.",
    integracoes: [
      { id: "claude", nome: "Claude Code", nota: "Anthropic. Installs itself if missing." },
      { id: "chatgpt", nome: "ChatGPT", nota: "Aliases: codex-app, codex-desktop, codex-gui." },
      { id: "hermes", nome: "Hermes Agent", nota: "Nous Research." },
      { id: "openclaw", nome: "OpenClaw", nota: "Aliases: clawdbot, moltbot." },
      { id: "opencode", nome: "OpenCode", nota: "Anomaly. Installs itself if missing." },
      { id: "codex", nome: "Codex", nota: "OpenAI." },
      { id: "hermes-desktop", nome: "Hermes Desktop", nota: "Windowed version of Hermes." },
      { id: "copilot", nome: "Copilot CLI", nota: "GitHub. Alias: copilot-cli." },
      { id: "omp", nome: "OMP", nota: "Agent with IDE integration." },
      { id: "droid", nome: "Droid", nota: "Factory." },
      { id: "dsh", nome: "DeepSeek Harness", nota: "Alias: deepseek-harness." },
      { id: "kimi", nome: "Kimi Code CLI", nota: "Moonshot." },
      { id: "muse", nome: "Muse Code", nota: "Meta. Alias: muse-code." },
      { id: "pi", nome: "Pi", nota: "Installs @earendil-works/pi-coding-agent if missing." },
      { id: "pool", nome: "Pool", nota: "Poolside." },
      { id: "cline", nome: "Cline", nota: "Installs via npm if missing." },
      { id: "qwen", nome: "Qwen Code", nota: "Alibaba." },
      { id: "vscode", nome: "VS Code", nota: "Alias: code." }
    ],

    planosTitulo: "What the Cloud subscription gives you",
    planosNota: "Prices from the official pricing page, checked on September 6, 2026. Credits do not roll over from one month to the next, so check before finalizing the lab budget.",
    planos: [
      {
        nome: "Free",
        preco: "US$ 0",
        credito: "Initial credits",
        detalhe: "Run local models as much as you want and try the \"starter\" cloud models. 1 request at a time."
      },
      {
        nome: "Pro",
        preco: "US$ 20/month",
        credito: "US$ 60 credit/month",
        detalhe: "Unlocks the larger models and allows 3 simultaneous requests. On the annual plan it's US$ 200 (US$ 16.67/month).",
        destaque: true
      },
      {
        nome: "Max",
        preco: "US$ 100/month",
        credito: "US$ 300 credit/month",
        detalhe: "10 simultaneous requests and early access to new models."
      }
    ],
    planosExtra: "Above that there's Team (US$ 500/month, US$ 1,000 shared credit, centralized billing) and Enterprise by quote, with model access controls and spending caps, which is the conversation a lab with several people ends up having.",

    fecho: "The page's thesis closes in one sentence: <strong>the program and the model are independent choices</strong>. You can switch agents without switching subscriptions, and switch models without relearning the agent. What doesn't change in any of the combinations is what gives power to all of them: the AI still sees your files and executes commands."
  },

  /* ─────────────────────────────────────────────────────────────
     6. SIMULATOR TUTORIALS
     The computer screen is a toy with a year-2000 face, but the commands
     are real and the outputs are faithful reconstructions — not recordings.
     Each step declares which window it takes place in: terminal, browser,
     or dialog box.
     ───────────────────────────────────────────────────────────── */
  tutoriais: [
    {
      id: "ollama",
      nome: "Ollama Cloud + launch",
      nomeCurto: "Ollama Cloud",
      icone: "terminal",
      legenda: "One subscription, any program",
      resumo: "From zero to a large model driving Claude Code, OpenCode, or Pi, without editing a config file.",
      minutos: 9,

      /* The tutorial declares what you will have at the end. Without this, the person goes
         through eight steps without knowing where they are heading. */
      objetivo: "At the end you have a model too large for your machine running via the Ollama subscription, driving the tool you prefer. And you know how to switch to a local model when the data can't leave.",

      passos: [
        {
          ato: "Install",
          janela: "dialogo",
          titulo: "Open the terminal",
          explicacao: "It's the window where you type commands instead of clicking. On Ubuntu, Ctrl+Alt+T. On macOS, Cmd+Space and \"Terminal\". On Windows, PowerShell works, but to follow this tutorial letter by letter it's worth enabling WSL, which is a Linux inside Windows.",
          dialogo: {
            titulo: "Where the terminal is",
            linhas: [
              "Ubuntu / Linux — press Ctrl + Alt + T",
              "macOS — Cmd + Space, type Terminal, Enter",
              "Windows — Start menu, type PowerShell (or WSL)"
            ],
            botao: "I opened the terminal"
          }
        },
        {
          ato: "Install",
          janela: "terminal",
          titulo: "Install Ollama",
          explicacao: "Just one line. `curl` downloads the official script and `sh` executes it. Before running a `curl | sh` from anywhere, check that the address is indeed the official website. This habit is worth it for the rest of your life in the terminal.",
          cmd: "curl -fsSL https://ollama.com/install.sh | sh",
          saida: [
            { t: "out", v: ">>> Installing ollama to /usr/local" },
            { t: "out", v: ">>> Downloading Linux amd64 bundle" },
            { t: "out", v: "######################################################### 100.0%" },
            { t: "out", v: ">>> Creating ollama systemd service..." },
            { t: "out", v: ">>> The Ollama API is now available at 127.0.0.1:11434." },
            { t: "out", v: ">>> Install complete. Run \"ollama\" from the command line." }
          ],
          nota: "Remember this address: 127.0.0.1:11434 is your own machine talking to itself. It will reappear in the most important step of this tutorial."
        },
        {
          ato: "Log in",
          janela: "terminal",
          titulo: "Log in to the account",
          explicacao: "Here the tutorial diverges from the \"model on my computer\" path. The Ollama Cloud subscription gives access to models too large to fit on a common machine, running on their servers. The command opens the browser for you to confirm.",
          cmd: "ollama signin",
          saida: [
            { t: "out", v: "You need to be signed in to Ollama to run Cloud models." },
            { t: "out", v: "" },
            { t: "out", v: "If your browser did not open, navigate to:" },
            { t: "out", v: "    https://ollama.com/connect?code=HTPK-QDVX" },
            { t: "out", v: "" }
          ],
          nota: "The Free plan gives initial credits and one request at a time; Pro (US$ 20/month) gives US$ 60 of credit per month and three simultaneous requests. The values are in the table in section 05."
        },
        {
          ato: "Log in",
          janela: "terminal",
          titulo: "Run a model that wouldn't fit here",
          explicacao: "The suffix is everything: `-cloud` (or `:cloud`, for models without a size variant) sends the bill to the Ollama server. Notice what does NOT happen: there's no download bar, because there's nothing to download.",
          cmd: "ollama run gpt-oss:120b-cloud \"Explain in two sentences what the Cerrado is.\"",
          saida: [
            { t: "out", v: "The Cerrado is the second largest biome in South America, occupying about" },
            { t: "out", v: "two million km² in central Brazil, with savanna vegetation adapted" },
            { t: "out", v: "to acidic soils and fire. It is considered a biodiversity hotspot and" },
            { t: "out", v: "holds the headwaters of three of the country's major river basins." }
          ],
          nota: "120 billion parameters answered in seconds on a machine that wouldn't have the memory to load them. The command is local, the process is local, the port is local. The thinking happened in a data center."
        },
        {
          ato: "Use",
          janela: "terminal",
          titulo: "Open the launch menu",
          explicacao: "This is the game-changing command. With no argument, `ollama launch` shows the AI programs your version knows, marks the ones already installed, and lets you choose the model. No environment variable, no config file.",
          cmd: "ollama launch",
          saida: [
            { t: "out", v: "  Choose an integration:" },
            { t: "out", v: "" },
            { t: "out", v: "> claude      Claude Code        Anthropic's coding tool with subagents" },
            { t: "out", v: "  chatgpt     ChatGPT            Use Ollama models in ChatGPT" },
            { t: "out", v: "  opencode    OpenCode           Anomaly's open-source coding agent" },
            { t: "out", v: "  codex       Codex              OpenAI's open-source coding agent" },
            { t: "out", v: "  pi          Pi                 Minimal AI agent toolkit with plugin support" },
            { t: "out", v: "  droid       Droid              Factory's coding agent across terminal and IDEs" },
            { t: "out", v: "  dsh         DeepSeek Harness   DeepSeek's open-source agent harness" },
            { t: "out", v: "  copilot     Copilot CLI        GitHub's AI coding agent for the terminal" },
            { t: "out", v: "  ...         (18 total)" }
          ],
          nota: "The full list is in the catalog, in section 05. It grows with every Ollama version, so it's worth running the command and looking at yours, instead of trusting any published table (including this one)."
        },
        {
          ato: "Use",
          janela: "terminal",
          titulo: "Drive Claude Code with the Ollama model",
          explicacao: "Installs the program if it's missing, points to the local address, and opens it. Notice the third line of the output: the address is your machine, and the model that will respond is on an Ollama server. Where it thinks and how far its reach goes are different things.",
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
          nota: "`ANTHROPIC_BASE_URL=http://localhost:11434`: the program thinks it's talking to Anthropic and it's talking to the Ollama process, on your machine, which in turn talks to the data center. Local address, remote model, both at the same time and in the same command."
        },
        {
          ato: "Use",
          janela: "terminal",
          titulo: "Switch programs without switching subscriptions",
          explicacao: "The same account serves any of the programs on the list. Here, Pi, which didn't even need to be installed: launch installs and opens it. It works the same for `ollama launch opencode`, `ollama launch codex`, `ollama launch droid`.",
          cmd: "ollama launch pi --model gpt-oss:120b-cloud",
          saida: [
            { t: "out", v: "Pi is not installed. Install it now? [Y/n] y" },
            { t: "out", v: "npm install -g @earendil-works/pi-coding-agent@latest" },
            { t: "out", v: "added 1 package in 6s" },
            { t: "out", v: "Starting Pi with gpt-oss:120b-cloud" },
            { t: "out", v: "" },
            { t: "out", v: "pi › " }
          ],
          nota: "This is the practical gain of the subscription: program and model become independent choices. You can switch agents without switching plans, and switch models without relearning the agent."
        },
        {
          ato: "When the data can't leave",
          janela: "terminal",
          titulo: "And when the data can't leave",
          explicacao: "The same program does the opposite: without the cloud suffix, the model is downloaded to your computer and the compute runs on your machine. This is the option for medical records, interviews, and any data under a consent agreement, and the reason this family exists on the page.",
          cmd: "ollama pull qwen3.5:4b && ollama run qwen3.5:4b \"Summarize this interview excerpt.\"",
          saida: [
            { t: "out", v: "pulling manifest" },
            { t: "out", v: "pulling 4c2a1f8d... 100%  ▕████████████████▏ 2.4 GB" },
            { t: "out", v: "success" },
            { t: "out", v: "" },
            { t: "out", v: "[response generated locally]" }
          ],
          nota: "Turn off the wi-fi and run it again: this one keeps working, the `:cloud` one doesn't. This is the one-line test that separates the two things, and the only proof that matters before trusting sensitive data to any tool on this page."
        }
      ],
      fecho: "Two conclusions, and they don't cancel each other out. The Cloud subscription solves the power problem: models too large for your machine, driving the harness you prefer, via a single command. The local model solves the secrecy problem: weaker, no bill, and nothing leaves your computer. The choice between the two is per task, not a one-time decision, and you can switch in the middle of the day by changing the model suffix."
    },
    {
      id: "antigravity",
      nome: "Antigravity CLI",
      nomeCurto: "Antigravity",
      icone: "janela",
      legenda: "Google's agent, in your terminal",
      resumo: "From installation to the first task, and to the trap that this page's measurement found.",
      minutos: 8,

      /* The tutorial declares what you will have at the end. Without this, the person goes
         through eight steps without knowing where they are heading — this was the critique that
         motivated this rewrite. */
      objetivo: "At the end you have a Google agent running in your terminal, looking at your folder. And you know the difference between it seeing your files and not seeing them, which is the only thing separating the two sides of this entire page.",

      /* This is the CLI, not the window app. It was the CLI (`agy`) that the
         measurement in section 02 used, and it's the one that has the same format as the Ollama
         tutorial: everything happens in the terminal, from start to finish.
         Commands checked at antigravity.google/docs/cli/install/ and
         .../getting-started/ on 09/11/2026. Step 7 uses the REAL output
         measured on 09/10 (see automation/captures/2026-09-10-leia-me.md). */
      passos: [
        {
          ato: "Install",
          janela: "dialogo",
          titulo: "Open the terminal",
          explicacao: "The same window from the previous tutorial. On Ubuntu, Ctrl+Alt+T. On macOS, Cmd+Space and \"Terminal\". On Windows, PowerShell.",
          dialogo: {
            titulo: "Where the terminal is",
            linhas: [
              "Ubuntu / Linux — press Ctrl + Alt + T",
              "macOS — Cmd + Space, type Terminal, Enter",
              "Windows — Start menu, type PowerShell"
            ],
            botao: "I opened the terminal"
          }
        },
        {
          ato: "Install",
          janela: "terminal",
          titulo: "Install",
          explicacao: "One line, like Ollama. The installer detects your system and leaves a program called `agy`, not `antigravity`.",
          cmd: "curl -fsSL https://antigravity.google/cli/install.sh | bash",
          saida: [
            { t: "out", v: "==> Detecting platform… linux-x64" },
            { t: "out", v: "==> Downloading Antigravity CLI v1.2.0" },
            { t: "out", v: "==> Installed to ~/.local/bin/agy" },
            { t: "out", v: "" },
            { t: "out", v: "Run 'agy' to get started." }
          ],
          nota: "On Windows the line is different: `irm https://antigravity.google/cli/install.ps1 | iex`, in PowerShell. If the terminal says it can't find `agy` after installing, it's because the `~/.local/bin` folder isn't in the PATH. The installer itself prints the line that fixes this."
        },
        {
          ato: "First run",
          janela: "terminal",
          titulo: "Open for the first time",
          explicacao: "With no arguments, `agy` opens a screen inside the terminal. The first time it asks for the color scheme and whether you prefer full screen or embedded. Choose whatever you like, you can change it later.",
          cmd: "agy",
          saida: [
            { t: "out", v: "  Antigravity CLI v1.2.0" },
            { t: "out", v: "" },
            { t: "out", v: "  Color scheme:  ● Dark   ○ Solarized   ○ Solarized Light   ○ Terminal" },
            { t: "out", v: "  Screen mode:      ● Full screen   ○ Embedded" }
          ],
          nota: "Notice that it opened **in the folder you were in**. This decides what it will be able to see."
        },
        {
          ato: "First run",
          janela: "dialogo",
          titulo: "Log in to the account",
          explicacao: "On the first run it opens your browser by itself for you to sign in with your Google Account. After that the session is saved on the machine and it doesn't ask again.",
          dialogo: {
            titulo: "Sign in with Google",
            linhas: [
              "The browser opened at accounts.google.com",
              "Choose the account and authorize Antigravity CLI",
              "Return to the terminal: it's already authenticated"
            ],
            botao: "I authorized it in the browser"
          },
          nota: "Here the point from section 01 becomes visible again: the program is installed on your machine and sees your files, but who responds is a model on a Google server. Where it thinks and how far its reach goes are different things."
        },
        {
          ato: "First run",
          janela: "dialogo",
          titulo: "Authorize the folder",
          explicacao: "Before anything else it asks if it can read the folder it was opened in. This is the most important question in the entire tutorial, and the answer defines everything that follows.",
          dialogo: {
            titulo: "Trust this folder?",
            linhas: [
              "~/laboratorio-teste",
              "The agent will be able to read the files in here.",
              "Commands that alter files still ask for approval."
            ],
            botao: "Trust this folder"
          },
          nota: "Open it in the project, and only in the project. Choosing the folder is choosing what it can see: opening it at the root of the computer or in your home folder gives access to email, keys, and everything else that's there."
        },
        {
          ato: "Use",
          janela: "terminal",
          titulo: "The first task, in Portuguese",
          explicacao: "You write what you want. It looks at the folder before proposing anything, which is what the browser chat can't do.",
          prompt: "How many photos are in the campo-2026 folder and from how many different days are they?",
          cmd: "ls campo-2026 | wc -l",
          saida: [
            { t: "out", v: "1240" },
            { t: "out", v: "" },
            { t: "out", v: "There are 1,240 photos. I will look at the modification dates to" },
            { t: "out", v: "count how many different days they cover." }
          ],
          nota: "No one said there were 1,240. It counted."
        },
        {
          ato: "Use",
          janela: "terminal",
          titulo: "The screenless mode, and its trap",
          explicacao: "To run the agent inside a script there is the `--print` mode: it responds and exits, without opening a screen. **In this mode it does not inherit the folder you are in.** This is how the measurement for this page accidentally discovered the cleanest demonstration of the entire argument.",
          cmd: "agy --print \"Run: pwd\"",
          saida: [
            { t: "out", v: "/home/voce/.antigravity/scratch" },
            { t: "nota", v: "You are in ~/laboratorio-teste. It is not." }
          ],
          nota: "Without the folder, the same prompts from the section 02 examples go back to yielding **zero commands** and responses indistinguishable from the browser chat. Same program, same model, same question. The only thing that changes is whether it can see your files."
        },
        {
          ato: "Use",
          janela: "terminal",
          titulo: "Give the folder, and see the difference",
          explicacao: "The `--add-dir` option gives the folder to the agent. Compare the output with the previous step: it's the same command, on the same computer, in the same second.",
          cmd: "agy --print --add-dir . \"Run: pwd\"",
          saida: [
            { t: "out", v: "/home/voce/laboratorio-teste" },
            { t: "nota", v: "Now it does. From here on it can see your files." }
          ],
          nota: "Save this pair of outputs: it's the entire tab in two lines. The difference between \"AI in the browser\" and \"AI on your machine\" is not the model or the intelligence: it's **whether it can reach your files**, and that turns on and off with a command-line option."
        }
      ],
      fecho: "You have the agent installed, authenticated, and pointed at a folder. What to do with it is section 02 of this page, and how it connects to other models is section 05. If you want to drive this same agent with another model, or use an Ollama model inside another program, the `ollama launch` table in the catalog shows how."
    }
  ],

  /* The section "Before installing: what you are authorizing" was removed in
     09/12/2026. It was seven technical and nested rules, written for those who already
     administer their own machine, and none of them were the subject of the tab.
     What needed to survive survived in the right place: choosing the folder
     is a step in the section 04 tutorial, with the explanation next to it, and checking
     the result is in the narration of the section 02 examples. */

  /* ─────────────────────────────────────────────────────────────
     8. HOW THIS WAS MEASURED
     The part that separates measurement from propaganda. It's short on
     purpose: the complete material is in automation/captures/, and
     whoever wants to verify provenance has the path. What needs to be
     ON THE PAGE is the method in three sentences and the list of what
     was NOT measured — because that list is what gives credit to the rest.
     ───────────────────────────────────────────────────────────── */
  medicao: {
    titulo: "How this was measured",
    lede: "All the numbers on this page came from real executions in September 2026, and the transcripts are in the repository. It's worth knowing how, because the method explains both what the page claims and what it avoids claiming.",

    passos: [
      {
        titulo: "A test folder with real traps",
        texto: "A program assembles the same folder every time: 1,240 real JPEG photos, 340 files with messy names, 40 spreadsheets totaling 97 tabs, 84 identical files hidden among others. Each trap is a mistake that actually happens in a lab, and none of them appear on the screen as an error."
      },
      {
        titulo: "The scoreboard is the files, not the conversation",
        texto: "After the program finishes, another program counts what's left in the folder: how many files remain, how many went into a subfolder, how many CSVs exist. That's what counts. If it says \"done\" and the folder says otherwise, the folder wins."
      },
      {
        titulo: "Both sides, with the same phrases",
        texto: "The same tasks were taken to Gemini in the browser on 09/09 and to two installed programs on 09/10. The tasks that mattered most were repeated five times in each program, to separate results from luck."
      }
    ],

    naoMedidoTitulo: "What was NOT measured",
    naoMedidoLede: "This list is what separates measurement from propaganda. It stays on the page on purpose.",
    naoMedido: [
      {
        item: "Comparable time and cost",
        porque: "the browser side had no timed duration. One side measured and the other estimated is not a comparison: that's why this page publishes no time or cost figures."
      },
      {
        item: "A geoprocessing scenario with GDAL",
        porque: "the test machine didn't have GDAL installed, and attempts to install it ran into packages without a version for its Python. The scenario is described in the repository and will return on any machine that has it."
      },
      {
        item: "Real Linux",
        porque: "everything ran on Windows. Some prompts cited Ubuntu by mistake, and what they measured was that mismatch, not the program's behavior. The affected results were re-run."
      },
      {
        item: "How often it fails",
        porque: "the repeated tasks were stable; variation appeared in tasks run once or twice. There is no honest number for that here, so this page gives none."
      }
    ],

    saibaMais: {
      titulo: "Three conclusions from this measurement were wrong. How they were discovered",
      corpo: "Measuring AI is easy to get wrong, and the most common way to get it wrong is to attribute to the program a behavior that was actually caused by the test. It happened three times here, and all three were corrected before any number reached this page.<br><br><strong>1. \"The word Ubuntu disables the program.\"</strong> Wrong. Naming a system doesn't disable anything. Naming the <em>wrong</em> system does. The machine was Windows and the prompt said Ubuntu.<br><br><strong>2. \"The isolation lock distorts nothing.\"</strong> Wrong, and this was the worst one: the lock <em>was hiding Python</em> from one of the programs. The other one saw the installed libraries and seemed faster. It wasn't a better program; it was a different environment, and I had credited the merit to the program.<br><br><strong>3. \"Both programs leave the folder and scan the entire computer.\"</strong> Wrong. It was the prompt, which mentioned a nonexistent 500 GB HD. Once the text was corrected, both stayed inside the folder.<br><br>The common thread of the three is a rule that holds for both sides of this page: <strong>the program acts on what it can verify exists.</strong> A prompt that describes what isn't on the machine becomes a knowledge response; an environment that hides a tool becomes \"the machine doesn't have it\".<br><br>The test scenario also needed fixing. In an earlier version the photos were 91 bytes each, and one program correctly concluded they were broken files and recommended deleting all 1,240. The error was in the test. With real JPEG photos, none of the next twenty runs called the data synthetic.<br><br>All of this is documented in writing in <code>automation/capturas/</code>, including in the files that were wrong: they have a rectification block at the top instead of having been rewritten."
    }
  }
};
