# Layout e identidade visual (mobile admin)

Este documento fixa como o app Expo espelha o “clima” do frontend Angular (**stone**, tipografia editorial, formulários tipo salão/beleza). A fonte normativa das cores no **web** continua sendo [frontend/src/styles/theme.css](../../frontend/src/styles/theme.css) e componentes como [frontend/src/styles/components.css](../../frontend/src/styles/components.css). No mobile, os valores equivalentes ficam codificados em TypeScript para reuso consistente nas telas.

## Onde está no código (mobile)

| Peça | Arquivo |
|------|---------|
| Cores semânticas, tokens de raio e nomes das `fontFamily` | [mobile/constants/belezapro-theme.ts](../../mobile/constants/belezapro-theme.ts) |
| Carregamento de fontes (`useFonts`) + asset map | [mobile/constants/fonts.ts](../../mobile/constants/fonts.ts) |
| Bloqueio de splash até fonts carregarem | [mobile/app/_layout.tsx](../../mobile/app/_layout.tsx) |
| Primeira tela com o novo sistema | [mobile/app/(auth)/login.tsx](../../mobile/app/(auth)/login.tsx) |

> O arquivo histórico [mobile/constants/theme.ts](../../mobile/constants/theme.ts) ainda é o template Expo (abas Home/Explore). Novas telas **admin** devem preferir `belezapro-theme.ts` para alinhar com o Angular.

---

## Tipografia

| Uso no app | Família Google | Equivalente web |
|------------|----------------|-----------------|
| Marca / títulos editorial (italic) | Playfair Display (600 SemiBold Italic como `PlayfairDisplay_600SemiBold_Italic`) | `font-serif italic` (`--font-serif`: Playfair) |
| Corpo de tela, labels “técnicos”, inputs, botão | Inter (regular / medium / semibold) | `font-sans` (`--font-sans`: Inter) |

Carregar **sempre** as variantes via [mobile/constants/fonts.ts](../../mobile/constants/fonts.ts) no layout raiz; não assumir nomes sem o mapa registrado pelo `useFonts`.

**Convenções sugeridas**

- Um título forte por bloco ou tela: `FontFamilies.serifItalicHeading`.
- Subtítulo e parágrafos: `sansMedium` ou `sansRegular`, cor `textBody` ou `textMuted`.
- Rótulos de campo (estilo `bp-field-label`): `sansSemiBold`, tamanho pequeno, **uppercase**, `letterSpacing` alto (~2–3px), cor `textMuted`.

---

## Cores (`BelezaproColors`)

Espelho direto das variáveis CSS do Angular `@theme`:

| Token mobile | Hex | Função típica |
|--------------|-----|----------------|
| `surfaceCanvas` | `#fafaf9` | Fundo de tela (canvas) |
| `surfaceElevated` | `#ffffff` | Cards, painéis |
| `surfaceMuted` | `#f5f5f4` | Fundo de inputs, áreas muted |
| `surfaceSubtle` | `#e7e5e4` | Hover/bordas discretas (quando aplicável) |
| `borderSubtle` | `#e7e5e4` | Foco/secundário de borda |
| `borderSoft` | `#f5f5f4` | Borda suave em cards e inputs |
| `textMuted` | `#a8a29e` | Labels uppercase, placeholders |
| `textBody` | `#57534e` | Texto secundário legível |
| `textHeading` | `#1c1917` | Títulos e texto em inputs |
| `actionPrimary` | `#292524` | Botão primário preenchido (não usar azul padrão de template) |
| `actionPrimaryHover` | `#44403c` | Estado pressed sobre primário |
| `actionOnPrimary` | `#ffffff` | Texto sobre botão primário |
| `error` | `#b3261e` | Mensagens de erro / alert |

---

## Layout e forma

Tokens em [mobile/constants/belezapro-theme.ts](../../mobile/constants/belezapro-theme.ts) (`BelezaproRadius`):

- **Card**: raio ~`24` (equivalente a `--radius-card` 1.5rem no web).
- **Controles grandes** (inputs): ~`16` (`--radius-control-lg`).
- **Botão principal**: formato **pill** (raio muito alto, ex. `9999`), largura total quando for CTA único como no login).

**Sombras**: no React Native usar `shadow*` no iOS e `elevation` no Android de forma discreta (~sombra macia tipo `--shadow-modal-soft`).

**Fluxo típico de tela pública/stack**

- Canvas `surfaceCanvas` em tela cheia.
- Conteúdo centralizado com scroll/`KeyboardAvoidingView` quando houver formulário.

---

## Padrões de componente (paridade com Angular)

Inspirados em `bp-input-lg`, `bp-field-label`, `bp-btn-primary-pill`:

| Padrão | Comportamento |
|--------|----------------|
| Cartão elevated | Fundo branco, borda `borderSoft`, cantos grandes, padding generoso |
| Campo texto | Fundo `surfaceMuted`, borda `borderSoft`, texto `textHeading` |
| Botão primário | Fundo `actionPrimary`; ao pressionar, `actionPrimaryHover` ou opacidade controlada |

---

## Accent rosa (`rose`)

Alguns fluxos admin no Angular usam **rose** para ações destrutivas ou destaque pontual (ex.: modais). Não faz parte do arquivo `belezapro-theme.ts` inicial; quando uma tela precisar, **documente o hex** ao adicionar (ex.: alinhar a classes Tailwind `rose-*` já usadas no web).

---

## Checklist rápido para novas telas

1. Importar cores/raios de `@/constants/belezapro-theme` (não reinventar paleta).
2. Título de marca/uso editorial: serif italic carregado; demais texto: Inter.
3. Primário sempre **stone escuro** (`actionPrimary`), não azul cyan do template Expo.
4. Manter alto contraste e bastante ar no layout (aspecto “estúdio / salão”).

---

Última sincronização com o código mobile: valores tomados de `belezapro-theme.ts` + tela `app/(auth)/login.tsx`.
