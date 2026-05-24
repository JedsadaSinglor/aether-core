import { World } from '../World';
import { Component, Layer } from '../components';
import { ObjectPool } from '../ObjectPool';
import { useGameStore } from '../../store/gameStore';

// Grid size configuration
const CELL_SIZE = 50;
const COLS = 9; // 450 / 50
const ROWS = 16; // 800 / 50
const TOTAL_CELLS = COLS * ROWS;

// Pre-allocated flat arrays for Spatial Grid (linked list grid)
// Shared across frames to avoid garbage collection
const gridHead = new Int16Array(TOTAL_CELLS);
const gridNext = new Int16Array(1500); // Max entities matching MAX_ENTITIES

/**
 * High-performance Circle-Circle Collision System using Spatial Grid partitioning.
 * Eliminates O(N^2) complexity and executes with zero garbage collection.
 */
export function CollisionSystem(world: World, _dt: number): void {
  // 1. Clear spatial grid
  gridHead.fill(-1);
  gridNext.fill(-1);

  // 2. Populate grid with all active collider entities
  for (let i = 0; i < world.maxEntities; i++) {
    if (world.active[i] === 0) continue;
    if (!world.hasComponent(i, Component.Collider)) continue;

    const x = world.transformX[i];
    const y = world.transformY[i];

    // Compute cell column and row
    const col = Math.max(0, Math.min(COLS - 1, Math.floor(x / CELL_SIZE)));
    const row = Math.max(0, Math.min(ROWS - 1, Math.floor(y / CELL_SIZE)));
    const cellIdx = row * COLS + col;

    // Insert entity at head of cell linked-list
    gridNext[i] = gridHead[cellIdx];
    gridHead[cellIdx] = i;
  }

  // 3. Perform collision checks
  for (let i = 0; i < world.maxEntities; i++) {
    if (world.active[i] === 0) continue;
    if (!world.hasComponent(i, Component.Collider)) continue;

    const mask = world.colliderLayerMask[i];
    const x = world.transformX[i];
    const y = world.transformY[i];
    const r = world.colliderRadius[i];

    // Compute entity cell coords
    const col = Math.max(0, Math.min(COLS - 1, Math.floor(x / CELL_SIZE)));
    const row = Math.max(0, Math.min(ROWS - 1, Math.floor(y / CELL_SIZE)));

    // Check neighboring 9 cells
    for (let dy = -1; dy <= 1; dy++) {
      const ny = row + dy;
      if (ny < 0 || ny >= ROWS) continue;

      for (let dx = -1; dx <= 1; dx++) {
        const nx = col + dx;
        if (nx < 0 || nx >= COLS) continue;

        const cellIdx = ny * COLS + nx;
        let otherIdx = gridHead[cellIdx];

        while (otherIdx !== -1) {
          // Avoid self-collision and duplicate checks (only check otherIdx > i)
          if (otherIdx > i && world.active[otherIdx] === 1) {
            const otherMask = world.colliderLayerMask[otherIdx];
            
            // Check if these two layers are allowed to collide
            if (shouldCollide(mask, otherMask)) {
              const ox = world.transformX[otherIdx];
              const oy = world.transformY[otherIdx];
              const or = world.colliderRadius[otherIdx];

              const dxVal = ox - x;
              const dyVal = oy - y;
              const distSq = dxVal * dxVal + dyVal * dyVal;
              const radiusSum = r + or;

              if (distSq < radiusSum * radiusSum) {
                // Collision occurred! Handle interaction inline or flag
                handleCollision(world, i, otherIdx);
              }
            }
          }
          otherIdx = gridNext[otherIdx];
        }
      }
    }
  }
}

/**
 * Fast bitwise check determining if layers should interact.
 */
