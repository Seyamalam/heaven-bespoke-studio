# Delivery report — September 5, 2026

## Delivered

A working static React/TypeScript application for Heaven Furniture Mart with an editorial landing page, three-piece 3D configurator, vgpu material study, saved design preferences, and guided WhatsApp consultation.

Four original generated interior/material images, three original Blender furniture models with editable source and poster renders, and seven vgpu-generated material textures are included. Responsive images, self-hosted fonts, deferred GPU modules, and on-demand rendering keep the first visit focused on the page and consultation.

Product requirements, design direction, architecture, implementation checklist, asset provenance, GPU workflow, QA results, and hackathon release instructions are in `docs/`. Source prompts and reproducible asset scripts are retained.

## Repository and local preview

[Private GitHub repository](https://github.com/Seyamalam/heaven-bespoke-studio). Meaningful commits cover planning, scaffolding, assets, page/inquiry, vgpu integration, and verification/documentation.

The current local production preview runs at http://127.0.0.1:4173 while its process is running. Restart with `npm run build && npm run preview`. The development server is available through `npm run dev`.

## Evidence

18 unit tests, lint, TypeScript, and the production build pass. Native vgpu doctor and shader validation pass; all seven GPU-generated textures pass pixel checks. Desktop/tablet/phone-width checks, configuration, material lighting, save/restore, inquiry review, focus restoration, and actual WebGL loss/retry were exercised in Chrome. Production page loading was checked to confirm that the 3D and material-study chunks are absent until requested.

## Practical limits

- Generated images, models, and finishes are disclosed as illustrative concepts.
- The inquiry opens WhatsApp for the visitor to review and send; it is not a server-backed lead database.
- There is no public deployment or submitted hackathon entry yet.
- Physical Safari/Android device checks remain for release. Current mobile checks use resized desktop Chrome.
- The deferred 3D bundle triggers Vite's size warning. It is approximately 262 kB gzip and does not load with the initial page.

## Next release steps

Deploy `dist/` to a public HTTPS static host, test that URL on real phones, record the 60–90 second interaction, publish the authorized public social entry with the required hashtag, and complete the organizer's form before the published deadline. See `SUBMISSION.md` for the sequence and recording script.
