export const Component = {
  None: 0,
  Transform: 1 << 0,
  Stats: 1 << 1,
  AI: 1 << 2,
  Weapon: 1 << 3,
  Collider: 1 << 4,
  Tag: 1 << 5,
  Projectile: 1 << 6,
  Orb: 1 << 7,
  Popup: 1 << 8
} as const;

export type ComponentType = typeof Component[keyof typeof Component];

export const Layer = {
  None: 0,
  Player: 1 << 0,
  Enemy: 1 << 1,
  ProjectilePlayer: 1 << 2,
  ProjectileEnemy: 1 << 3,
  Orb: 1 << 4
} as const;

export type LayerType = typeof Layer[keyof typeof Layer];

export const AIState = {
  Idle: 0,
  Kiting: 1,
  Aggressive: 2,
  Adaptive: 3,
  BossDefault: 4
} as const;

export type AIStateType = typeof AIState[keyof typeof AIState];

export const MAX_ENTITIES = 1500;
