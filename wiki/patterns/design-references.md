# Design References

Status: Active

Personal library of sites worth stealing from. One file, one entry per site. Feeds the `impeccable` skill by paste, not by import — impeccable reads project-local `.impeccable/DESIGN.md` and `PRODUCT.md` only.

## Why not a vault / HTML archive

- **Not a separate vault.** One more thing to sync for content that is a list.
- **Not saved HTML.** Rots in a week (build-hashed CSS, lazy-loaded fonts, CDN images), and nobody reads a 400KB `<div>` soup. The live URL is the archive.
- **Not a screenshot dump.** Images without words are unsearchable and untransferable — "I like this" is not a design instruction.

What transfers is the **named specific**: the type pairing, the spacing rhythm, the one motion trick. If you can't write it in a sentence, it isn't a reference, it's a vibe.

## Entry format

Four lines. If it takes more, it's two entries.

```markdown
### <Site name> — <url>
- **Mode:** Persuade | Operate | Read | Experience
- **Steal:** the one named thing (type pairing, grid, motion, density, color move)
- **Tags:** #dark #editorial #dense #b2b #playful ...
```

`Mode` matches impeccable's four modes, so a brief can pull "all my Operate refs" in one grep.

## Capture rule

Add a reference **only when you can name what to steal**. Cap at ~40 entries; below that you re-read the whole file in seconds, above that you never open it. Prune on add.

Optional: drop a screenshot at `~/Obsidian/VibeCoding/raw/design-refs/<slug>.png` and link it. Words first, image second — never image only.

## Using it

New project, at the DESIGN.md step:

```bash
rg -A3 'Mode:\*\* Persuade' ~/Obsidian/VibeCoding/wiki/patterns/design-references.md
```

Pick 2–3, paste the **Steal** lines into `.impeccable/DESIGN.md` under a "References" heading with what specifically applies. Never paste the whole file — impeccable does better with three sharp constraints than thirty loose ones.

Personal vs professional is a tag (`#personal` / `#client`), not a second file.

---

## References

### Aura — https://auraprotocol.com ([httpster](https://httpster.net/website/auraprotocol/))
- **Mode:** Persuade
- **Steal:** explains a complex financial product with diagrams instead of paragraphs — restrained palette and generous whitespace so the one illustrated mechanic per section is the only thing to look at
- **Tags:** #minimal #professional #finance #explanatory #light

### Curry Cafe — https://curry.cafe ([httpster](https://httpster.net/website/curry-cafe/))
- **Mode:** Persuade
- **Steal:** heavy visible borders as the layout system — every block boxed and hairline-divided, saturated fills doing the work images usually do
- **Tags:** #unusual-layout #photographic #colourful #typographic #retro #food-drink

### Mariano Pascual — https://marianopascual.me ([httpster](https://httpster.net/website/mariano-pascual/))
- **Mode:** Experience
- **Steal:** playful oversized menu as the main event; cartoon illustration carries the personality so the portfolio grid can stay plain
- **Tags:** #retro #colourful #interactive #illustrative #portfolio

### Heartbeat Drum Machine — https://heartbeatdrummachine.com ([httpster](https://httpster.net/website/heartbeatdrummachine-chd-5/))
- **Mode:** Experience
- **Steal:** minimal page where the interaction *is* the content — one playable instrument, no chrome, retro hardware feel from type + muted palette alone
- **Tags:** #minimal #interactive #retro #music

### Made by Folk — https://madebyfolk.com ([httpster](https://httpster.net/website/made-by-folk/))
- **Mode:** Read
- **Steal:** one large centred image anchoring each view, neon accents at full strength against neutral ground
- **Tags:** #grid #photographic #illustrative #neon #blog

### For Bottoms — https://forbottoms.com ([httpster](https://httpster.net/website/for-bottoms/))
- **Mode:** Read
- **Steal:** zine layout logic — mismatched column widths and type scales per section, held together by a strict colour set and scroll rhythm
- **Tags:** #grid #colourful #typographic #scrolling-behaviour #zine #blog #culture

### ustwo — https://ustwo.com ([httpster](https://httpster.net/website/ustwo/))
- **Mode:** Persuade
- **Steal:** the professional/fun balance — simple, near-default layout carrying bold flat colour blocks; the palette does the personality so the structure can stay credible. **Closest match for my own site.**
- **Tags:** #responsive #colourful #design-illustration #studio #personal

### I Weigh Community — https://iweighcommunity.com ([httpster](https://httpster.net/website/i-weigh-community/))
- **Mode:** Read
- **Steal:** cut-and-paste collage imagery (mixed-media, hard-edged cutouts) + bottom-anchored nav that stays put through a long scroll
- **Tags:** #colourful #typographic #illustrative #collage #bottom-nav #blog #culture

### Linear — https://linear.app
- **Mode:** Operate
- **Steal:** near-zero-chrome surfaces; hierarchy from spacing + weight alone, almost no borders or fills
- **Tags:** #dark #dense #b2b #saas

### Stripe Docs — https://docs.stripe.com
- **Mode:** Read
- **Steal:** sticky code pane paired to prose scroll; language switcher persists across the whole doc set
- **Tags:** #light #technical #docs

### Raca — https://www.racastudio.pl/?ref=httpster.net
- **Mode:** Operate
- **Steal:** simple scrolling landing page; portfolio display; team page; top menu
- **Tags:** #light #minimalist #landing-page #portfolio

### The Mind Room — https://themindroom.com.au/?ref=httpster.net
- **Mode:** Operate
- **Steal:** colorful but not overwhelming with good photos 
- **Tags:** #colorful #minimalist #landing-page #b2c
### One Useful Thing (Substack) — https://www.oneusefulthing.org/archive
- **Mode:** Read
- **Steal:** narrow, ruled chronological entries with title, short deck, and date; subscription stays separate from the reading links
- **Tags:** #newsletter #editorial #archive #light

### OpenTools newsletter — https://newsletter.opentools.ai/archive
- **Mode:** Read
- **Steal:** dates and short issue descriptions make the archive scannable; an explicit Subscribe action remains separate from issue selection
- **Tags:** #newsletter #archive #ai #metadata

<!-- add yours here, newest first -->
