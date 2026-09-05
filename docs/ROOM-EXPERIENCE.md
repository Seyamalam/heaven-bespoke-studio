# Interactive room extension

## Direction

Add a complete, explorable living-room scene to the existing furniture consultation journey. Keep navigation, selection controls, and consultation in accessible HTML. The 3D room is an optional immersive surface with a still image before loading.

The signature is a miniature architectural room: original furniture, a timber floor, a framed window, soft curtains, a rug, plants, and wall art. Select furniture directly in the scene or with matching buttons. Explore overview, sofa, reading corner, and overhead camera presets. Switch furniture arrangement, wall tone, and time of day. Finish choices continue into the existing bespoke studio and inquiry.

## Interaction contract

- Enter/leave the live room explicitly; fall back to the existing interior illustration if GPU rendering fails.
- Click furniture to select it; equivalent HTML controls work with the keyboard.
- Move between camera presets, drag to orbit, and zoom within bounds.
- A daylight slider updates room lighting and window-light shading; a lamp toggle offers evening atmosphere.
- Two curated arrangements move furniture together, keeping layout decisions useful and bounded.
- Wall colors and furniture finishes update immediately. No claim of calibrated physical material simulation.
- Carry the selected piece into detailed width customization or consultation.

## Performance work

Share furniture rendering, reuse cached GLBs, optimize geometry delivery, render only on changes, cap mobile pixel ratio, and avoid persistent animation or full-screen postprocessing. Camera transitions invalidate only until settled and respect reduced motion. Decorative shaders depend on light/finish input, not a continuous clock.

Only the active hero image is mounted. All GPU code stays behind an explicit action. Record before/after asset size and verify initial network requests plus live-room frame behavior.

## Visual alternatives considered

A full-screen first-person walkthrough would hide useful controls and add collision/motion costs. The selected cutaway room provides a legible overall layout and visible furniture, with close-up camera presets when needed. It fits the brand's bespoke selection task and the competition's UX weighting.

## Release

Check real browser behavior on desktop and phone widths, run lint/tests/build, push meaningful milestones, deploy the static Vite build to Vercel, and verify the public URL without authentication. Do not send an inquiry or post a social entry during verification.
