# Captura de conversas reais no Gemini — briefing de execução

> **Para quem executa:** uma pessoa, ou um agente de *computer use* com acesso ao
> navegador e à conta Google de quem pediu a tarefa.
> **Entregável:** um arquivo `automation/capturas/gemini-<data>.json` com as cinco
> conversas transcritas na íntegra e as métricas de cada uma.
> **Tempo estimado:** 40 a 70 minutos.

---

## 1. Para que serve

A aba **"Como usar fora do navegador"** (`como-usar.html`) compara, lado a lado,
resolver uma tarefa conversando com uma IA numa aba do navegador contra resolvê-la
com uma IA que tem acesso ao terminal.

Hoje a coluna da esquerda — a da conversa no navegador — é uma **reconstituição
escrita à mão**. Ela é plausível, e está honestamente rotulada como reconstituição,
mas é o ponto mais fraco da página: estamos afirmando como um chat se comporta em
vez de mostrar.

Esta captura substitui a reconstituição por **transcrições reais**. O objetivo não é
fazer o Gemini passar vergonha: é registrar com fidelidade o que acontece de verdade,
inclusive — e principalmente — quando ele vai bem.

> ⚠️ **Se o Gemini resolver alguma tarefa melhor do que a página supõe, isso é um
> resultado válido e precisa ser reportado.** A página será corrigida, não a captura.
> Um levantamento que só confirma o que já se acreditava não serve para nada.

---

## 2. O que medir

Em todos os cinco roteiros, o dado mais importante é sempre o mesmo:

> **Que informação o Gemini precisou pedir a você — informação que um agente com
> acesso aos arquivos teria lido sozinho?**

Exemplos do que conta: "qual o seu sistema operacional?", "cole a saída do comando",
"rode `gdalinfo` e me mande o resultado", "qual o caminho da pasta?", "os arquivos
seguem qual padrão de nome?".

Cada uma dessas perguntas é uma volta que só existe porque ele não enxerga a máquina.
**Conte todas.**

---

## 3. Regras invioláveis

1. **Uma conversa nova para cada roteiro.** Cinco roteiros, cinco conversas do zero.
   Contexto vazado de um para o outro invalida a comparação.
2. **Use a interface web do Gemini, normalmente.** Não desligue recursos, não force
   modo nenhum. Se ele quiser executar código, **deixe** — ver §7.
3. **Não anexe arquivos e não suba nada.** A comparação é sobre o chat *não ter* os
   arquivos. Se ele pedir upload, responda o que está no roteiro e siga.
4. **Não conduza, não corrija, não ensine.** Nada de "mas e as outras abas?" antes da
   hora, nada de "acho que o problema é o locale". Você é um pesquisador com pressa,
   não um revisor. **Só diga o que o roteiro manda dizer.**
5. **Copie tudo, sem editar.** A transcrição vai inteira: os "supondo que", os
   pedidos de esclarecimento, os blocos de código completos. Não resuma, não limpe,
   não conserte a formatação.
6. **Não invente saídas de comando.** Quando o roteiro manda colar uma saída, use
   **exatamente** o texto que o roteiro fornece, e marque no JSON que aquilo veio do
   roteiro (campo `saidas_fornecidas_pelo_roteiro: true`). Nada dessas saídas foi
   medido numa máquina real — e a página vai dizer isso.
7. **Pare quando o roteiro mandar parar**, ou ao chegar em **8 mensagens suas** na
   mesma conversa, o que vier primeiro. Registre por que parou.
8. **Registre o que você não conseguiu fazer.** Um roteiro incompleto, com o motivo
   escrito, vale muito mais do que um roteiro preenchido por dedução.

### Segurança e privacidade (a conta é de outra pessoa)

- Trabalhe **apenas** em conversas novas criadas por você. Não abra, edite, renomeie
  nem apague conversas que já existiam.
- **Não conecte extensões, apps, Drive, Gmail ou Fotos.** Se o Gemini oferecer, recuse.
- Não altere nenhuma configuração da conta.
- Todos os dados dos roteiros são **fictícios**. Não substitua por dados reais do
  laboratório, mesmo que pareça deixar o teste mais realista.
- Se algo pedir senha, código de verificação ou confirmação de pagamento: **pare** e
  avise quem pediu a tarefa.

---

## 4. Antes de começar

Registre, no cabeçalho do JSON:

- data e hora de início (com fuso);
- o nome do modelo exatamente como aparece na interface (ex.: `2.5 Pro`, `3 Flash`) —
  se houver seletor de modelo, **anote qual estava selecionado**;
- idioma da interface;
- se a conta é gratuita ou paga, se der para saber.

---

## 5. Os cinco roteiros

Em todos: **o texto dentro do bloco é para colar literalmente.** Não acrescente
"por favor", não reformule, não traduza.

---

### Roteiro 1 — Organizar fotos por data

**O que estamos observando:** ele chuta o caminho e o padrão de nome? Quantas voltas
até funcionar? Ele sugere conferir se o total bateu?

**Abertura:**

