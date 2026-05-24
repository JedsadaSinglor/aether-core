import React from 'react';
import { useGameStore } from '../store/gameStore';

const CHARACTER_NAMES: Record<string, string> = {
  CHR_01: 'Aegis-01 (Knight)',
  CHR_02: 'Zephyr-V (Scout)',
  CHR_03: 'Nova-X (Mage)',
  CHR_04: 'Shadow-9 (Assassin)',
  CHR_05: 'Titan-K (Heavy)',
  CHR_06: 'Oracle-Z (Support)'
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
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'radial-gradient(circle at center, rgba(31, 40, 51, 0.4) 0%, rgba(11, 12, 16, 0.9) 100%)',
        overflowY: 'auto'
      }}
    >
      {/* Red Alert Diagnostic Header */}
      <div style={{ textAlign: 'center', width: '100%', marginTop: '10px' }}>
        <div 
          className="text-magenta" 
          style={{ 
            fontSize: '1.8rem', 
            fontWeight: 800,
            letterSpacing: '0.1em',
            animation: 'pulse 1.5s infinite alternate',
            fontFamily: 'var(--font-primary)'
          }}
        >
          SYSTEM COMPROMISED
        </div>
        <div 
          style={{ 
            fontSize: '0.75rem', 
            color: 'var(--color-copper)', 
            textTransform: 'uppercase', 
            letterSpacing: '0.2em',
            marginTop: '4px',
            fontFamily: 'var(--font-primary)'
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
          margin: '12px 0',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {/* Outer rotating/pulsing ring */}
        <div 
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: '2px dashed var(--color-copper)',
            animation: 'spin 20s linear infinite'
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
            boxShadow: '0 0 15px rgba(255, 49, 49, 0.4)'
          }}
        />
        {/* Fractured center core */}
        <div 
          style={{
            width: '20px',
            height: '20px',
            backgroundColor: '#FF3131',
            borderRadius: '4px',
            transform: 'rotate(45deg)',
            boxShadow: '0 0 20px #FF3131'
          }}
        />
      </div>

      {/* Diagnostics Terminal Readout */}
      <div 
        className="glass-panel" 
        style={{
          width: '100%',
          border: '1px solid rgba(255, 0, 229, 0.25)',
          background: 'rgba(11, 12, 16, 0.75)',
          padding: '16px',
          boxShadow: '0 4px 20px rgba(255, 0, 229, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <h3 
          style={{ 
            fontSize: '0.85rem', 
            color: 'var(--color-brass)', 
            borderBottom: '1px solid rgba(181, 166, 66, 0.2)',
            paddingBottom: '4px',
            marginBottom: '4px',
            letterSpacing: '0.05em'
          }}
        >
          RUN DIAGNOSTICS:
        </h3>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
          <span style={{ color: '#718096' }}>CONSTRUCT CORE:</span>
          <span style={{ color: '#F7FAFC', fontWeight: 600 }}>{charName}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
          <span style={{ color: '#718096' }}>EQUIPPED WEAPON:</span>
          <span style={{ color: '#F7FAFC', fontWeight: 600 }}>{wepName}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
          <span style={{ color: '#718096' }}>AI LOGIC CORE:</span>
          <span style={{ color: 'var(--color-aether-cyan)', fontWeight: 600 }}>{playerConfig.selectedAICore}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '8px' }}>
          <span style={{ color: '#E2E8F0' }}>OPERATIONAL STAGE:</span>
          <span className="text-cyan" style={{ fontWeight: 700 }}>STAGE {runStats.currentStage} / 50</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
          <span style={{ color: '#E2E8F0' }}>HOSTILES DEACTIVATED:</span>
          <span style={{ color: 'var(--color-brass)', fontWeight: 700 }}>{runStats.enemiesKilled} UNITS</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
          <span style={{ color: '#E2E8F0' }}>AETHER OUTPUT (DMG):</span>
          <span style={{ color: '#FFF', fontWeight: 700, textShadow: '0 0 4px rgba(255, 255, 255, 0.4)' }}>
            {runStats.damageDealt.toLocaleString()} AP
          </span>
        </div>
      </div>

      {/* Acquired Passive Skills list */}
      <div 
        style={{
          width: '100%',
          marginTop: '12px',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '160px'
        }}
      >
        <div 
          style={{ 
            fontSize: '0.75rem', 
            color: 'var(--color-brass)', 
            textTransform: 'uppercase', 
            letterSpacing: '0.1em',
            marginBottom: '6px',
            fontFamily: 'var(--font-primary)'
          }}
        >
          Acquired Arcana Modifiers ({runStats.skillsCollected.length})
        </div>

        {runStats.skillsCollected.length > 0 ? (
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '6px',
              overflowY: 'auto',
              paddingRight: '4px'
            }}
          >
            {runStats.skillsCollected.map((skill, index) => (
              <div 
                key={index}
                className="glass-panel"
                style={{
                  padding: '6px 10px',
                  fontSize: '0.7rem',
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: '1px solid rgba(0, 229, 255, 0.15)',
                  backgroundColor: 'rgba(0, 229, 255, 0.03)'
                }}
              >
                {/* Tiny glowing cyan cube icon */}
                <div 
                  style={{
                    width: '6px',
                    height: '6px',
                    backgroundColor: 'var(--color-aether-cyan)',
                    boxShadow: '0 0 4px var(--color-aether-cyan)'
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
            className="glass-panel" 
            style={{
              padding: '12px',
              fontSize: '0.75rem',
              color: '#718096',
              textAlign: 'center',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexGrow: 1
            }}
          >
            No active arcana modifications.
          </div>
        )}
      </div>

      {/* Restart trigger action */}
      <div style={{ width: '100%', marginTop: '16px', marginBottom: '10px' }}>
        <button 
          className="btn-primary" 
          onClick={() => resetGame()}
          style={{ 
            width: '100%', 
            padding: '14px', 
            fontSize: '1rem',
            borderColor: 'var(--color-aether-magenta)',
            color: 'var(--color-aether-magenta)',
            textShadow: '0 0 5px var(--color-aether-glow-magenta)',
            boxShadow: '0 0 10px rgba(255, 0, 229, 0.1)'
          }}
        >
          REINITIALIZE GRID
        </button>
      </div>

      {/* Style overrides for custom simple animation */}
      <style>{`
        @keyframes pulse {
          0% { text-shadow: 0 0 5px rgba(255, 0, 229, 0.4); opacity: 0.85; }
          100% { text-shadow: 0 0 15px rgba(255, 0, 229, 0.9); opacity: 1; }
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
      `}</style>
    </div>
  );
};

export default GameOverScreen;
