# Heaven — The Bespoke Studio

An interactive furniture landing page for Heaven Furniture Mart, Chattogram, built fresh for the RacDox 2026 hackathon. Explore a room, customize an original 3D furniture concept, inspect its materials under movable light, and carry that direction into a free consultation.

## Run locally

Requires Node.js 22.12+.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. To serve the production output:

```sh
npm run build
npm run preview
```

No API keys or backend are needed. `dist/` can be deployed to a static host. The GitHub repository is private. The live site is [heaven-bespoke-studio.vercel.app](https://heaven-bespoke-studio.vercel.app). Vercel is linked to the repository for deployments.

## What works

- Interactive architectural room with selectable furniture, camera views, arrangements, wall tones, curtains, lighting, and quality controls.
- Drag-to-place furniture, keyboard position/rotation controls, approximate edge clearances, overlap feedback, and per-piece widths.
- Shareable room snapshot links that restore layout, finishes, widths, and mood. Room links can be included in the consultation.
- Blender Cycles ambient-occlusion and indirect-light bakes for the floor and rear wall; furniture shadows remain dynamic.

- Living, bedroom, and dining exploration with original concept imagery.
- Sofa, lounge chair, and coffee table in an on-demand 3D studio.
- Upholstery, timber finish, width, rotation, camera reset, dimensions, day/evening light, and expanded view.
- **vgpu material study:** movable light, warmth, magnification, and finish selection using an original WGSL shader. The same shader generates fallback textures through `vgpu/node`.
- Validated local save/restore of design preferences.
- Accessible consultation dialog with editable inquiry and an explicit WhatsApp handoff.
- Responsive navigation, mobile consultation action, craft accordion, FAQ, and verified contact details from the brief.
- Poster fallback and retry after WebGL loss; still material previews without WebGPU.

## Checks and asset generation

```sh
npm run lint
npm test
npm run build
npm run format:check
npx vgpu doctor
npm run gpu:check
npm run assets:materials
npm run assets:models
npm run assets:lighting
npm run assets:optimize
```

GPU commands require a supported local GPU. They are separate from standard CI. Regenerate editable furniture and GLB/poster exports with Blender:

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background --python scripts/build_furniture.py
npm run assets:models
npm run assets:optimize
```

## Project documents

- [Product requirements](docs/PRD.md)
- [Design direction](docs/DESIGN.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Interactive room and performance measurements](docs/ROOM-EXPERIENCE.md)
- [Room planning, sharing, and baked lighting](docs/ROOM-PLANNING.md)
- [Implementation checklist](docs/TODO.md)
- [Asset register](docs/ASSETS.md)
- [vgpu opportunity and implementation](docs/VGPU.md)
- [Verification results](docs/QA.md)
- [Delivery report](docs/REPORT.md)
- [Hackathon release and recording](docs/SUBMISSION.md)

## Source brief

- [RacDox hackathon](https://www.racdox.com/hackathon)
- [Company brief](https://docs.google.com/document/d/1Acf_Jez9Sw0FamAvBcbm9PgqdJs52ivX1GkOK1a0EuQ/edit)

Generated interiors and furniture models are illustrative design concepts. No model is represented as a verified Heaven product. Business claims are limited to the company brief. This is a competition concept, not the official Heaven website. Personal inquiry details are not persisted; visitors choose whether to send the prepared message in WhatsApp.

To regenerate architectural lighting, run Blender with `--background --python-exit-code 1 --python scripts/bake_room.py`, then `npm run assets:lighting`. Four optimized lighting textures are loaded only with the room. The source `.blend` and PNG maps are retained under `assets/source/lighting/`.
