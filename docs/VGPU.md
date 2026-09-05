# vgpu: a useful reason to interact

Read the [agent getting-started guide](https://vgpu.sh/docs/get-started/agents) and installed `vgpu@0.4.0`. The local `vgpu doctor` successfully rendered on the Mac's Metal GPU.

## Implemented opportunity: material confidence before consultation

Furniture finish decisions depend on texture and light. A flat color swatch communicates only part of that choice. The material study lets a visitor move a light across woven upholstery or wood grain, shift from daylight to warm evening light, and magnify the surface. Choosing a finish updates the 3D concept and follows the visitor into the consultation inquiry.

This supports the hackathon's emphasis on UX and conversion: each interaction produces a usable preference for a designer. The visitor can use the page and inquire without loading either GPU experience.

## One shader, two destinations

- Browser: `init`, `surface`, `effect`, and `frame` render an interactive canvas only when input changes.
- Local asset production: `vgpu/node` renders the same WGSL shader into seven WebP textures.
- Verification: shader validation plus actual GPU readback checks opacity, detail variation, and a measurable response to light changes.
- Compatibility: generated textures are used as still previews when WebGPU is absent. Finish selection remains functional; lighting controls are disabled clearly.

Sources: `src/shaders/material.wgsl`, `src/lib/materialGpu.ts`, `src/components/MaterialLab.tsx`, `scripts/render_materials.mjs`.

## Deliberate limits

The shader is an original illustrative material study, not a calibrated simulation of actual Heaven fabric or wood. Screen color, physical samples, and final dimensions must be confirmed with the business. The study controls close-up lighting; the 3D viewer has its own day/evening lighting controls.

The npm package is a rendering tool, not an image generator or a substitute for Blender geometry. Blender supplies the original furniture meshes; generated interiors provide the editorial imagery; vgpu supplies interactive material shading and reproducible texture assets.

## Future extensions, not implemented

1. Add photographed and measured Heaven material samples to make the study a real selection tool.
2. Offer a downloadable consultation moodboard combining the selected furniture, finish, dimensions, and room notes.
3. Add two-material comparison under the same light when the brand has an approved sample catalog.

These are intentionally outside the current build. The present studio already connects selection to a concrete inquiry without an account or server.
