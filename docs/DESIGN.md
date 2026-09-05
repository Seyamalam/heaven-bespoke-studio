# Design direction

## The Bespoke Studio

The subject is custom furniture for Chattogram homeowners. The page's job is to turn a furniture preference into a consultation. It should feel welcoming and specific to materials, not like a catalog.

## Tokens

| Name | Value | Purpose |
| --- | --- | --- |
| Lagoon | #173D36 | Core brand field and primary actions |
| Porcelain | #F5F3ED | Main reading surface |
| Linen | #E7E2D8 | Configurator stage and secondary panels |
| Walnut | #302B26 | Body text |
| Brass | #B89963 | Small material accents |
| Chalk | #FFFFFF | Hero type and highlights |

Typography: Cormorant Garamond display, Manrope for text and controls. Large expressive serif hero paired with compact, legible UI. Host fonts locally.

## Layout alternatives

Option A: split editorial cover + wide interior / material samples (selected).

```
LOGO                  Rooms  Our craft  The studio      CONSULT
------------------------------------------------------------
              A home, unmistakably yours.
         Bespoke furniture. Made around your life.
                     [Consultation]
 [        full-width architectural interior image          ]
 [ room selectors                          explore indicator]
              collection editorial / room tabs
 [        interactive model        ][ finish / size / save ]
          craftsmanship / process / inquiry / footer
```

Option B: full-screen camera-driven room. Rejected for primary navigation because it obscures the consultation path and complicates mobile browsing.

## Signature

A tangible material tray beside a live furniture model. Material choices affect the model and the consultation message, connecting exploration to a business action. Keep surrounding sections quiet.

## Critique before implementation

The brief specifically requests ivory, teal, wood, and serif type, so that palette is intentional. To avoid generic luxury-template output: use architectural cropping, large offset editorial titles, room-specific imagery, a tactile sample tray, and honest process content. No invented testimonials, excessive badges, cursor replacement, or floating decorative particles.

## Interaction and motion

Room tabs crossfade imagery; selected sample rings show current finish. Hover states gently elevate image interest, without hiding content. Scroll reveal uses progressive enhancement and respects reduced motion. Model rotation is user-driven. Mobile uses native scrolling and thumb-friendly controls.
