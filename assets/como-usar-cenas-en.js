/* ═══════════════════════════════════════════════════════════════
   Global Landscape of Generative AI — Examples from the "How to use" tab

   Each example is ONE question that actually comes up at work, and
   the answer in two places: in a browser tab and in a program
   installed on the computer.

   HOW THIS SECTION CHANGED ON Sep 12, 2026, AND WHY
   Previously it narrated the tests: transcription of the two conversations,
   file count, pitfall of each scenario, how many spreadsheet
   tabs were lost. It became technical and boring, and turned the tab
   into a measurement report instead of an explanation.

   Now the section NARRATES THE DIFFERENCE, in the language of someone who works, and
   the measurement becomes a backing: it remains intact in the repository and
   section 05 tells how it was done. The rule: here we say what can be
   done on each side, not what went wrong in which run.

   WHAT WAS USED
   Browser: Gemini, in conversations captured on Sep 9, 2026.
   Terminal: Antigravity CLI, on Sep 10, 2026, in a test folder
   with real files. Claude Code ran the same tasks and
   appears only in the "learn more" that compares the two.
   Transcripts and reports: automation/capturas/
   ═══════════════════════════════════════════════════════════════ */

const COMO_USAR_CENAS = {
  fontes: {
    navegador: {
      arquivo: "automation/capturas/gemini-2026-09-09.json",
      rotulo: "Gemini, in a browser tab",
      curto: "in the browser",
      data: "09/Sep/2026"
    },
    agente: {
      arquivos: [
        "automation/capturas/antigravity-2026-09-10-forma-agente.json",
        "automation/capturas/claude-code-deepseek-2026-09-10-forma-agente.json"
      ],
      rotulo: "Antigravity, in the terminal",
      curto: "in the terminal",
      data: "10/Sep/2026"
    }
  },

  cenas: [
    /* ─────────────────────────────────────────────────────────── */
    {
      id: "fotos",
      aba: "A thousand photos to sort",
      pergunta: "I came back from three weeks in the field with over a thousand photos in a single folder. How do I sort them by date?",

      navegador: {
        rotulo: "In a browser tab",
        sub: "Gemini",
        narrativa: "It writes a command and explains what each part does. Since it doesn't know your system or where the folder is, it chooses a system for you and leaves the path blank for you to fill in. You open the terminal, paste, run it, and go back to report what appeared on the screen. If the command doesn't work for your case, this back-and-forth repeats.",
        bom: "Responds in seconds, without installing anything, and explains the reasoning.",
        limite: "You are the one who executes and checks."
      },

      instalado: {
        rotulo: "With an installed program",
        sub: "Antigravity, in the terminal",
        narrativa: "It opens the folder before proposing anything. It counts how many photos there are, sees that there are files with non-standard names, checks if the image library exists on your machine, and then shows the plan. You authorize it, it executes, and at the end it goes back to check how many photos ended up in each subfolder.",
        bom: "Works on your real files, and checks the result.",
        limite: "You approve every step that changes anything."
      },

      diferenca: "On both ends the AI knows the same amount. What changes is who does the manual work and who discovers the cases that weren't in the plan: the photos the camera named differently, the one that came from another phone, the one someone had already renamed by hand. In the browser, these only appear when you go check and come back to report. In the terminal, they appear to the one doing the work.",

      quandoUsar: {
        navegador: "When you want to understand the command before running it, or are on a machine where you can't install anything.",
        instalado: "When there are many files and you will repeat this other times."
      }
    },

    /* ─────────────────────────────────────────────────────────── */
    {
      id: "planilhas",
      aba: "Spreadsheets to CSV",
      pergunta: "I have forty field spreadsheets and need all of them in CSV. How do I convert them all at once?",

      navegador: {
        rotulo: "In a browser tab",
        sub: "Gemini",
        narrativa: "It gives the right command and suggests how to check afterwards. But it can't open your spreadsheets, so it answers about spreadsheets in general: how many there are, how many tabs each one has, whether any is protected—none of that is factored in. When you ask specifically, it explains very well what could go wrong.",
        bom: "Explains the method and the risks, if you ask.",
        limite: "The answer is about spreadsheets in general, not about yours."
      },

      instalado: {
        rotulo: "With an installed program",
        sub: "Antigravity, in the terminal",
        narrativa: "It opens the files before converting. It sees there are forty, sees how many tabs exist in total, and can tell you this before starting. It converts, and then counts what came out to compare with what went in.",
        bom: "Works on your files and can compare before and after.",
        limite: "It does what you asked. If the request doesn't mention tabs, it doesn't treat tabs as a requirement."
      },

      diferenca: "This is the example that teaches the most about how to ask. Spreadsheets have tabs, and CSV doesn't: each tab becomes a separate file, or it's lost. In both places, saying <strong>what cannot be lost</strong> changes the result — and in the installed program the difference is visible, because it will count the tabs before converting instead of just starting to convert.",

      quandoUsar: {
        navegador: "When you want to understand the format before touching the files.",
        instalado: "When the files are yours, there are many, and you need to know if everything is left."
      },

      saibaMais: [{
        titulo: "The phrase that changes the result, and the number behind it",
        corpo: "This is the most solid finding from the measurement, and it's worth the technical paragraph for those interested.<br><br>The forty test spreadsheets had <strong>97 tabs in total</strong>. Asking <em>“convert these spreadsheets to CSV”</em>, 40 files came out: one per spreadsheet, and the other 57 tabs were left behind without any warning on the screen. Asking the same thing with <em>“without losing any tabs”</em>, the 97 files came out.<br><br>We repeated this five times on each of the two installed programs. With the complete phrase, it got it right all ten times. Without it, it failed in every run that actually executed.<br><br>The lesson isn't about this program or this format: it's that <strong>the request needs to say what you don't accept losing</strong>, because that's the part the machine can check afterwards."
      }, {
        /* The former fifth example. As a surface example it was
           entirely about a specific error, which is what the section
           stopped doing on Sep 12. As a counterweight to the box above, it is necessary:
           without it the page suggests that just asking correctly is enough. */
        titulo: "Asking better helps a lot. It doesn't solve everything",
        corpo: "It would be comforting to end with “just ask correctly”. Another test won't allow it.<br><br>In a folder with <strong>244 satellite images</strong>, four were outside the series standard. We asked both ways, with a question and with an explicit command, five times each, on the two programs. The twenty runs found the same three, and none found the fourth.<br><br>The reason is instructive: that file opened normally and showed the same image. The difference was in how the bytes had been written, and the library the programs used to open it corrects this on its own, silently. Once opened, the file was identical to the others.<br><br><strong>There are problems that only appear to someone who already knows what to look for.</strong> That part of the work continues to belong to whoever understands the subject, and no phrasing of the request replaces that."
      }]
    },

    /* ─────────────────────────────────────────────────────────── */
    {
      id: "espaco",
      aba: "The folder is full",
      pergunta: "My work folder filled up and I don't know what is taking up space. How do I find out?",

      navegador: {
        rotulo: "In a browser tab",
        sub: "Gemini",
        narrativa: "Here the conversation gets stuck in a way that well illustrates the problem. It doesn't know what computer you're on, and the procedure is different on each system. So either it chooses one for you, or it spends the answer asking which one it is. In the capture we made, there were three consecutive messages about which machine it was, and the folder remained the same size.",
        bom: "Explains the methods very well, after knowing what your system is.",
        limite: "Finding out what your system is costs the entire conversation."
      },

      instalado: {
        rotulo: "With an installed program",
        sub: "Antigravity, in the terminal",
        narrativa: "It is inside the folder, so it measures. In a few commands it returns the size of each subfolder, the largest files and what is in every corner, with the numbers from your machine. Without asking anything.",
        bom: "Answers with the real numbers from your folder.",
        limite: "It shows you what is large. Deciding what can be deleted is still up to you."
      },

      diferenca: "This is the task where the difference becomes clearest, because the question depends entirely on information that only exists on your machine. A chat can teach the method; it cannot look. And note what the installed program does <em>not</em> solve: it tells you what is taking up space, and the decision about what to delete remains with whoever knows the work.",

      quandoUsar: {
        navegador: "When you want to learn how to do this measurement yourself.",
        instalado: "When you want the answer now, about this folder."
      }
    },

    /* ─────────────────────────────────────────────────────────── */
    {
      id: "nomes",
      aba: "Messy names",
      pergunta: "I have over three hundred files with names full of spaces, accents, and uppercase letters. How do I standardize everything?",

      navegador: {
        rotulo: "In a browser tab",
        sub: "Gemini",
        narrativa: "It writes very good code, and even runs a test to show it works. Except the test runs on names it made up, because it can't see yours. It warns, in theory, that two files could end up with the same name after removing the accent.",
        bom: "Correct code, explained, and with the risk anticipated.",
        limite: "The test is on examples, not on your files."
      },

      instalado: {
        rotulo: "With an installed program",
        sub: "Antigravity, in the terminal",
        narrativa: "It reads the actual list and finds the concrete case: two files that, without the accent, become the same name. Instead of discovering this after overwriting one of them, it stops in the middle, opens both to compare, and handles the case before continuing.",
        bom: "Finds the problematic case in your files, before making changes.",
        limite: "You need to authorize the renaming, one block at a time."
      },

      diferenca: "The code was equally good in both places. The difference appeared when encountering the real files — and this is almost always the case: what breaks an automation is usually not the method, it's the weird case that only exists in your folder.",

      quandoUsar: {
        navegador: "When you want the code to adapt and run on your own.",
        instalado: "When the files matter and overwriting one of them would be costly."
      },

      saibaMais: {
        titulo: "Antigravity and Claude Code: two ways of handling the same problem",
        corpo: "We ran the same tasks on two terminal programs: <strong>Antigravity</strong>, from Google, and <strong>Claude Code</strong>, from Anthropic. Both found the pair of files that collides. What they did next was different, and it's worth knowing this choice exists.<br><br><strong>Antigravity</strong> resolved it on its own: renamed one of the two with a suffix, continued the work, and reported what it had done at the end.<br><br><strong>Claude Code</strong> stopped, explained the situation, and asked how you preferred to resolve it. It offered, on its own, to save a spreadsheet with the mapping from old name to new name, in case you wanted to undo it.<br><br>Neither is wrong. One assumes more and interrupts you less; the other interrupts you more and assumes less. It's the kind of difference that only appears through use, and that tends to weigh more on the choice than any model comparison."
      }
    }
  ]
};
