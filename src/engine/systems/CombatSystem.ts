import { World } from '../World';
import { Component } from '../components';
import { ObjectPool } from '../ObjectPool';
import { useGameStore } from '../../store/gameStore';

/**
 * Handles weapon firing cycles, cooldown updates, and spawning projectiles with custom patterns.
 * Reads active skills from the global Zustand store to apply modifiers.
 */
export function CombatSystem(world: World, dt: number): void {
  // 1. Fetch active skills from Zustand store
  const { runStats } = useGameStore.getState();
  const skills = runStats.skillsCollected;

  const hasMultishot = skills.includes('Multishot');
  const hasRicochet = skills.includes('Ricochet');

  // 2. Locate player to target / orbit
  let playerIdx = -1;
  for (let i = 0; i < world.maxEntities; i++) {
    if (world.active[i] === 1 && world.tagIsPlayer[i] === 1) {
      playerIdx = i;
      break;
    }
  }

  // Iterate all entities with Weapon capabilities
  for (let i = 0; i < world.maxEntities; i++) {
    if (world.active[i] === 0) continue;
    if (!world.hasComponent(i, Component.Weapon)) continue;

    // Update weapon reload timer
    world.weaponFireRateTimer[i] += dt;

    const cooldown = world.weaponFireRateCooldown[i];
    if (world.weaponFireRateTimer[i] < cooldown) continue;

    const x = world.transformX[i];
    const y = world.transformY[i];
    
    const isPlayer = world.tagIsPlayer[i] === 1;
    const isDrone = world.tagIsProjectile[i] === 1 && world.projectileType[i] === 7;

    // --- CASE C: ORACLE COMPANION DRONE (CHR_06 unique perk) ---
    if (isDrone) {
      // Drone fires at nearest enemy
      let targetX = x;
      let targetY = y - 200; // default straight up
      let minDist = Infinity;
      let targetEnemyIdx = -1;

      for (let e = 0; e < world.maxEntities; e++) {
        if (world.active[e] === 1 && world.tagIsEnemy[e] === 1) {
          const dx = world.transformX[e] - x;
          const dy = world.transformY[e] - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDist) {
            minDist = dist;
            targetX = world.transformX[e];
            targetY = world.transformY[e];
            targetEnemyIdx = e;
          }
        }
      }

      // Reset timer
      world.weaponFireRateTimer[i] = 0;

      if (targetEnemyIdx !== -1) {
        const dx = targetX - x;
        const dy = targetY - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
          const dirX = dx / dist;
          const dirY = dy / dist;

          // Spawn player-owned projectile directed at enemy so player stats are inherited
          ObjectPool.spawnProjectile(
            world,
            playerIdx !== -1 ? playerIdx : i, // owner is player so damage formulas work
            x,
            y,
            dirX,
            dirY,
            1, // type 1 Repeater
            0.5 * world.weaponDamageMultiplier[i], // 0.5x damage mult
            400, // speed
            1, // pierce
            0, // bounce
            6 // radius
          );
        }
      }
      continue;
    }

    // --- CASE A: PLAYER WEAPONS ---
    if (isPlayer) {
      const wType = world.weaponType[i];
      const baseDmgMult = world.weaponDamageMultiplier[i];
      const projSpeed = world.weaponProjectileSpeed[i];
      
      // Determine target (closest enemy)
      let targetX = x;
      let targetY = y - 200; // default straight up if no enemies
      let minDist = Infinity;

      for (let e = 0; e < world.maxEntities; e++) {
        if (world.active[e] === 1 && world.tagIsEnemy[e] === 1) {
          const dx = world.transformX[e] - x;
          const dy = world.transformY[e] - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDist) {
            minDist = dist;
            targetX = world.transformX[e];
            targetY = world.transformY[e];
          }
        }
      }

      // Direction vector
      let dx = targetX - x;
      let dy = targetY - y;
      let dist = Math.sqrt(dx * dx + dy * dy);
      if (dist === 0) {
        dx = 0;
        dy = -1;
        dist = 1;
      }
      const dirX = dx / dist;
      const dirY = dy / dist;

      // Adjust weapon rotation to face target
      world.transformRotation[i] = Math.atan2(dirY, dirX);

      // Reset timer
      world.weaponFireRateTimer[i] = 0;

      // Apply skill modifiers to spawned projectiles
      const bounceCount = hasRicochet ? 2 : 0;
      let dmgMultiplier = hasMultishot ? baseDmgMult * 0.8 : baseDmgMult;

      // Nova-X unique perk: Every 3rd cast -> next shot 2x damage
      const store = useGameStore.getState();
      const isNovaX = store.playerConfig.selectedAutomaton === 'CHR_03';
      let isOverloaded = false;
      if (isNovaX) {
        world.playerCastCount++;
        if (world.playerCastCount >= 3) {
          world.playerCastCount = 0;
          dmgMultiplier *= 2.0;
          isOverloaded = true;
        }
      }

      if (isOverloaded) {
        ObjectPool.spawnPopup(world, x, y - 25, 0, true); // OVERLOAD popup!
      }

      if (wType === 1) {
        // WEP_01: Repeater (Fast bolts)
        if (hasMultishot) {
          // 3-way spread
          const angles = [-0.15, 0, 0.15];
          angles.forEach((angleOffset) => {
            const cos = Math.cos(angleOffset);
            const sin = Math.sin(angleOffset);
            const vx = dirX * cos - dirY * sin;
            const vy = dirX * sin + dirY * cos;
            ObjectPool.spawnProjectile(
              world, i, x, y, vx, vy, 1, dmgMultiplier, projSpeed, 1, bounceCount, 6
            );
          });
        } else {
          ObjectPool.spawnProjectile(
            world, i, x, y, dirX, dirY, 1, dmgMultiplier, projSpeed, 1, bounceCount, 6
          );
        }
      } 
      else if (wType === 2) {
        // WEP_02: Arcane Cannon (Slow heavy ball, pierces 5 targets)
        if (hasMultishot) {
          // Double shot slightly angled
          const angles = [-0.1, 0.1];
          angles.forEach((angleOffset) => {
            const cos = Math.cos(angleOffset);
            const sin = Math.sin(angleOffset);
            const vx = dirX * cos - dirY * sin;
            const vy = dirX * sin + dirY * cos;
            ObjectPool.spawnProjectile(
              world, i, x, y, vx, vy, 2, dmgMultiplier, projSpeed, 5, bounceCount, 16
            );
          });
        } else {
          ObjectPool.spawnProjectile(
            world, i, x, y, dirX, dirY, 2, dmgMultiplier, projSpeed, 5, bounceCount, 16
          );
        }
      } 
      else if (wType === 3) {
        // WEP_03: Chrono-Boomerang (Infinite pierce, returns)
        ObjectPool.spawnProjectile(
          world, i, x, y, dirX, dirY, 3, dmgMultiplier, projSpeed, 99, bounceCount, 14
        );
      } 
      else if (wType === 4) {
        // WEP_04: Tesla Chain (Bounces to 3 enemies)
        ObjectPool.spawnProjectile(
          world, i, x, y, dirX, dirY, 4, dmgMultiplier, projSpeed, 1, bounceCount + 3, 8
        );
      } 
      else if (wType === 5) {
        // WEP_05: Aether Sawblades (Orbits player, spawned in a ring)
        const bladesCount = hasMultishot ? 4 : 3;
        for (let s = 0; s < bladesCount; s++) {
          const startAngle = (Math.PI * 2 / bladesCount) * s;
          const projId = ObjectPool.spawnProjectile(
            world, i, x, y, 0, 0, 5, dmgMultiplier, 0, 99, 0, 16
          );
          world.projectileAngle[projId] = startAngle;
        }
      }
    } 

    // --- CASE B: ENEMY WEAPONS (Ranged & Bosses) ---
    else {
      // Enemy weapon logic (fires at Player)
      if (playerIdx !== -1) {
        const px = world.transformX[playerIdx];
        const py = world.transformY[playerIdx];
        
        let dx = px - x;
        let dy = py - y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
          const dirX = dx / dist;
          const dirY = dy / dist;

          // Check if this is a boss (radius > 25)
          const radius = world.colliderRadius[i];
          if (radius > 25) {
            const hpRatio = world.statsHP[i] / world.statsMaxHP[i];

            // Adjust cooldown based on boss health/phase
            if (hpRatio <= 0.25) {
              world.weaponFireRateCooldown[i] = 1.0; // Enraged: Double fire speed
            } else {
              world.weaponFireRateCooldown[i] = 2.0;
            }

            // Reset timer
            world.weaponFireRateTimer[i] = 0;

            if (hpRatio > 0.75) {
              // Phase 1 (HP > 75%): 8 concentric projectiles ring
              const projCount = 8;
              for (let b = 0; b < projCount; b++) {
                const angle = (Math.PI * 2 / projCount) * b;
                const vx = Math.cos(angle);
                const vy = Math.sin(angle);
                ObjectPool.spawnProjectile(
                  world, i, x, y, vx, vy, 1, 1.0, 200, 1, 0, 8
                );
              }
            } 
            else if (hpRatio > 0.50) {
              // Phase 2 (75% >= HP > 50%): 5-way player-targeted fan spread
              const projCount = 5;
              const angleSpread = 0.15;
              const baseAngle = Math.atan2(dirY, dirX);
              for (let b = 0; b < projCount; b++) {
                const angle = baseAngle + (b - (projCount - 1) / 2) * angleSpread;
                const vx = Math.cos(angle);
                const vy = Math.sin(angle);
                ObjectPool.spawnProjectile(
                  world, i, x, y, vx, vy, 1, 1.0, 220, 1, 0, 8
                );
              }
            } 
            else if (hpRatio > 0.25) {
              // Phase 3 (50% >= HP > 25%): 6-bullet spiral bullet hell sweep
              const projCount = 6;
              const sweepAngle = (performance.now() / 1000) * 3.0; // rotating angle sweep
              for (let b = 0; b < projCount; b++) {
                const angle = sweepAngle + (Math.PI * 2 / projCount) * b;
                const vx = Math.cos(angle);
                const vy = Math.sin(angle);
                ObjectPool.spawnProjectile(
                  world, i, x, y, vx, vy, 1, 1.0, 200, 1, 0, 8
                );
              }
            } 
            else {
              // Phase 4 (HP <= 25%): Enraged Concentric Ring (10 bullets) + Fast Player-Targeted Snipe
              const projCount = 10;
              for (let b = 0; b < projCount; b++) {
                const angle = (Math.PI * 2 / projCount) * b;
                const vx = Math.cos(angle);
                const vy = Math.sin(angle);
                ObjectPool.spawnProjectile(
                  world, i, x, y, vx, vy, 1, 1.1, 230, 1, 0, 8
                );
              }
              ObjectPool.spawnProjectile(
                world, i, x, y, dirX, dirY, 1, 1.2, 320, 1, 0, 8
              );
            }
          } else {
            // Standard Ranged projectile: Slow single bolt
            world.weaponFireRateTimer[i] = 0;
            ObjectPool.spawnProjectile(
              world, i, x, y, dirX, dirY, 1, 1.0, 180, 1, 0, 6
            );
          }
        }
      }
    }
  }
}