```
Tenho uma pasta com mais de mil fotos de campo, tiradas em três semanas. Como separo elas em subpastas por data?
```

**Respostas condicionais** — use só a que couber, na ordem em que a situação aparecer:

| Se ele… | Você responde exatamente |
|---|---|
| perguntar o sistema operacional | `Ubuntu.` |
| perguntar o caminho da pasta | `~/campo-2026` |
| perguntar o padrão dos nomes | `A maioria é IMG_20260714_083112.jpg, mas tem umas soltas com nome diferente.` |
| der um script/comando | `Deu erro: mv: target is not a directory` |
| corrigir o script | `Agora rodou. Mas ficaram 1.237 fotos e não 1.240.` |
| perguntar quais faltaram | `Como eu descubro quais são?` |

**Pare** quando ele explicar como achar as três que faltaram, ou em 8 mensagens suas.

---

### Roteiro 2 — Padronizar nomes de arquivo

**O que estamos observando:** ele avisa sobre dependência de *locale* antes de o erro
acontecer? Ele sugere um ensaio (`echo`) antes de renomear 340 arquivos de verdade?

**Abertura:**

```
Preciso padronizar o nome de 340 arquivos .tif no Ubuntu: sem acento, sem espaço, tudo minúsculo. Como faço?
```

**Respostas condicionais:**

| Se ele… | Você responde exatamente |
|---|---|
| der um comando com `iconv` | `Rodei e ficou mapa_cerrado_2025_cpia.tif — ele comeu o Ó de CÓPIA em vez de virar O.` |
| pedir a saída de `locale` | `LANG= e LC_ALL= estão as duas vazias.` |
| perguntar a versão do iconv/glibc | `Não sei dizer, é um Ubuntu 24.04 padrão.` |
| perguntar se os arquivos já foram renomeados | `Já. Rodei nos 340 de uma vez.` |

**Pare** quando ele explicar a causa e der uma correção, ou em 8 mensagens suas.

> **Anote com destaque:** ele sugeriu testar em um arquivo antes de rodar nos 340?
> Espontaneamente, ou só depois de você dizer que já tinha rodado?

---

### Roteiro 3 — Planilhas para CSV  ⭐ o mais importante

**O que estamos observando:** este é o caso em que a resposta é **correta e mesmo
assim perde dados em silêncio**. O `soffice --headless --convert-to csv` converte
somente a **primeira aba** de cada planilha.

**A pergunta que decide tudo: ele avisa sozinho, ou só quando perguntado?**

**Abertura:**

```
Como converto 40 arquivos .xlsx em .csv de uma vez, no Ubuntu?
```

**Regras especiais deste roteiro:**

- **Não corrija nada.** Não mencione abas. Não mencione perda de dados.
- Deixe-o dar a resposta e, se ele parar por aí, mande a segunda mensagem abaixo.

**Segunda mensagem** (só depois de ele ter dado a solução completa):

```
Isso pega todas as abas de cada planilha?
```

**Terceira mensagem** (se ele confirmar que não pega):

```
Como eu conto quantas abas existem no total nos 40 arquivos, para conferir?
```

**Pare** depois disso.

> **Registre com precisão:** ele avisou da limitação de "só a primeira aba"
> **espontaneamente**, na primeira resposta? Ou só depois da segunda mensagem?
> Cite a frase exata dele, seja qual for a resposta.

---

### Roteiro 4 — Descobrir o que lotou o disco

**O que estamos observando:** diagnóstico é uma árvore — cada resposta decide a
próxima pergunta. Queremos **contar quantas idas e voltas** até uma conclusão útil.

**Abertura:**

```
Meu HD de 500 GB encheu e não sei o que está ocupando espaço. Como descubro?
```

**Saídas a colar** — use na ordem, conforme ele for pedindo. **Cole exatamente
assim**, com a quebra de linha:

Se ele pedir a saída de um `du` na home:

```
188G	/home/ana/rasters
96G	/home/ana/Downloads
41G	/home/ana/campo-2026
9G	/home/ana/backup-antigo
2G	/home/ana/Documentos
```

Se ele pedir para descer em `rasters`:

```
121G	/home/ana/rasters/temporarios/
52G	/home/ana/rasters/mod13q1/
15G	/home/ana/rasters/limites/
```

Se ele pedir para olhar dentro de `temporarios`:

```
12.847 arquivos .tif, o mais antigo de 2023-04, o mais novo de ontem.
```

Outras perguntas: responda `Não sei, como eu vejo isso?` — é o que um usuário real
responderia, e é justamente o dado que interessa.

**Pare** quando ele indicar o que apagar com alguma segurança, ou em 8 mensagens suas.

> **Anote:** quantas mensagens suas foram necessárias até uma recomendação concreta?

---

### Roteiro 5 — Recortar rasters com GDAL

**O que estamos observando:** ele pergunta sobre sistema de coordenadas **antes** de
mandar rodar nos 60 arquivos, ou só depois do problema aparecer?

**Abertura:**

```
Como recorto 60 arquivos GeoTIFF pelo limite do estado de Goiás usando GDAL?
```

**Respostas condicionais:**

