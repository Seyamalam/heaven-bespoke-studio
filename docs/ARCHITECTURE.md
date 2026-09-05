# Architecture

## Stack

React + TypeScript + Vite for a deployable static site. Plain CSS design tokens and responsive layouts. Three.js through React Three Fiber and Drei, split into an on-demand module. Blender Python script generates reproducible GLB furniture models. Vitest covers preference validation and inquiry serialization; browser checks exercise the real journey.

## Modules

- `src/App.tsx`: editorial page and section composition.
- `src/components/Configurator.tsx`: selection state, material tray, model loading boundary, save controls.
- `src/components/FurnitureScene.tsx`: GLB rendering, camera controls, material updates, dimensions.
- `src/components/Consultation.tsx`: accessible dialog, user input, message preview, explicit WhatsApp action.
- `src/lib/design.ts`: typed furniture/finish data, local preference validation, message construction.
- `src/styles.css`: tokens, editorial layouts, responsive and reduced-motion rules.
- `public/images`: optimized concept interiors and model poster images.
- `public/models`: generated GLB exports.
- `scripts/build_furniture.py`: Blender source for models and poster renders.
- `assets/source`: original generated imagery / Blender source retained where practical.

## Data and behavior

App owns the current furniture, upholstery, wood finish, width, and active room. Configurator changes that state and inquiry consumes it. Only a versioned, validated preference object is stored in localStorage. Reads/writes tolerate unavailable or malformed storage. Personal details live only in dialog state.

WhatsApp destination is the business number from the brief. Build message with encodeURIComponent; open only on user interaction. No remote form submission, server, cookies, analytics, or API keys are needed.

## Rendering strategy

Serve the hero as an optimized responsive image with fixed dimensions and high fetch priority. Below-fold imagery uses lazy loading. Load Three.js and GLB only after requesting the 3D view. Show a poster before load and retain working selectors/inquiry if WebGL fails. Use demand rendering and limited pixel ratio. Avoid continuous GPU animation.

## Asset contract

Models use named materials `Fabric`, `Wood`, `Brass`; configurator clones loaded models and materials before mutation. Models share consistent meter-based scale and ground plane at y=0 after glTF export. Public geometry is original procedural design and is labeled illustrative.

## Deployment

`npm run build` outputs `dist/` for any static host. SPA has no pathname routes. GitHub repository starts private; no secrets or local environment files are committed. CI runs lint/typecheck, tests, and build.

## Material light study with vgpu

`MaterialLab.tsx` is a lazy native dialog. `materialGpu.ts` owns the GPU lifecycle and loads `src/shaders/material.wgsl` as a raw Vite string. The WGSL fragment shader creates woven upholstery and timber grain, estimates surface normals, and shades with movable light and warmth. Finish selection updates the same `Design` object consumed by the Three.js scene and inquiry.

The canvas surface must be rendered within `frame(gpu, callback)`. Uniform changes are coalesced into a single animation frame; there is no idle render loop. The canvas is resized with a bounded pixel ratio. Closing the dialog disconnects the observer, cancels pending frames, and disposes GPU resources. Unsupported devices use pre-rendered assets while keeping finish selection available.

`scripts/render_materials.mjs` uses `vgpu/node` to render seven still previews from the exact shader. It reads real GPU pixels and asserts opacity, visible variation, and response to relighting. Standard CI has no native GPU requirement.

## Deferred 3D loading boundary

Resolve `useGLTF` in `FurnitureScene` before mounting the R3F canvas. Suspending the model inside a newly created canvas caused reproducible context loss in the tested browser; moving the asset boundary outside the canvas resolved it. The viewer listens for context loss, shows the poster, preserves choices, and offers a fresh canvas on retry.

The production 3D chunk is approximately 976 kB minified / 262 kB gzip, loaded only on request. The base application is approximately 230 kB / 73 kB gzip; the material study is a separate approximately 139 kB / 45 kB gzip chunk. Vite's large-chunk warning is retained and documented rather than hidden.

## Room extension and Vercel

`RoomExplorer.tsx` owns room-only state and accessible controls. `RoomScene.tsx` is deferred until entry, resolves all three GLBs before mounting Canvas, and composes procedural architecture with shared `FurnitureObjects.tsx` rendering. `roomShaders.ts` holds three original GLSL surface shaders. `room.ts` defines curated arrangements, wall tones, and view labels. Furniture finishes and the selected piece remain in the application `Design` state. Room arrangements, lighting, and wall colors are exploratory and are not saved or included in the inquiry.

Only the active editorial hero image is mounted. The two 3D experiences share one bundled rendering dependency; the base application grows to approximately 75 kB gzip while the room scene itself adds approximately 4 kB on request. The combined GLBs shrink to 577 kB through material-compatible mesh joining and Meshopt compression. See `ROOM-EXPERIENCE.md` for measured numbers.

`vercel.json` specifies Vite, `npm run build`, and `dist`. `.vercelignore` excludes editable asset sources and documentation from deployment upload. Local Vercel linking and authentication files are gitignored. Production is available at https://heaven-bespoke-studio.vercel.app.
