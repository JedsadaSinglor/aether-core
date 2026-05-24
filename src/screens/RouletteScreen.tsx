import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

const SKILL_POOL = [
  { name: 'Multishot', desc: '+1 Projectile, -20% Damage multiplier.', tag: 'Weapon', icon: '🏹' },
  { name: 'Ricochet', desc: 'Projectiles bounce to +2 additional walls/enemies.', tag: 'Weapon', icon: '↪️' },
  { name: 'Vampiric Touch', desc: 'Absorbs Aether energy, healing 5% of damage dealt.', tag: 'Necro', icon: '🦇' },
  { name: 'Overclock', desc: '+25% Attack Speed, but drains 5% maximum integrity on load.', tag: 'Cyber', icon: '🔋' },
  { name: 'Aether Burn', desc: 'On Hit: Inflicts Fire DoT dealing 10% damage over 3s.', tag: 'Fire', icon: '🔥' },
  { name: 'Frost Nova', desc: 'On Kill: Releases an Ice burst freezing nearby targets for 1s.', tag: 'Ice', icon: '❄️' },
  { name: 'Chain Lightning', desc: 'On Hit: 20% chance to arc electricity to 3 closest enemies.', tag: 'Elec', icon: '⚡' },
  { name: 'Kinetic Shield', desc: 'Generates 1 energy shield stack every 10s (Max 3). Blocks hits.', tag: 'Defense', icon: '🛡️' },
  { name: 'Executioner', desc: 'Construct instantly terminates targets below 15% HP.', tag: 'Offense', icon: '💀' },
  { name: 'Magnetic Pull', desc: 'Increases gravity field pickup radius for Aether Orbs by 300%.', tag: 'Utility', icon: '🧲' }
];

