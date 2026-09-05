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
