# iRacing Posters

Make calendar posters for iRacing seasons, special events and private leagues, straight from the browser.

The first template is the regular-season poster from the Figma design "iRacing Series 2026 S1": a series card (class, setups, race times, length, cars) above a week-by-week list of tracks with time of day, temperature and rain chance.

## Use it

1. Fill in the series: name, license class, setup, race times and length.
2. Add car classes (pick from the list, then tick the cars) and the weeks (track, layout, time of day, temperature, rain chance).
3. Choose what to show under **Show on poster**, then click **Download PNG**.

Your season is kept in the browser. **Save and share > Export season file** saves it as a file you can send to others, for example so league members can make their own posters.

Car and track suggestions live in `src/data/catalog.ts`; anything not listed can still be typed in.

## Develop

```sh
npm install
npm run dev
```

`npm run build` type-checks and builds to `dist/`.

## Deploy

Every push to `main` builds the site and publishes it to GitHub Pages (`.github/workflows/deploy.yml`). In the repo, set **Settings > Pages > Source** to **GitHub Actions** once.

For a custom domain later: add the domain in **Settings > Pages**, point DNS at GitHub, and remove the `BASE_PATH` line from the workflow so the site is served from `/`.
