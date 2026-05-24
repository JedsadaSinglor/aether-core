import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, type StatAllocation } from '../store/gameStore';
import '../styles/PreRunScreen.css';

const AUTOMATONS = [
  {
    id: 'CHR_01',
    name: 'Aegis-01 (Knight)',
    focus: 'HP / DEF Focus',
    perk: 'OnTakeDamage: 15% chance to Block and reflect 50% of blocked damage to the attacker.',
    icon: '🛡️'
  },
  {
    id: 'CHR_02',
    name: 'Zephyr-V (Scout)',
    focus: 'AGI / Speed Focus',
    perk: 'OnEvade: Spawns a decoy bomb at the current position that explodes after a short delay.',
    icon: '⚡'
  },
  {
    id: 'CHR_03',
    name: 'Nova-X (Mage)',
    focus: 'INT / Skill Focus',
    perk: 'OnSkillCast: Every 3rd skill cast deals double (2x) damage.',
    icon: '🔮'
  },
  {
    id: 'CHR_04',
    name: 'Shadow-9 (Assassin)',
    focus: 'LUK / ATK Focus',
    perk: 'OnKill: Gain invisibility for 1.5s (enemies will drop targeting/aggro).',
    icon: '👤'
  },
  {
    id: 'CHR_05',
    name: 'Titan-K (Heavy)',
    focus: 'HP / Resilience Focus',
    perk: 'OnTakeDamage: Absorbs damage as energy. At max energy, releases a massive electrical shockwave.',
    icon: '🔋'
  },
  {
    id: 'CHR_06',
    name: 'Oracle-Z (Support)',
    focus: 'INT / AGI Focus',
    perk: 'OnInit: Spawns an autonomous combat drone that follows you and fires at nearby targets.',
    icon: '🛸'
  }
];

const WEAPONS = [
  {
    id: 'WEP_01',
    name: 'Aether Repeater',
    focus: 'High Speed - Low Damage',
    pattern: 'Fires fast, low-damage projectile bolts in a straight line (0.5x base damage).',
    icon: '🔫'
  },
  {
    id: 'WEP_02',
    name: 'Arcane Cannon',
    focus: 'Slow Speed - Piercing',
    pattern: 'Fires slow, piercing plasma spheres that tear through groups (2.0x base damage).',
    icon: '☄️'
  },
  {
    id: 'WEP_03',
    name: 'Chrono-Boomerang',
    focus: 'Target & Return',
    pattern: 'Throws spinning blades that fly toward targets and return to the player, slicing twice.',
    icon: '🪃'
  },
  {
    id: 'WEP_04',
    name: 'Tesla Chain',
    focus: 'Multi-target Bounces',
    pattern: 'Releases chain lightning that arcs to the closest enemy, bouncing up to 3 times.',
    icon: '⚡'
  },
  {
    id: 'WEP_05',
    name: 'Aether Sawblades',
    focus: 'Circular Orbit Shield',
    pattern: 'Spawns sawblades orbiting around the player for 3 seconds (2s cooldown).',
    icon: '⚙️'
  }
];

const AI_CORES = [
  {
    id: 'Kiting',
    name: 'Kiting Core',
    desc: 'Maintains distance from nearest enemy. Retreats if too close, otherwise fires.'
  },
  {
    id: 'Aggressive',
    name: 'Aggressive Core',
    desc: 'Targets the lowest health enemy, moving directly toward them while firing.'
  },
  {
    id: 'Adaptive',
    name: 'Adaptive Core',
    desc: 'Kites when health drops below 30%, otherwise charges aggressively.'
  }
] as const;

