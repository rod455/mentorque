# Mentorque — Landing Page

Landing page de pré-lançamento do **Mentorque**, o app de educação em mecânica
automotiva (do básico ao avançado) com consultoria especializada. Captura de
e-mails para a lista de espera, bilíngue (PT-BR / EN), pronta para deploy na
Vercel.

Stack: **Next.js 14 (App Router) · TypeScript · Tailwind CSS · framer-motion ·
Supabase**.

---

## Como rodar

```bash
npm install
cp .env.example .env.local   # preencha as variáveis (veja abaixo)
npm run dev                  # http://localhost:3000
```

Outros scripts: `npm run build` (build de produção), `npm start` (servir o
build), `npm run lint`.

### Variáveis de ambiente (`.env.local`)

| Variável | Para quê |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase (captura da waitlist). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave publishable/anon (segura para expor; o RLS controla o acesso). |
| `NEXT_PUBLIC_SITE_URL` | URL canônica do site (usada nas imagens absolutas de Open Graph). |

Sem essas variáveis o site **roda normalmente**: o formulário aceita o e-mail e
mostra o estado de sucesso, mas **não persiste** nada (e loga um aviso no
servidor). É só plugar as chaves para começar a gravar.

---

## Como editar os textos (i18n)

Todo o conteúdo fica em arquivos de strings — **nada de copy hardcoded nos
componentes**:

- `lib/i18n/strings.pt.ts` — Português (idioma primário, fonte da verdade dos tipos).
- `lib/i18n/strings.en.ts` — Inglês (mesma estrutura).

Para alterar um texto, edite o arquivo `.pt` (e o `.en` correspondente). O
seletor de idioma (header e footer) troca em tempo real e guarda a preferência
no `localStorage`; o idioma também é detectado pelo navegador na primeira visita
(PT-BR como padrão).

Para adicionar um novo idioma: crie `strings.xx.ts` no mesmo formato e registre
em `lib/i18n/index.tsx` (objeto `DICTS` e tipo `Locale`).

---

## Captura de e-mails (waitlist)

O fluxo: `components/ui/WaitlistForm.tsx` → `POST /api/waitlist`
(`app/api/waitlist/route.ts`) → Supabase (`lib/supabase.ts`).

### 1. Criar a tabela no Supabase

Rode o SQL de `supabase/migrations/0001_waitlist.sql` no **SQL editor** do seu
projeto Supabase (ou via Supabase CLI). Ele cria a tabela `waitlist` com índice
único por e-mail e uma policy de RLS que permite **apenas insert** pela chave
anon — leitura só pelo dashboard / service role.

### 2. Configurar as chaves

Preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` no
`.env.local` (e nas Environment Variables da Vercel).

### Trocar por outro backend (Formspree / API própria)

Edite só `app/api/waitlist/route.ts`. Há um `// TODO` marcando onde plugar.
Exemplo com Formspree: troque o bloco do Supabase por um `fetch` para o endpoint
do form. O front-end não precisa mudar.

---

## Deploy na Vercel

1. Importe o repositório na Vercel (framework detectado: **Next.js**).
2. Em **Settings → Environment Variables**, adicione `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `NEXT_PUBLIC_SITE_URL` (a URL final do site).
3. Deploy. O build roda `next build` automaticamente.

> Dica: depois do primeiro deploy, atualize `NEXT_PUBLIC_SITE_URL` para o domínio
> de produção para que os cards de Open Graph apontem para a imagem correta.

---

## Estrutura

```
app/
  layout.tsx            next/font (Space Grotesk + Inter), metadata SEO/OG, skip-link
  page.tsx              compõe as 11 seções (sanduíche escuro/claro)
  globals.css           Tailwind + base da marca
  icon.svg              favicon (sextavado sólido)  — auto-injetado pelo Next
  apple-icon.png        apple touch icon
  api/waitlist/route.ts handler POST (Supabase ou stub)
components/
  Header.tsx
  sections/             Hero, TrustBar, ProblemSolution, Features, HowItWorks,
                        Consulting, Plans, Benefits, FAQ, FinalCta, Footer
  ui/                   Button, Section, Reveal (motion), HexMotif (motivo),
                        PhoneMockup, StoreBadges, Logo, WaitlistForm, LangSwitcher
lib/
  i18n/                 strings.pt.ts · strings.en.ts · index.tsx (provider + useI18n)
  icons.tsx            conjunto de ícones próprios (line, 24px)
  supabase.ts          client Supabase (null-safe)
public/
  logo/                lockups, marca e motivo do sextavado (SVG)
  og-image.png         imagem de compartilhamento
supabase/migrations/   0001_waitlist.sql
tools/                  pipeline de geração dos assets da marca (independente da LP)
```

### Notas de design / acessibilidade

- Paleta da marca (grafite, âmbar, teal, coral) em `tailwind.config.ts`. Âmbar é
  **o** acento — usado em CTAs e destaques.
- Estrutura "sanduíche": hero e seções de transição em fundo escuro; conteúdo em
  fundo claro. Sem listras/stripes decorativas; cards usam tom de fundo + sombra.
- Animações com framer-motion respeitam `prefers-reduced-motion`.
- HTML semântico, foco visível (ring âmbar), `alt` em imagens, contraste forte,
  skip-link e `aria-*` no carrossel do hero e no formulário.

### Marca

Os SVGs em `public/logo/` são gerados pelo pipeline em `tools/` (Node + resvg +
opentype). Para regenerar: `cd tools && node build-web-assets.js`.
