# Net Atlas Ultimate

A neon-themed interactive 3D world explorer that displays websites by country.

- Spinning 3D globe (Three.js + three-globe)
- Real country polygons (world-atlas TopoJSON)
- Click a country to:
  - Fetch live metadata from RESTCountries (name, capital, population, region)
  - Show its flag and stats
  - Show websites defined in `websites-by-country.json`
- Neon, glassmorphism, scanline / CRT-style UI
- Website favicons, country flags, TLD-based categories

## How it works

### Frontend

The site is a pure static frontend suitable for GitHub Pages:

- `index.html` – layout, globe container, info panel
- `style.css` – neon theme, glassmorphism, animations, scanlines
- `script.js` – globe logic, RESTCountries integration, website list rendering
- `websites-by-country.json` – data file you maintain (or generate)

The globe is rendered with:

- [three.js](https://threejs.org/)
- [three-globe](https://github.com/vasturiano/three-globe)
- [world-atlas](https://github.com/topojson/world-atlas) (`countries-110m.json` via CDN)
- [RESTCountries](https://restcountries.com/) for country info

Favicons are pulled via Google's favicon service:
`https://www.google.com/s2/favicons?sz=64&domain=example.com`

Flags per country use:
`https://flagcdn.com/`  

(For example: `https://flagcdn.com/64x48/au.png` for Australia.)

### Data: websites-by-country.json

You (or your backend scripts) are responsible for populating:

```json
{
  "AU": [
    { "url": "https://abc.net.au", "category": "media" },
    { "url": "https://www.australia.gov.au", "category": "government" }
  ],
  "US": [
    { "url": "https://www.whitehouse.gov", "category": "government" },
    { "url": "https://www.nasa.gov", "category": "science" }
  ]
}
```

The keys must be **ISO 3166-1 alpha-2 country codes** (e.g. AU, US, JP, DE).
Each entry has:

- `url` – full URL string
- `category` – free text, but will be displayed as a neon tag

If `category` is omitted, a default category is inferred from the top-level domain (TLD).

## About Wikipedia, BuiltWith, all.site, internet-map.net

This project is **designed** so that your website lists can come from:

- [Wikipedia – Lists of websites](https://en.wikipedia.org/wiki/Lists_of_websites)
- [BuiltWith website lists](https://builtwith.com/website-lists/Site)
- [all.site](https://all.site/search)
- [internet-map.net](https://internet-map.net/)

However:

- The **browser frontend does NOT scrape those sites directly.**
- Many sites (especially BuiltWith, all.site, internet-map.net) have Terms of Service
  that restrict automated scraping or require a proper API / license.
- Wikipedia is generally more open, but still has usage guidelines.

### Recommended approach

1. **Manual / semi-automatic collection**

   Use those websites to find URLs you care about, then put them into
   `websites-by-country.json` manually.

2. **Your own backend scripts (advanced)**

   If you want automation:

   - Write server-side scripts (e.g. Node.js, Python) that:
     - Respect each site's Terms of Service.
     - Use official APIs or data exports if available.
   - Have those scripts generate `websites-by-country.json`.
   - Commit that JSON into your GitHub repo, or host it on your own backend
     and change the frontend to `fetch()` from your API.

> This repo intentionally does **not** include scrapers for those sites,
> to avoid violating their terms or doing automated scraping from the browser.

## Deploying to GitHub Pages

1. Create a new repository on GitHub (e.g. `net-atlas-ultimate`).
2. Add these files to the root:
   - `index.html`
   - `style.css`
   - `script.js`
   - `websites-by-country.json`
   - `LICENSE`
   - `.gitignore`
   - `README.md`
3. Commit and push.
4. In the GitHub repo:
   - Go to **Settings → Pages**
   - Set **Source** to `main` branch, root (`/`)
5. Your Net Atlas Ultimate site will be available at:
   `https://<your-username>.github.io/<repo-name>/`

## Title & description

- **Title:** Net Atlas Ultimate  
- **Description:** A neon-themed interactive 3D world explorer that displays websites by country using a spinning globe, live country data, flags, icons, and categories.