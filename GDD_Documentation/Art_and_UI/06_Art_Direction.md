# Aether-Core GDD: Art Direction & Design Language

## 6.1 Core Aesthetic Philosophy: "Aetherpunk"
Aetherpunk represents the juxtaposition of raw, mechanical grit and hyper-clean, vibrant magical energy.
*   **The Physical:** Heavy, aged metals. Brass gears, copper piping, and darkened steel.
*   **The Magical:** Pure, luminous energy. Neon cyan, brilliant magenta, and blinding white.
*   **The Environment:** The "Void." Deep, dark backgrounds that allow the luminous elements to act as the primary light sources. 
*   **The Interface:** Glassmorphism. UI panels should feel like translucent, frosted glass overlaid on the mechanical/magical world beneath.

## 6.2 Color Palette (Design Tokens)

### Backgrounds (The Void)
*   `--color-bg-primary`: `#0B0C10` (Deep Space Dark - Use for base backgrounds)
*   `--color-bg-secondary`: `#1F2833` (Slate Charcoal - Use for elevated panels)

### Primary Accents (Aether Energy)
*   `--color-aether-cyan`: `#00E5FF` (Main brand color, player energy, EXP orbs)
*   `--color-aether-magenta`: `#FF00E5` (Enemy energy, danger indicators, high-tier drops)
*   `--color-aether-glow`: `rgba(0, 229, 255, 0.6)` (Used for `box-shadow` to create emission)

### Structural Elements (Metals)
*   `--color-brass`: `#B5A642` (Used for UI borders, non-active buttons, mechanical trims)
*   `--color-copper`: `#CB6D51` (Used for secondary structural elements and rustic accents)

### Semantic Colors
*   `--color-hp-full`: `#39FF14` (Neon Green)
*   `--color-hp-low`: `#FF3131` (Neon Red)
*   `--color-crit`: `#FFE135` (Electric Yellow)

## 6.3 Typography System
To achieve a modern, premium feel, avoid browser default fonts.
*   **Primary Font (`Outfit`):** A geometric sans-serif with a futuristic edge. Use exclusively for large Headers (`H1`, `H2`), Numbers, and Damage Pop-ups.
    *   *Weight:* 700 (Bold) for Headers, 800 (Extra Bold) for Damage.
*   **Secondary Font (`Inter`):** Highly legible and clean. Use for body text, skill descriptions, and small UI labels.
    *   *Weight:* 400 (Regular) and 500 (Medium).

## 6.4 UI Component Guidelines
*   **Containers (Glassmorphism):** 
    *   Background: `rgba(31, 40, 51, 0.4)`
    *   Backdrop Filter: `blur(12px)`
    *   Border: `1px solid rgba(181, 166, 66, 0.3)` (Faint brass outline)
*   **Buttons (Active):**
    *   Background: Transparent.
    *   Border: `2px solid var(--color-aether-cyan)`
    *   Text Color: `var(--color-aether-cyan)`
    *   Hover State: Background becomes `var(--color-aether-cyan)`, Text becomes `#0B0C10`, add `box-shadow: 0 0 15px var(--color-aether-cyan)`.

## 6.5 Animation & Micro-Interactions
Dynamic movement is critical for a premium feel.
*   **Easing Curve:** Use `cubic-bezier(0.25, 1, 0.5, 1)` for snappy, mechanical pop-ins that settle smoothly.
*   **Hover Transitions:** Base duration of `0.2s` for color/glow changes.
*   **The Auto-Roulette:** The spinning UI must use a staggered decelerating animation, ending with a scale "pop" (`scale(1.1)`) and a screen-space flash (`backdrop-filter: brightness(1.5)`) when the final skill is locked in.
