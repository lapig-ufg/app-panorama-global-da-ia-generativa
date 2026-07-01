# Organização das Pastas — Panorama Global da IA Generativa

> Análise da estrutura de diretórios do projeto, recomendações de limpeza e registro das ações executadas.  
> Gerado em: **01/jul/2026**. Limpeza executada em **01/jul/2026**.

---

## 1. Resumo executivo

A pasta raiz (`panorama-llms/`) é o **workspace local de desenvolvimento**. O clone `panorama-llms-github/` é usado exclusivamente para fazer `push` e publicar no GitHub Pages. As demais cópias foram removidas.

| Pasta | Propósito | Status |
|---|---|---|
| `.` (raiz) | Workspace de desenvolvimento local. Contém o site, admin, automação, docs e `.gitignore`. | **Manter** |
| `panorama-llms-github/` | Clone do repositório oficial usado para fazer `push` e publicar. | **Manter** |
| `panorama-llms/` | ~~Cópia antiga do site~~ | **Removida** |
| `panorama-llms-preview/` | ~~Clone antigo/publicado do repo oficial~~ | **Removida** |

---

## 2. Estrutura atual

```
panorama-llms/                         ← workspace de desenvolvimento (esta pasta)
├── .claude/                           ← configuração local do Claude Code (ignorada pelo git)
│   └── settings.local.json
├── .github/
│   └── workflows/
│       └── auto-update.yml            ← cron de automação semanal
├── admin/                             ← PWA de curadoria
│   ├── icon.svg
│   ├── index.html
│   ├── manifest.json
│   ├── README.md
│   └── sw.js
├── assets/                            ← site (CSS, JS, dados)
│   ├── app.js
│   ├── data.js
│   ├── render.js
│   └── styles.css
├── automation/                        ← pipeline de atualização semanal
│   ├── apps-script/
│   │   ├── .clasp.json
│   │   ├── .claspignore
│   │   ├── appsscript.json
│   │   └── Codigo.gs
│   ├── .gitignore
│   ├── policy.md
│   ├── prepare.mjs
│   ├── publish.mjs
│   ├── README.md
│   └── schema.json
├── .gitignore                         ← ignora clones de deploy e configurações locais
├── .nojekyll                          ← desativa Jekyll no GitHub Pages
├── ARQUITETURA.md                     ← documentação da arquitetura e operação
├── index.html                         ← página principal da timeline
├── LICENSE
├── ORGANIZACAO.md                     ← este documento
└── README.md
│
└── panorama-llms-github/              ← clone do repo oficial para deploy
    ├── .github/
    ├── admin/
    ├── assets/
    ├── automation/
    ├── .nojekyll
    ├── ARQUITETURA.md
    ├── index.html
    ├── LICENSE
    ├── ORGANIZACAO.md
    └── README.md
```

---

## 3. O que foi feito na limpeza

As ações abaixo foram executadas em **01/jul/2026** para eliminar redundâncias e deixar workspace e clone de deploy sincronizados.

### 3.1 Sincronização RAIZ ↔ `panorama-llms-github/`

Após comparar byte a byte (SHA-256), o estado mais atual foi consolidado:

- **Copiados do clone de deploy para a raiz** (GH tinha versões mais novas):
  - `.github/workflows/auto-update.yml`
  - `admin/icon.svg`, `admin/manifest.json`
  - `assets/app.js`, `assets/data.js`, `assets/render.js`, `assets/styles.css`
  - `automation/apps-script/.clasp.json`, `.claspignore`, `appsscript.json`
  - `automation/policy.md`, `prepare.mjs`, `publish.mjs`, `schema.json`
  - `index.html`, `LICENSE`
- **Copiados da raiz para o clone de deploy** (só existiam localmente):
  - `.nojekyll`
  - `ORGANIZACAO.md`
- **Removido da raiz** (arquivo morto, não referenciado em nenhum lugar):
  - `ibm-svgrepo-com.svg`

Após a sincronização, a raiz e `panorama-llms-github/` ficaram **idênticos em conteúdo** (exceto `.claude/settings.local.json`, que é configuração local e não deve ir ao repositório).

### 3.2 Pastas removidas

- **`panorama-llms/`** — cópia antiga do site (maio/2026), sem `admin/`, `automation/` e `ARQUITETURA.md` atualizados.
- **`panorama-llms-preview/`** — clone publicado obsoleto (commit `bf59ebb`) com `.git/` próprio. Seus assets modificados localmente já estavam refletidos no commit `9b91bf3` de `panorama-llms-github/`.

### 3.3 Proteção contra novas cópias

- Criado `.gitignore` na raiz ignorando `/panorama-llms-github/`, `/panorama-llms-preview/`, outras variações de backup e `.claude/`.

---

## 4. Histórico de diferenças (pré-limpeza)

> Registro das diferenças encontradas antes da limpeza, para referência.

