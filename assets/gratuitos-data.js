/* ═══════════════════════════════════════════════════════════════
   Panorama Global da IA Generativa — Catálogo de IAs Gratuitas
   Dados estruturados das ferramentas, modelos e plataformas com
   planos gratuitos (Free Tier), suas cotas e limites.

   FONTE DE DADOS (desde a revisão de 24/Jul/2026):
   As cotas/limites/planos pagos são adaptados de The AI Rankings
   (https://theairankings.com/best-free-ai-tools/), atualizado por
   eles ~mensalmente. Veja o bloco `source` abaixo e
   automation/GRATUITOS.md para o plano de coleta automatizada.

   PARA ATUALIZAR ESTA PÁGINA (hoje, manual):
   1. Confira a página da fonte (source.url) por mudanças nas cotas;
   2. Altere `source.lastChecked`, `updatedAt` e `updatedText`;
   3. Edite os itens no array `items` abaixo (ou rode, no futuro,
      `node automation/update-gratuitos.mjs`).

   SCHEMA v2 (scrape-friendly): cada item pode ter, além dos campos
   originais, `freeModel`, `paidStepUp`, `theCatch`, `rank` e
   `sourceUrl` — mapeamento 1:1 dos campos da fonte, pensado para
   que um scraper regenere este arquivo sem retrabalho de modelagem.
   O renderer (gratuitos.js) só mostra os campos opcionais quando
   existem, então entradas da v1 seguem funcionando.
   ═══════════════════════════════════════════════════════════════ */

