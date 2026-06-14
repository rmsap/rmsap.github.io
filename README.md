# Ryan Saperstein — Personal Portfolio

A single-page portfolio site built with React, TypeScript, Vite, and Tailwind CSS. Hosted on Cloudflare Pages at **https://ryansaperstein.com**.

## Tech stack

- **React 19** + **TypeScript**
- **Vite 7** (dev server and build)
- **Tailwind CSS 4** (via `@tailwindcss/vite`)
- **Lucide React** and **Heroicons** for icons
- **Web3Forms** for the contact form (no backend required)

## Prerequisites

- **Node.js** 18+ (recommend 20+)
- **npm** (or pnpm/yarn)

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/rmsap/rmsap.github.io.git
cd rmsap.github.io
npm install
```

### 2. Environment variables (optional)

The contact section uses [Web3Forms](https://web3forms.com) so messages are emailed to you without exposing your address.

1. Get an access key at [web3forms.com](https://web3forms.com).
2. Copy the example env file and add your key:

```bash
cp .env.example .env
```

3. In `.env`, set:

```bash
VITE_WEB3FORMS_ACCESS_KEY=your_access_key_here
```

Without this key, the contact form will not submit successfully. The app still runs; you’ll need the key for production if you want the form to work on the live site.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### 4. Build and preview

```bash
npm run build
npm run preview
```

Preview serves the production build locally (default [http://localhost:4173](http://localhost:4173)).

## Scripts

| Script        | Description                          |
|---------------|--------------------------------------|
| `npm run dev` | Start Vite dev server with HMR       |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Serve the `dist` build locally    |
| `npm run deploy:redirect` | Publish the `redirect/` page to the `gh-pages` branch (forwards `rmsap.github.io` → `ryansaperstein.com`) |
| `npm run lint` | Run ESLint                          |

## Project structure

```
src/
├── App.tsx              # Root layout and section order
├── main.tsx             # Entry point
├── home.tsx             # Home page wiring (if used)
├── components/          # UI components
│   ├── Header.tsx       # Nav and mobile menu
│   ├── Hero.tsx         # Hero section
│   ├── Projects.tsx     # Projects grid
│   ├── Experience.tsx   # Work experience
│   ├── TechnicalSkills.tsx
│   ├── Contact.tsx      # Contact form (Web3Forms)
│   ├── Footer.tsx
│   ├── Carousel.tsx
│   └── About/           # About section and timeline
├── data/                # Content (edit these to update the site)
│   ├── experiences.json # Jobs and roles
│   ├── aboutData.json   # About copy, stats, journey
│   ├── skills.json      # Technical and soft skills
│   └── journey.json     # Timeline / journey data
├── constants/
│   └── socialLinks.ts   # GitHub, LinkedIn, etc.
└── hooks/
    └── useActiveSection.ts
```

## Updating content

- **Work experience:** Edit `src/data/experiences.json` (company, role, period, highlights, technologies, logo path).
- **About section:** Edit `src/data/aboutData.json` (header, profile image, stats, bio, journey).
- **Skills:** Edit `src/data/skills.json` (proficient, familiar, interested, soft).
- **Social links:** Edit `src/constants/socialLinks.ts`.

Asset paths (e.g. logos, photos) are relative to the `public/` folder (e.g. `/playbookLogo.png` → `public/playbookLogo.png`).

## Deployment (Cloudflare Pages)

The live site is hosted on **Cloudflare Pages** at **https://ryansaperstein.com**. Cloudflare builds directly from the GitHub repo on push — there's no manual deploy step.

Cloudflare Pages project settings:

- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Environment variables:** every `VITE_*` key from `.env` must be set in the Pages project (Settings → Environment variables) — these are inlined at build time, so the contact form (`VITE_WEB3FORMS_ACCESS_KEY`) and Firebase (`VITE_FIREBASE_*`) break if they're missing.

SPA deep links and prerendered blog pages are served as real files; unknown paths fall through to `public/404.html`, which Cloudflare serves and which bootstraps the app (see `public/spa-redirect.js`).

### Old GitHub Pages domain

`rmsap.github.io` is kept alive on GitHub Pages purely to redirect old links to the new domain. The redirect page lives in `redirect/`; publish it to the `gh-pages` branch with:

```bash
npm run deploy:redirect
```

Make sure the repo's **Settings → Pages → Custom domain** is left empty so it serves at `rmsap.github.io` (not trying to claim `ryansaperstein.com`).

## License

Private/personal use. All rights reserved.
