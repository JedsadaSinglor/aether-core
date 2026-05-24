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
import { Heart, Hexagon, PowerOff, ChevronsUp, Crosshair, Cpu } from 'lucide-react';

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
            padding: '10px 14px',
            pointerEvents: 'auto'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--color-brass)', textTransform: 'uppercase', fontWeight: 600 }}>
              Current Stage
            </div>
            <div className="font-display text-cyan" style={{ fontSize: '1.4rem', lineHeight: '1' }}>
              Stage {stage}
            </div>
          </div>
          
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '0.7rem', color: '#E2E8F0', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
              <Cpu size={12} color="var(--color-brass)" />
              {currentAutomatonName}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--color-aether-magenta)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
              <Crosshair size={12} />
              AI: {playerConfig.selectedAICore}
            </div>
          </div>
        </div>

        {/* Health Bar Overlay */}
        <div className="glass-panel" style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#FFFFFF', fontWeight: 600 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Heart size={12} style={{ color: 'var(--color-hp-full)' }} /> INTEGRITY
            </span>
            <span>{Math.max(0, Math.floor(hp))} / {Math.floor(maxHp)}</span>
          </div>
          <div 
            style={{ 
              height: '10px', 
              background: 'rgba(0,0,0,0.7)', 
              borderRadius: '5px', 
              border: '1px solid rgba(181, 166, 66, 0.4)',
              overflow: 'hidden' 
            }}
          >
            <div 
              style={{ 
                height: '100%', 
                width: `${Math.max(0, (hp / maxHp) * 100)}%`, 
                background: 'linear-gradient(90deg, #FF3131, #39FF14)',
                boxShadow: '0 0 10px rgba(57, 255, 20, 0.6)',
                transition: 'width 0.2s ease-out' 
              }}
            />
          </div>
        </div>

        {/* EXP Bar Overlay */}
        <div className="glass-panel" style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#FFFFFF', fontWeight: 600 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Hexagon size={12} className="text-cyan" /> AETHER ENERGY
            </span>
            <span>{Math.floor(exp)} / {Math.floor(nextExp)}</span>
          </div>
          <div 
            style={{ 
              height: '8px', 
              background: 'rgba(0,0,0,0.7)', 
              borderRadius: '4px', 
              border: '1px solid rgba(0, 229, 255, 0.3)',
              overflow: 'hidden' 
            }}
          >
            <div 
              style={{ 
                height: '100%', 
                width: `${Math.min(100, (exp / nextExp) * 100)}%`, 
                background: 'linear-gradient(90deg, rgba(0,229,255,0.5), var(--color-aether-cyan))',
                boxShadow: '0 0 10px var(--color-aether-glow)',
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
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--color-brass)', fontWeight: 600, letterSpacing: '0.05em' }}>ARMAMENT ENGAGED</div>
            <div className="font-display text-cyan" style={{ fontSize: '1rem' }}>{currentWeaponName}</div>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#A0AEC0', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '0.6rem', color: 'var(--color-brass)' }}>TRACKING</span>
            <span>{entityCount} ENTITIES</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn-secondary" 
            onClick={handleBackToMenu}
            style={{ flex: 1, padding: '10px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <PowerOff size={14} /> Abort
          </button>
          
          <button 
            className="btn-primary" 
            onClick={handleTestLevelUp}
            style={{ flex: 2, padding: '10px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <ChevronsUp size={14} /> Trigger Level-Up
          </button>
        </div>
      </div>
    </div>
  );
}

const AUTOMATONS_NAMES: Record<string, string> = {
  CHR_01: 'Aegis-01',
  CHR_02: 'Zephyr-V',
  CHR_03: 'Nova-X',
  CHR_04: 'Shadow-9',
  CHR_05: 'Titan-K',
  CHR_06: 'Oracle-Z',
};

const WEAPONS = [
  { id: 'WEP_01', name: 'Aether Repeater' },
  { id: 'WEP_02', name: 'Arcane Cannon' },
  { id: 'WEP_03', name: 'Chrono-Boomerang' },
  { id: 'WEP_04', name: 'Tesla Chain' },
  { id: 'WEP_05', name: 'Aether Sawblades' }
];
