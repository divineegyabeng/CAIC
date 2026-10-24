# Weekly Instagram runbook — @divine_egyabeng

Produces 7 posts a week for Divine Egyabeng's personal Instagram: 5 carousels and 2 text posts.
Everything here is already settled. Do not redesign it.

## Account and channel

- Instagram channel (Buffer): `6aa28954cd8b9c702c419273`
- Buffer organization: `6958f078552e44be216f9946`
- Timezone: Africa/Accra (UTC+00:00)
- Handle shown on slides: `@divine_egyabeng`

## Setup each run

```
git clone --depth 1 https://github.com/divineegyabeng/CAIC /home/claude/caic
cd /home/claude/caic/pipeline
```
Node, Playwright and the Inter font are already present in the container.

## Content rules

**Topics.** 5 carousels on trending cyber and tech, researched fresh each week from real
reporting with named sources and hard numbers. 2 text posts, general observations about work
and persistence. Never about his books. No link in bio.

**Voice.** Copied from his own posts. Second person. No contractions. Short declarative
sentences. No hashtags, no emoji, no jargon.

Caption structure:
1. Hook. One counterintuitive or alarming line.
2. The finding, with the named researcher and real figures.
3. "Here is how it plays out." The mechanism in plain steps.
4. "It works because" — the psychology.
5. "Two things that still work." Two concrete actions. (Text posts use "Do this today.")

**Never include a closing question**, in the caption or as a slide. He asked for this twice.

## Slide template

Edit a deck JSON, run `node render.js deck.json outdir`. Output is 1080x1080 PNG.

- Cover: photo bleeding off the right, solid `#101216` panel left for the type.
  White headline, last line in accent. Small swipe line bottom left.
- Interiors: pure black. Title in accent `#D9A02B`. Body pure white. White numeral 01-04.
- Follow slide last, always. Never carries the watermark.
- Watermark `@divine_egyabeng` bottom right, white at 52%, on every slide but the follow one.
- 3 to 9 slides. Most land at 7.

See `examples/`.

## Photos

Must be real photography. **Never AI generated** — he will reject it, and Instagram's
"AI content" label is a dealbreaker for him.

`photos/` holds a reusable library. For anything new, Pexels via the built-in browser:
the container cannot reach images.pexels.com, so fetch in the browser pane with JS and
trigger a blob download. Files land in `C:\Users\BOSS\Downloads` as `.tmp` with the real
name pending — match them by byte size, then `device_stage_files`.

Check the cover crop. The subject must not sit behind the headline.

## Publishing

1. Copy rendered PNGs to `slides/<topic>/` in this repo, commit, push to `main`.
2. Buffer reads them directly from
   `https://raw.githubusercontent.com/divineegyabeng/CAIC/main/slides/<topic>/slide-NN.png`.
   No upload host needed. The container cannot reach Cloudinary; this is the route that works.
3. `create_post` with `saveToDraft: true`, then `edit_post` with
   `mode: customScheduled`, `dueAt`, `saveToDraft: false`.
   Instagram needs `metadata.instagram = {type: "post", shouldShareToFeed: true}`.
   Alt text on every image. Leave `isAiGenerated` false.
   `edit_post` revalidates the whole post, so always resend assets and metadata.

**Times.** One post a day. Spread between 05:00 and 23:00, varied across morning, midday and
evening, never on the hour or half hour. His organic posts look like this and it should stay
that way.

**Schedule at least 24 hours out** so he has a window to review or pull anything in Buffer
before it fires.

## Also deliver

Copy the slides to `E:\Carousels\<topic>\` on his computer via `device_commit_files`.
Note: files cannot be deleted from here — if something needs removing, ask him.

## When finished

Tell him what went out and when, in a short message. List the topics and times. Flag anything
uncertain, especially a developing story whose numbers could change before its slot.
