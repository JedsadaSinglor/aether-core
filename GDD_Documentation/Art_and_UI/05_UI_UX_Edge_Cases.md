# Aether-Core GDD: UI/UX & Edge Case Handling

## 5. UI/UX Design Flow

### 5.1 Aetherpunk Design Tokens
*   **Typography:** Primary: `Outfit` (Headings/Numbers). Secondary: `Inter` (Body Text).
*   **Color Palette:**
    *   *Aether Neon:* `#00E5FF` (Cyan) / `#FF00E5` (Magenta) for energy and magic.
    *   *Brass/Copper:* `#B5A642` / `#CB6D51` for mechanical elements and borders.
    *   *Void Background:* `#0B0C10` (Deep Space Dark) to make neon colors pop.
*   **Aesthetics:** High contrast, glassmorphism overlays, glowing box-shadows.

### 5.2 Interface Wireframes
*   **Lobby/Hangar UI (`STATE_PRE_RUN`):** 
    *   *Top:* Available Aether Points (100) in bright glowing cyan.
    *   *Middle (Left):* Automaton 3D model or sprite showcase.
    *   *Middle (Right):* Base stat allocation +/- buttons, Weapon selection carousel.
    *   *Bottom:* Massive "INITIALIZE SEQUENCE" button.
*   **Combat UI (`STATE_COMBAT`):** 
    *   *Control:* Hidden control buttons (No D-Pad / No Joystick). 100% automated.
    *   *Top:* Player HP bar (Green/Red) and EXP bar (Cyan) spanning the entire width.
    *   *Bottom:* Passive Skill icon bar showing collected buffs.
    *   *Screen Space:* Damage pop-ups with critical hits significantly larger and colored Yellow.

## 5.1 Run Summary Screen (Post-Death)
Designed for social sharing and performance analysis:
*   **Visual Style:** A "Data Diagnostic" readout from the Overseer's terminal.
*   **Key Stats:**
    *   **Max Stage Reached:** (e.g., "Stage 42/50")
    *   **Damage Analysis:** Total damage dealt and DPS (Damage Per Second) charts.
    *   **Final Build:** A visual grid showing the Automaton, Weapon, AI Core, and the full list of Skill combos collected.
*   **Social Action:** A "Share to Community" button that captures the screen for Discord/Social Media.

## 6. Edge Case Handling
1.  **AI Corner Trap:** If Velocity is below threshold for too long, force the automaton to walk through enemies.
2.  **Memory Leak:** Use `Object Pool Pattern`. Do not use `Instantiate` or `Destroy` during Combat.
3.  **Roulette Empty Pool:** If all skills are full, the roulette awards `Full Heal` or `Core Upgrade` instead.

## 7. Performance Budget
*   **Target FPS:** 60 FPS minimum on mid-range devices.
*   **Draw Calls:** Keep below 100 via batching/instancing (especially for Aether Orbs).
*   **Entity Limit:** 1,000 active entities (enemies + projectiles + EXP orbs).
*   **Memory:** Max 500MB heap allocation during `STATE_COMBAT` (Strict Object Pooling).
