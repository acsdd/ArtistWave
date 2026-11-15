# ArtistWave private launch brief

**Status:** Internal preparation only. Do not change repository visibility, deploy a public site, or post externally without the owner’s go-ahead.

## Positioning

ArtistWave is a music discovery and library workspace for people who want to follow an artist or style beyond one streaming catalog. Explore artists, genres and eras; preview recordings from supported sources when available; bring in local audio; and organize tracks into playlists. The compact player and routine-planning workspace support listening and movement practice.

**Short line:** Find your sound. Build a listening space that feels like yours.

**What makes it distinct:** Artist identity and recording results are shown separately, so listeners can choose the artist they mean before exploring available recordings. ArtistWave also brings discovery, local tracks, playlists, a compact player and optional private library sync into one browser app.

## Audience to test first

Start with music explorers who already use a mix of local files and online discovery. Include a few dance or routine builders as a secondary group because the app has genre browsing and routine-planning tools. Ask each person to complete one simple journey and tell us where they got stuck; do not try to market every feature at once.

## Claims we can make

- Browse artists, genres and eras, then choose an artist identity before searching recordings.
- Preview recordings from supported online sources when they are available.
- Add local audio and organize music into playlists; local audio files stay on the device.
- Use a compact player and optional browser installation.
- Optional Google sync stores library metadata in the user’s private Drive app-data area; audio files are not uploaded.

## Claims to avoid

- Do not call the catalog complete, licensed, royalty-free or guaranteed to play. Availability and attribution vary by provider and individual recording.
- Do not position ArtistWave as a replacement for commercial streaming services.
- Do not imply that a search result grants permission for public performance, redistribution or commercial use. Check the source and the rights for the specific recording.
- Do not imply Google sign-in or online playback is required for local-file use.

## First demo

Make one 30–45 second screen recording: search for an artist with multiple matches, select the intended artist, preview an available recording, add it to a playlist, then open the compact player. Use a recording whose source and rights have been checked. Keep personal files, account details and OAuth settings out of the capture. Add captions so the clip works without sound.

## Private soft-launch sequence

1. **Fix first impressions:** keep one canonical site address, rewrite the opening of the README around the current product, and add a clear screenshot or short demo. The README now covers the current product and YouTube search; a vector social preview and captioned demo script are prepared.
2. **Verify the experience:** once the canonical site is configured, test it in a clean browser on desktop and phone. Check discovery, playback failures, local-file access, playlists, mini player, install prompt and optional Google sign-in. Confirm the Google authorized origin matches the deployed site.
3. **Invite a small private group:** ask five people who fit the audience to try the same short task. Collect their consent-based feedback directly; add no tracking just for the launch.
4. **Choose one public channel:** after the private test, adapt the message for a community whose rules allow project feedback. Participate normally and avoid repeated link drops. Product Hunt can be a later listing after the demo and support details are ready.
5. **Review before any announcement:** confirm the live address, support/contact route, privacy explanation, provider limitations, and the owner’s approval to make the site or repository public.

## Draft introduction

> I’ve been building ArtistWave, a browser music workspace for exploring artists and styles, previewing recordings from supported sources when they’re available, and organizing local and online tracks into playlists. You can also use a compact player and a routine-planning workspace. Local audio stays on your device; optional Google sync is for library metadata. It isn’t a complete commercial catalog, so online availability depends on the source. I’m looking for a few music explorers and dance/routine builders to try it and tell me what feels confusing.

Add the verified site link only after the canonical deployment is reachable. Do not publish this draft automatically.

## Current launch blockers

- The README and in-app Google setup text use the `acsdd` site origin. GitHub reports the repository is **public** and Pages is enabled, which conflicts with the earlier private-preparation direction; do not change visibility or deploy as part of this checklist. Verify the live site and confirm that the existing Google OAuth client allows that origin.
- The README opening and version label now describe the current v3.4 preview. The detailed feature history remains below for people who want implementation detail.
- The live `acsdd.github.io/ArtistWave/` address could not be confirmed from the available browser check. Verify it in a real browser and inspect the latest Pages workflow run.
- A purpose-made SVG social preview is included; confirm the intended social platforms accept it or export a PNG before announcement. Provider behavior, Google sign-in, mobile layout, and browser installation still need a clean-user release pass. The actual captioned recording remains to be captured.

## Channel notes

- Product Hunt’s current guide allows makers to prepare a product listing and save it as a draft. Use its own launch guide when the page and demo are ready: https://help.producthunt.com/en/articles/17350772-launch-guide
- Reddit’s anti-spam guidance says self-promotion is not automatically spam, but communities can have stricter rules and repeated unsolicited promotion can be treated as spam. Check each community’s rules and participate genuinely before sharing: https://support.reddithelp.com/hc/en-us/articles/360043504051-Spam

## Early signal to watch

For the private test, count whether people can finish the artist-to-playlist journey without help, note which provider/playback failures occur, and ask whether they would return for another session. Use direct tester feedback rather than adding analytics before there is a clear need.
