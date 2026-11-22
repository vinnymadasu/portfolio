# Portfolio — Vineeth Rao Madasu

Next.js 15 (App Router) + React 19, statically exported to GitHub Pages.
No CSS framework, no UI library, no translation service — everything here is
application code.

**Live:** https://vinnymadasu.github.io

## The idea

I build systems that move goods from Indian factories to warehouses abroad.
This site is the same shape: a **routing interface** from an origin to a
destination.

Choosing a destination market does three things at once:

1. **Translates the whole page** into that market's language (7 languages).
2. **Recomputes the live timezone offset** and both local clocks.
3. **Draws the working-hours overlap** — the hours we could actually share.

On first visit the destination is **detected from the visitor's own timezone**,
so a recruiter in Berlin arrives to a German page already showing their time.

## Running it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # static export to ./out
```

## Deploying

`.github/workflows/deploy.yml` builds on every push to `main` and publishes to
GitHub Pages. In the repository: **Settings → Pages → Source: GitHub Actions**.

For a project page served from a subpath, set a repository variable
`BASE_PATH` to `/<repo-name>`. For a user page (`<user>.github.io`) leave it unset.

## Layout

```
app/
  layout.js          document shell, fonts, pre-paint theme script
  page.js            renders <Shell/>
  globals.css        all styles, CSS custom properties, light + dark
components/
  LocaleProvider.jsx market + language context, timezone auto-detect
  Routing.jsx        origin → destination, live clocks, overlap bar
  Shell.jsx          page composition, ⌘K keybinding
  Finder.jsx         filterable capability manifest
  Consignment.jsx    a product case study (used twice)
  Record.jsx         work history and stack
  Profiles.jsx       external profiles
  Contact.jsx        email and copy-to-clipboard
  CommandPalette.jsx ⌘K fuzzy search over sections, profiles, markets
  TopBar.jsx         scroll progress, theme toggle
lib/
  markets.js         12 destination markets with coordinates and timezones
  geo.js             great-circle distance, DST-aware offsets, overlap maths
  i18n.js            translations for 7 languages
  links.js           profile links
```

## Notes

- `lib/geo.js` is pure and dependency-free, so it can be tested with plain Node.
- Times render only after mount; the server and first client paint agree, which
  keeps hydration clean.
- `prefers-reduced-motion` is respected throughout.
- Excluded destination markets by request: UAE, Saudi Arabia, Qatar, Kuwait,
  Bahrain, Oman, Malaysia, Indonesia, Turkey, Egypt, Pakistan, Bangladesh.
