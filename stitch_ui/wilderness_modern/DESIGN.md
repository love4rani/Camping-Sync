# Design System Specification: Editorial Wilderness

## 1. Overview & Creative North Star: "The Digital Naturalist"
This design system moves away from the rigid, boxy constraints of traditional utility apps to embrace an editorial, high-end aesthetic. The Creative North Star is **"The Digital Naturalist"**—a philosophy that treats the mobile interface like a premium travel journal. 

We achieve a signature look by breaking the "template" feel through:
*   **Intentional Asymmetry:** Using generous, uneven padding and off-center typography to create a sense of organic movement.
*   **Breathable Composition:** Prioritizing negative space (using our `16` and `20` spacing tokens) to allow content to "sit" rather than "fit."
*   **Tonal Depth:** Replacing harsh dividers with soft shifts in surface color to mimic the layering of a forest canopy.

---

## 2. Colors & Atmospheric Depth
Our palette is rooted in the earth. It is not just a set of backgrounds, but a system of atmospheric layers.

### The "No-Line" Rule
**Standard 1px borders are strictly prohibited.** Boundaries between sections must be defined solely by background shifts. To separate a header from a body, transition from `surface` (#faf9f5) to `surface_container_low` (#f4f4f0). This creates a seamless, high-end "dipped" look.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of paper and glass. Use the following hierarchy for nesting:
1.  **Base Layer:** `surface` (#faf9f5) or `background` (#faf9f5).
2.  **Sectioning:** Use `surface_container` (#efeeea) for large content blocks.
3.  **Interactive Elements:** Use `surface_container_lowest` (#ffffff) for cards to make them "pop" against the off-white background.

### The Glass & Gradient Rule
To achieve a premium "glassmorphism" effect for floating navigation or overlays:
*   **Material:** Use `surface_variant` (#e3e2df) at 60% opacity with a `20px` backdrop-blur.
*   **Gradients:** Use a subtle linear gradient from `primary` (#163422) to `primary_container` (#2d4b37) for Hero CTAs to add "soul" and dimension.

---

## 3. Typography: The Editorial Voice
We utilize **Manrope**, a modern sans-serif that balances geometric precision with organic warmth.

*   **Display (Display-LG/MD):** Used sparingly for "Hero Moments" (e.g., trip titles). These should use `on_surface` (#1b1c1a) and tight letter-spacing (-0.02em) to feel like a magazine masthead.
*   **Headlines (Headline-SM/MD):** The primary storytelling weight. Use these for section headers.
*   **Titles (Title-LG/MD):** For card titles and navigation.
*   **Body (Body-LG/MD):** Designed for high legibility. Use `on_surface_variant` (#424843) for body text to reduce harsh contrast and evoke a softer, natural feel.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too "digital." We use **Tonal Layering** to convey importance.

*   **The Layering Principle:** Place a `surface_container_lowest` card on top of a `surface_container_low` background. The difference in hex code is enough to provide visual separation without the "clutter" of shadows.
*   **Ambient Shadows:** When an element must float (e.g., a Floating Action Button), use a shadow with a `24px` blur, 4% opacity, and a tint derived from `primary` (#163422) rather than pure black.
*   **Ghost Borders:** If a boundary is required for accessibility, use `outline_variant` (#c2c8c0) at **15% opacity**. It should be felt, not seen.

---

## 5. Components: Crafted Primitives

### Buttons (The Interaction Pillars)
*   **Primary:** Background `primary` (#163422), text `on_primary` (#ffffff). Shape: `full` (9999px) for a modern, pebble-like feel. Padding: Spacing `4` (1.4rem) horizontal.
*   **Secondary:** Background `secondary_container` (#fdd6b2), text `on_secondary_container` (#785b3e). No border.
*   **Tertiary:** Text-only using `primary` (#163422), using Spacing `3` (1rem) for touch targets.

### Input Fields (The Quiet Forms)
*   **Container:** Use `surface_container_high` (#e9e8e4) with `xl` (1.5rem) rounded corners. 
*   **State:** On focus, transition the background to `surface_container_lowest` (#ffffff) and add a "Ghost Border."
*   **Labels:** Use `label-md` in `on_surface_variant`. Always place labels *above* the field, never as placeholders.

### Cards & Lists (The Content Feed)
*   **Rule:** Forbid divider lines. 
*   **Execution:** Use Spacing `6` (2rem) as a vertical gap between items. For lists, use a subtle background shift on hover/tap using `surface_bright` (#faf9f5).
*   **Rounding:** All cards must use the `xl` (1.5rem) radius to mirror the softness of nature.

### Exclusive Component: The "Trip Pulse"
*   A specialized tracking component for Camping-Sync. A horizontal scrolling "status" bar using `glassmorphism` (60% `primary_container`) that floats at the top of the screen, providing real-time weather or gear-sync updates.

---

## 6. Do’s and Don’ts

### Do:
*   **DO** use asymmetric margins. For example, a left margin of Spacing `8` and a right margin of Spacing `4` can make a photo gallery feel curated.
*   **DO** use `primary_fixed_dim` (#adcfb4) for subtle icon backgrounds to give them a "leafy" highlight.
*   **DO** prioritize the `20` (7rem) spacing token at the bottom of screens to ensure content doesn't feel cramped by the device's home indicator.

### Don't:
*   **DON'T** use #000000 for text. Use `on_surface` (#1b1c1a) to maintain the organic warmth of the system.
*   **DON'T** use the `DEFAULT` (0.5rem) roundedness for large containers; it feels too "standard." Stick to `xl` (1.5rem) for a premium, custom feel.
*   **DON'T** use high-saturation greens. Only use the provided `primary` (#163422) and its variants to ensure the "Forest" theme stays sophisticated, not "neon."