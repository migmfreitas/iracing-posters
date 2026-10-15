# iRacing Posters

Make calendar posters for iRacing seasons, special events and private leagues, straight from the browser.

Posters follow the Figma design "iRacing Series 2026 S1": each series gets a card (class, setups, race times, length, cars) above a week-by-week list of tracks with time of day, temperature and rain chance. Several series can sit side by side, with blank rows for weeks a series skips, so a community can show its whole season on one poster.

## Use it

1. On the start screen, choose a calendar for iRacing series (pick one or more ready-made series), a custom league calendar or an event poster.
2. Add more series with **+ New series** or **Duplicate**, and switch between them with the tabs. Drag the divider to make the editor wider or the preview bigger.
3. Fill in each series: name, license class, setup, race times and length, car classes, and the weeks (track, layout, time of day, weather forecast). Mark a week as **No race** to leave it blank.
4. Choose what to show under **Show on poster**, pick a **Format** (16:9, A4 portrait or landscape, square, story, or fit to content) and click **Download PNG**.

Your poster is kept in the browser. **Save and share > Export poster file** saves it as a file you can send to others; older single-season files still import.

## Admin

Open `#/admin` on the site (for example https://migmfreitas.github.io/iracing-posters/#/admin) to edit the car classes, tracks and layouts, and the iRacing series templates offered on the start screen. Saving commits `src/data/catalog.json` and `src/data/series.json` to `main` with a GitHub fine-grained token (this repository only, Contents: read and write) that stays in your browser, and the site redeploys on its own.

Anything not in the catalogue can still be typed in the editor.

## Develop

```sh
npm install
npm run dev
```

`npm run build` type-checks and builds to `dist/`.

## Deploy

Every push to `main` builds the site and publishes it to GitHub Pages (`.github/workflows/deploy.yml`). In the repo, set **Settings > Pages > Source** to **GitHub Actions** once.

For a custom domain later: add the domain in **Settings > Pages**, point DNS at GitHub, and remove the `BASE_PATH` line from the workflow so the site is served from `/`.
