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

## Implemented and measured

The room now includes three selectable furniture models, four camera views, two arrangements, three wall tones, day/evening lighting, a floor lamp, curtain control, two quality settings, expanded view, and the existing consultation handoff. Three original GLSL shaders shade timber/window light, rug weave/border, and wall artwork. The vgpu close-up material study remains available in the bespoke studio.

| Model | Original bytes | Delivered bytes | Original primitives | Delivered primitives |
| ----- | -------------: | --------------: | ------------------: | -------------------: |
| Sofa  |        290,032 |         124,784 |                  23 |                    3 |
| Chair |        155,956 |          68,680 |                  14 |                    3 |
| Table |        856,104 |         383,092 |                  52 |                    2 |
| Total |      1,302,092 |         576,556 |                  89 |                    8 |

The pipeline uses deduplication, flattening, material-compatible joining, welding, quantization, and Meshopt compression. Round-trip validation checks material names and model bounds within 2 mm. Original uncompressed exports are retained in `assets/source/models/`; Blender writes there and `npm run assets:models` creates the public GLBs.

The room-specific production module is approximately 4 kB gzip, sharing the existing approximately 260 kB GPU/Three.js module with the furniture viewer. It is not downloaded before entry. Geometry files are 56% smaller in aggregate, and their primitive count falls by 91%. This is an asset/work reduction, not a claimed frame-rate percentage.

On-demand rendering follows the [React Three Fiber performance guidance](https://r3f.docs.pmnd.rs/advanced/scaling-performance). Camera transitions invalidate until settled, and low-motion mode snaps directly to the chosen view. Tall mobile framing is bounded by the orbit distance to avoid a transition loop that cannot reach its destination.

Development-only canvas diagnostics expose render-frame counts and shader compilation errors for browser verification; these diagnostics are omitted from production. The floor shader initially used a GLSL reserved identifier. Browser compilation diagnostics identified it; the identifier was corrected and the actual sunlit floor verified.
