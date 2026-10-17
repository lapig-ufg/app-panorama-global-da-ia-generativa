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
    lastChecked: "2026-10-17",
    schemaVersion: 2,
  },
  updatedAt: "2026-10-17",
  updatedText: "October 17, 2026",
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
      /* Revisão de 17/out/2026: a tabela de outubro ainda serve o 3.6 Flash
         no gratuito; 3.7/3.8 são pagos. Vídeo grátis agora é via Flow. */
      id: "gemini-free",
      rank: 1,
      name: "Gemini Free",
      company: "Google",
      category: "modelos-llm",
      badge: "Multimodal Web Chat",
      highlight: "Voice, research and images in free chat, with free video available separately in Google Flow.",
      freeModel: "Gemini 3.6 Flash",
      freeQuota: "Compute-based quota, renewable every ~5h up to a weekly cap.",
      limits: "Free activity may train Google's models (opt-out in settings). Deep Research: ~10 reports/month. In-app video and Gemini 3.7/3.8 Flash require a subscription.",
      bestFor: "Multimodal everyday use: voice, research and images, with free video via Flow.",
      paidStepUp: "Google AI Plus ~$4.99/mo or AI Pro $19.99/mo.",
      theCatch: "Flash lags behind Gemini 3.1 Pro (paid) on harder reasoning.",
      howToAccess: "Visit gemini.google.com with a free Google account.",
      link: "https://gemini.google.com/",
      sourceUrl: "https://theairankings.com/best-free-ai-tools/",
      tags: ["Gemini 3.6 Flash", "Voice", "Image", "Deep Research", "Flow"]
    },
    {
      /* Rewritten on 10/Aug/2026. Until 06/Aug the free plan gave ~10 GPT-5.5
         messages every 5h and then downgraded to Instant/mini; now the
         default is GPT-5.6 Luna and text is unlimited. The old `id` was
         "codex-chatgpt", a name inherited from when Codex and ChatGPT were the same
         entry — since Codex became its own card right below, keeping the two
         with swapped names would only confuse anyone editing.
         Em 17/out, mantemos Luna ilimitado conforme a tabela atual da fonte;
         trechos antigos da página ainda descrevem GPT-5.5 seguido de mini. */
      id: "chatgpt-free",
      rank: 2,
      name: "ChatGPT Free",
      company: "OpenAI",
      category: "modelos-llm",
      badge: "Web Chat",
      highlight: "Unlimited text conversations on GPT-5.6 Luna, with limited uploads, images and tools.",
      freeModel: "GPT-5.6 Luna",
      freeQuota: "Unlimited text chats, subject to abuse guardrails; limited uploads, images and tools.",
      limits: "Unlimited applies only to text. Ads in several markets, including India since August 27, 2026; conversations may train models by default (opt-out available).",
      bestFor: "High-volume text chat without counting messages — plus the Think button when the question is hard.",
      paidStepUp: "Go $8/mo or Plus $20/mo.",
      theCatch: "Uploads, images and tools have tight quotas; ads and conversation training are enabled by default, with a training opt-out.",
      howToAccess: "Create a free account at chatgpt.com.",
      link: "https://chatgpt.com/",
      sourceUrl: "https://theairankings.com/best-free-ai-tools/",
      tags: ["GPT-5.6 Luna", "Unlimited Text", "Think", "Images"]
    },
    {
      /* A fonte agregada de outubro ainda dizia Sonnet 5. O Sonnet 5.5 foi
         lançado em 28/set (https://www.anthropic.com/news/claude-sonnet-5-5),
         mas o anúncio oficial não detalha o plano gratuito. Tom's Guide
         informa que substituiu o Sonnet 5 como padrão de Free e Pro.
         A cota abaixo vem de The AI Rankings, medida com o Sonnet 5:
         https://theairankings.com/best-free-ai-tools/ */
      id: "claude-web",
      rank: 3,
      name: "Claude Free",
      company: "Anthropic",
      category: "modelos-llm",
      badge: "Web Chat & Artifacts",
      highlight: "Free access to Claude Sonnet 5.5 for writing, careful reasoning and long documents.",
      freeModel: "Claude Sonnet 5.5",
      freeQuota: "~30–40 messages per 5h window (source estimate for Sonnet 5).",
      limits: "The limit varies with demand; the message estimate was measured with Sonnet 5. No Opus or native image or video generation.",
      bestFor: "Natural prose, careful reasoning and long documents.",
      paidStepUp: "Pro $20/mo ($17 annual).",
      theCatch: "No Opus access; tighter quotas than Gemini and no image or video generation.",
      howToAccess: "Visit and create a free account at claude.ai.",
      link: "https://claude.ai/",
      sourceUrl: "https://www.tomsguide.com/ai/claude/claude-sonnet-5-5-just-launched-heres-why-its-about-to-become-your-daily-driver",
      tags: ["Sonnet 5.5", "Artifacts", "Writing", "Reasoning"]
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
      /* Muse Image substituiu o gerador anterior em 07/jul/2026; uso intenso
         de imagem agora exige plano pago, sem preço informado pela fonte. */
      id: "meta-ai",
      rank: 5,
      name: "Meta AI",
      company: "Meta",
      category: "modelos-llm",
      badge: "Chat on Social Networks",
      highlight: "Free everyday chat and images within WhatsApp, Instagram and Messenger.",
      freeModel: "Muse Spark + Muse Image",
      freeQuota: "Free for everyday use; heavy image use requires a paid plan.",
      limits: "Tied to your Meta social accounts; heavy image use depends on a paid plan.",
      bestFor: "Casual multimodal use within WhatsApp, Instagram and Messenger.",
      paidStepUp: "Meta paid plans for heavy image use (price not published).",
      theCatch: "Tied to your Meta social accounts; high-volume image use requires payment.",
      howToAccess: "Available inside WhatsApp, Instagram and Messenger.",
      link: "https://www.meta.ai/",
      sourceUrl: "https://theairankings.com/best-free-ai-tools/",
      tags: ["Muse Spark", "Muse Image", "WhatsApp", "Instagram"]
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
      /* Em 18/ago/2026 foram aposentados Deep Research, Group Chats,
         podcasts de IA e Labs; o chat mantém seletor GPT-5.2 / MAI. */
      id: "microsoft-copilot",
      rank: 7,
      name: "Microsoft Copilot Free",
      company: "Microsoft",
      category: "modelos-llm",
      badge: "Chat & Office",
      highlight: "Drafts and images inside the Office and Edge ecosystem.",
      freeModel: "GPT-5.2 / MAI (model selector)",
      freeQuota: "Daily quotas; richest inside Office and Edge.",
      limits: "Daily quotas. Deep Research, Group Chats, AI podcasts and Labs were retired on August 18, 2026.",
      bestFor: "Drafts and images inside Word, Outlook and Edge.",
      paidStepUp: "Microsoft 365 Premium $19.99/mo.",
      theCatch: "Performs better inside Word/Outlook/Edge than in the standalone chat.",
      howToAccess: "Visit copilot.microsoft.com or use inside Edge/Office.",
      link: "https://copilot.microsoft.com/",
      sourceUrl: "https://theairankings.com/best-free-ai-tools/",
      tags: ["GPT-5.2", "MAI", "Office", "Edge", "Images"]
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
      /* A tabela atual corrige seções antigas da própria fonte: geração
         de imagem deixou de estar disponível no gratuito em março/2026. */
      id: "grok-free",
      rank: 9,
      name: "Grok Free",
      company: "xAI",
      category: "modelos-llm",
      badge: "Chat & News",
      highlight: "Access to real-time X/news and chat with fewer filters.",
      freeModel: "Grok (Grok 4-class)",
      freeQuota: "~10 prompts every 2h.",
      limits: "No free image generation since March 2026. Trains on your data by default (opt-out available).",
      bestFor: "Real-time X/news and conversations with fewer filters.",
      paidStepUp: "SuperGrok Lite $10 or SuperGrok $30/mo.",
      theCatch: "Cap of ~10 prompts every 2h.",
      howToAccess: "Visit grok.com with an X account or a free account.",
      link: "https://grok.com/",
      sourceUrl: "https://theairankings.com/best-free-ai-tools/",
      tags: ["Grok 4", "X", "Real Time", "Chat"]
    },
    {
      /* Novos no ranking de outubro: Qwen (10) e Kimi (11). A fonte não
         publica cotas numéricas nem preços de entrada para estes chats. */
      id: "qwen-chat",
      rank: 10,
      name: "Qwen Chat",
      company: "Alibaba",
      category: "modelos-llm",
      badge: "Multimodal Chat",
      highlight: "Free multimodal and multilingual chat with generous usage.",
      freeModel: "Qwen",
      freeQuota: "Free and generous multimodal chat; no numerical quota reported by the source.",
      limits: "Prompts stored on servers in China.",
      bestFor: "Free multimodal and multilingual chat.",
      paidStepUp: "—",
      theCatch: "Hosted in China; the source provides no numerical usage limit.",
      howToAccess: "Visit chat.qwen.ai.",
      link: "https://chat.qwen.ai/",
      sourceUrl: "https://theairankings.com/best-free-ai-tools/",
      tags: ["Qwen", "Multimodal", "Multilingual", "China"]
    },
    {
      id: "kimi-chat",
      rank: 11,
      name: "Kimi",
      company: "Moonshot AI",
      category: "modelos-llm",
      badge: "Long-Context Chat",
      highlight: "Free long-context chat for documents and agentic research.",
      freeModel: "Kimi (standard; K3 is paid)",
      freeQuota: "Free, with long context; no numerical quota reported by the source.",
      limits: "Prompts stored on servers in China; K3 requires a paid plan.",
      bestFor: "Long-document analysis and agentic research.",
      paidStepUp: "—",
      theCatch: "Hosted in China; the K3 model is paid.",
      howToAccess: "Visit kimi.com.",
      link: "https://www.kimi.com/",
      sourceUrl: "https://theairankings.com/best-free-ai-tools/",
      tags: ["Kimi", "Long Context", "Documents", "Agentic Research", "China"]
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
      /* Em 17/out/2026 o catálogo inclui vários modelos Free. Contextos
         fornecidos no roteiro desta revisão, com procedência declarada em
         https://models.dev/api.json (provedor opencode): DeepSeek V4.1 Flash,
         GLM-5.3-Flash, MiMo-V2.6-Flash e Big Pickle: 200K; Nemotron 3.5
         Lightning: 262K; Nemotron 3 Ultra, Nemotron 3.5 Super VL, LongCat 2.5
         Preview, Beam e Space Bunny: 1M. A documentação do Zen confirma
         os modelos gratuitos temporários e distingue políticas de treino. */
      id: "opencode-zen",
      name: "OpenCode + Zen (free models)",
      company: "OpenCode",
      category: "assistentes-dev",
      badge: "Open Source Agent",
      highlight: "Open source code agent with several free Zen models: DeepSeek V4.1 Flash, GLM-5.3-Flash and MiMo-V2.6-Flash have 200K context; others reach 1M.",
      freeModel: "DeepSeek V4.1 Flash, GLM-5.3-Flash, MiMo-V2.6-Flash and others",
      freeQuota: "Models marked as Free at no per-token cost for a limited time; 200K context in several models and up to 1M in some.",
      limits: "Temporary releases with no published usage quota per model. Some free models may use data for model improvement; the documentation states zero retention and no training for DeepSeek V4.1 Flash and GLM-5.3-Flash. Check each model's policy before sending personal or confidential data.",
      bestFor: "Running a terminal code agent with several free models and long context.",
      paidStepUp: "Paid Zen is prepaid pay-as-you-go; the agent itself is free and MIT.",
      theCatch: "Free access is temporary, the catalog changes and data-use policies vary by model.",
      howToAccess: "Install OpenCode, create an account at opencode.ai/auth and connect the Zen key with the /connect command.",
      link: "https://opencode.ai/docs/zen/",
      sourceUrl: "https://opencode.ai/docs/zen/",
      tags: ["DeepSeek V4.1 Flash", "GLM-5.3-Flash", "MiMo-V2.6-Flash", "200K Context", "Up to 1M", "Open Source"]
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
      /* Mantidas ~2.000 conclusões/mês; a edição de outubro não sustenta
         o antigo número de 50 chats. Copilot Student reabriu em 17/jun. */
      id: "github-copilot-free",
      name: "GitHub Copilot (Free Plan)",
      company: "GitHub / Microsoft",
      category: "assistentes-dev",
      badge: "IDE Extension",
      highlight: "Code autocompletion and chat in the extension, with broad IDE compatibility.",
      freeModel: "Copilot models",
      freeQuota: "~2,000 code completions per month.",
      limits: "Quota renewed monthly on your GitHub account; Copilot Student reopened on June 17, 2026 for eligible students.",
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
      limits: "Limited daily count; free resolution capped at 1K.",
      bestFor: "Image generation with text, character consistency and conversational editing.",
      paidStepUp: "Google AI Plus ~$4.99/mo or AI Pro $19.99/mo.",
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
      /* O vídeo gratuito saiu do app Gemini: Veo 3.1 agora é via Flow,
         com 50 créditos/dia e áudio sincronizado também no gratuito. */
      id: "google-veo",
      name: "Google Veo 3.1",
      company: "Google",
      category: "midia-av",
      badge: "Video Generation",
      highlight: "Videos with synchronized audio via Google Flow, with 50 free credits per day.",
      freeModel: "Veo 3.1",
      freeQuota: "50 credits/day in Google Flow for non-subscribers.",
      limits: "Generations consume Flow credits; video in the Gemini app now requires a paid plan.",
      bestFor: "Generating free video with synchronized audio via Flow; Gemini Omni Flash is also free inside YouTube Shorts.",
      paidStepUp: "Google AI Pro $19.99/mo.",
      theCatch: "Free access is via Flow, with daily credits; video within the Gemini app is paid.",
      howToAccess: "Visit Google Flow (labs.google/fx/tools/flow) with your Google account.",
      link: "https://labs.google/fx/tools/flow",
      sourceUrl: "https://theairankings.com/best-free-ai-tools/",
      tags: ["Veo 3.1", "Google Flow", "Video", "Synchronized Audio", "50 credits/day"]
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
