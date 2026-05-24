import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Skull, Activity, Layers, Cpu, Crosshair, BrainCircuit, RefreshCw } from 'lucide-react';

const CHARACTER_NAMES: Record<string, string> = {
  CHR_01: 'Aegis-01',
  CHR_02: 'Zephyr-V',
  CHR_03: 'Nova-X',
  CHR_04: 'Shadow-9',
  CHR_05: 'Titan-K',
  CHR_06: 'Oracle-Z'
};

const WEAPON_NAMES: Record<string, string> = {
  WEP_01: 'Aether Repeater',
  WEP_02: 'Arcane Cannon',
  WEP_03: 'Chrono-Boomerang',
  WEP_04: 'Tesla Chain',
  WEP_05: 'Aether Sawblades'
};

const GameOverScreen: React.FC = () => {
  const { playerConfig, runStats, resetGame } = useGameStore();

  const charName = CHARACTER_NAMES[playerConfig.selectedAutomaton] || playerConfig.selectedAutomaton;
  const wepName = WEAPON_NAMES[playerConfig.selectedWeapon] || playerConfig.selectedWeapon;

  return (
    <div 
      className="fade-in"
      style={{
        width: '100%',
        height: '100%',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        background: 'radial-gradient(circle at center, rgba(31, 40, 51, 0.4) 0%, rgba(11, 12, 16, 0.95) 100%)',
        overflowY: 'auto',
        overflowX: 'hidden'
      }}
    >
      {/* Red Alert Diagnostic Header */}
      <div style={{ textAlign: 'center', width: '100%', marginTop: '10px', marginBottom: '20px' }}>
        <div 
          className="text-magenta" 
          style={{ 
            fontSize: '1.8rem', 
            fontWeight: 800,
            letterSpacing: '0.15em',
            animation: 'pulse-text 1.5s infinite alternate',
            fontFamily: 'var(--font-primary)'
          }}
        >
          SYSTEM COMPROMISED
        </div>
        <div 
          style={{ 
            fontSize: '0.75rem', 
            color: 'var(--color-hp-low)', 
            textTransform: 'uppercase', 
            letterSpacing: '0.2em',
            marginTop: '4px',
            fontFamily: 'var(--font-primary)',
            opacity: 0.8
          }}
        >
          — Construct Critical Failure —
        </div>
      </div>

      {/* Decorative Stained-glass Aether Core breakdown */}
      <div 
        style={{
          position: 'relative',
          width: '100px',
          height: '100px',
          margin: '0 auto 24px auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexShrink: 0
        }}
      >
        {/* Outer rotating/pulsing ring */}
        <div 
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: '2px dashed rgba(255, 49, 49, 0.4)',
            animation: 'spin 15s linear infinite'
          }}
        />
        {/* Inner shattered frame */}
        <div 
          style={{
            position: 'absolute',
            width: '80%',
            height: '80%',
            borderRadius: '50%',
            border: '3px double var(--color-hp-low)',
            boxShadow: '0 0 20px rgba(255, 49, 49, 0.5)'
          }}
        />
        {/* Fractured center core */}
        <div 
          style={{
            width: '24px',
            height: '24px',
            backgroundColor: '#FF3131',
            borderRadius: '4px',
            transform: 'rotate(45deg)',
            boxShadow: '0 0 25px #FF3131'
          }}
        />
      </div>

      {/* Diagnostics Terminal Readout */}
      <div 
        className="glass-panel" 
        style={{
          width: '100%',
          border: '1px solid rgba(255, 0, 229, 0.3)',
          background: 'rgba(11, 12, 16, 0.85)',
          padding: '16px',
          boxShadow: '0 4px 20px rgba(255, 0, 229, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          marginBottom: '16px',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255, 0, 229, 0.2)', paddingBottom: '8px' }}>
          <Activity size={16} className="text-magenta" />
          <h3 style={{ fontSize: '0.85rem', color: 'var(--color-aether-magenta)', letterSpacing: '0.1em', margin: 0 }}>
            DIAGNOSTIC READOUT
          </h3>
        </div>

        {/* 2-Column Grid for Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.65rem', color: '#718096', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Cpu size={10} /> CORE
            </span>
            <span style={{ fontSize: '0.8rem', color: '#F7FAFC', fontWeight: 600 }}>{charName}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.65rem', color: '#718096', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Crosshair size={10} /> ARMAMENT
            </span>
            <span style={{ fontSize: '0.8rem', color: '#F7FAFC', fontWeight: 600 }}>{wepName}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.65rem', color: '#718096', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <BrainCircuit size={10} /> AI LOGIC
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-aether-cyan)', fontWeight: 600 }}>{playerConfig.selectedAICore}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.65rem', color: '#718096', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Layers size={10} /> STAGE
            </span>
            <span className="text-cyan" style={{ fontSize: '0.8rem', fontWeight: 700 }}>{runStats.currentStage} / 50</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.65rem', color: '#718096', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Skull size={10} /> HOSTILES TERMINATED
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-brass)', fontWeight: 700 }}>{runStats.enemiesKilled}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.65rem', color: '#718096', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Activity size={10} /> AETHER OUTPUT
            </span>
            <span style={{ fontSize: '0.8rem', color: '#FFF', fontWeight: 700 }}>
              {runStats.damageDealt.toLocaleString()} AP
            </span>
          </div>
        </div>
      </div>

      {/* Acquired Passive Skills list */}
      <div 
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          minHeight: 0 // allow flex child to shrink properly
        }}
      >
        <div 
          style={{ 
            fontSize: '0.75rem', 
            color: 'var(--color-brass)', 
            textTransform: 'uppercase', 
            letterSpacing: '0.1em',
            marginBottom: '8px',
            fontFamily: 'var(--font-primary)',
            flexShrink: 0
          }}
        >
          Acquired Modifiers ({runStats.skillsCollected.length})
        </div>

        {runStats.skillsCollected.length > 0 ? (
          <div 
            className="custom-scrollbar"
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '8px',
              overflowY: 'auto',
              paddingRight: '6px',
              paddingBottom: '10px'
            }}
          >
            {runStats.skillsCollected.map((skill, index) => (
              <div 
                key={index}
                style={{
                  padding: '8px',
                  fontSize: '0.7rem',
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: '1px solid rgba(0, 229, 255, 0.2)',
                  backgroundColor: 'rgba(0, 229, 255, 0.05)',
                  borderRadius: '4px',
                  boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)'
                }}
              >
                <div 
                  style={{
                    width: '6px',
                    height: '6px',
                    backgroundColor: 'var(--color-aether-cyan)',
                    boxShadow: '0 0 6px var(--color-aether-cyan)',
                    borderRadius: '1px',
                    flexShrink: 0
                  }}
                />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {skill}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div 
            style={{
              padding: '16px',
              fontSize: '0.8rem',
              color: '#4A5568',
              textAlign: 'center',
              border: '1px dashed rgba(255,255,255,0.1)',
              borderRadius: '6px',
              backgroundColor: 'rgba(0,0,0,0.3)',
              fontStyle: 'italic'
            }}
          >
            No active arcana modifications detected.
          </div>
        )}
      </div>

      {/* Restart trigger action */}
      <div style={{ width: '100%', marginTop: '16px', flexShrink: 0 }}>
        <button 
          className="btn-primary" 
          onClick={() => resetGame()}
          style={{ 
            width: '100%', 
            padding: '14px', 
            fontSize: '1rem',
            borderColor: 'var(--color-aether-magenta)',
            color: 'var(--color-aether-magenta)',
            background: 'rgba(255, 0, 229, 0.05)',
            textShadow: '0 0 5px var(--color-aether-glow-magenta)',
            boxShadow: '0 0 15px rgba(255, 0, 229, 0.15)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <RefreshCw size={18} /> REINITIALIZE GRID
        </button>
      </div>

      {/* Style overrides for custom simple animation */}
      <style>{`
        @keyframes pulse-text {
          0% { text-shadow: 0 0 10px rgba(255, 0, 229, 0.5); opacity: 0.9; }
          100% { text-shadow: 0 0 25px rgba(255, 0, 229, 1); opacity: 1; }
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        .fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 229, 255, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 229, 255, 0.8);
        }
      `}</style>
    </div>
  );
};

export default GameOverScreen;
