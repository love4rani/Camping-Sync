# Design System Strategy: The Social Campfire

## 1. Overview & Creative North Star
**Creative North Star: "The Digital Glamp-Site"**

This design system rejects the "utilitarian outdoor" aesthetic in favor of a vibrant, social-first experience. We are moving away from the rugged, serious grit of traditional camping apps and leaning into a "Fruity Pop" aesthetic that feels as curated as an Instagram feed but as energetic as a summer festival. 

The system breaks the rigid "enterprise grid" by utilizing **Dynamic Asymmetry** and **Soft-Brutalism**. Instead of perfectly centered, boxed-in content, we use overlapping elements, exaggerated roundedness (`xl` and `full` tokens), and high-contrast color pairings. The goal is a UI that feels "bouncy" and alive—less like a database of campsites and more like a shared digital scrapbook for a generation that views nature through a wide-angle lens.

---

## 2. Colors & Surface Philosophy
The palette is built on high-energy vibrance balanced by a "Soft Cream" base to maintain readability without losing the "pop."

### The "No-Line" Rule
Standard 1px solid borders are strictly prohibited for sectioning. We define boundaries through **Tonal Shifts**. 
*   **Implementation:** A card (using `surface_container_lowest`) should sit on a section background (`surface_container_low`). If more distinction is needed, use a background color shift to `primary_container` (#6dfe9c) to signal a change in context.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of "Fruit-Scented Acrylic." 
*   **Base:** `surface` (#fffbff).
*   **Nesting:** Place a `surface_container` (#f8f4e2) as a parent wrapper, then use `surface_container_highest` (#ece9d4) for interactive elements within it. This creates depth without visual clutter.

### The "Glass & Gradient" Rule
To elevate the "Instagrammable" vibe, use **Glassmorphism** for floating navigation bars or sticky headers. Use `surface` at 70% opacity with a `backdrop-filter: blur(20px)`. 
*   **Signature Gradients:** For high-impact areas (Hero headers, "Join Trip" buttons), use a linear gradient from `primary` (#007439) to `primary_container` (#6dfe9c) at a 135-degree angle. This adds a "juicy" polish that flat color lacks.

---

## 3. Typography: Bold & Approachable
The typography strategy pairs the expressive **Plus Jakarta Sans** for high-impact display moments with the highly legible **Be Vietnam Pro** for utility.

*   **Display & Headline (Plus Jakarta Sans):** Used for "The Hook." These should be set with tight letter-spacing (-2%) to feel chunky and impactful. Use `display-lg` for trip titles to make them feel like magazine headers.
*   **Body & Labels (Be Vietnam Pro):** This is our workhorse. Even though the vibe is "fun," the utility must remain high. Use `body-lg` for campfire descriptions and `label-md` for metadata (lat/long, weather).
*   **Visual Hierarchy:** Use `secondary` (#9d4f00) for sub-headlines to create a warm, sunset-inspired contrast against the `primary` greens.

---

## 4. Elevation & Depth: Tonal Layering
We avoid the "default" look by replacing mechanical shadows with organic, ambient depth.

*   **The Layering Principle:** Instead of a shadow, place a `surface_container_lowest` card on a `surface_dim` background. The slight shift in "creaminess" provides enough signal for the eye to perceive a layer.
*   **Playful Shadows:** When the user request calls for "playful drop shadows," we apply an **Ambient Glow**. Shadows should use the `secondary` color at 8% opacity with a blur of `24px` and a `Y` offset of `8px`. This makes the element feel like it’s floating over a warm light source.
*   **The "Ghost Border" Fallback:** If a border is required (e.g., in a high-density list), use the `outline_variant` token at **15% opacity**. A solid 100% stroke is too "heavy" for this energetic system.

---

## 5. Components

### Buttons (The "Juicy" Interaction)
*   **Primary:** Fully rounded (`full`), background `primary`, text `on_primary`. Apply the "Playful Shadow" mentioned above. On hover, transform `scale(1.05)`.
*   **Secondary:** `secondary_container` background with `on_secondary_container` text. No shadow; use a `Ghost Border` instead.
*   **Sizing:** Use Spacing Scale `6` (2rem) for vertical padding in Hero CTAs to give them a "chunky," touchable feel.

### Cards & Lists
*   **Rule:** Forbid divider lines.
*   **Implementation:** Separate list items using the Spacing Scale `3` (1rem). Group related content into cards with `md` (1.5rem) or `lg` (2rem) corner radii. 
*   **Imagery:** All photos must have a `DEFAULT` (1rem) border radius to match the rounded typography.

### Chips (Social Tags)
*   Used for "Amenities" (e.g., #PetFriendly, #Waterfront).
*   Use `tertiary_container` (#fcc025) to make them look like little "sunshine" badges. Use `label-md` for the text.

### Input Fields
*   **Styling:** Background `surface_container_low`, `full` roundedness. 
*   **Interaction:** On focus, transition the background to `primary_container` and add a 2px "Ghost Border" of the `primary` color.

### Custom App Components: "The Vibe-Meter"
A specialized progress bar or rating component using a gradient from `secondary` to `tertiary`. This allows users to rate the "vibe" of a campsite with a chunky, rounded slider thumb.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** lean into white space. Use Spacing Scale `10` or `12` between major sections to let the vibrant colors breathe.
*   **Do** use "Chunky" icons (4px stroke weight minimum) to match the bold typography.
*   **Do** use asymmetrical layouts. For example, a campsite image could be slightly offset from its descriptive text card.

### Don't:
*   **Don't** use pure black (#000000). Always use `on_surface` (#39382d) to keep the "soft cream" warmth intact.
*   **Don't** use sharp corners. Anything less than `sm` (0.5rem) roundedness will feel "too corporate" for this system.
*   **Don't** use standard Material Design dividers. If you feel the need for a line, use a background color change instead.