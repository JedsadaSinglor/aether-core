import { World } from './World';
import { Component, Layer } from './components';

export const ObjectPool = {
  /**
   * Spawns the player entity.
   */
  spawnPlayer(
    world: World,
    x: number,
    y: number,
    hp: number,
    atk: number,
    def: number,
    moveSpeed: number,
    attackSpeed: number,
    luk: number,
    int: number
  ): number {
    const id = world.createEntity();
    
    world.addComponent(id, Component.Transform | Component.Stats | Component.Collider | Component.Tag | Component.Weapon);
    
    world.transformX[id] = x;
    world.transformY[id] = y;
    world.transformVx[id] = 0;
    world.transformVy[id] = 0;
    world.transformRotation[id] = -Math.PI / 2; // Face upwards initially
    
    world.statsHP[id] = hp;
    world.statsMaxHP[id] = hp;
    world.statsATK[id] = atk;
    world.statsMoveSpeed[id] = moveSpeed;
    world.statsAttackSpeed[id] = attackSpeed;
    world.statsDEF[id] = def;
    world.statsLUK[id] = luk;
    world.statsINT[id] = int;
    
    world.colliderRadius[id] = 16;
    world.colliderLayerMask[id] = Layer.Player;
    
    world.tagIsPlayer[id] = 1;
    
    // Weapon base setup
    world.weaponFireRateTimer[id] = 0;
    world.weaponFireRateCooldown[id] = 1.0; // Seconds between shots default
    world.weaponDamageMultiplier[id] = 1.0;
    world.weaponProjectileSpeed[id] = 400; // Pixels per second
    world.weaponType[id] = 1; // Default WEP_01 Repeater
    
    return id;
  },

  /**
   * Spawns an enemy entity.
   */
  spawnEnemy(
    world: World,
    x: number,
    y: number,
    type: number, // 1 = Swarmer, 2 = Ranged, 3 = Elite, 4 = Boss
    hp: number,
    atk: number,
    def: number,
    moveSpeed: number,
    radius: number
  ): number {
    const id = world.createEntity();
    
    world.addComponent(id, Component.Transform | Component.Stats | Component.Collider | Component.Tag | Component.AI);
    
    world.transformX[id] = x;
    world.transformY[id] = y;
    world.transformVx[id] = 0;
    world.transformVy[id] = 0;
    world.transformRotation[id] = 0;
    
    world.statsHP[id] = hp;
    world.statsMaxHP[id] = hp;
    world.statsATK[id] = atk;
    world.statsMoveSpeed[id] = moveSpeed;
    world.statsAttackSpeed[id] = 1.0;
    world.statsDEF[id] = def;
    
    world.colliderRadius[id] = radius;
    world.colliderLayerMask[id] = Layer.Enemy;
    
    world.tagIsEnemy[id] = 1;
    
    // AI Setup
    world.aiCurrentState[id] = 0; // Default Idle/Chase
    world.aiTargetId[id] = -1;
    world.aiStateTimer[id] = 0;
    
    // Boss specific addition
    if (type === 4) {
      world.addComponent(id, Component.Weapon);
      world.weaponFireRateTimer[id] = 0;
      world.weaponFireRateCooldown[id] = 2.0;
      world.weaponDamageMultiplier[id] = 1.2;
      world.weaponProjectileSpeed[id] = 250;
      world.weaponType[id] = 1; // default weapon for boss projectiles
    } else if (type === 2) {
      // Ranged enemies need a weapon to fire at player
      world.addComponent(id, Component.Weapon);
      world.weaponFireRateTimer[id] = Math.random() * 2.0; // staggered spawn fire
      world.weaponFireRateCooldown[id] = 2.5;
      world.weaponDamageMultiplier[id] = 0.8;
      world.weaponProjectileSpeed[id] = 200;
      world.weaponType[id] = 1;
    }
    
    return id;
  },

  /**
   * Spawns a projectile.
   */
  spawnProjectile(
    world: World,
    ownerId: number,
    x: number,
    y: number,
    vx: number,
    vy: number,
    type: number, // 1 to 5
    damageMultiplier: number,
    speed: number,
    pierce: number,
    bounce: number,
    radius: number
  ): number {
    const id = world.createEntity();
    
    world.addComponent(id, Component.Transform | Component.Collider | Component.Tag | Component.Projectile);
    
    world.transformX[id] = x;
    world.transformY[id] = y;
    
    // Normalize and multiply by speed
    const length = Math.sqrt(vx * vx + vy * vy);
    if (length > 0) {
      world.transformVx[id] = (vx / length) * speed;
      world.transformVy[id] = (vy / length) * speed;
    } else {
      world.transformVx[id] = 0;
      world.transformVy[id] = -speed;
    }
    
    world.transformRotation[id] = Math.atan2(vy, vx);
    
    world.colliderRadius[id] = radius;
    
    const isPlayerOwned = world.tagIsPlayer[ownerId] === 1;
    world.colliderLayerMask[id] = isPlayerOwned ? Layer.ProjectilePlayer : Layer.ProjectileEnemy;
    world.tagIsProjectile[id] = 1;
    
    world.projectileOwner[id] = isPlayerOwned ? 1 : 2;
    world.projectileType[id] = type;
    world.projectilePierce[id] = pierce;
    world.projectileBounce[id] = bounce;
    world.projectileTimer[id] = 0;
    
    // Stats component to carry projectile damage details
    world.addComponent(id, Component.Stats);
    world.statsATK[id] = world.statsATK[ownerId]; // Inherit base attack from owner
    world.statsLUK[id] = world.statsLUK[ownerId]; // Inherit luk for crits
    world.statsINT[id] = world.statsINT[ownerId]; // Inherit int for skill/magic boosts
    world.weaponDamageMultiplier[id] = damageMultiplier;
    
    return id;
  },

  /**
   * Spawns an EXP Orb.
   */
  spawnOrb(world: World, x: number, y: number, value: number): number {
    const id = world.createEntity();
    
    world.addComponent(id, Component.Transform | Component.Collider | Component.Tag | Component.Orb);
    
    world.transformX[id] = x;
    world.transformY[id] = y;
    world.transformVx[id] = 0;
    world.transformVy[id] = 0;
    
    world.colliderRadius[id] = 8;
    world.colliderLayerMask[id] = Layer.Orb;
    
    world.tagIsOrb[id] = 1;
    world.orbValue[id] = value;
    
    return id;
  },

  /**
   * Spawns a floating damage popup.
   */
  spawnPopup(world: World, x: number, y: number, value: number, isCrit: boolean): number {
    const id = world.createEntity();
    
    world.addComponent(id, Component.Transform | Component.Tag | Component.Popup);
    
    world.transformX[id] = x;
    world.transformY[id] = y;
    world.transformVx[id] = (Math.random() - 0.5) * 40; // float slightly sideways
    world.transformVy[id] = -60 - Math.random() * 40; // float upwards speed
    
    world.tagIsPopup[id] = 1;
    world.popupValue[id] = value;
    world.popupLifetime[id] = 0.8; // seconds
    world.popupMaxLifetime[id] = 0.8;
    world.popupIsCrit[id] = isCrit ? 1 : 0;
    
    return id;
  }
};
