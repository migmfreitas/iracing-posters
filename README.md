# iRacing Posters

Make calendar posters for iRacing seasons, special events and private leagues, straight from the browser.

The first template is the regular-season poster from the Figma design "iRacing Series 2026 S1": a series card (class, setups, race times, length, cars) above a week-by-week list of tracks with time of day, temperature and rain chance.

## Use it

1. Edit the season in the JSON box (or import a `.json` file).
2. Tick the fields you want on the poster.
3. Click **Download PNG**.

Your last season is kept in the browser. **Export JSON** saves it as a file you can share, for example so league members can make their own posters.

## Develop

```sh
npm install
npm run dev
```

`npm run build` type-checks and builds to `dist/`.

## Deploy

Every push to `main` builds the site and publishes it to GitHub Pages (`.github/workflows/deploy.yml`). In the repo, set **Settings > Pages > Source** to **GitHub Actions** once.

For a custom domain later: add the domain in **Settings > Pages**, point DNS at GitHub, and remove the `BASE_PATH` line from the workflow so the site is served from `/`.
