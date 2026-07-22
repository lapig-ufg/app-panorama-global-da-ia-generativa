/* ═══════════════════════════════════════════════════════════════
   Panorama Global da IA Generativa — Catálogo de IAs Gratuitas
   Dados estruturados das ferramentas, modelos e plataformas com
   planos gratuitos (Free Tier), suas cotas e limites.

   PARA ATUALIZAR ESTA PÁGINA:
   Altere a data em 'updatedAt'/'updatedText' e adicione ou edite
   os itens no array 'items' abaixo.
   ═══════════════════════════════════════════════════════════════ */

const GRATUITOS_DATA = {
  updatedAt: "2026-07-22",
  updatedText: "22 de Julho de 2026",
  categories: [
    { id: "todos", label: "Todas as IAs" },
    { id: "assistentes-dev", label: "Assistentes de Código & IDEs" },
    { id: "modelos-llm", label: "LLMs & Chat Web" },
    { id: "apis-inferencia", label: "APIs & Provedores" },
    { id: "pesquisa-busca", label: "Pesquisa & Raciocínio" },
    { id: "imagem-design", label: "Geração de Imagens & UI" }
  ],
  items: [
    {
      id: "antigravity",
      name: "Google Antigravity",
      company: "Google",
      category: "assistentes-dev",
      highlight: "Modelos de ponta (Gemini 1.5 Pro, Flash, Claude 3.5 Sonnet) com cotas renováveis para desenvolvimento de código.",
      badge: "Agentes & Código",
      freeQuota: "Cotas diárias e semanais gratuitas renováveis sem necessidade de cartão de crédito.",
      limits: "Limite de requisições por minuto (RPM) e janela de mensagens com resets periódicos.",
      bestFor: "Desenvolvimento completo de projetos, refatoração de código, análise de repositórios e automação com subagentes.",
      howToAccess: "Disponível nativamente no ecossistema Antigravity para suporte a desenvolvimento assistido por IA.",
      link: "https://deepmind.google/technologies/gemini/",
      tags: ["Gemini 1.5 Pro", "Claude 3.5 Sonnet", "Agentes", "Código"]
    },
    {
      id: "codex-chatgpt",
      name: "OpenAI ChatGPT & GPT-4o",
      company: "OpenAI",
      category: "modelos-llm",
      highlight: "GPT-4o mini ilimitado + cotas diárias gratuitas do GPT-4o com visão e análise de arquivos.",
      badge: "Web Chat",
      freeQuota: "Acesso ilimitado ao GPT-4o mini e cotas renováveis a cada poucas horas para o GPT-4o.",
      limits: "Ao esgotar a cota temporária do GPT-4o, a conversa migra automaticamente para o GPT-4o mini.",
      bestFor: "Redação de textos, tira-dúvidas gerais, análise de arquivos/imagens e código rápido.",
      howToAccess: "Crie uma conta gratuita em chatgpt.com.",
      link: "https://chatgpt.com/",
      tags: ["GPT-4o", "GPT-4o mini", "Visão", "Análise de Dados"]
    },
    {
      id: "claude-web",
      name: "Claude.ai",
      company: "Anthropic",
      category: "modelos-llm",
      highlight: "Acesso gratuito aos modelos Claude 3.5 Sonnet e Haiku com suporte a Artefatos visuais.",
      badge: "Web Chat & Artefatos",
      freeQuota: "Cota de mensagens gratuita renovada dinamicamente a cada 5 horas.",
      limits: "O limite de mensagens flutua conforme o volume de tráfego global da plataforma.",
      bestFor: "Escrita acadêmica/profissional impecável, análise lógica profunda de código e prototipagem de UI com Artefatos.",
      howToAccess: "Acesse e crie uma conta gratuita em claude.ai.",
      link: "https://claude.ai/",
      tags: ["Claude 3.5 Sonnet", "Artifacts", "Escrita", "Raciocínio"]
    },
    {
      id: "google-ai-studio",
      name: "Google AI Studio (API)",
      company: "Google",
      category: "apis-inferencia",
      highlight: "API de desenvolvedor 100% gratuita para Gemini 1.5 Pro e Flash com janela de 1 Milhão de tokens.",
      badge: "API de Desenvolvedor",
      freeQuota: "15 Requisições por Minuto (RPM) e 1.000.000 de Tokens por Minuto (TPM) no Gemini 1.5 Flash sem pagar nada.",
      limits: "Dados enviados na chave de API gratuita podem ser usados para aprimoramento dos modelos do Google.",
      bestFor: "Processar PDFs inteiros, livros, vídeos longos, áudios e integrar LLMs em sistemas próprios.",
      howToAccess: "Gere sua chave de API gratuita em aistudio.google.com.",
      link: "https://aistudio.google.com/",
      tags: ["API Grátis", "Gemini 1.5 Pro", "1M Contexto", "Multimodal"]
    },
    {
      id: "groq-cloud",
      name: "GroqCloud API",
      company: "Groq",
      category: "apis-inferencia",
      highlight: "Inferência ultra-rápida (acima de 500 tokens/segundo) de modelos abertos como Llama 3.3 70B e DeepSeek R1.",
      badge: "API Ultra-Rápida",
      freeQuota: "Até 14.400 requisições gratuitas por dia em modelos selecionados.",
      limits: "Limite de 30 Requisições por Minuto (RPM) no plano gratuito.",
      bestFor: "Criar chatbots instantâneos, APIs de resposta em tempo real e automações leves sem latência.",
      howToAccess: "Cadastre-se no console.groq.com e crie uma API Key gratuita.",
      link: "https://console.groq.com/",
      tags: ["Llama 3.3 70B", "DeepSeek R1", "500+ tok/s", "API Grátis"]
    },
    {
      id: "github-copilot-free",
      name: "GitHub Copilot (Plano Free)",
      company: "GitHub / Microsoft",
      category: "assistentes-dev",
      highlight: "Autocompletar de código ilimitado e 50 mensagens mensais no chat da extensão para VS Code.",
      badge: "Extensão VS Code",
      freeQuota: "2.000 conclusões de código automáticas por mês + 50 interações de chat de IA.",
      limits: "Cota renovada mensalmente diretamente na sua conta do GitHub.",
      bestFor: "Sugestões rápidas de código em tempo real diretamente no seu editor (VS Code ou JetBrains).",
      howToAccess: "Instale a extensão GitHub Copilot no VS Code e faça login com sua conta GitHub.",
      link: "https://github.com/features/copilot",
      tags: ["VS Code", "Autocompletar", "GitHub", "Código"]
    },
    {
      id: "cursor-free",
      name: "Cursor IDE (Plano Hobby)",
      company: "Anysphere",
      category: "assistentes-dev",
      highlight: "50 requisições mensais com modelos de ponta (Claude 3.5 Sonnet / GPT-4o) + edições em linha ilimitadas.",
      badge: "IDE com IA",
      freeQuota: "50 chamadas de modelos premium por mês e atalhos de edição de código (Ctrl+K / Cmd+K) sem custo.",
      limits: "Ao esgotar os 50 créditos premium, passa para fila lenta ou modelos menores.",
      bestFor: "Navegar, editar e gerar código diretamente nos arquivos do projeto usando atalhos de teclado.",
      howToAccess: "Baixe o editor em cursor.com.",
      link: "https://www.cursor.com/",
      tags: ["IDE", "Claude 3.5", "Ctrl+K", "Projetos"]
    },
    {
      id: "perplexity-free",
      name: "Perplexity AI",
      company: "Perplexity",
      category: "pesquisa-busca",
      highlight: "Buscador alimentado por IA com respostas sintetizadas e links/fontes da web em tempo real.",
      badge: "Pesquisa & Busca",
      freeQuota: "Pesquisas padrão ilimitadas + 5 buscas profundas (Pro Search com raciocínio) a cada 4 horas.",
      limits: "5 Pro Searches a cada intervalo de 4 horas.",
      bestFor: "Pesquisar fatos atualizados, sintetizar notícias, encontrar artigos com fontes confiáveis citadas.",
      howToAccess: "Acesse perplexity.ai no navegador ou aplicativo celular.",
      link: "https://www.perplexity.ai/",
      tags: ["Busca Web", "Citações", "Fatos Atualizados", "Fontes"]
    },
    {
      id: "huggingface-chat",
      name: "HuggingChat & Hugging Face",
      company: "Hugging Face",
      category: "modelos-llm",
      highlight: "Interface gratuita para testar os maiores modelos Open Source do mundo (DeepSeek R1, Llama 3.3, Qwen 2.5).",
      badge: "Open Source Chat",
      freeQuota: "Uso gratuito e sem necessidade de assinatura paga para conversar com modelos abertos de ponta.",
      limits: "Sujeito a filas temporárias nos servidores comunitários em horários de pico.",
      bestFor: "Testar e comparar a qualidade de modelos abertos recentes sem gastar créditos.",
      howToAccess: "Acesse huggingface.co/chat diretamente.",
      link: "https://huggingface.co/chat/",
      tags: ["Llama 3.3", "DeepSeek R1", "Qwen 2.5", "Open Source"]
    },
    {
      id: "v0-vercel",
      name: "v0 por Vercel",
      company: "Vercel",
      category: "imagem-design",
      highlight: "Geração de componentes React, Tailwind CSS e páginas web completas a partir de descrições em texto.",
      badge: "UI & Code Gen",
      freeQuota: "200 créditos mensais renováveis para criar e iterar interfaces de usuário.",
      limits: "200 créditos renovados a cada ciclo mensal.",
      bestFor: "Criar layouts web modernos, protótipos de dashboards, landing pages e componentes de frontend.",
      howToAccess: "Acesse v0.dev e faça login com sua conta GitHub ou Vercel.",
      link: "https://v0.dev/",
      tags: ["React", "Tailwind", "Design UI", "Frontend"]
    },
    {
      id: "deepseek-web",
      name: "DeepSeek Web Chat",
      company: "DeepSeek",
      category: "modelos-llm",
      highlight: "Acesso gratuito ao DeepSeek-V3 e DeepSeek-R1 (raciocínio avançado com cadeias de pensamento expostas).",
      badge: "Raciocínio & R1",
      freeQuota: "Uso totalmente gratuito da plataforma web sem custos de mensalidade.",
      limits: "Pode apresentar lentidão momentânea em momentos de alta demanda global de servidores.",
      bestFor: "Resolver problemas complexos de matemática, lógica, algoritmos e provas com explicação passo a passo.",
      howToAccess: "Acesse chat.deepseek.com.",
      link: "https://chat.deepseek.com/",
      tags: ["DeepSeek R1", "DeepSeek V3", "Raciocínio", "Matemática"]
    },
    {
      id: "huggingface-spaces-img",
      name: "Flux.1 & Geração de Imagem (HF Spaces)",
      company: "Black Forest Labs / HF",
      category: "imagem-design",
      highlight: "Geradores de imagem de altíssima fidelidade (FLUX.1 [schnell] e SDXL) disponíveis de graça.",
      badge: "Geração de Imagens",
      freeQuota: "Criação ilimitada de imagens via Spaces da comunidade no Hugging Face.",
      limits: "Tempo de fila variável conforme o uso da placa gráfica (GPU) compartilhada.",
      bestFor: "Criar ilustrações, fotorealismo, artes conceituais e mockups visuais sem pagar por assinaturas.",
      howToAccess: "Acesse huggingface.co/spaces/black-forest-labs/FLUX.1-schnell.",
      link: "https://huggingface.co/spaces/black-forest-labs/FLUX.1-schnell",
      tags: ["FLUX.1", "Imagens", "SDXL", "Arte Digital"]
    }
  ]
};
