# Aether-Core GDD: In-Game System & Mechanics

Upon entering `STATE_COMBAT`, the player cannot control movement or shooting (Observer Mode).

## 3.1 Level Up & Cinematic Auto-Roulette Mechanics
When the Aether Orbs (EXP) bar is full and the automaton levels up, the system triggers an automated skill selection process designed for high impact and zero interruption:

1.  **Cinematic Slow-Motion:** Instead of a hard pause, the game enters a "Dramatic Slow-Mo" state. Action continues at a significantly reduced speed, maintaining the cinematic flow while highlighting the level-up moment.
2.  **The Aether-Punk Roulette UI:** A mechanical slot-machine style interface appears (central or peripheral). Skill icons spin rapidly with high-quality steampunk/magical visual effects.
3.  **Suspenseful Audio Design:**
    *   **The Build-up:** Rapid mechanical clicking sounds (clink-clink-clink) as the gear spins, gradually slowing down to build tension.
    *   **The Jackpot:** Once a skill is selected, a "Grand Chime" or "Magical Burst" sound plays.
4.  **High-Impact Visual Feedback:** A subtle screen flash and VFX burst occur when the skill is locked in, delivering a "Jackpot" satisfaction to the player.
5.  **Auto-Equip & Resume:** The selected skill (e.g., Ricochet) is instantly equipped. Projectile effects change immediately, and game speed ramps back to 100% for seamless combat.

## 3.2 Skill Pool Examples
*   **Multishot:** `ProjectileCount += 1`, `DamageMultiplier *= 0.8`
*   **Ricochet:** `Projectile.BounceCount += 2`
*   **Vampiric Touch:** `OnHit: Player.Heal(Damage * 0.05)`
*   **Overclock:** `Player.AttackSpeed *= 1.25`, `Player.TakeDamage(MaxHP * 0.05)`
*   **Aether Burn (Tag: Fire):** `OnHit: ApplyDOT(Damage * 0.1, Duration=3s)`
*   **Frost Nova (Tag: Ice):** `OnKill: SpawnAOE(Radius=3, Effect=Freeze(1s))`
*   **Chain Lightning (Tag: Elec):** `OnHit: 20% chance to arc to nearest enemy.`
*   **Kinetic Shield:** `Gain 1 Shield stack every 10s (Blocks 1 hit). Max 3.`
*   **Executioner:** `Enemies below 15% HP are instantly killed on hit.`
*   **Magnetic Pull:** `Aether Orb pickup radius increased by 300%.`

## 3.3 Skill Synergy System
Skills contain tags (e.g., `Fire`, `Ice`, `Elec`). Collecting enough tags unlocks hidden powerful traits automatically during combat:
*   **Thermal Shock (Requires 3 Fire + 3 Ice):** `Frozen enemies take 300% damage from Fire attacks and shatter.`
*   **Plasma Storm (Requires 3 Fire + 3 Elec):** `Aether Burn DoT now chains lightning to nearby enemies every second.`

## 3.4 Enemy Types & Boss Mechanics
*   **Swarmers:** Fast, low HP, spawn in groups of 10+. (Test AOE capabilities).
*   **Ranged/Artillery:** Stand outside aggro range and shoot slow projectiles. (Test Kiting Core).
*   **Elites:** High HP/DEF, immune to knockback.
*   **Bosses (Every 10 Stages):** Have a custom State Machine. 
    *   *Example: "The Brass Colossus"* - Sweeps the room with a laser (requires high movement speed or teleport to dodge). Invokes "Bullet Hell" mechanics.

