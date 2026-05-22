# nowplaying

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
![](https://nowplaying-three.vercel.app/api/now-playing?user=KDesp&spin=always&cover=cd)
```

![](https://nowplaying-three.vercel.app/api/now-playing?user=KDesp&spin=always&cover=cd)

## Local development

```bash
cp .env.example .env.local   # add LASTFM_API_KEY
npm install
npx vercel dev
```

Open: `http://localhost:3000/api/now-playing?user=YOUR_LASTFM_USER`

## Query parameters

| Parameter        | Description | Default |
|------------------|-------------|---------|
| `user`           | Last.fm username (**required**) | — |
| `theme`          | `dark`, `light`, or `midnight` | `dark` |
| `width`          | Card width in px (300–800) | `440` |
| `show_album`     | Show album line (`true` / `false`) | `true` |
| `cover`          | Art shape: `square`, `cd`, or `vinyl` | `cd` |
| `spin`           | Rotation: `playing` (when live), `always`, `never` | `playing` |
| `spin_speed`     | Seconds per rotation (3–30) | `5` (cd), `8` (vinyl) |
| `bg`, `border`, `text`, `muted`, `accent` | Custom hex colors (no `#`) | theme |

Alias: `cover_style` = `cover`, `spin_duration` = `spin_speed`. For `spin`, `true`/`false` map to `playing`/`never`.

### Examples

```md
<!-- Spinning vinyl, always rotates --> 
![](https://nowplaying-three.vercel.app/api/now-playing?user=you&cover=vinyl&spin=always&spin_speed=10)

<!-- CD cover, static when not listening --> 
![](https://nowplaying-three.vercel.app/api/now-playing?user=you&cover=cd&spin=playing)

<!-- Classic square art, no disc --> 
![](https://nowplaying-three.vercel.app/api/now-playing?user=you&cover=square)

<!-- Light theme, wider card --> 
![](https://nowplaying-three.vercel.app/api/now-playing?user=you&theme=light&width=520)
```

## How it works

1. `user.getRecentTracks` (limit 1) — current track or most recent scrobble.
2. Optional `track.getInfo` when artwork is missing or a placeholder.
3. Album image is fetched server-side and inlined as a data URI in the SVG.
4. Response is cached for 5 minutes (`Cache-Control`).

## License

[MIT](./LICENSE)
