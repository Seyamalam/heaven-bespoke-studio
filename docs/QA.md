# Verification results

Tested September 5, 2026 on macOS in Chrome using the real local application. Browser tests used the interactive browser tool. No inquiry was sent.

## Automated checks

- ESLint: passed.
- TypeScript + Vite production build: passed.
- Vitest: 18 tests passed, covering saved-state validation, unsafe/corrupt data, width boundaries, unavailable storage, and inquiry serialization. GPU lifecycle tests cover unavailable adapters and closing the dialog before initialization resolves or rejects.
- `vgpu doctor`: native Metal GPU initialized and rendered successfully.
- `vgpu check src/shaders/material.wgsl --require-validation`: passed with no diagnostics.
- Seven material outputs passed GPU pixel assertions for opacity, surface variation, and relighting response.

The production build emits a size warning for the on-demand Three.js chunk. It is not part of the initial page load. No Lighthouse score or cross-browser coverage is claimed.

## Hosted CI status

The workflow is configured, but GitHub Actions reports `startup_failure` before creating any jobs. The authenticated run page states that recent account payments failed or the spending limit needs to be increased. This is an account-level runner restriction, not a failed application test. Local checks above passed. Resolve the GitHub billing/spending restriction and rerun the workflow to establish a hosted green run.

Observed run: https://github.com/Seyamalam/heaven-bespoke-studio/actions/runs/33945426747

## Browser journeys completed

- Desktop, 768 px tablet, 390 px phone, and 360 px phone layouts checked for horizontal overflow; none observed.
- Mobile menu opens, navigates to the studio, and closes correctly.
- Hero room switching and room-specific collection inquiries work.
- All three GLBs load and render on the GPU. Sofa, chair, and table selection resets the width to that piece's starting value.
- Upholstery and wood updates are visible. Width, rotation buttons, camera reset, dimensions, evening lighting, and expanded view were exercised.
- Saving a sofa direction and reloading restores Clay upholstery, Natural oak, and 300 cm width. Explicit restore also works.
- Material study renders live; finish changes update the studio. Light warmth and magnification respond to keyboard range input. Close/Escape restores focus to its trigger.
- Consultation collects the name, optional room dimensions and notes, then presents an editable message. The WhatsApp URL includes the correct business number and selected direction. The message remains unsent.
- Mobile material and consultation dialogs fit the screen and scroll internally. The consultation review step stays usable on mobile.
- Forced WebGL context loss produces the poster and a clear retry message, preserving the selected design. Retry creates a working canvas; context is no longer lost.

- Production build verified: initial page requests contain no furniture GLBs, Three.js viewer chunk, or material-study chunk. These load only after interaction.

## Regression resolved

A model suspended inside a newly mounted R3F Canvas reproducibly lost its WebGL context. A minimal cube rendered correctly; changing shadows and antialiasing did not fix the full model. Resolving the GLB before mounting Canvas fixed the actual failure. The full models and context-loss recovery were then verified in the browser. Temporary debugging artifacts were kept outside the repository and removed from source.

## Remaining release checks

- [x] Public Vercel URL and GLB asset respond with HTTP 200 without authentication.
- Run the same journey on a physical iPhone/Safari and a midrange Android device. Current phone checks are resized Chrome views.
- Confirm production social/contact links and opening hours with the brand if supplied; the page invites visitors to call ahead.
- Record the real screen interaction and complete the hackathon release steps in `SUBMISSION.md`.

## Interactive room extension

- Original room architecture and all optimized furniture render in Chrome with a healthy WebGL context.
- Mobile overview framing was adjusted to keep the complete cutaway inside the canvas. No horizontal overflow at 390 px.
- Camera presets, day/evening slider, floor lamp, and curtains were exercised. The sunlit floor shader was verified after correcting a reserved GLSL identifier. Browser shader diagnostics report no compilation errors.
- Idle rendering verified: the development canvas frame counter remained at 145 across separate observations more than 30 seconds apart after the camera settled. There is no continuous room animation loop.
- Geometry optimization round-trip checks preserve material names and model bounds within 2 mm; total delivery falls from 1,302,092 to 576,556 bytes and primitive count from 89 to 8.
- Vercel production build succeeded independently of the GitHub Actions billing restriction. Live URL: https://heaven-bespoke-studio.vercel.app.
- Public end-to-end checks: entry loads the room only on request; the overhead camera works; forced WebGL loss offers retry and recovers with a healthy context; the room-to-studio action and live vgpu material dialog work on the production domain.
- Consultation handoff verified with a selected 84 cm Pause chair in Deep teal. The editable WhatsApp message contains the matching design and business number. Nothing was sent.
