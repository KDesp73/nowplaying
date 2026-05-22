# lastfmwidget

Dynamic **Last.fm** “now playing / last played” card as **SVG** for your [GitHub profile README](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme).

Album art is embedded as **base64** inside the SVG so it renders correctly on GitHub (external image URLs inside SVG are blocked in `<img>` tags).

## Setup

1. Create a [Last.fm API account](https://www.last.fm/api/account/create) and copy your **API key**.
2. Deploy to [Vercel](https://vercel.com) (import this repo).
   - Framework preset: **Other**
   - Build command: leave empty (or use repo `vercel.json`)
   - Output directory: **public** (set automatically via `vercel.json`)
3. Add environment variable: `LASTFM_API_KEY` = your key.
4. Embed in your profile README (replace domain and username):

```markdown
<div align="center">
  <a href="https://www.last.fm/user/YOUR_LASTFM_USER">
    <img
      src="https://YOUR_VERCEL_DOMAIN/api/now-playing?user=YOUR_LASTFM_USER"
      alt="Last.fm now playing"
    />
  </a>
</div>
```

<div align="center">
  <a href="https://www.last.fm/user/KDesp">
    <img
      src="https://nowplaying-three.vercel.app/api/now-playing?user=KDesp"
      alt="Last.fm now playing"
    />
  </a>
</div>

## Local development

```bash
cp .env.example .env.local   # add LASTFM_API_KEY
npm install
npx vercel dev
```

Open: `http://localhost:3000/api/now-playing?user=YOUR_LASTFM_USER`

## Query parameters

| Parameter     | Description                                      | Default |
|---------------|--------------------------------------------------|---------|
| `user`        | Last.fm username (**required**)                  | —       |
| `theme`       | `dark`, `light`, or `midnight`                   | `dark`  |
| `width`       | Card width in px (280–800)                       | `420`   |
| `show_album`  | Show album name (`true` / `false`)               | `true`  |
| `bg`          | Background hex (without `#`)                     | theme   |
| `border`      | Border hex                                       | theme   |
| `text`        | Primary text hex                                 | theme   |
| `muted`       | Secondary text hex                               | theme   |
| `accent`      | Status / accent hex                              | theme   |

### Examples

```html
<!-- Light theme, wider card -->
<img src="https://YOUR_DOMAIN/api/now-playing?user=rj&theme=light&width=500" />

<!-- Hide album line -->
<img src="https://YOUR_DOMAIN/api/now-playing?user=rj&show_album=false" />

<!-- Custom colors -->
<img src="https://YOUR_DOMAIN/api/now-playing?user=rj&bg=0d1117&accent=58a6ff" />
```

## How it works

1. `user.getRecentTracks` (limit 1) — current track or most recent scrobble.
2. Optional `track.getInfo` when artwork is missing or a placeholder.
3. Album image is fetched server-side and inlined as a data URI in the SVG.
4. Response is cached for 5 minutes (`Cache-Control`).

## License

MIT