function shouldCollide(mask1: number, mask2: number): boolean {
  // Collisions interest mappings:
  // - Player vs Enemy (contact damage)
  // - ProjectilePlayer vs Enemy
  // - ProjectileEnemy vs Player
  // - Player vs Orb (EXP gathering)
  if ((mask1 === Layer.Player && mask2 === Layer.Enemy) || (mask1 === Layer.Enemy && mask2 === Layer.Player)) return true;
  if ((mask1 === Layer.ProjectilePlayer && mask2 === Layer.Enemy) || (mask1 === Layer.Enemy && mask2 === Layer.ProjectilePlayer)) return true;
  if ((mask1 === Layer.ProjectileEnemy && mask2 === Layer.Player) || (mask1 === Layer.Player && mask2 === Layer.ProjectileEnemy)) return true;
  if ((mask1 === Layer.Player && mask2 === Layer.Orb) || (mask1 === Layer.Orb && mask2 === Layer.Player)) return true;
  
  return false;
}

/**
 * Resolves actions immediately on collision (e.g. projectile damage, orb collection).
 */
function handleCollision(world: World, e1: number, e2: number): void {
  // Distinguish entities: make sure entityA has Layer.Player or Layer.Projectile
  let entityA = e1;
  let entityB = e2;
  
  // Sort so entityA is Player or Projectile
  const maskB = world.colliderLayerMask[entityB];
  if (maskB === Layer.Player || maskB === Layer.ProjectilePlayer || maskB === Layer.ProjectileEnemy) {
    entityA = e2;
    entityB = e1;
  }

  const sortedMaskA = world.colliderLayerMask[entityA];
  const sortedMaskB = world.colliderLayerMask[entityB];

  // --- 1. PLAYER VS EXP ORB ---
  if (sortedMaskA === Layer.Player && sortedMaskB === Layer.Orb) {
    const orbValue = world.orbValue[entityB];
    
    // Destroy orb
    world.destroyEntity(entityB);
    
    // Add EXP to the world player metrics
    world.playerEXP += orbValue;
    
    // Check level up (Formula: RequiredEXP(Level) = 100 * (Level^1.2))
    const requiredEXP = Math.floor(100 * Math.pow(world.playerLevel, 1.2));
    if (world.playerEXP >= requiredEXP) {
      world.playerEXP = Math.max(0, world.playerEXP - requiredEXP);
      world.playerLevel++;
      
      // Transition to ROULETTE screen state
      useGameStore.getState().setGameState('ROULETTE');
    }
    
    // Trigger floating popup showing XP value (using regular popup)
    ObjectPool.spawnPopup(world, world.transformX[entityA], world.transformY[entityA] - 20, Math.floor(orbValue), false);
    
    return;
  }

  // --- 2. PLAYER PROJECTILE VS ENEMY ---
  if (sortedMaskA === Layer.ProjectilePlayer && sortedMaskB === Layer.Enemy) {
    // Process damage on Enemy
    applyProjectileDamage(world, entityA, entityB);
    return;
  }

  // --- 3. ENEMY PROJECTILE VS PLAYER ---
  if (sortedMaskA === Layer.ProjectileEnemy && sortedMaskB === Layer.Player) {
    // Process damage on Player
    applyProjectileDamage(world, entityA, entityB);
    return;
  }

  // --- 4. PLAYER VS ENEMY (Contact damage) ---
  if (sortedMaskA === Layer.Player && sortedMaskB === Layer.Enemy) {
    // Apply contact damage to player (cooldown protected or per-frame)
    // To prevent instant death, we only damage player occasionally (e.g. state check)
    // Let's apply a small damage tick
    const enemyAtk = world.statsATK[entityB];
    applyDamage(world, entityB, entityA, enemyAtk * 0.1); // 10% damage per frame touch
  }
}

/**
 * Calculates projectile hits and updates pierce/bounces.
 */
