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

- Verify the deployed public URL and its HTTPS asset paths.
- Run the same journey on a physical iPhone/Safari and a midrange Android device. Current phone checks are resized Chrome views.
- Confirm production social/contact links and opening hours with the brand if supplied; the page invites visitors to call ahead.
- Record the real screen interaction and complete the hackathon release steps in `SUBMISSION.md`.
