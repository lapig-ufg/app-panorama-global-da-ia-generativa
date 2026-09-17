/* ═══════════════════════════════════════════════════════════════
   Global Panorama of Generative AI — Catalog of Free AIs
   Structured data on tools, models and platforms with
   free plans (Free Tier), their quotas and limits.

   DATA SOURCE (since the 24/Jul/2026 revision):
   Quotas/limits/paid plans are adapted from The AI Rankings
   (https://theairankings.com/best-free-ai-tools/), updated by
   them ~monthly. See the `source` block below and
   automation/GRATUITOS.md for the automated collection plan.

   When an announcement from the vendor themselves is newer than the
   aggregated source (as was the case on 10/Aug/2026: unlimited ChatGPT,
   Codex on the Free plan, OpenCode Zen), the item points `sourceUrl` to
   that announcement instead of The AI Rankings. The field is per-item
   precisely so the page can mix the two provenances without lying
   about where each number came from.

   TO UPDATE THIS PAGE (today, manually):
   1. Check the source page (source.url) for changes in quotas;
   2. Change `source.lastChecked`, `updatedAt` and `updatedText`;
   3. Edit the items in the `items` array below (or run, in the future,
      `node automation/update-gratuitos.mjs`).

   SCHEMA v2 (scrape-friendly): each item can have, in addition to the
   original fields, `freeModel`, `paidStepUp`, `theCatch`, `rank` and
   `sourceUrl` — 1:1 mapping of the source fields, designed so
   that a scraper regenerates this file without remodeling effort.
   The renderer (gratuitos.js) only shows optional fields when
   they exist, so v1 entries keep working.
   ═══════════════════════════════════════════════════════════════ */

