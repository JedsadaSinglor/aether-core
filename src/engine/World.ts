import { Component, type ComponentType, MAX_ENTITIES } from './components';

export class World {
  public maxEntities: number;
  
  // Run Leveling Metrics
  public playerEXP: number = 0;
  public playerLevel: number = 1;
  public playerShields: number = 0;
  public playerShieldTimer: number = 10.0;
  public playerCastCount: number = 0;
  public titanEnergy: number = 0;
  public maxTitanEnergy: number = 100;
  public screenShake: number = 0;
  
  
  // Entity activity and masks
  public active: Uint8Array;
  public masks: Uint32Array;
  
  // Transform Component
  public transformX: Float32Array;
  public transformY: Float32Array;
  public transformVx: Float32Array;
  public transformVy: Float32Array;
  public transformRotation: Float32Array;
  
  // Stats Component
  public statsHP: Float32Array;
  public statsMaxHP: Float32Array;
  public statsATK: Float32Array;
  public statsMoveSpeed: Float32Array;
  public statsAttackSpeed: Float32Array;
  public statsDEF: Float32Array;
  public statsLUK: Float32Array;
  public statsINT: Float32Array;
  
  // AI Component
  public aiCurrentState: Uint8Array;
  public aiTargetId: Int16Array;
  public aiStateTimer: Float32Array;
  
  // Weapon Component
  public weaponFireRateTimer: Float32Array;
  public weaponFireRateCooldown: Float32Array;
  public weaponDamageMultiplier: Float32Array;
  public weaponProjectileSpeed: Float32Array;
  public weaponType: Uint8Array; // WEP_01 to WEP_05
  
  // Collider Component
  public colliderRadius: Float32Array;
  public colliderLayerMask: Uint8Array;
  
  // Tag Component
  public tagIsPlayer: Uint8Array;
  public tagIsEnemy: Uint8Array;
  public tagIsProjectile: Uint8Array;
  public tagIsOrb: Uint8Array;
  public tagIsPopup: Uint8Array;
  
  // Projectile Component Extra
  public projectileOwner: Uint8Array; // 1 = Player, 2 = Enemy
  public projectilePierce: Int8Array;
  public projectileBounce: Int8Array;
  public projectileType: Uint8Array; // 1 = Repeater, 2 = Cannon, 3 = Boomerang, 4 = Tesla, 5 = Sawblade
  public projectileAngle: Float32Array; // For circular movement if needed (e.g. sawblades)
  public projectileTimer: Float32Array; // Duration tracking for sawblades/boomerang
  
  // Orb Component Extra
  public orbValue: Float32Array;
  
  // Popup Component Extra
  public popupValue: Int32Array;
  public popupLifetime: Float32Array; // in seconds
  public popupMaxLifetime: Float32Array;
  public popupIsCrit: Uint8Array;
  
  // Next search index for object pool optimizations
  private nextFreeIndex: number = 0;

  constructor(maxEntities: number = MAX_ENTITIES) {
    this.maxEntities = maxEntities;
    
    this.active = new Uint8Array(maxEntities);
    this.masks = new Uint32Array(maxEntities);
    
    this.transformX = new Float32Array(maxEntities);
    this.transformY = new Float32Array(maxEntities);
    this.transformVx = new Float32Array(maxEntities);
    this.transformVy = new Float32Array(maxEntities);
    this.transformRotation = new Float32Array(maxEntities);
    
    this.statsHP = new Float32Array(maxEntities);
    this.statsMaxHP = new Float32Array(maxEntities);
    this.statsATK = new Float32Array(maxEntities);
    this.statsMoveSpeed = new Float32Array(maxEntities);
    this.statsAttackSpeed = new Float32Array(maxEntities);
    this.statsDEF = new Float32Array(maxEntities);
    this.statsLUK = new Float32Array(maxEntities);
    this.statsINT = new Float32Array(maxEntities);
    
    this.aiCurrentState = new Uint8Array(maxEntities);
    this.aiTargetId = new Int16Array(maxEntities);
    this.aiStateTimer = new Float32Array(maxEntities);
    this.aiTargetId.fill(-1);
    
    this.weaponFireRateTimer = new Float32Array(maxEntities);
    this.weaponFireRateCooldown = new Float32Array(maxEntities);
    this.weaponDamageMultiplier = new Float32Array(maxEntities);
    this.weaponProjectileSpeed = new Float32Array(maxEntities);
    this.weaponType = new Uint8Array(maxEntities);
    
    this.colliderRadius = new Float32Array(maxEntities);
    this.colliderLayerMask = new Uint8Array(maxEntities);
    
    this.tagIsPlayer = new Uint8Array(maxEntities);
    this.tagIsEnemy = new Uint8Array(maxEntities);
    this.tagIsProjectile = new Uint8Array(maxEntities);
    this.tagIsOrb = new Uint8Array(maxEntities);
    this.tagIsPopup = new Uint8Array(maxEntities);
    
    this.projectileOwner = new Uint8Array(maxEntities);
    this.projectilePierce = new Int8Array(maxEntities);
    this.projectileBounce = new Int8Array(maxEntities);
    this.projectileType = new Uint8Array(maxEntities);
    this.projectileAngle = new Float32Array(maxEntities);
    this.projectileTimer = new Float32Array(maxEntities);
    
    this.orbValue = new Float32Array(maxEntities);
    
    this.popupValue = new Int32Array(maxEntities);
    this.popupLifetime = new Float32Array(maxEntities);
    this.popupMaxLifetime = new Float32Array(maxEntities);
    this.popupIsCrit = new Uint8Array(maxEntities);
  }