function applyProjectileDamage(world: World, projectile: number, victim: number): void {
  const skills = useGameStore.getState().runStats.skillsCollected;
  
  let isCrit = Math.random() < (world.statsLUK[projectile] * 0.02 + 0.05); // 2% crit chance per Luck point + 5% base
  let baseDmg = world.statsATK[projectile] * world.weaponDamageMultiplier[projectile];

  const isPlayerProj = world.projectileOwner[projectile] === 1;

  // Apply Aether Overdrive stacking damage boost (+30% per stack)
  if (isPlayerProj) {
    const overdriveCount = skills.filter(s => s === 'Aether Overdrive').length;
    if (overdriveCount > 0) {
      baseDmg *= (1 + overdriveCount * 0.3);
    }
  }

  // Thermal Shock Synergy: Frozen takes 300% from Fire (Aether Burn or Fire tags)
  const hasThermalShock = skills.includes('Aether Burn') && skills.includes('Frost Nova');
  if (isPlayerProj && hasThermalShock && world.aiStateTimer[victim] > 0) {
    baseDmg *= 3.0;
    world.aiStateTimer[victim] = 0; // shatter: break freeze
    ObjectPool.spawnPopup(world, world.transformX[victim], world.transformY[victim] - 25, 0, true); // Shatter indicator
  }

  // Executioner Skill: instantly kill enemies below 15% HP
  const def = world.statsDEF[victim];
  if (isPlayerProj && skills.includes('Executioner') && (world.statsHP[victim] / world.statsMaxHP[victim] < 0.15)) {
    baseDmg = world.statsHP[victim] * (100 + def) / 100 + 10;
    isCrit = true; // highlight execute
  }

  // Calculate final damage (applying crit multiplier)
  const dmg = baseDmg * (isCrit ? 2.0 : 1.0);
  
  // Apply damage, and capture the actual damage dealt
  const finalDamage = applyDamage(world, projectile, victim, dmg, isCrit);

  // Vampiric Touch: heal player for 5% of final damage
  if (isPlayerProj && skills.includes('Vampiric Touch') && finalDamage > 0) {
    let pIdx = -1;
    for (let i = 0; i < world.maxEntities; i++) {
      if (world.active[i] === 1 && world.tagIsPlayer[i] === 1) {
        pIdx = i;
        break;
      }
    }
    if (pIdx !== -1) {
      const healAmt = Math.max(1, Math.floor(finalDamage * 0.05));
      world.statsHP[pIdx] = Math.min(world.statsMaxHP[pIdx], world.statsHP[pIdx] + healAmt);
      // Float heal text
      ObjectPool.spawnPopup(world, world.transformX[pIdx] + (Math.random() - 0.5) * 15, world.transformY[pIdx] - 25, healAmt, false);
    }
  }

  // Aether Burn: apply Fire DoT
  if (isPlayerProj && skills.includes('Aether Burn') && finalDamage > 0) {
    world.projectileTimer[victim] = 3.0; // 3 seconds DoT duration
    world.statsINT[victim] = finalDamage * 0.1; // ticks 10% hit damage per second
  }

  // Handle Tesla Chain (type 4) or Chain Lightning passive skill bounce
  const isTesla = world.projectileType[projectile] === 4;
  const hasChainLightning = isPlayerProj && skills.includes('Chain Lightning') && Math.random() < 0.20;
  
  if (hasChainLightning && world.projectileBounce[projectile] === 0) {
    world.projectileBounce[projectile] = 2; // grant bounce capacity on the fly
  }

  if ((isTesla || hasChainLightning) && world.projectileBounce[projectile] > 0) {
    // Find next closest enemy that isn't the victim
    let nextTarget = -1;
    let minDist = Infinity;
    const px = world.transformX[victim];
    const py = world.transformY[victim];
    
    for (let e = 0; e < world.maxEntities; e++) {
      if (world.active[e] === 1 && world.tagIsEnemy[e] === 1 && e !== victim) {
        const dx = world.transformX[e] - px;
        const dy = world.transformY[e] - py;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist && dist < 150) { // bounce radius cap 150px
          minDist = dist;
          nextTarget = e;
        }
      }
    }

    if (nextTarget !== -1) {
      // Redirect projectile velocity towards new target
      const dx = world.transformX[nextTarget] - px;
      const dy = world.transformY[nextTarget] - py;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 0) {
        const speed = 450;
        world.transformX[projectile] = px; // teleport to bounce origin
        world.transformY[projectile] = py;
        world.transformVx[projectile] = (dx / dist) * speed;
        world.transformVy[projectile] = (dy / dist) * speed;
        world.transformRotation[projectile] = Math.atan2(dy, dx);
        world.projectileBounce[projectile]--;
      }
    } else {
      world.destroyEntity(projectile); // Destroy if no bounce target
    }
  } 
  // Sawblade (type 5) and Boomerang (type 3) do not get destroyed on normal hits (infinite pierce)
  else if (world.projectileType[projectile] !== 5 && world.projectileType[projectile] !== 3) {
    world.projectilePierce[projectile]--;
    if (world.projectilePierce[projectile] <= 0) {
      world.destroyEntity(projectile);
    }
  }
}

