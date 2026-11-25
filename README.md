# A — Anandhan Shine portfolio

A one-page, zero-dependency portfolio for a **Unity gameplay programmer & character designer**.
Phantom-graphite surfaces with moonlight-silver text, aqua as the primary accent, and lime green as the
secondary accent — roughly 60 / 10 / 20 / 10. Includes a 3D game-case shelf project browser, a local
demo video, and a runtime-synthesized sound layer.

**Alternate styling:** `alt/` contains a second, self-contained edition with the same content and
behaviour but a completely different flat "field manual" visual language. Open `alt/index.html` or
visit `http://localhost:8765/alt/index.html`. See `alt/README.md`.

---

## Run it

Double-click `index.html` — it works from the file system.

For the best result (range requests for the 104 MB video, correct MIME types), serve it:

```powershell
powershell -ExecutionPolicy Bypass -File tools\serve.ps1 8765
# → http://localhost:8765
```

---

## Structure

```
index.html                 markup, copy, stats
style.css                  all styling (palette in the :root block)
app.js                     project data, case shelf, video, sound, page wiring
assets/img/poster-*.svg    six 900×900 covers (poster-01 = Squishy)
assets/video/              squishy-demo.mp4
tools/serve.ps1            local static server with MP4 range support
```

`assets/css/` and `assets/js/` are **unused copies from the original template**.
`index.html` loads only `style.css` and `app.js`. Safe to delete.

---

## Projects — `app.js`

Edit the `PROJECTS` array near the top of `app.js`.

```js
{
  title: "Squishy",
  engine: "Unity",
  status: "Playable build",
  genre: "Arcade / Hyper-casual",
  role: "Gameplay Programmer & Character Designer",
  poster: "assets/img/poster-01.svg",
  demo: "https://yourgame.itch.io/squishy",   // hidden when empty or example.com
  video: "assets/video/squishy-demo.mp4",     // local <video> (preferred)
  youtube: "VIDEO_ID"                         // fallback for YouTube trailers
}
```

Optional fields (`platform`, `team`, `year`, `duration`) are hidden automatically when absent.
Entries 02–06 are intentionally empty in-progress slots — replace them when real prototypes exist.

The project file shows **video only**, never the cover art. `ESC` closes, arrow keys step projects.

---

## Art and palette

- Covers: replace `assets/img/poster-0N.svg` with any square artwork (900×900 works best).
- Palette: `:root` at the top of `style.css`.

```css
/* 60% phantom graphite / 10% moonlight silver / 20% aqua / 10% lime green */
--bg:     #0f1115;
--panel:  #1b1f25;
--silver: #c8d0dc;
--aqua:   #3ff0dc;
--lime:   #b4f24a;
```

`tools/make-posters.ps1` is the original cover generator; it produces the old template art.
Edit the SVGs directly unless you update that script first.

The background is now a plain-canvas recreation of Animate UI's `GravityStarsBackground`, behind
every other layer. The old CSS 3D floor grid, horizon and glows are gone. `initGravityStars` in
`app.js` keeps all the documented knobs in `CFG` (75 stars, glow, pointer attract/repel, optional
star-to-star bounce/merge). Stars drift, slow, wrap and glow; the pointer pulls them in and keeps
acting from its last position; the canvas follows the page's own ink (`--txt`), sizes to its
container at device pixel ratio, scatters on resize, pauses off screen or when the tab is hidden,
and holds still under `prefers-reduced-motion`. Still zero libraries.

---

## Case shelf

- Cases stand spine-out on a shelf; hovering pulls one forward, clicking opens it into the
  disc tray and the project file.
- Each spine carries a number chip, the title, a project colour band at the foot, and a
  3-pellet cluster (project tint / aqua / lime).
- The shelf is a silver-to-graphite plate over a soft studio backdrop, lit by an aqua spill.
- Auto-advances every **3 s**, and pauses while the shelf is hovered/open, the project file
  is up, the tab is hidden, or you interacted in the last ~4.5 s.
- Clicking a case opens it; the glass side arrows step the shelf.
- `prefers-reduced-motion` stops the auto-advance.
- The project file stacks the demo video, title and technical facts.

Keyboard: cases are focusable (`Enter` opens), `←` / `→` step, `Esc` closes the open case.

---

## Hero intro

On a normal first load (no section hash, page at the top, motion allowed) the boot screen runs:
a dim gamepad fills in, one control lights up per step while the loading bar advances, then the
"PLAYER 1 READY" screen fades and the hero copy arrives. The gamepad only lives on the boot
screen — there is no travelling controller any more; the hero art keeps only the ASCII cube.

A second Bencho piece, `ASCII wake` (MIT, bencho.dev/licence), sits in the top-right of the hero
where the target ring used to be. It is ported to plain canvas in `initAsciiCube` so
the page still loads no libraries; Bencho's `--fill-on` / `--ink` tokens map to this project's own
silver ink. Drag through the cube to leave a cooling wake of glyphs, click to send out a ring.
Under `prefers-reduced-motion` it renders as a static field of dots.

The About die is the scroll-driven 3D change: it petals open into six faces as the section
arrives and folds back into a solid cube as it leaves, driven by `--burst`, `--unfold` and
`--die-turn` in `initScroll3D`. All of it is CSS transforms — no 3D library.

The About art uses the same technique for a desk scene: a table, four legs, monitor, keyboard,
mouse and CPU tower fly in from different directions and settle as the section scrolls into
view. The monitor's screen powers on once everything is seated. It is built by `buildDesk` and
driven by `updateDesk`; with `prefers-reduced-motion` it renders as a static, fully assembled
desk.

Decorative layers also drift at different depths in `initScroll3D`: the hero copy lags, the
scroll cue leads, and the project ring, craft-card shapes and About accents move at their own
speeds as they cross the viewport.
All parallax stops under `prefers-reduced-motion`.

---

## Honest defaults

The site currently states 2 years making games, 1 playable project and 0 jam wins.
Squishy is the only real project; 02–06 are labelled unreleased prototypes.
Update the hero stats in `index.html` and the About copy when that changes.

The contact email in `index.html` is `anandhanshine8281@gmail.com`.

---

## Video notes

`assets/video/squishy-demo.mp4` is 1920×846, 119 s, ~104 MB.
Compress it (H.264, 8–15 Mbps) before deploying to a host with bandwidth limits.
`tools/serve.ps1` supports HTTP range requests and correct `video/mp4` MIME so seeking works locally.

---

## Sound

Every UI sound is synthesized at runtime with Web Audio — no audio files.
Hover cues cover links, buttons and discs; clicks play a short press cue, while richer actions
(open/close/swap/toggle) use their own layered sounds. The nav speaker button persists its state
in `localStorage` (`as_sfx`) and audio starts only after a user gesture, as browsers require.