  /**
   * Acquire a free entity ID from the pool.
   * Time complexity: O(1) average due to cached nextFreeIndex, O(N) worst-case.
   */
  public createEntity(): number {
    const start = this.nextFreeIndex;
    
    for (let i = 0; i < this.maxEntities; i++) {
      const idx = (start + i) % this.maxEntities;
      if (this.active[idx] === 0) {
        this.active[idx] = 1;
        this.masks[idx] = Component.None;
        
        // Reset entity variables to clear dirty state from pool reuse
        this.transformX[idx] = 0;
        this.transformY[idx] = 0;
        this.transformVx[idx] = 0;
        this.transformVy[idx] = 0;
        this.transformRotation[idx] = 0;
        
        this.statsHP[idx] = 0;
        this.statsMaxHP[idx] = 0;
        this.statsATK[idx] = 0;
        this.statsMoveSpeed[idx] = 0;
        this.statsAttackSpeed[idx] = 1;
        this.statsDEF[idx] = 0;
        this.statsLUK[idx] = 0;
        this.statsINT[idx] = 0;
        
        this.aiCurrentState[idx] = 0;
        this.aiTargetId[idx] = -1;
        this.aiStateTimer[idx] = 0;
        
        this.weaponFireRateTimer[idx] = 0;
        this.weaponFireRateCooldown[idx] = 0;
        this.weaponDamageMultiplier[idx] = 1;
        this.weaponProjectileSpeed[idx] = 0;
        this.weaponType[idx] = 0;
        
        this.colliderRadius[idx] = 0;
        this.colliderLayerMask[idx] = 0;
        
        this.tagIsPlayer[idx] = 0;
        this.tagIsEnemy[idx] = 0;
        this.tagIsProjectile[idx] = 0;
        this.tagIsOrb[idx] = 0;
        this.tagIsPopup[idx] = 0;
        
        this.projectileOwner[idx] = 0;
        this.projectilePierce[idx] = 0;
        this.projectileBounce[idx] = 0;
        this.projectileType[idx] = 0;
        this.projectileAngle[idx] = 0;
        this.projectileTimer[idx] = 0;
        
        this.orbValue[idx] = 0;
        
        this.popupValue[idx] = 0;
        this.popupLifetime[idx] = 0;
        this.popupMaxLifetime[idx] = 0;
        this.popupIsCrit[idx] = 0;
        
        this.nextFreeIndex = (idx + 1) % this.maxEntities;
        return idx;
      }
    }
    
    throw new Error('ECS Engine: Maximum entity limit reached (1500 entities)!');
  }

  /**
   * Release/destroy an entity, returning it to the pool.
   */
  public destroyEntity(id: number): void {
    if (id < 0 || id >= this.maxEntities) return;
    this.active[id] = 0;
    this.masks[id] = Component.None;
    this.aiTargetId[id] = -1;
  }

  public addComponent(id: number, component: ComponentType): void {
    this.masks[id] |= component;
  }

  public removeComponent(id: number, component: ComponentType): void {
    this.masks[id] &= ~component;
  }

  public hasComponent(id: number, component: ComponentType): boolean {
    return (this.masks[id] & component) === component;
  }

  public clear(): void {
    this.active.fill(0);
    this.masks.fill(Component.None);
    this.aiTargetId.fill(-1);
    this.nextFreeIndex = 0;
    this.playerEXP = 0;
    this.playerLevel = 1;
    this.playerShields = 0;
    this.playerShieldTimer = 10.0;
    this.playerCastCount = 0;
    this.titanEnergy = 0;
    this.maxTitanEnergy = 100;
    this.screenShake = 0;
  }
}
