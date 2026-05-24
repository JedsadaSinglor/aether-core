import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { World } from '../engine/World';
import { GameLoop } from '../engine/GameLoop';
import { spawnPlayerFromConfig } from '../engine/PlayerStatsBridge';
import { AISystem } from '../engine/systems/AISystem';
import { CombatSystem } from '../engine/systems/CombatSystem';
import { CollisionSystem } from '../engine/systems/CollisionSystem';
import { EnemySpawner, resetSpawnerState } from '../engine/spawners/EnemySpawner';
import { SkillSystem } from '../engine/systems/SkillSystem';

export default function CombatScreen() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const loopRef = useRef<GameLoop | null>(null);
  const worldRef = useRef<World | null>(null);

  const { playerConfig, setGameState, resetGame } = useGameStore();

  const [hp, setHp] = useState(100);
  const [maxHp, setMaxHp] = useState(100);
  const [exp, setExp] = useState(0);
  const [nextExp, setNextExp] = useState(100);
  const [stage, setStage] = useState(1);
  const [entityCount, setEntityCount] = useState(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    // 1. Create World
    const world = new World(1500);
    worldRef.current = world;

    // 2. Setup Canvas
    const canvas = canvasRef.current;
    canvas.width = 450;
    canvas.height = 800;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 3. Initialize Game Loop
    const loop = new GameLoop(world, ctx);
    loopRef.current = loop;

    // 4. Spawn Player based on configured stats
    const playerId = spawnPlayerFromConfig(world, playerConfig, 225, 400);
    setHp(world.statsHP[playerId]);
    setMaxHp(world.statsMaxHP[playerId]);

    // 5. Initialize Enemy Spawner State
    resetSpawnerState();

    // 6. Bind Official Logic Systems
    loop.aiSystem = AISystem;
    loop.combatSystem = CombatSystem;
    loop.collisionSystem = CollisionSystem;
    loop.waveSpawner = EnemySpawner;
    loop.skillSystem = SkillSystem;

    // 7. Start Loop
    loop.start(() => {
      // Sync Player State details dynamically to React HUD
      let pIdx = -1;
      for (let i = 0; i < world.maxEntities; i++) {
        if (world.active[i] === 1 && world.tagIsPlayer[i] === 1) {
          pIdx = i;
          break;
        }
      }

      if (pIdx !== -1) {
        setHp(world.statsHP[pIdx]);
        setMaxHp(world.statsMaxHP[pIdx]);
        setExp(world.playerEXP);
        
        // Synced required EXP
        const reqExp = Math.floor(100 * Math.pow(world.playerLevel, 1.2));
        setNextExp(reqExp);
      }

      // Sync stage level from store
      const store = useGameStore.getState();
      setStage(store.runStats.currentStage);

      // Sync active entity count
      let activeCount = 0;
      for (let e = 0; e < world.maxEntities; e++) {
        if (world.active[e] === 1) activeCount++;
      }
      setEntityCount(activeCount);
    });

    return () => {
      loop.stop();
    };
  }, [playerConfig]);

  const handleBackToMenu = () => {
    resetGame();
    setGameState('PRE_RUN');
  };

  const handleTestLevelUp = () => {
    // Manually trigger a level up to test state machine transitions later
    setExp(0);
    setGameState('ROULETTE');
  };

  // Get name of current weapon
  const currentWeaponName = WEAPONS.find(w => w.id === playerConfig.selectedWeapon)?.name || 'Weapon';
  const currentAutomatonName = AUTOMATONS_NAMES[playerConfig.selectedAutomaton] || 'Automaton';

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Game Canvas */}
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />

      {/* Top HUD Area */}
      <div 
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          right: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          pointerEvents: 'none'
        }}
      >
        {/* Stage & Details HUD bar */}
        <div 
          className="glass-panel-neon" 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '8px 12px',
            pointerEvents: 'auto'
          }}
        >
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--color-brass)', textTransform: 'uppercase' }}>
              Current Stage
            </div>
            <div className="font-display text-cyan" style={{ fontSize: '1.2rem' }}>
              Stage {stage}
            </div>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.65rem', color: '#A0AEC0' }}>
              {currentAutomatonName}
            </div>
            <div style={{ fontSize: '0.6rem', color: 'var(--color-aether-magenta)', textTransform: 'uppercase' }}>
              AI Core: {playerConfig.selectedAICore}
            </div>
          </div>
        </div>

        {/* Health Bar Overlay */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#FFFFFF' }}>
            <span>AETHER STRUCTURE INTEGRITY</span>
            <span>{hp} / {maxHp}</span>
          </div>
          <div 
            style={{ 
              height: '8px', 
              background: 'rgba(0,0,0,0.5)', 
              borderRadius: '4px', 
              border: '1px solid rgba(181, 166, 66, 0.2)',
              overflow: 'hidden' 
            }}
          >
            <div 
              style={{ 
                height: '100%', 
                width: `${(hp / maxHp) * 100}%`, 
                background: 'linear-gradient(90deg, #FF3131, #39FF14)',
                boxShadow: '0 0 8px rgba(57, 255, 20, 0.6)',
                transition: 'width 0.3s ease' 
              }}
            />
          </div>
        </div>

        {/* EXP Bar Overlay */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#FFFFFF' }}>
            <span>AETHER ENERGY LEVEL</span>
            <span>{exp} / {nextExp}</span>
          </div>
          <div 
            style={{ 
              height: '6px', 
              background: 'rgba(0,0,0,0.5)', 
              borderRadius: '3px', 
              border: '1px solid rgba(0, 229, 255, 0.1)',
              overflow: 'hidden' 
            }}
          >
            <div 
              style={{ 
                height: '100%', 
                width: `${(exp / nextExp) * 100}%`, 
                background: 'var(--color-aether-cyan)',
                boxShadow: '0 0 6px var(--color-aether-cyan)',
                transition: 'width 0.3s ease' 
              }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Controls Panel */}
      <div 
        className="glass-panel" 
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          right: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--color-brass)' }}>ARMAMENT ENGAGED</div>
            <div className="font-display text-cyan" style={{ fontSize: '0.9rem' }}>{currentWeaponName}</div>
          </div>
          <div style={{ fontSize: '0.65rem', color: '#8892B0' }}>
            Entities: {entityCount}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn-secondary" 
            onClick={handleBackToMenu}
            style={{ flex: 1, padding: '8px', fontSize: '0.75rem' }}
          >
            Abort Sequence
          </button>
          
          <button 
            className="btn-primary" 
            onClick={handleTestLevelUp}
            style={{ flex: 1, padding: '8px', fontSize: '0.75rem' }}
          >
            Trigger Level-Up
          </button>
        </div>
      </div>
    </div>
  );
}

const AUTOMATONS_NAMES: Record<string, string> = {
  CHR_01: 'Aegis-01 (Knight)',
  CHR_02: 'Zephyr-V (Scout)',
  CHR_03: 'Nova-X (Mage)',
  CHR_04: 'Shadow-9 (Assassin)',
  CHR_05: 'Titan-K (Heavy)',
  CHR_06: 'Oracle-Z (Support)',
};

const WEAPONS = [
  { id: 'WEP_01', name: 'Aether Repeater' },
  { id: 'WEP_02', name: 'Arcane Cannon' },
  { id: 'WEP_03', name: 'Chrono-Boomerang' },
  { id: 'WEP_04', name: 'Tesla Chain' },
  { id: 'WEP_05', name: 'Aether Sawblades' }
];