export default function PreRunScreen() {
  const { playerConfig, setPlayerConfig, updateStatAllocation, resetStatAllocation, setGameState } = useGameStore();

  const [charIndex, setCharIndex] = useState(0);
  const [weaponIndex, setWeaponIndex] = useState(0);
  const [isPulsing, setIsPulsing] = useState(false);

  const totalAllocated = Object.values(playerConfig.statAllocation).reduce((a, b) => a + b, 0);
  const pointsRemaining = 100 - totalAllocated;

  const handleNextChar = () => {
    const nextIdx = (charIndex + 1) % AUTOMATONS.length;
    setCharIndex(nextIdx);
    setPlayerConfig({ selectedAutomaton: AUTOMATONS[nextIdx].id });
  };

  const handlePrevChar = () => {
    const prevIdx = (charIndex - 1 + AUTOMATONS.length) % AUTOMATONS.length;
    setCharIndex(prevIdx);
    setPlayerConfig({ selectedAutomaton: AUTOMATONS[prevIdx].id });
  };

  const handleNextWeapon = () => {
    const nextIdx = (weaponIndex + 1) % WEAPONS.length;
    setWeaponIndex(nextIdx);
    setPlayerConfig({ selectedWeapon: WEAPONS[nextIdx].id });
  };

  const handlePrevWeapon = () => {
    const prevIdx = (weaponIndex - 1 + WEAPONS.length) % WEAPONS.length;
    setWeaponIndex(prevIdx);
    setPlayerConfig({ selectedWeapon: WEAPONS[prevIdx].id });
  };

  const handleStatChange = (stat: keyof StatAllocation, amount: number) => {
    if (amount > 0 && pointsRemaining <= 0) {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 300);
      return;
    }
    updateStatAllocation(stat, amount);
  };

  const handleLaunch = () => {
    // Transition to game combat screen
    setGameState('COMBAT');
  };

  return (
    <div className="prerun-container">
      {/* 1. Header */}
      <div className="prerun-header">
        <h1>Overseer's Will</h1>
        <div className="prerun-subtitle">Construct Initialization</div>
      </div>

      {/* 2. Character Carousel */}
      <div>
        <div className="prerun-section-title">
          <span>Automaton Model</span>
          <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{charIndex + 1} / {AUTOMATONS.length}</span>
        </div>
        <div className="carousel-container">
          <button className="carousel-arrow" onClick={handlePrevChar}>◀</button>
          
          <div className="carousel-content-wrapper">
            <AnimatePresence mode="wait">
              <motion.div
                key={AUTOMATONS[charIndex].id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
                  {AUTOMATONS[charIndex].icon}
                </div>
                <div className="carousel-title">{AUTOMATONS[charIndex].name}</div>
                <div className="carousel-stat-focus">{AUTOMATONS[charIndex].focus}</div>
                <div className="carousel-description">{AUTOMATONS[charIndex].perk}</div>
              </motion.div>
            </AnimatePresence>
          </div>
          
          <button className="carousel-arrow" onClick={handleNextChar}>▶</button>
        </div>
      </div>

      {/* 3. Weapon Carousel */}
      <div>
        <div className="prerun-section-title">
          <span>Arcane Armaments</span>
          <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{weaponIndex + 1} / {WEAPONS.length}</span>
        </div>
        <div className="carousel-container">
          <button className="carousel-arrow" onClick={handlePrevWeapon}>◀</button>
          
          <div className="carousel-content-wrapper">
            <AnimatePresence mode="wait">
              <motion.div
                key={WEAPONS[weaponIndex].id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
                  {WEAPONS[weaponIndex].icon}
                </div>
                <div className="carousel-title">{WEAPONS[weaponIndex].name}</div>
                <div className="carousel-stat-focus">{WEAPONS[weaponIndex].focus}</div>
                <div className="carousel-description">{WEAPONS[weaponIndex].pattern}</div>
              </motion.div>
            </AnimatePresence>
          </div>
          
          <button className="carousel-arrow" onClick={handleNextWeapon}>▶</button>
        </div>
      </div>

      {/* 4. Stat Allocation Panel */}
      <div>
        <div className="prerun-section-title">
          <span>Aether Point Allocation</span>
          <span className={`points-budget ${isPulsing ? 'pulsing' : ''}`}>
            {pointsRemaining} AP Left
          </span>
        </div>

        <div className="stats-grid">
          {(Object.keys(playerConfig.statAllocation) as Array<keyof StatAllocation>).map((stat) => {
            const val = playerConfig.statAllocation[stat];
            const maxVal = 100;
            const fillWidth = `${(val / maxVal) * 100}%`;
            
            // Generate description tooltip info based on stat type
            let tooltip = '';
            if (stat === 'ATK') tooltip = '+2 Base ATK';
            if (stat === 'AGI') tooltip = '+5% Speed, +2% AtkSpeed';
            if (stat === 'DEF') tooltip = 'Non-linear reduction (100/(100+DEF))';
            if (stat === 'HP') tooltip = '+50 HP';
            if (stat === 'LUK') tooltip = '+2% Crit, +1% Rare Drop';
            if (stat === 'INT') tooltip = '+5% Skill DMG, -2% Cooldown';

            return (
              <div key={stat} className="stat-row">
                <div>
                  <div className="stat-name-label">{stat}</div>
                  <div style={{ fontSize: '0.6rem', color: '#8892B0', marginTop: '2px' }}>
                    {tooltip}
                  </div>
                </div>
                
                <div className="stat-slider-bar">
                  <div className="stat-fill" style={{ width: fillWidth }} />
                </div>
                
                <div className="stat-controls">
                  <button 
                    className="stat-btn" 
                    onClick={() => handleStatChange(stat, -1)}
                    disabled={val <= 0}
                  >
                    -
                  </button>
                  <span className="stat-value">{val}</span>
                  <button 
                    className="stat-btn" 
                    onClick={() => handleStatChange(stat, 1)}
                    disabled={pointsRemaining <= 0}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
          <button 
            className="btn-secondary" 
            onClick={resetStatAllocation}
            disabled={totalAllocated === 0}
            style={{ fontSize: '0.7rem', padding: '4px 8px' }}
          >
            Reset Stats
          </button>
        </div>
      </div>

      {/* 5. AI Core Config */}
      <div>
        <div className="prerun-section-title">
          <span>AI Logic Core Directive</span>
        </div>
        <div className="ai-cores-grid">
          {AI_CORES.map((core) => {
            const isSelected = playerConfig.selectedAICore === core.id;
            return (
              <div 
                key={core.id}
                className={`ai-core-card ${isSelected ? 'selected' : ''}`}
                onClick={() => setPlayerConfig({ selectedAICore: core.id })}
              >
                <div className="ai-core-name">{core.name}</div>
                <div className="ai-core-desc">{core.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Launch Sequence */}
      <div className="launch-panel">
        <button 
          className="btn-primary btn-launch"
          onClick={handleLaunch}
        >
          Initialize Sequence
        </button>
        <div style={{ fontSize: '0.6rem', color: '#8892B0', textAlign: 'center' }}>
          By pressing, you confirm loading binary firmware into active Automaton slot.
        </div>
      </div>
    </div>
  );
}