| Se ele… | Você responde exatamente |
|---|---|
| perguntar o formato do limite | `Um GeoPackage, limites/go.gpkg` |
| perguntar sobre projeção **antes** de dar o comando | `Não sei, como eu vejo isso?` — **e registre que ele perguntou espontaneamente** |
| der o comando/laço | `Rodou nos 60, mas 14 saíram vazios, só com nodata.` |
| pedir a saída de `gdalinfo` do raster | `Size is 4800, 4800 / NoData Value=-3000 / ID["EPSG",4326]` |
| pedir a saída de `ogrinfo` do vetor | `Feature Count: 1 / ID["EPSG",31982]` |

**Pare** quando ele identificar a divergência de CRS e propor a correção, ou em
8 mensagens suas.

---

## 6. O que entregar

Um arquivo JSON em `automation/capturas/gemini-AAAA-MM-DD.json`, com esta forma:

```json
{
  "capturado_em": "2026-09-10T14:20:00-03:00",
  "modelo": "Gemini 3 Flash",
  "modelo_selecionado_manualmente": false,
  "idioma_interface": "pt-BR",
  "conta": "paga",
  "executado_por": "agente de computer use",
  "saidas_fornecidas_pelo_roteiro": true,
  "observacoes_gerais": "",

  "conversas": [
    {
      "roteiro": 1,
      "titulo": "Organizar fotos por data",
      "url": "https://gemini.google.com/app/...",
      "turnos_usuario": 4,
      "parou_porque": "resolvido",

      "executou_codigo": false,
      "pediu_upload": false,
      "avisou_espontaneamente": null,

      "pediu_informacao_que_um_agente_leria_sozinho": [
        "qual o sistema operacional",
        "qual o caminho da pasta",
        "qual o padrão dos nomes"
      ],

      "transcricao": [
        { "quem": "usuario", "texto": "Tenho uma pasta com..." },
        { "quem": "gemini",  "texto": "Claro! Supondo que..." }
      ],

      "notas_do_executor": "Ele assumiu que a data estava no nome do arquivo."
    }
  ]
}
```

### Campo por campo

| Campo | O que é |
|---|---|
| `turnos_usuario` | quantas mensagens **você** mandou nessa conversa |
| `parou_porque` | `"resolvido"`, `"limite de 8 mensagens"`, `"recusou"`, `"travou"` ou o motivo real |
| `executou_codigo` | ele rodou código num sandbox próprio? (ver §7) |
| `pediu_upload` | ele pediu para você anexar os arquivos? |
| `avisou_espontaneamente` | só nos roteiros 3 e 5. `true`/`false`/`null`, com a frase dele em `notas_do_executor` |
| `pediu_informacao_que_um_agente_leria_sozinho` | **o campo mais importante.** Uma linha por pergunta feita a você que um agente com acesso ao disco responderia sozinho |
| `transcricao` | a conversa inteira, em ordem, sem editar. Blocos de código vão como texto, com as quebras de linha preservadas |
| `notas_do_executor` | qualquer coisa que chamou atenção e não coube nos outros campos |

Se JSON for inviável, entregue em Markdown seguindo os mesmos campos, na mesma ordem.
**O que não pode faltar é a transcrição literal.**

---

## 7. Casos especiais

**Se o Gemini executar código num sandbox.**
Deixe. Registre `executou_codigo: true` e descreva em `notas_do_executor` o que ele
rodou e sobre quais dados. Isto é um achado importante, não um problema: o sandbox
dele executa código **sem os seus arquivos dentro**, e essa distinção é mais precisa
do que o argumento que a página faz hoje. A página será ajustada por causa disso.

**Se ele pedir para anexar os arquivos.**
Responda `São 1.240 arquivos, não dá para anexar.` e siga. Marque `pediu_upload: true`.

**Se ele acertar de primeira, sem nenhuma volta.**
Ótimo — registre assim mesmo, com `turnos_usuario: 1` e a lista de perguntas vazia.
É um resultado, e a página vai passar a dizer isso.

**Se ele recusar ou der resposta genérica demais.**
Não insista nem reformule. Registre `parou_porque: "recusou"` e cole a resposta dele.

**Se a interface mudar no meio (novo modelo, nova aba, limite de uso).**
Anote em `observacoes_gerais` e continue de onde parou, numa conversa nova se preciso.

---

## 8. Depois da entrega

Quem consome este arquivo vai:

1. substituir as transcrições reconstituídas em `assets/como-usar-data.js`
   (campo `cenarios[].chat.transcricao`) pelas reais;
2. corrigir os custos declarados (`cenarios[].chat.custo`) com os números medidos —
   inclusive para cima, se o Gemini tiver ido melhor do que a página supunha;
3. reescrever a abertura da aba em cima de um caso real, no lugar da atual discussão
   de nomenclatura;
4. manter, na página, a distinção entre **o que foi transcrito** (a conversa) e
   **o que foi fornecido pelo roteiro** (as saídas de comando coladas).

O item 4 não é opcional. A página inteira se sustenta em não afirmar como medido
aquilo que foi reconstituído.
