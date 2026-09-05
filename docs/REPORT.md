# Delivery report — September 5, 2026

## Delivered

A working static React/TypeScript application for Heaven Furniture Mart with an editorial landing page, three-piece 3D configurator, vgpu material study, saved design preferences, and guided WhatsApp consultation.

Four original generated interior/material images, three original Blender furniture models with editable source and poster renders, and seven vgpu-generated material textures are included. Responsive images, self-hosted fonts, deferred GPU modules, and on-demand rendering keep the first visit focused on the page and consultation.

Product requirements, design direction, architecture, implementation checklist, asset provenance, GPU workflow, QA results, and hackathon release instructions are in `docs/`. Source prompts and reproducible asset scripts are retained.

## Repository and local preview

[Private GitHub repository](https://github.com/Seyamalam/heaven-bespoke-studio). Meaningful commits cover planning, scaffolding, assets, page/inquiry, vgpu integration, and verification/documentation.

The current local production preview runs at http://127.0.0.1:4173 while its process is running. Restart with `npm run build && npm run preview`. The development server is available through `npm run dev`.

## Evidence

39 unit tests, lint, TypeScript, and the production build pass. Native vgpu doctor and shader validation pass; all seven GPU-generated textures pass pixel checks. Desktop/tablet/phone-width checks, configuration, material lighting, save/restore, inquiry review, focus restoration, and actual WebGL loss/retry were exercised in Chrome. Production page loading was checked to confirm that the 3D and material-study chunks are absent until requested.

GitHub Actions is currently blocked before job startup by an account billing/spending-limit restriction. The local verification results above are complete; a successful hosted CI run remains pending that account issue.

## Practical limits

- Generated images, models, and finishes are disclosed as illustrative concepts.
- The inquiry opens WhatsApp for the visitor to review and send; it is not a server-backed lead database.
- The site is publicly deployed on Vercel; the hackathon entry has not been submitted.
- Physical Safari/Android device checks remain for release. Current mobile checks use resized desktop Chrome.
- The deferred 3D bundle triggers Vite's size warning. It is approximately 262 kB gzip and does not load with the initial page.

## Next release steps

Test the public Vercel URL on real phones, record the 60–90 second interaction, publish the authorized public social entry with the required hashtag, and complete the organizer's form before the published deadline. See `SUBMISSION.md` for the sequence and recording script.

## Interactive room and public launch

The follow-up release adds a complete interactive cutaway room with furniture selection, arrangements, camera transitions, wall tones, curtains, day/evening lighting, and a floor lamp. Three architectural shaders complement the existing vgpu material study. Shared model rendering and Meshopt compression reduce furniture delivery by 56% and primitive count by 91%. The room stops rendering when idle; its scene module adds approximately 4 kB gzip to the existing deferred 3D runtime.

Live site: https://heaven-bespoke-studio.vercel.app. Vercel is linked to the GitHub repository. Source assets and local authentication metadata are excluded from deployment upload. See `ROOM-EXPERIENCE.md` for design and performance details.

## Room planning release

Shareable room links, furniture dragging with measurements, per-piece widths, and Blender-baked architectural lighting are implemented. Room links restore finishes, layout, sizes, and mood without personal details. Consultation can carry the plan link with a visitor-controlled checkbox. Keyboard controls complement dragging; collisions produce a visible overlap warning. Four lighting textures add about 83 kB on room entry. See `ROOM-PLANNING.md` for provenance, architecture, and verification.
