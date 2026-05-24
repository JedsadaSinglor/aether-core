# Aether-Core: Arcana Automata

## Project Overview
**Aether-Core** is an Aetherpunk-themed Idle Auto-Battler Roguelike game designed for mobile (9:16 portrait). The core philosophy is **"Overseer's Will"**, where players act as engineers designing autonomous magic-mechanical constructs ("Automatons") to clear dungeons.

### Key Pillars
- **Zero-Meta Progression:** True roguelike experience where every run starts from scratch with a baseline of 100 Aether Points.
- **Observer Combat:** 100% automated combat where build engineering is the primary gameplay.
- **Cinematic Auto-Roulette:** High-impact, automated skill acquisition during level-ups.
- **Aetherpunk Aesthetics:** A fusion of brass, stained glass, and neon arcane energy.

---

## Directory Overview
This directory serves as the **Technical Game Design Document (TGDD)** repository for Project Aether-Core. It contains modularized specifications designed for both human developers and AI coding assistants.

### Key Files in `GDD_Documentation/`
- **[NAVIGATION.md](GDD_Documentation/NAVIGATION.md):** The central index for all documentation.
- **[01_Overview_Flow.md](GDD_Documentation/01_Overview_Flow.md):** Defines project scope, core philosophy, and high-level game states.
- **[02_Pre_Run_Config.md](GDD_Documentation/02_Pre_Run_Config.md):** Details stat allocation, characters (Automatons), weapons, and AI logic cores.
- **[03_Gameplay_Mechanics.md](GDD_Documentation/03_Gameplay_Mechanics.md):** Describes the cinematic auto-roulette system and skill pool.
- **[04_Technical_Specs.md](GDD_Documentation/04_Technical_Specs.md):** Outlines the ECS (Entity-Component-System) architecture and system logic.
- **[05_UI_UX_Edge_Cases.md](GDD_Documentation/05_UI_UX_Edge_Cases.md):** Covers interface design and technical edge-case handling (e.g., memory leaks, AI pathing).

---

## Technical Roadmap (Inferred)
The project is architected for high performance and modularity:
- **Architecture:** Entity-Component-System (ECS) for handling 1,000+ entities.
- **Stack:** Recommended TypeScript/React (UI) and Node.js or high-performance game engine logic.
- **Logic:** State Machine-based AI Cores and Procedural Room Generation.

## AI Operational Mandates
To ensure transparency and maintain project integrity, all AI agents operating in this workspace must adhere to the following protocols:

1.  **Mandatory Plan Approval:** Before performing any modifications to files, documentation, or code, the AI **must** present a detailed action plan to the user and wait for explicit **approval**.
2.  **Action Logging (DOC/LOG):** Every action, change, or decision made by the AI must be recorded in a persistent log (e.g., a `CHANGELOG.md` or a dedicated `LOG/` directory). This log should include:
    *   **Timestamp:** When the change occurred.
    *   **Action Taken:** A summary of the modification.
    *   **Rationale:** Why the change was made according to the approved plan.
    *   **Affected Files:** A list of all files impacted.

---

## Usage
These documents should be provided as context for any development, asset creation, or balancing tasks. AI agents should prioritize reading files in numeric order (01-04) to establish foundational context before implementing features.
