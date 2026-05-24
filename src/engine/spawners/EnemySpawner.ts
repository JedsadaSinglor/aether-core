import { World } from '../World';
import { ObjectPool } from '../ObjectPool';
import { useGameStore } from '../../store/gameStore';

// Spawner state tracked locally
let currentStage = 1;
let waveActive = false;
let waveClearedTimer = 0;
let spawnerCooldown = 2.0; // 2 seconds between waves

/**
 * Handles stage progressions and spawning waves of enemies scaled by current Stage.
 * Spawns a Boss every 10 stages.
 */
export function EnemySpawner(world: World, dt: number): void {
  // Count current active enemies in the world
  let activeEnemies = 0;
  for (let e = 0; e < world.maxEntities; e++) {
    if (world.active[e] === 1 && world.tagIsEnemy[e] === 1) {
      activeEnemies++;
    }
  }

  // 1. WAVE ACTIVE MANAGEMENT
  if (waveActive) {
    if (activeEnemies === 0) {
      // Wave cleared! Start transition timer to next stage
      waveActive = false;
      waveClearedTimer = 0;
      
      // Award stage clear bonuses (e.g., spawn a batch of high-value EXP Orbs at center)
      ObjectPool.spawnOrb(world, 225, 400, 50); // Large stage clear orb
      
      // Trigger floating success indicator
      ObjectPool.spawnPopup(world, 225, 380, 999, true); // Visual completion jackpot
    }
    return;
  }

  // 2. WAVE COOLDOWN / TRANSITION TIMEOUT
  waveClearedTimer += dt;
  if (waveClearedTimer < spawnerCooldown) return;

  // Prepare next wave!
  const store = useGameStore.getState();
  
  // If player returned to menu or reset, sync spawner stage
  if (store.gameState === 'PRE_RUN') {
    currentStage = 1;
    waveActive = false;
    return;
  }

  // Progress stage
  if (waveClearedTimer >= spawnerCooldown) {
    currentStage = store.runStats.currentStage;
    if (activeEnemies === 0) {
      // If we cleared, increment stage
      currentStage += 1;
      store.setRunStats({ currentStage });
    }
    waveClearedTimer = 0;
  }

  // 3. SPAWN WAVE
  waveActive = true;
  
  // Calculate scaled health and attack values (GDD formulas)
  // HP = 50 * (1 + Stage * 0.15)
  // ATK = 5 * (1 + Stage * 0.08)
  const baseHp = 50 * (1 + currentStage * 0.15);
  const baseAtk = 5 * (1 + currentStage * 0.08);

  const width = 450;
  const height = 800;

  // Spawn position utility: Spawns at screen borders (outside 9:16 frame)
  const getSpawnPos = () => {
    const border = Math.floor(Math.random() * 4); // 0 = Top, 1 = Bottom, 2 = Left, 3 = Right
    const buffer = 30; // spawn 30px off-screen
    
    switch (border) {
      case 0: return { x: Math.random() * width, y: -buffer };
      case 1: return { x: Math.random() * width, y: height + buffer };
      case 2: return { x: -buffer, y: Math.random() * height };
      default: return { x: width + buffer, y: Math.random() * height };
    }
  };

  // --- BOSS FIGHT SPAWNING (Every 10 Stages) ---
  if (currentStage % 10 === 0) {
    // Spawn Boss: "The Brass Colossus" at the top center
    const bx = width / 2;
    const by = 120;
    
    // Boss stats scale heavily: 6x health, 1.5x attack, large radius
    const bossHp = baseHp * 6.5;
    const bossAtk = baseAtk * 1.5;
    
    ObjectPool.spawnEnemy(
      world,
      bx,
      by,
      4, // Type 4 = Boss
      bossHp,
      bossAtk,
      15 + currentStage, // Def scales
      35, // slow speed
      36  // Giant radius
    );
    
    // Spawn floating warning text
    ObjectPool.spawnPopup(world, bx, by - 30, 0, true); // warning text trigger
    return;
  }

  // --- STANDARD WAVE SPAWNING ---
  // Swarmers count: scales up with stage
  const swarmersCount = Math.min(25, 4 + currentStage * 2);
  for (let s = 0; s < swarmersCount; s++) {
    const pos = getSpawnPos();
    ObjectPool.spawnEnemy(
      world,
      pos.x,
      pos.y,
      1, // Type 1 = Swarmer
      baseHp * 0.8, // lower HP for swarmers
      baseAtk * 0.7, // lower ATK
      0, // DEF
      90 + Math.random() * 20, // fast speed
      11 // Small radius
    );
  }

  // Ranged count: appears after Stage 2
  if (currentStage >= 2) {
    const rangedCount = Math.min(8, Math.floor(currentStage / 2));
    for (let r = 0; r < rangedCount; r++) {
      const pos = getSpawnPos();
      ObjectPool.spawnEnemy(
        world,
        pos.x,
        pos.y,
        2, // Type 2 = Ranged
        baseHp * 1.0, // standard HP
        baseAtk * 0.9,
        2, //DEF
        60, // slow speed
        14 // Medium radius
      );
    }
  }

  // Elites count: appears after Stage 5
  if (currentStage >= 5) {
    const elitesCount = Math.min(4, Math.floor((currentStage - 4) / 2) + 1);
    for (let e = 0; e < elitesCount; e++) {
      const pos = getSpawnPos();
      ObjectPool.spawnEnemy(
        world,
        pos.x,
        pos.y,
        3, // Type 3 = Elite
        baseHp * 2.2, // high HP
        baseAtk * 1.3, // heavy hit
        8 + currentStage * 0.5, // high DEF
        45, // very slow speed
        20 // Large radius
      );
    }
  }
}

/**
 * Resets local spawner states (for restart/new run triggers).
 */
export function resetSpawnerState(): void {
  currentStage = 1;
  waveActive = false;
  waveClearedTimer = 0;
}