const GRATUITOS_DATA = {
  // Provenance — a scraper fills these same fields.
  source: {
    name: "The AI Rankings — Best Free AI Tools",
    url: "https://theairankings.com/best-free-ai-tools/",
    attribution: "Quotas and limits adapted from The AI Rankings (theairankings.com)",
    lastChecked: "2026-08-10",
    schemaVersion: 2,
  },
  updatedAt: "2026-08-10",
  updatedText: "August 10, 2026",
  categories: [
    { id: "todos", label: "All AIs" },
    { id: "assistentes-dev", label: "Code Assistants & IDEs" },
    { id: "modelos-llm", label: "LLMs & Web Chat" },
    { id: "apis-inferencia", label: "APIs & Providers" },
    { id: "pesquisa-busca", label: "Search & Reasoning" },
    { id: "imagem-design", label: "Image Generation & UI" },
    { id: "midia-av", label: "Video, Voice & Music" }
  ],
  items: [
    /* ── Models & Web Chat ─────────────────────────────────── */

    {
      id: "gemini-free",
      rank: 1,
      name: "Gemini Free",
      company: "Google",
      category: "modelos-llm",
      badge: "Multimodal Web Chat",
      highlight: "The most generous free tier in multimodality — voice, search, image and video in a single chat.",
      freeModel: "Gemini 3.5 Flash",
      freeQuota: "Compute-based quota, renewable every ~5h up to a weekly cap.",
      limits: "Free-tier activity may be used to train Google's models (can be disabled in settings).",
      bestFor: "The most generous all-rounder: voice, search, image and video.",
      paidStepUp: "Google AI Pro $19.99/mo (or AI Plus $7.99).",
      theCatch: "Flash lags behind Gemini 3.5 Pro (paid) on harder reasoning.",
      howToAccess: "Visit gemini.google.com with a free Google account.",
      link: "https://gemini.google.com/",
      sourceUrl: "https://theairankings.com/best-free-ai-tools/",
      tags: ["Gemini 3.5 Flash", "Voice", "Image", "Video"]
    },
    {
      /* Rewritten on 10/Aug/2026. Until 06/Aug the free plan gave ~10 GPT-5.5
         messages every 5h and then downgraded to Instant/mini; now the
         default is GPT-5.6 Luna and text is unlimited. The old `id` was
         "codex-chatgpt", a name inherited from when Codex and ChatGPT were the same
         entry — since Codex became its own card right below, keeping the two
         with swapped names would only confuse anyone editing. */
      id: "chatgpt-free",
      rank: 2,
      name: "ChatGPT Free",
      company: "OpenAI",
      category: "modelos-llm",
      badge: "Web Chat",
      highlight: "Since 06/Aug/2026, text conversations with no limits whatsoever — and on GPT-5.6 Luna, no longer on the downgraded model.",
      freeModel: "GPT-5.6 Luna",
      freeQuota: "Unlimited text chats, no daily quota or downgrade to mini.",
      limits: "Unlimited applies only to text: images, files, voice and image generation maintain separate quotas. Rollout is gradual since the 06/Aug announcement, so it may not have reached your account yet. In some markets the free version displays ads, and conversations may train the model if you haven't disabled it.",
      bestFor: "High-volume text chat without counting messages — plus the Think button when the question is hard.",
      paidStepUp: "Go $8/mo or Plus $20/mo.",
      theCatch: "Luna scores 52.3 on the Artificial Analysis Intelligence Index, below GPT-5.6 Sol (60.9), which remains exclusive to paid plans along with Deep Research and Work mode.",
      howToAccess: "Create a free account at chatgpt.com.",
      link: "https://chatgpt.com/",
      sourceUrl: "https://openai.com/index/improving-gpt-5-6-sol-in-chatgpt/",
      tags: ["GPT-5.6 Luna", "Unlimited Text", "Think", "Images"]
    },
    {
      id: "claude-web",
      rank: 3,
      name: "Claude Free",
      company: "Anthropic",
      category: "modelos-llm",
      badge: "Web Chat & Artifacts",
      highlight: "Free access to Claude Sonnet 4.6 with support for visual Artifacts.",
      freeModel: "Claude Sonnet 4.6",
      freeQuota: "~15 messages, with daily/weekly quotas that fluctuate based on demand.",
      limits: "The limit fluctuates with global traffic; no native image or video generation.",
      bestFor: "Natural prose, careful reasoning and long documents.",
      paidStepUp: "Pro $20/mo ($17 annual).",
      theCatch: "Withholds Opus 4.8 (the strongest model); tighter quotas than Gemini.",
      howToAccess: "Visit and create a free account at claude.ai.",
      link: "https://claude.ai/",
      sourceUrl: "https://theairankings.com/best-free-ai-tools/",
      tags: ["Sonnet 4.6", "Artifacts", "Writing", "Reasoning"]
    },
    {
      id: "deepseek-web",
      rank: 4,
      name: "DeepSeek Free",
      company: "DeepSeek",
      category: "modelos-llm",
      badge: "Frontier Reasoning",
      highlight: "Frontier-level reasoning for free, with no monthly subscription.",
      freeModel: "DeepSeek (frontier-class)",
      freeQuota: "No strict daily quota; throttles speed during peak hours.",
      limits: "Prompts are stored on servers in China; several governments restrict DeepSeek on official devices.",
      bestFor: "Free frontier reasoning (hosted in China).",
      paidStepUp: "",
      theCatch: "Servers in China and slowdowns during Asian peak hours.",
      howToAccess: "Visit chat.deepseek.com.",
      link: "https://chat.deepseek.com/",
      sourceUrl: "https://theairankings.com/best-free-ai-tools/",
      tags: ["DeepSeek", "Reasoning", "Math", "Totally Free"]
    },
    {
      id: "meta-ai",
      rank: 5,
      name: "Meta AI",
      company: "Meta",
      category: "modelos-llm",
      badge: "Chat on Social Networks",
      highlight: "Fully free multimodal AI embedded in WhatsApp, Instagram and Messenger.",
      freeModel: "Muse Spark",
      freeQuota: "Completely free, no paid plan.",
      limits: "Tied to your Meta social accounts.",
      bestFor: "Casual multimodal use within WhatsApp, Instagram and Messenger.",
      paidStepUp: "",
      theCatch: "Tied to your Meta social accounts.",
      howToAccess: "Available inside WhatsApp, Instagram and Messenger.",
      link: "https://www.meta.ai/",
      sourceUrl: "https://theairankings.com/best-free-ai-tools/",
      tags: ["Muse Spark", "WhatsApp", "Instagram", "Totally Free"]
    },
    {
      id: "le-chat",
      rank: 6,
      name: "Le Chat",
      company: "Mistral AI",
      category: "modelos-llm",
      badge: "Web Chat (EU)",
      highlight: "Generous European option with image, code and connectors.",
      freeModel: "Mistral Medium / Small",
      freeQuota: "~25 messages per day.",
      limits: "Soft daily cap; hosted in the EU with data opt-out controls.",
      bestFor: "Generous European option: image, code and connectors.",
      paidStepUp: "Pro $14.99/mo.",
      theCatch: "Daily cap of ~25 messages.",
      howToAccess: "Visit chat.mistral.ai and create a free account.",
      link: "https://chat.mistral.ai/",
      sourceUrl: "https://theairankings.com/best-free-ai-tools/",
      tags: ["Mistral", "European Union", "Image", "Code"]
    },
    {
      id: "microsoft-copilot",
      rank: 7,
      name: "Microsoft Copilot Free",
      company: "Microsoft",
      category: "modelos-llm",
      badge: "Chat & Office",
      highlight: "Drafts and images inside the Office and Edge ecosystem.",
      freeModel: "GPT-class model",
      freeQuota: "Daily quotas; richest inside Office and Edge.",
      limits: "Daily quotas; real value is inside Office apps.",
      bestFor: "Drafts and images inside Word, Outlook and Edge.",
      paidStepUp: "Microsoft 365 Premium $19.99/mo.",
      theCatch: "Performs better inside Word/Outlook/Edge than in the standalone chat.",
      howToAccess: "Visit copilot.microsoft.com or use inside Edge/Office.",
      link: "https://copilot.microsoft.com/",
      sourceUrl: "https://theairankings.com/best-free-ai-tools/",
      tags: ["Copilot", "Office", "Edge", "Images"]
    },
    {
      id: "perplexity-free",
      rank: 8,
      name: "Perplexity AI",
      company: "Perplexity",
      category: "pesquisa-busca",
      badge: "Search & Lookup",
      highlight: "AI search engine that synthesizes answers and cites web sources in real time.",
      freeModel: "Multi-model",
      freeQuota: "Unlimited cited quick searches; a few Pro Searches per day.",
      limits: "Few Pro Searches per day; may train on data (opt-out available).",
      bestFor: "Research with citations and sourced answers.",
      paidStepUp: "Pro $20/mo.",
      theCatch: "Only a few Pro Searches per day.",
      howToAccess: "Visit perplexity.ai in the browser or app.",
      link: "https://www.perplexity.ai/",
      sourceUrl: "https://theairankings.com/best-free-ai-tools/",
      tags: ["Web Search", "Citations", "Updated Facts", "Sources"]
    },
    {
      id: "grok-free",
      rank: 9,
      name: "Grok Free",
      company: "xAI",
      category: "modelos-llm",
      badge: "Chat & News",
      highlight: "Access to real-time X/news, image generation and fewer filters.",
      freeModel: "Grok (xAI)",
      freeQuota: "~10 prompts every 2h.",
      limits: "Trains on your data by default (opt-out available).",
      bestFor: "Real-time X/news, image generation and fewer filters.",
      paidStepUp: "SuperGrok Lite $10 or SuperGrok $30/mo.",
      theCatch: "Cap of ~10 prompts every 2h.",
      howToAccess: "Visit grok.com with an X account or a free account.",
      link: "https://grok.com/",
      sourceUrl: "https://theairankings.com/best-free-ai-tools/",
      tags: ["Grok", "X", "Real Time", "Images"]
    },
    {
      id: "huggingface-chat",
      name: "HuggingChat & Hugging Face",
      company: "Hugging Face",
      category: "modelos-llm",
      badge: "Open Source Chat",
      highlight: "Free interface to test the world's top Open Source models.",
      freeModel: "Open models (Llama, Qwen, DeepSeek…)",
      freeQuota: "Free use, no subscription, to chat with cutting-edge open models.",
      limits: "Subject to temporary queues on community servers during peak hours.",
      bestFor: "Testing and comparing the quality of recent open models without spending credits.",
      howToAccess: "Visit huggingface.co/chat directly.",
      link: "https://huggingface.co/chat/",
      tags: ["Open Source", "Llama", "Qwen", "DeepSeek"]
    },

    /* ── Search & Reasoning ──────────────────────────────── */

    {
      id: "notebooklm",
      name: "NotebookLM",
      company: "Google",
      category: "pesquisa-busca",
      badge: "Research with Sources",
      highlight: "Research tool that anchors answers in your own uploaded sources.",
      freeModel: "Gemini (under the hood)",
      freeQuota: "Up to 100 notebooks, 50 sources each, ~500,000 words per notebook.",
      limits: "Source/notebook limits; answers restricted to what you upload.",
      bestFor: "Research anchored in your own uploaded sources.",
      paidStepUp: "",
      theCatch: "Answers are restricted to the sources you upload.",
      howToAccess: "Visit notebooklm.google.com with a Google account.",
      link: "https://notebooklm.google.com/",
      sourceUrl: "https://theairankings.com/best-free-ai-tools/",
      tags: ["Sources", "Citations", "Research", "PDFs"]
    },

    /* ── APIs & Providers ──────────────────────────────────── */

    {
      id: "google-ai-studio",
      name: "Google AI Studio (API)",
      company: "Google",
      category: "apis-inferencia",
      badge: "Developer API",
      highlight: "Free developer API for Gemini, with a long context window.",
      freeModel: "Gemini (Pro / Flash)",
      freeQuota: "Free per-minute quotas (RPM/TPM) with no credit card.",
      limits: "Data sent via the free API key may be used to improve Google's models.",
      bestFor: "Processing long PDFs, books, videos and audio, and integrating LLMs into your own systems.",
      howToAccess: "Generate your free API key at aistudio.google.com.",
      link: "https://aistudio.google.com/",
      tags: ["Free API", "Gemini", "Long Context", "Multimodal"]
    },
    {
      id: "groq-cloud",
      name: "GroqCloud API",
      company: "Groq",
      category: "apis-inferencia",
      badge: "Ultra-Fast API",
      highlight: "Ultra-fast inference (hundreds of tokens/second) of open models.",
      freeModel: "Llama 3.3 70B, DeepSeek R1, …",
      freeQuota: "Up to 14,400 free requests per day on selected models.",
      limits: "30 Requests Per Minute (RPM) limit on the free plan.",
      bestFor: "Building instant chatbots, real-time response APIs and lightweight automations with no latency.",
      howToAccess: "Sign up at console.groq.com and create a free API Key.",
      link: "https://console.groq.com/",
      tags: ["Llama 3.3 70B", "DeepSeek R1", "Fast", "Free API"]
    },

    /* ── Code Assistants & IDEs ───────────────────────── */

    {
      /* Codex ceased to be a separate product on 09/Jul/2026: it became one of
         the three modes of the ChatGPT desktop app (Chat, Work, Codex). Only
         Codex and Chat open on the Free plan — Work mode is paid, which is why
         it doesn't have its own card on this page. */
      id: "openai-codex-free",
      name: "OpenAI Codex (Free Plan)",
      company: "OpenAI",
      category: "assistentes-dev",
      badge: "Code Agent",
      highlight: "OpenAI's code agent became available on the free account, in the terminal, in VS Code and on the web.",
      freeModel: "Lightweight GPT-5.6 line models",
      freeQuota: "Local tasks in 5-hour windows, with a weekly cap on top; no credit card.",
      limits: "OpenAI doesn't publish how many messages or which exact models fit in the Free plan — the counter appears inside Codex itself, and GPT-5.6 Luna stretches the quota the furthest. Cloud features (GitHub code review, Slack integration, remote task execution) are only on paid plans.",
      bestFor: "Trying out an agent that reads the project, edits files and runs commands, without signing up for anything.",
      paidStepUp: "Go $8/mo, Plus $20/mo or Pro starting at $100/mo (5× the limits).",
      theCatch: "It's an evaluation quota, not a daily work quota: long sessions exhaust the 5h window. Work mode (agent that returns spreadsheets, reports and ready-made apps) doesn't open on Free.",
      howToAccess: "Install the ChatGPT desktop app (Mac/Windows) or the Codex CLI and log in with the free account.",
      link: "https://developers.openai.com/codex/",
      sourceUrl: "https://learn.chatgpt.com/docs/pricing",
      tags: ["Codex", "CLI", "VS Code", "Agent"]
    },
    {
      /* Two things with similar names and a single card, because in practice you
         use both together: OpenCode (MIT agent, runs locally) and OpenCode
         Zen (their gateway, which is where the free models come from). */
      id: "opencode-zen",
      name: "OpenCode + Zen (free models)",
      company: "OpenCode",
      category: "assistentes-dev",
      badge: "Open Source Agent",
      highlight: "Open source code agent in the terminal, with frontier models released for free on the Zen gateway — including DeepSeek V4 Flash.",
      freeModel: "DeepSeek V4 Flash Free",
      freeQuota: "Models marked as Free on OpenCode Zen, at no per-token cost while the beta lasts.",
      limits: "These are time-limited releases with no published quota per model. What you send on the free models may be used to improve the model — do not send personal or confidential data.",
      bestFor: "Running a full code agent in the terminal without paying for an API, or using DeepSeek on programming tasks.",
      paidStepUp: "Paid Zen is pay-as-you-go (starting from $20 balance); the agent itself is free and MIT.",
      theCatch: "Free models come and go from the catalog without notice, and commercial use terms are unclear — use for study and prototyping, not production.",
      howToAccess: "Install OpenCode, create an account at opencode.ai/auth and connect the Zen key with the /connect command.",
      link: "https://opencode.ai/docs/zen/",
      sourceUrl: "https://opencode.ai/docs/zen/",
      tags: ["DeepSeek V4 Flash", "Terminal", "Open Source", "MIT"]
    },
    {
      id: "antigravity",
      name: "Google Antigravity",
      company: "Google",
      category: "assistentes-dev",
      badge: "Agents & Code",
      highlight: "Cutting-edge models with renewable quotas for code and agent development.",
      freeModel: "Gemini + Claude (in IDE)",
      freeQuota: "Renewable free daily and weekly quotas with no credit card.",
      limits: "Per-minute request limit and message window with periodic resets.",
      bestFor: "Full project development, code refactoring and automation with sub-agents.",
      howToAccess: "Available in the Antigravity ecosystem for AI-assisted development.",
      link: "https://deepmind.google/technologies/gemini/",
      tags: ["Gemini", "Agents", "Code", "IDE"]
    },
    {
      id: "github-copilot-free",
      name: "GitHub Copilot (Free Plan)",
      company: "GitHub / Microsoft",
      category: "assistentes-dev",
      badge: "IDE Extension",
      highlight: "Code autocompletion and chat in the extension, with broad IDE compatibility.",
      freeModel: "Copilot models",
      freeQuota: "~2,000 code completions per month + 50 chat interactions.",
      limits: "Quota renewed monthly on your GitHub account.",
      bestFor: "Real-time quick code suggestions right in the editor (VS Code, JetBrains…).",
      theCatch: "Monthly limit of ~2,000 completions.",
      howToAccess: "Install the GitHub Copilot extension in VS Code and log in with your GitHub account.",
      link: "https://github.com/features/copilot",
      sourceUrl: "https://theairankings.com/best-free-ai-tools/",
      tags: ["VS Code", "Autocomplete", "GitHub", "Code"]
    },
    {
      id: "cursor-free",
      name: "Cursor IDE (Hobby Plan)",
      company: "Anysphere",
      category: "assistentes-dev",
      badge: "AI IDE",
      highlight: "Monthly requests with cutting-edge models + unlimited inline edits.",
      freeModel: "Claude / GPT (in IDE)",
      freeQuota: "50 premium model calls per month and editing shortcuts (Ctrl+K) at no cost.",
      limits: "Once premium credits are exhausted, it moves to a slow queue or smaller models.",
      bestFor: "Navigating, editing and generating code in project files using keyboard shortcuts.",
      howToAccess: "Download the editor at cursor.com.",
      link: "https://www.cursor.com/",
      tags: ["IDE", "Claude", "Ctrl+K", "Projects"]
    },

    /* ── Image Generation & UI ────────────────────────────── */

    {
      id: "gemini-app-img",
      name: "Gemini app (Nano Banana 2)",
      company: "Google",
      category: "imagem-design",
      badge: "Image Generation",
      highlight: "Best free tier for images: text in image, character consistency and conversational editing.",
      freeModel: "Nano Banana 2 (Gemini 3.1 Flash Image)",
      freeQuota: "~20 images/day at up to 1K resolution.",
      limits: "Limited daily count; free resolution capped at 1K; 4K only on paid.",
      bestFor: "Image generation with text, character consistency and conversational editing.",
      paidStepUp: "Google AI Pro $19.99/mo.",
      theCatch: "Cap of ~20 images/day and 1K on free.",
      howToAccess: "Request images inside the Gemini app (gemini.google.com).",
      link: "https://gemini.google.com/",
      sourceUrl: "https://theairankings.com/best-free-ai-tools/",
      tags: ["Nano Banana 2", "Text in image", "Editing", "1K"]
    },
    {
      id: "v0-vercel",
      name: "v0 by Vercel",
      company: "Vercel",
      category: "imagem-design",
      badge: "UI & Code Gen",
      highlight: "Generation of React components, Tailwind CSS and web pages from text descriptions.",
      freeModel: "Vercel models",
      freeQuota: "200 renewable monthly credits for creating and iterating interfaces.",
      limits: "200 credits renewed every monthly cycle.",
      bestFor: "Creating modern web layouts, dashboard prototypes, landing pages and frontend components.",
      howToAccess: "Visit v0.dev and log in with your GitHub or Vercel account.",
      link: "https://v0.dev/",
      tags: ["React", "Tailwind", "UI Design", "Frontend"]
    },
    {
      id: "huggingface-spaces-img",
      name: "Flux & Image Generation (HF Spaces)",
      company: "Black Forest Labs / HF",
      category: "imagem-design",
      badge: "Image Generation",
      highlight: "High-fidelity open-weight image generators available for free in community Spaces.",
      freeModel: "FLUX.1 [schnell], SDXL",
      freeQuota: "Image creation via community Spaces on Hugging Face.",
      limits: "Variable queue time depending on shared GPU.",
      bestFor: "Creating illustrations, photorealism, concept art and mockups without a subscription.",
      howToAccess: "Visit huggingface.co/spaces/black-forest-labs/FLUX.1-schnell.",
      link: "https://huggingface.co/spaces/black-forest-labs/FLUX.1-schnell",
      tags: ["FLUX.1", "Images", "SDXL", "Open Source"]
    },

    /* ── Video, Voice & Music ────────────────────────────────── */

    {
      id: "google-veo",
      name: "Google Veo 3.1",
      company: "Google",
      category: "midia-av",
      badge: "Video Generation",
      highlight: "The easiest free path to high-quality video.",
      freeModel: "Veo 3.1",
      freeQuota: "Free for any Google account (via Gemini app and Google Vids).",
      limits: "4K and synchronized audio only on paid plans.",
      bestFor: "Easiest free path to high-quality video.",
      paidStepUp: "Google AI Pro $19.99/mo (4K + synchronized audio).",
      theCatch: "The free tier only generates the basics; 4K/synchronized audio are paid.",
      howToAccess: "Generate video inside the Gemini app (gemini.google.com).",
      link: "https://gemini.google.com/",
      sourceUrl: "https://theairankings.com/best-free-ai-tools/",
      tags: ["Veo 3.1", "Video", "Gemini", "4K*"]
    },
    {
      id: "whisper",
      name: "OpenAI Whisper",
      company: "OpenAI",
      category: "midia-av",
      badge: "Voice Transcription",
      highlight: "Free and open-source speech-to-text transcription.",
      freeModel: "Whisper (open-source)",
      freeQuota: "Self-hostable and free via various front-ends.",
      limits: "Self-hosting requires infrastructure; quality varies depending on the front-end.",
      bestFor: "Free speech-to-text transcription.",
      theCatch: "Self-hosting requires infrastructure.",
      howToAccess: "Use the open-source repo or one of the free front-ends.",
      link: "https://github.com/openai/whisper",
      sourceUrl: "https://theairankings.com/best-free-ai-tools/",
      tags: ["Whisper", "STT", "Open Source", "Audio"]
    }
  ]
};