const GRATUITOS_DATA = {
  // Proveniência — um scraper preenche estes mesmos campos.
  source: {
    name: "The AI Rankings — Best Free AI Tools",
    url: "https://theairankings.com/best-free-ai-tools/",
    attribution: "Cotas e limites adaptados de The AI Rankings (theairankings.com)",
    lastChecked: "2026-07-24",
    schemaVersion: 2,
  },
  updatedAt: "2026-07-24",
  updatedText: "24 de Julho de 2026",
  categories: [
    { id: "todos", label: "Todas as IAs" },
    { id: "assistentes-dev", label: "Assistentes de Código & IDEs" },
    { id: "modelos-llm", label: "LLMs & Chat Web" },
    { id: "apis-inferencia", label: "APIs & Provedores" },
    { id: "pesquisa-busca", label: "Pesquisa & Raciocínio" },
    { id: "imagem-design", label: "Geração de Imagens & UI" },
    { id: "midia-av", label: "Vídeo, Voz & Música" }
  ],
  items: [
    /* ── Modelos & Chat Web ─────────────────────────────────── */

    {
      id: "gemini-free",
      rank: 1,
      name: "Gemini Free",
      company: "Google",
      category: "modelos-llm",
      badge: "Web Chat Multimodal",
      highlight: "O free tier mais generoso em multimodalidade — voz, pesquisa, imagem e vídeo num só chat.",
      freeModel: "Gemini 3.5 Flash",
      freeQuota: "Cota por compute, renovável a cada ~5h até um teto semanal.",
      limits: "A atividade gratuita pode ser usada para treinar os modelos do Google (dá pra desativar nas configurações).",
      bestFor: "O all-rounder mais generoso: voz, pesquisa, imagem e vídeo.",
      paidStepUp: "Google AI Pro $19,99/mês (ou AI Plus $7,99).",
      theCatch: "O Flash fica atrás do Gemini 3.5 Pro (pago) no raciocínio mais difícil.",
      howToAccess: "Acesse gemini.google.com com uma conta Google gratuita.",
      link: "https://gemini.google.com/",
      sourceUrl: "https://theairankings.com/best-free-ai-tools/",
      tags: ["Gemini 3.5 Flash", "Voz", "Imagem", "Vídeo"]
    },
    {
      id: "codex-chatgpt",
      rank: 2,
      name: "ChatGPT Free",
      company: "OpenAI",
      category: "modelos-llm",
      badge: "Web Chat",
      highlight: "Chat geral com geração de imagens e edição no Canvas, acessível a qualquer conta.",
      freeModel: "GPT-5.5 → mini",
      freeQuota: "~10 mensagens do GPT-5.5 a cada 5h; depois cai para o modelo mini.",
      limits: "Sessões pesadas recaem no mini; versão gratuita exibe anúncios em alguns mercados; conversas podem treinar o modelo se você não desativar.",
      bestFor: "Chat geral, geração de imagens e edição no Canvas.",
      paidStepUp: "Go $8/mês ou Plus $20/mês.",
      theCatch: "A cota do GPT-5.5 é pequena e sessões pesadas caem para o mini.",
      howToAccess: "Crie uma conta gratuita em chatgpt.com.",
      link: "https://chatgpt.com/",
      sourceUrl: "https://theairankings.com/best-free-ai-tools/",
      tags: ["GPT-5.5", "mini", "Imagens", "Canvas"]
    },
    {
      id: "claude-web",
      rank: 3,
      name: "Claude Free",
      company: "Anthropic",
      category: "modelos-llm",
      badge: "Web Chat & Artefatos",
      highlight: "Acesso gratuito ao Claude Sonnet 4.6 com suporte a Artefatos visuais.",
      freeModel: "Claude Sonnet 4.6",
      freeQuota: "~15 mensagens, com cotas diárias/semanais que flutuam com a demanda.",
      limits: "O limite flutua conforme o tráfego global; sem geração nativa de imagem ou vídeo.",
      bestFor: "Prosa natural, raciocínio cuidadoso e documentos longos.",
      paidStepUp: "Pro $20/mês ($17 anual).",
      theCatch: "Retém o Opus 4.8 (o modelo mais forte); cotas mais apertadas que as do Gemini.",
      howToAccess: "Acesse e crie uma conta gratuita em claude.ai.",
      link: "https://claude.ai/",
      sourceUrl: "https://theairankings.com/best-free-ai-tools/",
      tags: ["Sonnet 4.6", "Artifacts", "Escrita", "Raciocínio"]
    },
    {
      id: "deepseek-web",
      rank: 4,
      name: "DeepSeek Free",
      company: "DeepSeek",
      category: "modelos-llm",
      badge: "Raciocínio de Fronteira",
      highlight: "Raciocínio de nível fronteira de graça, sem mensalidade.",
      freeModel: "DeepSeek (frontier-class)",
      freeQuota: "Sem cota diária rígida; limita a velocidade em horários de pico.",
      limits: "Prompts são armazenados em servidores na China; vários governos restringem o DeepSeek em dispositivos oficiais.",
      bestFor: "Raciocínio de fronteira gratuito (hospedado na China).",
      paidStepUp: "",
      theCatch: "Servidores na China e lentidão no pico asiático.",
      howToAccess: "Acesse chat.deepseek.com.",
      link: "https://chat.deepseek.com/",
      sourceUrl: "https://theairankings.com/best-free-ai-tools/",
      tags: ["DeepSeek", "Raciocínio", "Matemática", "Grátis total"]
    },
    {
      id: "meta-ai",
      rank: 5,
      name: "Meta AI",
      company: "Meta",
      category: "modelos-llm",
      badge: "Chat em Redes Sociais",
      highlight: "IA multimodal totalmente gratuita embutida no WhatsApp, Instagram e Messenger.",
      freeModel: "Muse Spark",
      freeQuota: "Totalmente gratuita, sem plano pago.",
      limits: "Vinculada às suas contas sociais da Meta.",
      bestFor: "Uso multimodal casual dentro do WhatsApp, Instagram e Messenger.",
      paidStepUp: "",
      theCatch: "Atada às suas contas sociais da Meta.",
      howToAccess: "Disponível dentro do WhatsApp, Instagram e Messenger.",
      link: "https://www.meta.ai/",
      sourceUrl: "https://theairankings.com/best-free-ai-tools/",
      tags: ["Muse Spark", "WhatsApp", "Instagram", "Grátis total"]
    },
    {
      id: "le-chat",
      rank: 6,
      name: "Le Chat",
      company: "Mistral AI",
      category: "modelos-llm",
      badge: "Chat Web (UE)",
      highlight: "Opção europeia generosa com imagem, código e conectores.",
      freeModel: "Mistral Medium / Small",
      freeQuota: "~25 mensagens por dia.",
      limits: "Cap suave diário; hospedado na UE com controles de opt-out de dados.",
      bestFor: "Opção europeia generosa: imagem, código e conectores.",
      paidStepUp: "Pro $14,99/mês.",
      theCatch: "Cap diário de ~25 mensagens.",
      howToAccess: "Acesse chat.mistral.ai e crie uma conta gratuita.",
      link: "https://chat.mistral.ai/",
      sourceUrl: "https://theairankings.com/best-free-ai-tools/",
      tags: ["Mistral", "União Europeia", "Imagem", "Código"]
    },
    {
      id: "microsoft-copilot",
      rank: 7,
      name: "Microsoft Copilot Free",
      company: "Microsoft",
      category: "modelos-llm",
      badge: "Chat & Office",
      highlight: "Rascunhos e imagens dentro do ecossistema Office e Edge.",
      freeModel: "Modelo classe GPT",
      freeQuota: "Cotas diárias; mais rico dentro do Office e do Edge.",
      limits: "Cotas diárias; o valor real está dentro dos apps do Office.",
      bestFor: "Rascunhos e imagens dentro do Word, Outlook e Edge.",
      paidStepUp: "Microsoft 365 Premium $19,99/mês.",
      theCatch: "Rende mais dentro do Word/Outlook/Edge do que no chat solto.",
      howToAccess: "Acesse copilot.microsoft.com ou use dentro do Edge/Office.",
      link: "https://copilot.microsoft.com/",
      sourceUrl: "https://theairankings.com/best-free-ai-tools/",
      tags: ["Copilot", "Office", "Edge", "Imagens"]
    },
    {
      id: "perplexity-free",
      rank: 8,
      name: "Perplexity AI",
      company: "Perplexity",
      category: "pesquisa-busca",
      badge: "Pesquisa & Busca",
      highlight: "Buscador com IA que sintetiza respostas e cita fontes da web em tempo real.",
      freeModel: "Multi-modelo",
      freeQuota: "Buscas rápidas citadas ilimitadas; algumas Pro Searches por dia.",
      limits: "Poucas Pro Searches por dia; pode treinar nos dados (opt-out disponível).",
      bestFor: "Pesquisa com citações e respostas fonteadas.",
      paidStepUp: "Pro $20/mês.",
      theCatch: "Apenas algumas Pro Searches por dia.",
      howToAccess: "Acesse perplexity.ai no navegador ou app.",
      link: "https://www.perplexity.ai/",
      sourceUrl: "https://theairankings.com/best-free-ai-tools/",
      tags: ["Busca Web", "Citações", "Fatos Atualizados", "Fontes"]
    },
    {
      id: "grok-free",
      rank: 9,
      name: "Grok Free",
      company: "xAI",
      category: "modelos-llm",
      badge: "Chat & Notícias",
      highlight: "Acesso a notícias/X em tempo real, geração de imagem e menos filtros.",
      freeModel: "Grok (xAI)",
      freeQuota: "~10 prompts a cada 2h.",
      limits: "Treina nos seus dados por padrão (opt-out disponível).",
      bestFor: "Notícias/X em tempo real, geração de imagem e menos filtros.",
      paidStepUp: "SuperGrok Lite $10 ou SuperGrok $30/mês.",
      theCatch: "Cap de ~10 prompts a cada 2h.",
      howToAccess: "Acesse grok.com com uma conta X ou gratuita.",
      link: "https://grok.com/",
      sourceUrl: "https://theairankings.com/best-free-ai-tools/",
      tags: ["Grok", "X", "Tempo real", "Imagens"]
    },
    {
      id: "huggingface-chat",
      name: "HuggingChat & Hugging Face",
      company: "Hugging Face",
      category: "modelos-llm",
      badge: "Open Source Chat",
      highlight: "Interface gratuita para testar os maiores modelos Open Source do mundo.",
      freeModel: "Modelos abertos (Llama, Qwen, DeepSeek…)",
      freeQuota: "Uso gratuito, sem assinatura, para conversar com modelos abertos de ponta.",
      limits: "Sujeito a filas temporárias nos servidores comunitários em horários de pico.",
      bestFor: "Testar e comparar a qualidade de modelos abertos recentes sem gastar créditos.",
      howToAccess: "Acesse huggingface.co/chat diretamente.",
      link: "https://huggingface.co/chat/",
      tags: ["Open Source", "Llama", "Qwen", "DeepSeek"]
    },

    /* ── Pesquisa & Raciocínio ──────────────────────────────── */

    {
      id: "notebooklm",
      name: "NotebookLM",
      company: "Google",
      category: "pesquisa-busca",
      badge: "Pesquisa com Fontes",
      highlight: "Ferramenta de pesquisa que ancora as respostas nas suas próprias fontes enviadas.",
      freeModel: "Gemini (sob o capô)",
      freeQuota: "Até 100 cadernos, 50 fontes cada, ~500.000 palavras por caderno.",
      limits: "Limites de fontes/cadernos; respostas restritas ao que você envia.",
      bestFor: "Pesquisa ancorada nas suas próprias fontes enviadas.",
      paidStepUp: "",
      theCatch: "As respostas ficam restritas às fontes que você carrega.",
      howToAccess: "Acesse notebooklm.google.com com uma conta Google.",
      link: "https://notebooklm.google.com/",
      sourceUrl: "https://theairankings.com/best-free-ai-tools/",
      tags: ["Fontes", "Citações", "Pesquisa", "PDFs"]
    },

    /* ── APIs & Provedores ──────────────────────────────────── */

    {
      id: "google-ai-studio",
      name: "Google AI Studio (API)",
      company: "Google",
      category: "apis-inferencia",
      badge: "API de Desenvolvedor",
      highlight: "API de desenvolvedor gratuita para Gemini, com janela de contexto longa.",
      freeModel: "Gemini (Pro / Flash)",
      freeQuota: "Cotas gratuitas por minuto (RPM/TPM) sem cartão de crédito.",
      limits: "Dados enviados na chave de API gratuita podem ser usados para aprimorar os modelos do Google.",
      bestFor: "Processar PDFs, livros, vídeos e áudios longos e integrar LLMs em sistemas próprios.",
      howToAccess: "Gere sua chave de API gratuita em aistudio.google.com.",
      link: "https://aistudio.google.com/",
      tags: ["API Grátis", "Gemini", "Contexto Longo", "Multimodal"]
    },
    {
      id: "groq-cloud",
      name: "GroqCloud API",
      company: "Groq",
      category: "apis-inferencia",
      badge: "API Ultra-Rápida",
      highlight: "Inferência ultra-rápida (centenas de tokens/segundo) de modelos abertos.",
      freeModel: "Llama 3.3 70B, DeepSeek R1, …",
      freeQuota: "Até 14.400 requisições gratuitas por dia em modelos selecionados.",
      limits: "Limite de 30 Requisições por Minuto (RPM) no plano gratuito.",
      bestFor: "Criar chatbots instantâneos, APIs de resposta em tempo real e automações leves sem latência.",
      howToAccess: "Cadastre-se no console.groq.com e crie uma API Key gratuita.",
      link: "https://console.groq.com/",
      tags: ["Llama 3.3 70B", "DeepSeek R1", "Rápido", "API Grátis"]
    },

    /* ── Assistentes de Código & IDEs ───────────────────────── */

    {
      id: "antigravity",
      name: "Google Antigravity",
      company: "Google",
      category: "assistentes-dev",
      badge: "Agentes & Código",
      highlight: "Modelos de ponta com cotas renováveis para desenvolvimento de código e agentes.",
      freeModel: "Gemini + Claude (no IDE)",
      freeQuota: "Cotas diárias e semanais gratuitas renováveis sem cartão de crédito.",
      limits: "Limite de requisições por minuto e janela de mensagens com resets periódicos.",
      bestFor: "Desenvolvimento completo de projetos, refatoração de código e automação com subagentes.",
      howToAccess: "Disponível no ecossistema Antigravity para desenvolvimento assistido por IA.",
      link: "https://deepmind.google/technologies/gemini/",
      tags: ["Gemini", "Agentes", "Código", "IDE"]
    },
    {
      id: "github-copilot-free",
      name: "GitHub Copilot (Plano Free)",
      company: "GitHub / Microsoft",
      category: "assistentes-dev",
      badge: "Extensão de IDE",
      highlight: "Autocompletar de código e chat na extensão, com ampla compatibilidade de IDEs.",
      freeModel: "Modelos Copilot",
      freeQuota: "~2.000 conclusões de código por mês + 50 interações de chat.",
      limits: "Cota renovada mensalmente na sua conta do GitHub.",
      bestFor: "Sugestões rápidas de código em tempo real direto no editor (VS Code, JetBrains…).",
      theCatch: "Limite mensal de ~2.000 conclusões.",
      howToAccess: "Instale a extensão GitHub Copilot no VS Code e faça login com sua conta GitHub.",
      link: "https://github.com/features/copilot",
      sourceUrl: "https://theairankings.com/best-free-ai-tools/",
      tags: ["VS Code", "Autocompletar", "GitHub", "Código"]
    },
    {
      id: "cursor-free",
      name: "Cursor IDE (Plano Hobby)",
      company: "Anysphere",
      category: "assistentes-dev",
      badge: "IDE com IA",
      highlight: "Requisições mensais com modelos de ponta + edições em linha ilimitadas.",
      freeModel: "Claude / GPT (no IDE)",
      freeQuota: "50 chamadas de modelos premium por mês e atalhos de edição (Ctrl+K) sem custo.",
      limits: "Ao esgotar os créditos premium, passa para fila lenta ou modelos menores.",
      bestFor: "Navegar, editar e gerar código nos arquivos do projeto usando atalhos de teclado.",
      howToAccess: "Baixe o editor em cursor.com.",
      link: "https://www.cursor.com/",
      tags: ["IDE", "Claude", "Ctrl+K", "Projetos"]
    },

    /* ── Geração de Imagens & UI ────────────────────────────── */

    {
      id: "gemini-app-img",
      name: "Gemini app (Nano Banana 2)",
      company: "Google",
      category: "imagem-design",
      badge: "Geração de Imagens",
      highlight: "Melhor free tier de imagem: texto na imagem, consistência de personagem e edição conversacional.",
      freeModel: "Nano Banana 2 (Gemini 3.1 Flash Image)",
      freeQuota: "~20 imagens/dia em até 1K de resolução.",
      limits: "Contagem diária limitada; resolução livre capada em 1K; 4K só no pago.",
      bestFor: "Geração de imagem com texto, consistência de personagem e edição conversacional.",
      paidStepUp: "Google AI Pro $19,99/mês.",
      theCatch: "Teto de ~20 imagens/dia e 1K no free.",
      howToAccess: "Peça imagens dentro do app Gemini (gemini.google.com).",
      link: "https://gemini.google.com/",
      sourceUrl: "https://theairankings.com/best-free-ai-tools/",
      tags: ["Nano Banana 2", "Texto em imagem", "Edição", "1K"]
    },
    {
      id: "v0-vercel",
      name: "v0 por Vercel",
      company: "Vercel",
      category: "imagem-design",
      badge: "UI & Code Gen",
      highlight: "Geração de componentes React, Tailwind CSS e páginas web a partir de descrições em texto.",
      freeModel: "Modelos Vercel",
      freeQuota: "200 créditos mensais renováveis para criar e iterar interfaces.",
      limits: "200 créditos renovados a cada ciclo mensal.",
      bestFor: "Criar layouts web modernos, protótipos de dashboards, landing pages e componentes de frontend.",
      howToAccess: "Acesse v0.dev e faça login com sua conta GitHub ou Vercel.",
      link: "https://v0.dev/",
      tags: ["React", "Tailwind", "Design UI", "Frontend"]
    },
    {
      id: "huggingface-spaces-img",
      name: "Flux & Geração de Imagem (HF Spaces)",
      company: "Black Forest Labs / HF",
      category: "imagem-design",
      badge: "Geração de Imagens",
      highlight: "Geradores de imagem open-weight de alta fidelidade disponíveis de graça em Spaces da comunidade.",
      freeModel: "FLUX.1 [schnell], SDXL",
      freeQuota: "Criação de imagens via Spaces da comunidade no Hugging Face.",
      limits: "Tempo de fila variável conforme a GPU compartilhada.",
      bestFor: "Criar ilustrações, fotorealismo, artes conceituais e mockups sem assinatura.",
      howToAccess: "Acesse huggingface.co/spaces/black-forest-labs/FLUX.1-schnell.",
      link: "https://huggingface.co/spaces/black-forest-labs/FLUX.1-schnell",
      tags: ["FLUX.1", "Imagens", "SDXL", "Open Source"]
    },

    /* ── Vídeo, Voz & Música ────────────────────────────────── */

    {
      id: "google-veo",
      name: "Google Veo 3.1",
      company: "Google",
      category: "midia-av",
      badge: "Geração de Vídeo",
      highlight: "O caminho grátis mais fácil para vídeo de alta qualidade.",
      freeModel: "Veo 3.1",
      freeQuota: "Grátis para qualquer conta Google (via app Gemini e Google Vids).",
      limits: "4K e áudio sincronizado só nos planos pagos.",
      bestFor: "Caminho grátis mais fácil para vídeo de alta qualidade.",
      paidStepUp: "Google AI Pro $19,99/mês (4K + áudio sincronizado).",
      theCatch: "O free tier só gera o básico; 4K/áudio sincronizado são pagos.",
      howToAccess: "Gere vídeo dentro do app Gemini (gemini.google.com).",
      link: "https://gemini.google.com/",
      sourceUrl: "https://theairankings.com/best-free-ai-tools/",
      tags: ["Veo 3.1", "Vídeo", "Gemini", "4K*"]
    },
    {
      id: "whisper",
      name: "OpenAI Whisper",
      company: "OpenAI",
      category: "midia-av",
      badge: "Transcrição de Voz",
      highlight: "Transcrição de voz para texto (speech-to-text) gratuita e open-source.",
      freeModel: "Whisper (open-source)",
      freeQuota: "Self-hostable e grátis via vários front-ends.",
      limits: "Self-hosting exige infraestrutura; qualidade varia conforme o front-end.",
      bestFor: "Transcrição de voz para texto (speech-to-text) gratuita.",
      theCatch: "Hospedar você mesmo exige infraestrutura.",
      howToAccess: "Use o repo open-source ou um dos front-ends gratuitos.",
      link: "https://github.com/openai/whisper",
      sourceUrl: "https://theairankings.com/best-free-ai-tools/",
      tags: ["Whisper", "STT", "Open Source", "Áudio"]
    }
  ]
};