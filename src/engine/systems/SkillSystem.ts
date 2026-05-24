import { World } from '../World';
import { ObjectPool } from '../ObjectPool';
import { useGameStore } from '../../store/gameStore';

/**
 * Manages passive status updates:
 * 1. Kinetic Shield charges (1 stack / 10s, max 3)
 * 2. Aether Burn DoT ticking (1 tick per second)
 * 3. Freeze duration updates (shatters frozen targets on fire damage if Synergy active)
 */
export function SkillSystem(world: World, dt: number): void {
  // Fetch active skills from Zustand store
  const { runStats } = useGameStore.getState();
  const skills = runStats.skillsCollected;

  const hasShield = skills.includes('Kinetic Shield');
  const hasPlasmaStorm = skills.includes('Plasma Storm') || 
    (skills.includes('Aether Burn') && skills.includes('Chain Lightning')); // auto-synergy if both fire and elec tags active

  // 1. Locate player to update shield stacks
  let playerIdx = -1;
  for (let i = 0; i < world.maxEntities; i++) {
    if (world.active[i] === 1 && world.tagIsPlayer[i] === 1) {
      playerIdx = i;
      break;
    }
  }

  if (playerIdx !== -1) {
    // Decrement player status timers (like Shadow-9 invisibility)
    if (world.aiStateTimer[playerIdx] > 0) {
      world.aiStateTimer[playerIdx] = Math.max(0, world.aiStateTimer[playerIdx] - dt);
    }

    // Execute Core Restoration: Heal construct to 100% integrity
    if (skills.includes('Core Restoration')) {
      world.statsHP[playerIdx] = world.statsMaxHP[playerIdx];
      ObjectPool.spawnPopup(world, world.transformX[playerIdx], world.transformY[playerIdx] - 25, 0, true); // trigger special HEAL popup
      
      const cleanSkills = skills.filter(s => s !== 'Core Restoration');
      useGameStore.getState().setRunStats({ skillsCollected: cleanSkills });
    }

    if (hasShield && world.playerShields < 3) {
      if (world.playerShields < 3) {
        world.playerShieldTimer -= dt;
        if (world.playerShieldTimer <= 0) {
          world.playerShields++;
          world.playerShieldTimer = 10.0; // reset
          
          // Visual indicator of shield gain
          ObjectPool.spawnPopup(world, world.transformX[playerIdx], world.transformY[playerIdx] - 25, 0, true); // Spawn a special shield text popup
        }
      }
    }
  }

  // 2. Iterate all active entities to update status states (burn & freeze)
  for (let i = 0; i < world.maxEntities; i++) {
    if (world.active[i] === 0) continue;

    // --- ENEMY STATUS TRACKING ---
    if (world.tagIsEnemy[i] === 1) {
      // A. Decrement Freeze duration
      if (world.aiStateTimer[i] > 0) {
        world.aiStateTimer[i] -= dt;
        // Force speed to zero while frozen
        world.transformVx[i] = 0;
        world.transformVy[i] = 0;
      }

      // B. Tick Aether Burn DoT
      // projectileTimer[enemy] tracks remaining burn duration
      // statsINT[enemy] tracks the burn tick damage amount
      if (world.projectileTimer[i] > 0) {
        const oldTimer = world.projectileTimer[i];
        const newTimer = Math.max(0, oldTimer - dt);
        world.projectileTimer[i] = newTimer;

        // Tick damage exactly once per second boundaries
        if (Math.floor(oldTimer) !== Math.floor(newTimer) && newTimer >= 0) {
          const dmg = world.statsINT[i]; // Inherited tick damage
          
          // Apply burn tick damage (no crit)
          applyStatusDamage(world, i, dmg);

          // Plasma Storm Synergy: Burn tick has 20% chance to chain lightning
          if (hasPlasmaStorm && Math.random() < 0.20) {
            triggerPlasmaChain(world, i, dmg * 0.8);
          }
        }
      }
    }
  }
}

/**
 * Apply damage directly from a status condition.
 */
function applyStatusDamage(world: World, victim: number, damage: number): void {
  // Non-linear defense mitigation
  const def = world.statsDEF[victim];
  const dmgReduction = 100 / (100 + def);
  const finalDamage = Math.max(1, Math.floor(damage * dmgReduction));

  world.statsHP[victim] -= finalDamage;

  // Float fire-colored damage number (we use regular popup)
  ObjectPool.spawnPopup(
    world,
    world.transformX[victim],
    world.transformY[victim] - 20,
    finalDamage,
    false
  );

  // Check for death
  if (world.statsHP[victim] <= 0) {
    const vx = world.transformX[victim];
    const vy = world.transformY[victim];
    world.destroyEntity(victim);
    
    // Log kill
    const store = useGameStore.getState();
    store.setRunStats({
      enemiesKilled: store.runStats.enemiesKilled + 1
    });

    // Spawn EXP Orb
    ObjectPool.spawnOrb(world, vx, vy, 15);
  }
}

/**
 * Spawns chain lightning arc from a burn tick.
 */
function triggerPlasmaChain(world: World, originIdx: number, damage: number): void {
  const ox = world.transformX[originIdx];
  const oy = world.transformY[originIdx];
  
  // Find nearest enemy to bounce to
  let nextTarget = -1;
  let minDist = Infinity;

  for (let e = 0; e < world.maxEntities; e++) {
    if (world.active[e] === 1 && world.tagIsEnemy[e] === 1 && e !== originIdx) {
      const dx = world.transformX[e] - ox;
      const dy = world.transformY[e] - oy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist && dist < 120) {
        minDist = dist;
        nextTarget = e;
      }
    }
  }

  if (nextTarget !== -1) {
    // Spawn electric bolt projectile arcing toward next target
    const tx = world.transformX[nextTarget];
    const ty = world.transformY[nextTarget];
    const vx = tx - ox;
    const vy = ty - oy;
    
    // Find player index to act as owner
    let playerIdx = -1;
    for (let i = 0; i < world.maxEntities; i++) {
      if (world.active[i] === 1 && world.tagIsPlayer[i] === 1) {
        playerIdx = i;
        break;
      }
    }

    const ownerId = playerIdx !== -1 ? playerIdx : originIdx;
    
    // Spawn Tesla bounce bolt
    ObjectPool.spawnProjectile(
      world,
      ownerId,
      ox,
      oy,
      vx,
      vy,
      4, // Type 4 = Tesla Chain
      damage / Math.max(1, world.statsATK[ownerId]), // normalized damage multiplier
      400,
      1,
      0, // 0 bounces left
      8
    );
  }
}
