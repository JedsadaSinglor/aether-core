import { World } from '../World';
import { Component } from '../components';

/**
 * Handles Artificial Intelligence state machines and updates movement velocities.
 */
export function AISystem(world: World, _dt: number): void {
  // 1. Locate the player entity
  let playerIdx = -1;
  for (let i = 0; i < world.maxEntities; i++) {
    if (world.active[i] === 1 && world.tagIsPlayer[i] === 1) {
      playerIdx = i;
      break;
    }
  }

  // Shadow-9 Invisibility check: if player exists and has stealth timer active, enemies lose aggro
  let isPlayerInvisible = false;
  if (playerIdx !== -1 && world.aiStateTimer[playerIdx] > 0) {
    isPlayerInvisible = true;
  }

  // Iterate all active AI-equipped entities
  for (let i = 0; i < world.maxEntities; i++) {
    if (world.active[i] === 0) continue;
    
    // Bypass Component.AI check for the Drone entity (type 7)
    const isDrone = world.tagIsProjectile[i] === 1 && world.projectileType[i] === 7;
    if (!world.hasComponent(i, Component.AI) && !isDrone) continue;

    const x = world.transformX[i];
    const y = world.transformY[i];
    const speed = world.statsMoveSpeed[i];

    // --- CASE A: PLAYER AI CORE (if the player has an AI component) ---
    // Normally the player configures their AI Core which controls movement.
    if (world.tagIsPlayer[i] === 1) {
      const aiCoreType = world.aiCurrentState[i]; // 1 = Kiting, 2 = Aggressive, 3 = Adaptive
      const hp = world.statsHP[i];
      const maxHp = world.statsMaxHP[i];

      // Resolve current active behavior based on core type
      let activeBehavior = aiCoreType;
      if (aiCoreType === 3) {
        // Adaptive: Kiting when HP < 30%, otherwise Aggressive
        activeBehavior = (hp / maxHp < 0.3) ? 1 : 2;
      }

      if (activeBehavior === 1) {
        // --- KITING CORE ---
        // Find closest enemy
        let closestEnemyIdx = -1;
        let minDist = Infinity;
        
        for (let e = 0; e < world.maxEntities; e++) {
          if (world.active[e] === 1 && world.tagIsEnemy[e] === 1) {
            const dx = world.transformX[e] - x;
            const dy = world.transformY[e] - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDist) {
              minDist = dist;
              closestEnemyIdx = e;
            }
          }
        }

        const safeZone = 130; // Aggro buffer distance
        if (closestEnemyIdx !== -1 && minDist < safeZone) {
          // Move away from closest enemy
          const dx = x - world.transformX[closestEnemyIdx];
          const dy = y - world.transformY[closestEnemyIdx];
          const len = Math.sqrt(dx * dx + dy * dy);
          
          if (len > 0) {
            world.transformVx[i] = (dx / len) * speed;
            world.transformVy[i] = (dy / len) * speed;
            world.transformRotation[i] = Math.atan2(-dy, -dx); // face enemy while running away
          }
        } else {
          // No enemies close: float slowly toward nearest EXP orb if any
          let closestOrbIdx = -1;
          let minOrbDist = Infinity;
          for (let o = 0; o < world.maxEntities; o++) {
            if (world.active[o] === 1 && world.tagIsOrb[o] === 1) {
              const dx = world.transformX[o] - x;
              const dy = world.transformY[o] - y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < minOrbDist) {
                minOrbDist = dist;
                closestOrbIdx = o;
              }
            }
          }

          if (closestOrbIdx !== -1) {
            const dx = world.transformX[closestOrbIdx] - x;
            const dy = world.transformY[closestOrbIdx] - y;
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len > 0) {
              world.transformVx[i] = (dx / len) * speed * 0.8;
              world.transformVy[i] = (dy / len) * speed * 0.8;
            }
          } else {
            // Idle stand
            world.transformVx[i] = 0;
            world.transformVy[i] = 0;
          }
        }
      } else if (activeBehavior === 2) {
        // --- AGGRESSIVE CORE ---
        // Find enemy with lowest HP
        let targetEnemyIdx = -1;
        let lowestHP = Infinity;
        
        for (let e = 0; e < world.maxEntities; e++) {
          if (world.active[e] === 1 && world.tagIsEnemy[e] === 1) {
            const ehp = world.statsHP[e];
            if (ehp < lowestHP) {
              lowestHP = ehp;
              targetEnemyIdx = e;
            }
          }
        }

        if (targetEnemyIdx !== -1) {
          // Move towards target
          const dx = world.transformX[targetEnemyIdx] - x;
          const dy = world.transformY[targetEnemyIdx] - y;
          const len = Math.sqrt(dx * dx + dy * dy);
          
          // Stop moving closer if very near (e.g. 60px) to prevent direct collision damage
          if (len > 60) {
            world.transformVx[i] = (dx / len) * speed;
            world.transformVy[i] = (dy / len) * speed;
          } else {
            world.transformVx[i] = 0;
            world.transformVy[i] = 0;
          }
          if (len > 0) {
            world.transformRotation[i] = Math.atan2(dy, dx);
          }
        } else {
          // No targets: idle stand
          world.transformVx[i] = 0;
          world.transformVy[i] = 0;
        }
      }

      // --- SLIDING CORNER TRAP PREVENTION ---
      // If player is touching viewport walls and moving into them, slide along the wall
      const pRadius = world.colliderRadius[i] || 16;
      const margin = 5;
      const limitW = 450;
      const limitH = 800;

      // Near left boundary
      if (world.transformX[i] <= pRadius + margin && world.transformVx[i] < 0) {
        world.transformVx[i] = 0;
        if (Math.abs(world.transformVy[i]) < 10) {
          world.transformVy[i] = world.transformY[i] > limitH / 2 ? -speed : speed;
        }
      }
      // Near right boundary
      if (world.transformX[i] >= limitW - pRadius - margin && world.transformVx[i] > 0) {
        world.transformVx[i] = 0;
        if (Math.abs(world.transformVy[i]) < 10) {
          world.transformVy[i] = world.transformY[i] > limitH / 2 ? -speed : speed;
        }
      }
      // Near top boundary
      if (world.transformY[i] <= pRadius + margin && world.transformVy[i] < 0) {
        world.transformVy[i] = 0;
        if (Math.abs(world.transformVx[i]) < 10) {
          world.transformVx[i] = world.transformX[i] > limitW / 2 ? -speed : speed;
        }
      }
      // Near bottom boundary
      if (world.transformY[i] >= limitH - pRadius - margin && world.transformVy[i] > 0) {
        world.transformVy[i] = 0;
        if (Math.abs(world.transformVx[i]) < 10) {
          world.transformVx[i] = world.transformX[i] > limitW / 2 ? -speed : speed;
        }
      }

      continue;
    }

    // --- CASE C: ORACLE COMPANION DRONE (CHR_06 unique perk) ---
    if (isDrone) {
      if (playerIdx !== -1) {
        const px = world.transformX[playerIdx];
        const py = world.transformY[playerIdx];

        // Orbit target pathing
        const timeVal = performance.now() / 1000;
        const orbitAngle = timeVal * 2.5 + i; // Offset angle per drone
        const targetX = px + Math.cos(orbitAngle) * 35;
        const targetY = py + Math.sin(orbitAngle) * 35;

        // Smooth P controller follow tracking
        world.transformVx[i] = (targetX - x) * 6;
        world.transformVy[i] = (targetY - y) * 6;
        world.transformRotation[i] = timeVal * 1.5; // rotate slowly
      } else {
        world.destroyEntity(i); // Destroy drone if player is gone
      }
      continue;
    }

    // --- CASE B: ENEMY AI CORE ---
    if (world.tagIsEnemy[i] === 1) {
      if (playerIdx === -1 || isPlayerInvisible) {
        // Player is dead or invisible: stop chasing
        world.transformVx[i] = 0;
        world.transformVy[i] = 0;
        continue;
      }

      const px = world.transformX[playerIdx];
      const py = world.transformY[playerIdx];
      
      const dx = px - x;
      const dy = py - y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Determine Enemy type based on radius / component configurations
      const radius = world.colliderRadius[i];
      let isRanged = world.hasComponent(i, Component.Weapon);
      let isBoss = radius > 25;

      if (isBoss) {
        // Boss AI: Move slowly toward player, face player
        if (dist > 0) {
          world.transformVx[i] = (dx / dist) * speed;
          world.transformVy[i] = (dy / dist) * speed;
          world.transformRotation[i] = Math.atan2(dy, dx);
        }
      } else if (isRanged) {
        // Ranged AI: Maintain distance (between 160px and 220px)
        const minRange = 160;
        const maxRange = 220;
        
        if (dist > maxRange) {
          // Move closer
          world.transformVx[i] = (dx / dist) * speed;
          world.transformVy[i] = (dy / dist) * speed;
        } else if (dist < minRange) {
          // Move away
          world.transformVx[i] = (-dx / dist) * speed;
          world.transformVy[i] = (-dy / dist) * speed;
        } else {
          // Stand and shoot
          world.transformVx[i] = 0;
          world.transformVy[i] = 0;
        }
        
        if (dist > 0) {
          world.transformRotation[i] = Math.atan2(dy, dx); // Face player
        }
      } else {
        // Swarmer / Elite: Mindless chase
        if (dist > 0) {
          world.transformVx[i] = (dx / dist) * speed;
          world.transformVy[i] = (dy / dist) * speed;
          world.transformRotation[i] = Math.atan2(dy, dx);
        }
      }

      // --- CORNER TRAP PREVENTER (Edge Case from GDD/Specs) ---
      // If stuck (speed has been configured but actual speed is almost 0 for >2s)
      // For simplicity, if we detect player overlap or corner, we add slight randomness
      if (dist < 10) {
        world.transformVx[i] = (Math.random() - 0.5) * speed;
        world.transformVy[i] = (Math.random() - 0.5) * speed;
      }
    }
  }
}
