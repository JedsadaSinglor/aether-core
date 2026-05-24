# Aether-Core GDD: Overview & Core Flow

**Project Name:** Aether-Core (Arcana Automata)
**Genre:** Idle Auto-Battler / Roguelike (Archero-like)
**Platform:** Mobile (9:16 Vertical Portrait)
**Core Philosophy:** "Overseer's Will" — The player acts as the engineer who designs the build and observes the combat results automatically (Zero manual combat).

---

## 1. Game State & Core Flow (System Logic)

The game structure is divided into 4 main Game States:

1.  `STATE_PRE_RUN`: UI screen for players to allocate points and select equipment.
2.  `STATE_COMBAT`: Enter the dungeon where AI controls the automaton's combat 100%.
3.  `STATE_ROULETTE`: Pause time upon leveling up to spin for a skill.
4.  `STATE_GAMEOVER`: Character dies, results are summarized, and returns to `STATE_PRE_RUN`.

---

## 1.2. Zero-Meta Progression Philosophy (Permadeath)
Aether-Core adheres to a "True Roguelike" philosophy. Every run is a fresh start:

*   **Zero-Meta Wipe:** Upon death (HP = 0), all skills, levels, and mid-run upgrades are permanently deleted. No persistent stat upgrades are carried over to future runs.
*   **The 100-Point Baseline:** Every player, regardless of how long they have played, returns to the `STATE_PRE_RUN` with the exact same **100 Aether Points** for stat allocation. Victory depends solely on build engineering and RNG luck, not time invested.
*   **Run Summary:** Before resetting, players are presented with a detailed summary screen (see UI/UX section).


```text
[Flowchart]
Start -> [Pre-Run Setup] -> Generate Player Entity -> Enter Room 
-> [Combat (Auto)] <---> (Kill Enemy) -> Gain EXP
      |                      |
      v                      v (EXP Full)
  (HP <= 0)           [Pause: Auto-Roulette] -> Apply Skill -> Resume
      |
      v
[Game Over] -> Result Screen -> Reset to Start
```

---

## 1.3. Terminology Glossary
*   **Aether Points:** The currency used to allocate base stats before a run. Always resets to 100 per run.
*   **Automaton:** The mechanical/magical construct controlled by the AI Core. The "Player Character".
*   **Overseer:** The player. They engineer the Automaton and watch it perform.
*   **Roulette:** The randomized skill-selection mechanism triggered upon leveling up.
*   **Core / AI Core:** The behavioral logic module dictating the Automaton's movement and targeting in combat.
