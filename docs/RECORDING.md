# Hackathon screen recording

The walkthrough records the deployed site at https://heaven-bespoke-studio.vercel.app using real browser mouse and keyboard input. It has no voice, face, music, or audio track. A small injected cursor makes the actual pointer movement and clicks visible; application behavior is unchanged.

## Coverage

- Hero, living/bedroom/dining switching, and collections.
- Live room entry, camera views, both layouts, daylight, lamp, curtains, and upholstery.
- Dragging the chair, rotating it, approximate clearances, and sharing the room.
- Individual 3D furniture rotation, dimensions, width, and saving a direction.
- vgpu material study with moving light, upholstery, wood, and warmth.
- Consultation draft with the shared room link, followed by the process and showroom.

The sample name is fictional. The recording does not send the inquiry, open WhatsApp, post to Facebook, or submit the hackathon form.

## Recorder installation

The npm release was updated globally to agent-browser 0.36.0 and Chrome for Testing 152.0.7977.82 was installed. The npm release did not yet recognize `--fps`; the upstream repository at commit `4a98df7` did. That unmodified source was compiled with Cargo and installed separately at `/Users/seyam/.local/bin/agent-browser-60fps`.

The initial WebM take was discarded after review because the VP8 encoder stalled capture at 1920 × 1080. The final pipeline requests 60 fps and records H.264 directly, then makes a delivery MP4. Frame counts, duration, and a contact sheet are checked before delivery.

## Reproduce

```sh
RECORD_BROWSER_BIN=/Users/seyam/.local/bin/agent-browser-60fps node scripts/record_walkthrough.mjs
```

The script uses its own `heaven-film-60fps` browser session. Recordings, chapter timestamps, and review images are written into the gitignored `artifacts/recording/` directory. Do not commit large video files into the application repository.

The walkthrough uses an ordinary desktop viewport. Mobile behavior was verified separately in the release QA.

## Delivered take

`artifacts/recording/heaven-hackathon-1080p60.mp4` is 69.68 seconds, 1920 × 1080, H.264, 60 fps, 19.34 MB, with 4,181 output frames and no audio stream. The recorder received 1,989 Chrome repaint frames; unchanged views are held between repaints. The raw capture duration matches the walkthrough's wall-clock duration. The delivery encode preserves the timing and frame rate without motion interpolation.

Review covered a twelve-frame contact sheet and full-size samples of the dimension controls and consultation draft. The final recording shows the fictional name, selected 96 cm chair, finish choices, and room link in the draft. No message was sent.
