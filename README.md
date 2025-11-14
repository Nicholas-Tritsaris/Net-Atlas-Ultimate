# Net Atlas Ultimate – Orbital Edition

A neon, orbital-themed interactive 3D world explorer that displays websites by country.

- Spinning 3D globe (Three.js + three-globe)
- Real country polygons (world-atlas TopoJSON)
- Orbital visual style: starfield, layered neon orbits, atmosphere halo
- Click a country to:
  - Fetch live metadata from RESTCountries (name, capital, population, region)
  - Show its flag and stats
  - Show websites defined in `websites-by-country.json`
- Neon, glassmorphism, CRT scanlines, hover bloom
- Website favicons, country flags, TLD-based categories

## Data: websites-by-country.json

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

The keys are ISO 3166-1 alpha-2 country codes (AU, US, JP, DE, etc.).

## About Wikipedia, BuiltWith, all.site, internet-map.net

This project is meant to *visualise* website lists that you can assemble using:

- Wikipedia – Lists of websites
- BuiltWith website lists
- all.site search
- internet-map.net

But:

- The **browser frontend does NOT scrape those sites directly.**
- Many of them have Terms of Service that restrict scraping.
- Instead, use your own backend/CLI scripts (respecting ToS or using official APIs)
  to collect URLs and generate `websites-by-country.json`.

Then this frontend will render them on the orbital globe.

## Deploying to GitHub Pages

1. Create a new repo and add:
   - `index.html`
   - `style.css`
   - `script.js`
   - `websites-by-country.json`
   - `LICENSE`
   - `.gitignore`
   - `README.md`
2. Push to GitHub.
3. Enable GitHub Pages (Settings → Pages → source = `main` / root).
4. Your site appears at:  
   `https://<username>.github.io/<repo>/`

## Title & description

- **Title:** Net Atlas Ultimate – Orbital Edition  
- **Description:** A neon orbital 3D globe that shows websites by country as constellations of URLs, combining live country data, flags, icons, and categories.