export default function RouletteScreen() {
  const { setGameState, runStats, setRunStats } = useGameStore();

  // Compile choices based on what is unacquired
  const unacquiredSkills = SKILL_POOL.filter(s => !runStats.skillsCollected.includes(s.name));
  const choices = unacquiredSkills.length > 0 ? unacquiredSkills : [
    { name: 'Core Restoration', desc: 'Siphon ambient aether, instantly restoring structural integrity to 100%.', tag: 'Core', icon: '🔧' },
    { name: 'Aether Overdrive', desc: 'Overload weapon systems, increasing damage output by 30%.', tag: 'Core', icon: '💎' }
  ];

  const [reelOffset, setReelOffset] = useState(0);
  const [spinning, setSpinning] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<typeof SKILL_POOL[0] | null>(null);
  const [showJackpot, setShowJackpot] = useState(false);
  const [jackpotFlash, setJackpotFlash] = useState(false);

  useEffect(() => {
    // 1. Slot machine spin loop animation
    let animationId: number;
    let speed = 40;
    let position = 0;
    const startTime = Date.now();

    const animateReel = () => {
      const elapsed = Date.now() - startTime;
      
      if (elapsed < 1500) {
        // Spin fast
        position += speed;
      } else if (elapsed < 2500) {
        // Decelerate
        const factor = (2500 - elapsed) / 1000;
        speed = 40 * factor;
        position += Math.max(1, speed);
      } else {
        // Stop spinning
        setSpinning(false);
        
        // Select final skill based on the final offset
        const finalIdx = Math.floor(Math.random() * choices.length);
        const skill = choices[finalIdx];
        setSelectedSkill(skill);
        
        // Trigger jackpot chime visuals
        setShowJackpot(true);
        setJackpotFlash(true);
        setTimeout(() => setJackpotFlash(false), 200);

        // Auto-save selected skill to store
        setRunStats({
          skillsCollected: [...runStats.skillsCollected, skill.name]
        });
        
        return;
      }

      setReelOffset(position % (choices.length * 80));
      animationId = requestAnimationFrame(animateReel);
    };

    animationId = requestAnimationFrame(animateReel);

    return () => cancelAnimationFrame(animationId);
  }, [runStats.skillsCollected, choices]);

  const handleResume = () => {
    setGameState('COMBAT');
  };

  return (
    <div 
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(11, 12, 16, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px',
        overflow: 'hidden'
      }}
    >
      {/* Jackpot Flash Overlay */}
      <AnimatePresence>
        {jackpotFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: '#FFFFFF',
              mixBlendMode: 'overlay',
              zIndex: 101,
              pointerEvents: 'none'
            }}
          />
        )}
      </AnimatePresence>

      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 className="text-cyan" style={{ fontSize: '1.5rem', marginBottom: '4px' }}>
          APPLYING UPGRADES
        </h1>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-brass)', letterSpacing: '0.1em' }}>
          INTELLIGENT COMPLIANCE CORE
        </div>
      </div>

      {/* Reel Spinner Box */}
      <div 
        style={{
          width: '260px',
          height: '160px',
          border: '2px solid var(--color-brass)',
          boxShadow: '0 0 15px var(--color-brass-glow), inset 0 0 10px rgba(0,0,0,0.8)',
          background: '#0B0C10',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '8px',
          marginBottom: '24px'
        }}
      >
        {/* Shaded boundaries for realism */}
        <div 
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, height: '40px',
            background: 'linear-gradient(180deg, rgba(11,12,16,0.9) 0%, rgba(11,12,16,0) 100%)',
            pointerEvents: 'none', zIndex: 2
          }}
        />
        <div 
          style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0, height: '40px',
            background: 'linear-gradient(360deg, rgba(11,12,16,0.9) 0%, rgba(11,12,16,0) 100%)',
            pointerEvents: 'none', zIndex: 2
          }}
        />

        {/* Center alignment brackets */}
        <div 
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: '80px',
            transform: 'translateY(-50%)',
            borderTop: '1px dashed var(--color-aether-cyan)',
            borderBottom: '1px dashed var(--color-aether-cyan)',
            background: 'rgba(0, 229, 255, 0.03)',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />

        {/* Spinning reel list container */}
        <div 
          style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'absolute',
            left: 0,
            right: 0,
            top: spinning ? -reelOffset : '40px', // center item when stopped
            zIndex: 0
          }}
        >
          {spinning ? (
            // Repeat array multiple times to create smooth continuous spin wrap
            [...choices, ...choices, ...choices].map((skill, idx) => (
              <div 
                key={idx}
                style={{
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 24px',
                  gap: '16px'
                }}
              >
                <div style={{ fontSize: '2.2rem' }}>{skill.icon}</div>
                <div>
                  <h3 style={{ fontSize: '1rem', color: '#FFFFFF', textTransform: 'uppercase' }}>{skill.name}</h3>
                  <div style={{ fontSize: '0.65rem', color: 'var(--color-aether-cyan)' }}>TAG: {skill.tag}</div>
                </div>
              </div>
            ))
          ) : (
            // Stopped: Draw single locked-in skill card in center
            selectedSkill && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1.1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                style={{
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 24px',
                  gap: '16px'
                }}
              >
                <div style={{ fontSize: '2.5rem' }}>{selectedSkill.icon}</div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: '#FFFFFF', textTransform: 'uppercase' }}>
                    {selectedSkill.name}
                  </h3>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-aether-cyan)' }}>
                    TAG: {selectedSkill.tag}
                  </div>
                </div>
              </motion.div>
            )
          )}
        </div>
      </div>

      {/* Selected Skill Details Box */}
      <AnimatePresence>
        {showJackpot && selectedSkill && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="glass-panel-neon"
            style={{
              width: '260px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ fontSize: '0.8rem', color: '#E2E8F0', lineHeight: '1.4' }}>
              {selectedSkill.desc}
            </div>

            <button 
              className="btn-primary" 
              onClick={handleResume}
              style={{ fontSize: '0.8rem', padding: '8px' }}
            >
              Resume Combat
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
