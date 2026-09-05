# Room planning, sharing, and baked light

## Authorized scope

Add portable room links, direct furniture placement with measurements, and Blender-baked architectural lighting. Preserve the existing consultation path, rendering-on-demand behavior, mobile controls, and public Vercel deployment.

## State and sharing

A versioned URL fragment carries only validated design preferences, room settings, and three furniture poses. Parsing rejects malformed, oversized, unsupported, or out-of-range data. No names, messages, or contact details go into a link. Reading a link restores the plan but leaves GPU entry explicit. An editable URL field remains available when clipboard access is unavailable.

## Placement

Use an explicit Arrange mode, with ground-plane pointer dragging and disabled orbit while arranging. Snap positions to 5 cm; clamp rotated furniture footprints to the room envelope. HTML sliders and rotation buttons provide equivalent keyboard/touch placement. Show approximate wall clearances and an overlap warning. These are illustrative layout measurements, not an installation survey.

## Baked light

Bake the static floor and rear wall in Blender Cycles: ambient occlusion plus indirect bounce light. Exclude furniture so moving it cannot leave baked furniture shadows. Blend these textures with the dynamic room light and real-time furniture shadows. Keep original .blend and PNGs, convert served textures to WebP, and load them only with the room.

## Acceptance

Round-trip share state; reject unsafe links; verify rotated bounds and placement snapping with tests. Exercise dragging, numeric controls, overlap feedback, share link restore, mobile layout, real GPU shader compilation, and idle rendering. Commit and deploy after validation.