/**
 * Core Damage resolution applying defense scaling and death drops.
 */
export function applyDamage(world: World, attacker: number, victim: number, baseDamage: number, isCrit: boolean = false): number {
  const store = useGameStore.getState();
  const skills = store.runStats.skillsCollected;
  const isVictimPlayer = world.tagIsPlayer[victim] === 1;

  if (isVictimPlayer) {
    const selectedChar = store.playerConfig.selectedAutomaton;

    // A. Aegis-01 (Knight) unique perk: 15% chance to Block and reflect 50% damage
    if (selectedChar === 'CHR_01' && Math.random() < 0.15) {
      ObjectPool.spawnPopup(world, world.transformX[victim], world.transformY[victim] - 25, 0, true); // reflects block popup
      if (attacker !== -1 && world.active[attacker] === 1) {
        applyDamage(world, victim, attacker, baseDamage * 0.5);
      }
      return 0; // Prevent damage
    }

    // B. Zephyr-V (Scout) unique perk: 15% chance to Evade and spawn decoy bomb
    if (selectedChar === 'CHR_02' && Math.random() < 0.15) {
      ObjectPool.spawnPopup(world, world.transformX[victim], world.transformY[victim] - 25, 0, true); // Evade popup
      const px = world.transformX[victim];
      const py = world.transformY[victim];
      const decoyId = ObjectPool.spawnProjectile(
        world,
        victim,
        px,
        py,
        0,
        0,
        6, // Type 6 = Decoy Bomb
        2.5, // Damage multiplier
        0,
        99,
        0,
        24 // Exploding radius
      );
      world.projectileTimer[decoyId] = 1.5; // 1.5s fuse
      return 0; // Prevent damage
    }

    // C. Kinetic Shield Stack Absorption
    if (world.playerShields > 0 && skills.includes('Kinetic Shield')) {
      world.playerShields--;
      ObjectPool.spawnPopup(world, world.transformX[victim], world.transformY[victim] - 25, 0, true); // Special block popup
      return 0; // Prevent HP reduction
    }
  }

  // Non-linear Defense Formula: DamageTaken = Damage * (100 / (100 + DEF))
  const def = world.statsDEF[victim];
  const dmgReduction = 100 / (100 + def);
  const finalDamage = Math.max(1, Math.floor(baseDamage * dmgReduction));

  // Subtract health
  world.statsHP[victim] -= finalDamage;

  // Track player damage dealt
  if (!isVictimPlayer) {
    store.setRunStats({
      damageDealt: store.runStats.damageDealt + finalDamage
    });
  }

  // Set screen shake visuals
  if (isVictimPlayer) {
    world.screenShake = Math.max(world.screenShake, 8); // Satisfying shake when player takes damage
  } else {
    const isBoss = world.colliderRadius[victim] > 25;
    if (isCrit) {
      world.screenShake = Math.max(world.screenShake, 3); // Light pop shake for critical hits
    }
    if (isBoss) {
      world.screenShake = Math.max(world.screenShake, 5); // Rumble shake for boss hits
    }
  }

  // D. Titan-K (Heavy) unique perk: Damage builds energy, releases shockwave
  if (isVictimPlayer && store.playerConfig.selectedAutomaton === 'CHR_05' && finalDamage > 0) {
    world.titanEnergy += finalDamage;
    if (world.titanEnergy >= world.maxTitanEnergy) {
      world.titanEnergy = 0;
      
      const px = world.transformX[victim];
      const py = world.transformY[victim];
      
      for (let e = 0; e < world.maxEntities; e++) {
        if (world.active[e] === 1 && world.tagIsEnemy[e] === 1) {
          const ex = world.transformX[e];
          const ey = world.transformY[e];
          const dx = ex - px;
          const dy = ey - py;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 160) {
            applyDamage(world, victim, e, 150);
          }
        }
      }
      ObjectPool.spawnPopup(world, px, py - 30, 0, true); // SHOCKWAVE popup!
    }
  }

  // Spawn damage popup
  ObjectPool.spawnPopup(
    world,
    world.transformX[victim] + (Math.random() - 0.5) * 10,
    world.transformY[victim] - 15,
    finalDamage,
    isCrit
  );

  // Check for death
  if (world.statsHP[victim] <= 0) {
    const isVictimPlayer = world.tagIsPlayer[victim] === 1;
    
    if (isVictimPlayer) {
      // Player died -> Transition to GameOver state!
      world.destroyEntity(victim);
      useGameStore.getState().setGameState('GAMEOVER');
    } else {
      // Enemy died -> Spawn EXP Orbs!
      const victimX = world.transformX[victim];
      const victimY = world.transformY[victim];
      
      // Destroy enemy entity
      world.destroyEntity(victim);
      
      // Log kill statistic to Zustand
      const store = useGameStore.getState();
      store.setRunStats({
        enemiesKilled: store.runStats.enemiesKilled + 1
      });

      // Spawn orbs (number based on enemy size/HP)
      const orbValue = 15; // standard orb value
      ObjectPool.spawnOrb(world, victimX, victimY, orbValue);

      // Frost Nova Skill: freeze neighboring enemies
      const isAttackerPlayer = (attacker !== -1 && world.active[attacker] === 1) && 
        (world.tagIsPlayer[attacker] === 1 || world.projectileOwner[attacker] === 1);

      if (isAttackerPlayer && skills.includes('Frost Nova')) {
        // Freeze blast in radius 120px
        for (let e = 0; e < world.maxEntities; e++) {
          if (world.active[e] === 1 && world.tagIsEnemy[e] === 1) {
            const ex = world.transformX[e];
            const ey = world.transformY[e];
            const dx = ex - victimX;
            const dy = ey - victimY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
              world.aiStateTimer[e] = 1.0; // Freeze for 1s
            }
          }
        }
        ObjectPool.spawnPopup(world, victimX, victimY - 20, 0, false); // ice freeze popup
      }

      // Shadow-9 Assassin unique perk: OnKill gain invisibility for 1.5s
      if (store.playerConfig.selectedAutomaton === 'CHR_04') {
        let playerIdx = -1;
        for (let i = 0; i < world.maxEntities; i++) {
          if (world.active[i] === 1 && world.tagIsPlayer[i] === 1) {
            playerIdx = i;
            break;
          }
        }
        if (playerIdx !== -1) {
          world.aiStateTimer[playerIdx] = 1.5; // Invisible timer
          ObjectPool.spawnPopup(world, world.transformX[playerIdx], world.transformY[playerIdx] - 25, 0, true); // stealth popup
        }
      }
    }
  }

  return finalDamage;
}
