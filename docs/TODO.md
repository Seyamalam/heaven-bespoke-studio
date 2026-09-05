# Implementation checklist

## Foundation

- [x] Read hackathon and company brief.
- [x] Define product requirements and editorial design direction.
- [x] Document architecture, asset policy, verification, and submission.
- [x] Create remote GitHub repository and push planning checkpoint.
- [x] Scaffold React/TypeScript/Vite and CI.

## Assets

- [x] Generate living, bedroom, dining, and material imagery.
- [x] Inspect and optimize imagery; register prompts and provenance.
- [x] Create original sofa, lounge chair, and coffee table models in Blender.
- [x] Export GLBs and poster renders; inspect scale and appearance.

## Build

- [x] Responsive navigation and editorial hero with room switching.
- [x] Interactive collection exploration and material/craft content.
- [x] Furniture configurator with rotation, finishes, dimensions, and reset.
- [x] Save and restore a design locally.
- [x] Consultation dialog with editable WhatsApp inquiry.
- [x] Mobile sticky action, FAQ, contact links, accessibility and reduced motion.

- [x] vgpu live material study with light, warmth, magnification, and seven generated fallback assets.
- [x] Verify WGSL and native GPU pixel output.

## Verification and delivery

- [x] Typecheck/lint, unit tests, and production build.
- [x] Desktop/mobile browser interaction checks.
- [x] Validate GLB loading and material changes in browser.
- [x] Keyboard, no-WebGL fallback, storage failure and inquiry checks.
- [x] Visual critique and polish.
- [x] Update documents, push commits, provide preview and repo link.
- [ ] Resolve GitHub account billing/spending restriction and establish a successful hosted CI run.
- [x] Public Vercel deployment connected to GitHub.
- [ ] Screen recording, public social post and Google Form submission (release steps).

## Commit cadence

Commit meaningful working milestones: docs → scaffold → generated assets → editorial experience → configuration/inquiry → verification/polish. Push checkpoints to remote. Do not commit secrets, caches, or test output.

## Interactive room extension

- [x] Room architecture, selectable furniture, camera presets, arrangements, wall tones, lighting, and curtains.
- [x] Shared rendering, demand-driven frames, mobile camera fitting, quality controls, and model compression.
- [x] Original floor, rug, and artwork shaders, verified through the real browser renderer.

## Room planning and sharing

- [x] Versioned, validated, portable room links without personal inquiry data.
- [x] Drag placement, 5 cm snapping, rotated room bounds, keyboard controls, edge measurements, and overlap feedback.
- [x] Per-piece widths retained in room state and links.
- [x] Optional room-plan link in the consultation message.
- [x] Blender Cycles occlusion/bounce bakes, compressed delivery, and reproducible source.
- [x] Desktop pointer journey, mobile layout, fresh-page restore, and inquiry opt-out verified.
