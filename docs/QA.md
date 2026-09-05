# Verification plan

## Automated checks

TypeScript and lint for module contracts and hooks; production build for static deployment. Unit tests validate persisted preference parsing, min/max widths, unsafe/corrupt storage data, and WhatsApp message serialization for different furniture types. Browser journey checks verify switching rooms, changing finishes, saving/restoring, opening/closing the dialog, and inquiry payload.

## Browser acceptance

Test desktop and mobile views; no horizontal overflow, visible primary CTA, readable type, no clipped dialogs. Exercise keyboard navigation, focus return, Escape dismissal, reduced motion, 3D loading, drag rotation, material updates, dimension toggle, reset, and no-WebGL fallback. Inspect console for runtime errors and failed local requests. Verify links against brief. Avoid sending an actual inquiry during testing.

## Results

Pending implementation.
