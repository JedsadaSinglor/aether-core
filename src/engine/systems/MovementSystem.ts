import { World } from '../World';
import { Component } from '../components';
import { useGameStore } from '../../store/gameStore';
import { ObjectPool } from '../ObjectPool';
import { applyDamage } from './CollisionSystem';

/**
 * Updates positions based on velocity and handles boundary rules for player and projectiles.
 */
export function MovementSystem(world: World, dt: number, width: number = 450, height: number = 800): void {
  for (let i = 0; i < world.maxEntities; i++) {
    if (world.active[i] === 0) continue;
    
    if (world.hasComponent(i, Component.Transform)) {
      const x = world.transformX[i];
      const y = world.transformY[i];

      // Sawblade Projectile specific orbit logic (type 5)
      // Sawblades orbit the player
      if (world.tagIsProjectile[i] === 1 && world.projectileType[i] === 5) {
        world.projectileTimer[i] += dt;
        
        // Find player to orbit around
        let playerIdx = -1;
        for (let p = 0; p < world.maxEntities; p++) {
          if (world.active[p] === 1 && world.tagIsPlayer[p] === 1) {
            playerIdx = p;
            break;
          }
        }
        
        if (playerIdx !== -1) {
          const orbitRadius = 70; // Orbit distance
          const speedFactor = 4; // Radians per second
          const angleOffset = world.projectileAngle[i]; // Unique starting offset per sawblade
          const currentAngle = angleOffset + world.projectileTimer[i] * speedFactor;
          
          world.transformX[i] = world.transformX[playerIdx] + Math.cos(currentAngle) * orbitRadius;
          world.transformY[i] = world.transformY[playerIdx] + Math.sin(currentAngle) * orbitRadius;
          world.transformRotation[i] = currentAngle + Math.PI / 2; // Face direction of orbit movement
        } else {
          world.destroyEntity(i); // Destroy if player is gone
        }
        
        // Sawblades last for 3s (from GDD / WEP_05 spec)
        if (world.projectileTimer[i] >= 3.0) {
          world.destroyEntity(i);
        }
        continue;
      }

      // Magnetic Pull logic for EXP Orbs
      if (world.tagIsOrb[i] === 1) {
        // Find player
        let playerIdx = -1;
        for (let p = 0; p < world.maxEntities; p++) {
          if (world.active[p] === 1 && world.tagIsPlayer[p] === 1) {
            playerIdx = p;
            break;
          }
        }
        
        if (playerIdx !== -1) {
          const px = world.transformX[playerIdx];
          const py = world.transformY[playerIdx];
          const dx = px - x;
          const dy = py - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          const skills = useGameStore.getState().runStats.skillsCollected;
          const hasMagneticPull = skills.includes('Magnetic Pull');
          const magnetRange = hasMagneticPull ? 240 : 60;
          
          if (dist < magnetRange) {
            const pullSpeed = 240;
            world.transformVx[i] = (dx / dist) * pullSpeed;
            world.transformVy[i] = (dy / dist) * pullSpeed;
          } else {
            // Static when out of range
            world.transformVx[i] = 0;
            world.transformVy[i] = 0;
          }
        }
      }

      // Normal velocity integration
      world.transformX[i] += world.transformVx[i] * dt;
      world.transformY[i] += world.transformVy[i] * dt;
      
      // Clamp player to viewport limits
      if (world.tagIsPlayer[i] === 1) {
        const radius = world.colliderRadius[i] || 16;
        if (world.transformX[i] < radius) world.transformX[i] = radius;
        if (world.transformX[i] > width - radius) world.transformX[i] = width - radius;
        if (world.transformY[i] < radius) world.transformY[i] = radius;
        if (world.transformY[i] > height - radius) world.transformY[i] = height - radius;
      }
      
      // Clean up offscreen projectiles (give 50px buffer)
      if (world.tagIsProjectile[i] === 1) {
        // Decoy Bomb (type 6) specific fuse & explosion
        if (world.projectileType[i] === 6) {
          world.projectileTimer[i] -= dt;
          if (world.projectileTimer[i] <= 0) {
            const px = world.transformX[i];
            const py = world.transformY[i];

            // Locate player to act as damage source
            let playerIdx = -1;
            for (let p = 0; p < world.maxEntities; p++) {
              if (world.active[p] === 1 && world.tagIsPlayer[p] === 1) {
                playerIdx = p;
                break;
              }
            }
            const attackerId = playerIdx !== -1 ? playerIdx : i;

            // Explode: Deal 120 base damage to all enemies within a 140px radius
            for (let e = 0; e < world.maxEntities; e++) {
              if (world.active[e] === 1 && world.tagIsEnemy[e] === 1) {
                const ex = world.transformX[e];
                const ey = world.transformY[e];
                const dx = ex - px;
                const dy = ey - py;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 140) {
                  applyDamage(world, attackerId, e, 120 * world.weaponDamageMultiplier[i]);
                }
              }
            }

            // Spawn "BOOM" text popup
            ObjectPool.spawnPopup(world, px, py - 10, 0, true);

            // Destroy the bomb entity
            world.destroyEntity(i);
          }
          continue;
        }

        // Boomerang Projectile specific behavior (type 3)
        // Moves out, decelerates, then speeds back toward player
        if (world.projectileType[i] === 3) {
          world.projectileTimer[i] += dt;
          
          // Locate player
          let playerIdx = -1;
          for (let p = 0; p < world.maxEntities; p++) {
            if (world.active[p] === 1 && world.tagIsPlayer[p] === 1) {
              playerIdx = p;
              break;
            }
          }
          
          if (playerIdx !== -1) {
            if (world.projectileTimer[i] < 0.6) {
              // Decelerate initial throw
              world.transformVx[i] *= 0.92;
              world.transformVy[i] *= 0.92;
            } else {
              // Return: Accelerate toward player
              const dx = world.transformX[playerIdx] - world.transformX[i];
              const dy = world.transformY[playerIdx] - world.transformY[i];
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 15 && world.projectileTimer[i] > 0.8) {
                world.destroyEntity(i); // Caught by player
                continue;
              }
              const speed = 450;
              if (dist > 0) {
                world.transformVx[i] = (dx / dist) * speed;
                world.transformVy[i] = (dy / dist) * speed;
              }
            }
          } else {
            world.destroyEntity(i);
          }
        } else {
          // Normal projectiles check bounds
          if (world.transformX[i] < -50 || world.transformX[i] > width + 50 || world.transformY[i] < -50 || world.transformY[i] > height + 50) {
            world.destroyEntity(i);
          }
        }
      }
      
      // Manage popup lifetimes
      if (world.tagIsPopup[i] === 1) {
        world.popupLifetime[i] -= dt;
        if (world.popupLifetime[i] <= 0) {
          world.destroyEntity(i);
        }
      }
    }
  }
}
