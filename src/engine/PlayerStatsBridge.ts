import { World } from './World';
import { ObjectPool } from './ObjectPool';
import { Component, Layer } from './components';
import type { PlayerBuildConfig } from '../store/gameStore';

/**
 * Maps React UI configuration state to the low-level ECS player entity components.
 */
export function spawnPlayerFromConfig(world: World, config: PlayerBuildConfig, x: number, y: number): number {
  const { statAllocation, selectedAutomaton, selectedWeapon, selectedAICore } = config;

  // 1. Calculate Base Stats from Automaton Model choice
  let baseHP = 100;
  let baseATK = 10;
  let baseDEF = 5;
  let baseSpeed = 150;
  let baseLuk = 0;
  let baseInt = 0;

  switch (selectedAutomaton) {
    case 'CHR_01': // Aegis-01 (Knight) - HP/DEF Focus
      baseHP = 200;
      baseDEF = 15;
      baseSpeed = 130;
      break;
    case 'CHR_02': // Zephyr-V (Scout) - AGI Focus
      baseHP = 110;
      baseATK = 12;
      baseSpeed = 180;
      break;
    case 'CHR_03': // Nova-X (Mage) - INT Focus
      baseHP = 90;
      baseDEF = 4;
      baseInt = 15;
      baseSpeed = 140;
      break;
    case 'CHR_04': // Shadow-9 (Assassin) - LUK/ATK Focus
      baseHP = 100;
      baseATK = 16;
      baseLuk = 10;
      baseSpeed = 165;
      break;
    case 'CHR_05': // Titan-K (Heavy) - HP Focus
      baseHP = 250;
      baseDEF = 8;
      baseSpeed = 120;
      break;
    case 'CHR_06': // Oracle-Z (Support) - INT/AGI Focus
      baseHP = 120;
      baseDEF = 6;
      baseInt = 5;
      baseSpeed = 150;
      break;
  }

  // 2. Add Stat Point Allocation Adjustments
  // ATK: 1pt = +2 Base Damage
  const finalATK = baseATK + statAllocation.ATK * 2;
  
  // HP: 1pt = +50 Max Health
  const finalHP = baseHP + statAllocation.HP * 50;
  
  // DEF: 1pt = +1 DEF (non-linear reduction rating)
  const finalDEF = baseDEF + statAllocation.DEF;
  
  // AGI: 1pt = +5% Move Speed, +2% Attack Speed
  const finalSpeed = baseSpeed * (1 + statAllocation.AGI * 0.05);
  const finalAttackSpeed = 1.0 * (1 + statAllocation.AGI * 0.02);

  // LUK: 1pt = +2% Crit, +1% High-Tier
  const finalLuk = baseLuk + statAllocation.LUK;
  
  // INT: 1pt = +5% Skill DMG, -2% Skill Cooldown
  const finalInt = baseInt + statAllocation.INT;

  // 3. Spawn player entity using core pool
  const id = ObjectPool.spawnPlayer(
    world,
    x,
    y,
    finalHP,
    finalATK,
    finalDEF,
    finalSpeed,
    finalAttackSpeed,
    finalLuk,
    finalInt
  );

  // 4. Configure selected weapon statistics on entity
  // WEP_01 (Repeater): FireRate: Cooldown 0.4s, DamageMult: 0.5, Projectile: Fast Line
  // WEP_02 (Cannon): FireRate: Cooldown 1.5s, DamageMult: 2.0, Projectile: Slow Line
  // WEP_03 (Boomerang): FireRate: Cooldown 1.0s, DamageMult: 1.0, Projectile: Move -> Return
  // WEP_04 (Tesla): FireRate: Cooldown 0.8s, DamageMult: 0.9, Projectile: Chain
  // WEP_05 (Sawblades): Orbit. Cooldown: 2s (Duration: 3s)
  let weaponTypeVal = 1;
  let fireRateCooldown = 1.0;
  let damageMultiplier = 1.0;
  let projectileSpeed = 400;

  switch (selectedWeapon) {
    case 'WEP_01':
      weaponTypeVal = 1;
      fireRateCooldown = 0.4;
      damageMultiplier = 0.5;
      projectileSpeed = 550;
      break;
    case 'WEP_02':
      weaponTypeVal = 2;
      fireRateCooldown = 1.5;
      damageMultiplier = 2.0;
      projectileSpeed = 250;
      break;
    case 'WEP_03':
      weaponTypeVal = 3;
      fireRateCooldown = 1.0;
      damageMultiplier = 1.0;
      projectileSpeed = 350;
      break;
    case 'WEP_04':
      weaponTypeVal = 4;
      fireRateCooldown = 0.8;
      damageMultiplier = 0.9;
      projectileSpeed = 450;
      break;
    case 'WEP_05':
      weaponTypeVal = 5;
      fireRateCooldown = 2.0;
      damageMultiplier = 1.2;
      projectileSpeed = 0; // orbits
      break;
  }

  // Adjust fire rate cooldown based on Intelligence (-2% skill/weapon cooldown per INT point)
  // Cap cooldown reduction at 60%
  const cdrMultiplier = Math.max(0.4, 1 - finalInt * 0.02);
  const adjustedCooldown = fireRateCooldown * cdrMultiplier;

  world.weaponType[id] = weaponTypeVal;
  world.weaponFireRateCooldown[id] = adjustedCooldown;
  world.weaponDamageMultiplier[id] = damageMultiplier;
  world.weaponProjectileSpeed[id] = projectileSpeed;

  // 5. Store AI Configuration
  // aiCurrentState holds selected AI core index:
  // 1 = Kiting, 2 = Aggressive, 3 = Adaptive
  if (selectedAICore === 'Kiting') {
    world.aiCurrentState[id] = 1;
  } else if (selectedAICore === 'Aggressive') {
    world.aiCurrentState[id] = 2;
  } else {
    world.aiCurrentState[id] = 3;
  }

  // 6. Spawn Oracle-Z Companion Drone (CHR_06 unique perk)
  if (selectedAutomaton === 'CHR_06') {
    const droneId = world.createEntity();
    world.addComponent(droneId, Component.Transform | Component.Collider | Component.Tag | Component.Weapon);
    
    world.transformX[droneId] = x + 30;
    world.transformY[droneId] = y - 30;
    world.transformVx[droneId] = 0;
    world.transformVy[droneId] = 0;
    world.transformRotation[droneId] = 0;
    
    world.colliderRadius[droneId] = 8;
    world.colliderLayerMask[droneId] = Layer.None; // Drone doesn't take damage/collide
    
    world.tagIsProjectile[droneId] = 1; // Mark as projectile for easy render pipeline
    world.projectileType[droneId] = 7;  // Type 7 = Companion Drone
    
    world.weaponFireRateTimer[droneId] = 0;
    world.weaponFireRateCooldown[droneId] = 1.2; // Fires once every 1.2s
    world.weaponDamageMultiplier[droneId] = 0.5;
    world.weaponProjectileSpeed[droneId] = 400;
    world.weaponType[droneId] = 1; // standard bolts
  }

  return id;
}