### 4.1 Raiz (`.`) vs `panorama-llms-github/`

| Arquivo | Raiz | panorama-llms-github | Observação |
|---|---|---|---|
| `.github/workflows/auto-update.yml` | 2.042 B | 2.097 B | GH mais novo |
| `admin/icon.svg` | 654 B | 665 B | GH mais novo |
| `admin/manifest.json` | 408 B | 421 B | GH mais novo |
| `assets/app.js` | 19.096 B | 25.554 B | GH bem mais novo |
| `assets/data.js` | 29.055 B | 29.297 B | GH mais novo |
| `assets/render.js` | 11.576 B | 14.613 B | GH bem mais novo |
| `assets/styles.css` | 12.044 B | 18.565 B | GH bem mais novo |
| `automation/apps-script/.clasp.json` | 87 B | 88 B | GH mais novo |
| `automation/apps-script/.claspignore` | 29 B | 32 B | GH mais novo |
| `automation/apps-script/appsscript.json` | 210 B | 220 B | GH mais novo |
| `automation/policy.md` | 3.415 B | 3.471 B | GH mais novo |
| `automation/prepare.mjs` | 4.501 B | 4.613 B | GH mais novo |
| `automation/publish.mjs` | 7.195 B | 7.369 B | GH mais novo |
| `automation/schema.json` | 1.311 B | 1.344 B | GH mais novo |
| `index.html` | 12.966 B | 15.553 B | GH bem mais novo |
| `LICENSE` | 845 B | 865 B | GH mais novo |

Observação: `admin/index.html`, `admin/README.md`, `admin/sw.js`, `ARQUITETURA.md`, `README.md` e `automation/README.md` já tinham conteúdo idêntico; apenas os *timestamps* de modificação diferiam.

### 4.2 `panorama-llms-github/` vs `panorama-llms-preview/`

| Arquivo | panorama-llms-github | panorama-llms-preview | Observação |
|---|---|---|---|
| `admin/index.html` | 16.849 B | 14.085 B | preview desatualizado |
| `admin/README.md` | 3.407 B | 1.896 B | preview desatualizado |
| `admin/sw.js` | 1.378 B | 1.410 B | preview desatualizado |
| `automation/apps-script/Codigo.gs` | 17.417 B | 11.871 B | preview muito desatualizado |
| `ARQUITETURA.md` | 17.327 B | 14.883 B | preview desatualizado |

A pasta `panorama-llms-preview/` ainda carregava todo o `.git/` do repositório (65 KB de pack + hooks/logs/refs), ou seja, era um clone completo e desnecessário.

---

## 5. Fluxo de trabalho recomendado

```
┌─────────────────┐     desenvolve     ┌──────────────────────┐     push      ┌────────────────────────────┐
│   RAIZ (.)      │ ─────────────────▶ │ panorama-llms-github │ ────────────▶ │ GitHub (lapig-ufg/...)     │
│ workspace local │                    │ clone para deploy    │             │ GitHub Pages serve ao vivo │
└─────────────────┘                    └──────────────────────┘             └────────────────────────────┘
```

- **Nunca edite** diretamente em `panorama-llms-github/` sem antes sincronizar com a raiz.
- **Não crie novas cópias** como `panorama-llms-preview/`, `panorama-llms-v2/` etc. Use branches dentro do clone oficial se precisar testar algo.
- **Use a memória do projeto** (`memory/deploy-path.md`) para lembrar que a pasta local não é o repo git e a publicação deve ser feita clonando `lapig-ufg/app-panorama-global-da-ia-generativa` e fazendo push via `VictorGit10`.

---

## 6. Checklist de limpeza

- [x] Verificar se há arquivos não rastreados dentro de `panorama-llms/`.
- [x] Verificar se há arquivos não rastreados dentro de `panorama-llms-preview/`.
- [x] Sincronizar `admin/index.html` da raiz com `panorama-llms-github/`.
- [x] Sincronizar `assets/app.js`, `assets/styles.css`, `assets/render.js` e `index.html` de `panorama-llms-github/` com a raiz (se forem mais novos).
- [x] Apagar `panorama-llms/`.
- [x] Apagar `panorama-llms-preview/`.
- [x] Criar `.gitignore` na raiz para ignorar clones de deploy.
- [x] Fazer commit/push via `panorama-llms-github/`.

---

## 7. Detalhamento do commit

- **Repositório:** `panorama-llms-github/`
- **Remote:** `https://github.com/lapig-ufg/app-panorama-global-da-ia-generativa.git`
- **Branch:** `main`
- **Mensagem:** `chore: reorganiza workspace, sincroniza raiz com deploy e adiciona ORGANIZACAO.md`
- **Arquivos alterados:**
  - Novos: `.nojekyll`, `ORGANIZACAO.md`
  - Nenhuma alteração no conteúdo dos arquivos existentes (a raiz e o clone ficaram idênticos antes do commit).
