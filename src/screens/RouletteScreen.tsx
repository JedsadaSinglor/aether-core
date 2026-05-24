import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { Play } from 'lucide-react';

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
    let speed = 50;
    let position = 0;
    const startTime = Date.now();

    const animateReel = () => {
      const elapsed = Date.now() - startTime;
      
      if (elapsed < 1200) {
        // Spin fast
        position += speed;
      } else if (elapsed < 2400) {
        // Decelerate smoothly
        const factor = (2400 - elapsed) / 1200;
        speed = 50 * Math.pow(factor, 2);
        position += Math.max(1.5, speed);
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
        setTimeout(() => setJackpotFlash(false), 300);

        // Auto-save selected skill to store
        setRunStats({
          skillsCollected: [...runStats.skillsCollected, skill.name]
        });
        
        return;
      }

      setReelOffset(position % (choices.length * 90)); // Increased item height to 90px
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
      className="fade-in"
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(3, 4, 6, 0.95)',
        backgroundImage: 'radial-gradient(circle at center, rgba(0, 229, 255, 0.1) 0%, transparent 70%)',
        backdropFilter: 'blur(12px)',
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
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
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

      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 className="text-cyan" style={{ fontSize: '1.6rem', marginBottom: '6px', letterSpacing: '0.15em' }}>
          APPLYING UPGRADES
        </h1>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-brass)', letterSpacing: '0.2em' }}>
          INTELLIGENT COMPLIANCE CORE
        </div>
      </div>

      {/* Reel Spinner Box */}
      <div 
        style={{
          width: '280px',
          height: '180px',
          border: '2px solid rgba(181, 166, 66, 0.6)',
          boxShadow: '0 0 30px rgba(0, 229, 255, 0.15), inset 0 0 20px rgba(0,0,0,0.9)',
          background: '#030406',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '12px',
          marginBottom: '32px'
        }}
      >
        {/* Shaded boundaries for realism */}
        <div 
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, height: '60px',
            background: 'linear-gradient(180deg, rgba(3,4,6,1) 0%, rgba(3,4,6,0) 100%)',
            pointerEvents: 'none', zIndex: 2
          }}
        />
        <div 
          style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0, height: '60px',
            background: 'linear-gradient(360deg, rgba(3,4,6,1) 0%, rgba(3,4,6,0) 100%)',
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
            height: '90px',
            transform: 'translateY(-50%)',
            borderTop: '2px solid rgba(0, 229, 255, 0.5)',
            borderBottom: '2px solid rgba(0, 229, 255, 0.5)',
            background: 'rgba(0, 229, 255, 0.05)',
            boxShadow: '0 0 10px rgba(0, 229, 255, 0.2)',
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
            top: spinning ? -reelOffset : '45px', // center item when stopped (90px height / 2)
            zIndex: 0
          }}
        >
          {spinning ? (
            // Repeat array multiple times to create smooth continuous spin wrap
            [...choices, ...choices, ...choices].map((skill, idx) => (
              <div 
                key={idx}
                style={{
                  height: '90px',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 24px',
                  gap: '16px'
                }}
              >
                <div style={{ fontSize: '2.5rem', filter: 'blur(1px)' }}>{skill.icon}</div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', color: '#FFFFFF', textTransform: 'uppercase', filter: 'blur(0.5px)' }}>{skill.name}</h3>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-aether-cyan)' }}>TAG: {skill.tag}</div>
                </div>
              </div>
            ))
          ) : (
            // Stopped: Draw single locked-in skill card in center
            selectedSkill && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                style={{
                  height: '90px',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 24px',
                  gap: '16px'
                }}
              >
                <motion.div 
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  style={{ fontSize: '2.8rem', textShadow: '0 0 20px rgba(255,255,255,0.5)' }}
                >
                  {selectedSkill.icon}
                </motion.div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: '#FFFFFF', textTransform: 'uppercase', textShadow: '0 0 10px rgba(0, 229, 255, 0.5)' }}>
                    {selectedSkill.name}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-aether-cyan)', fontWeight: 600 }}>
                    TAG: {selectedSkill.tag}
                  </div>
                </div>
              </motion.div>
            )
          )}
        </div>
      </div>

      {/* Selected Skill Details Box */}
      <div style={{ height: '160px', width: '280px', display: 'flex', justifyContent: 'center' }}>
        <AnimatePresence>
          {showJackpot && selectedSkill && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="glass-panel-neon"
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '16px'
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-brass)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700 }}>
                  MODIFIER ACQUIRED
                </div>
                <div style={{ fontSize: '0.85rem', color: '#E2E8F0', lineHeight: '1.5' }}>
                  {selectedSkill.desc}
                </div>
              </div>

              <button 
                className="btn-primary" 
                onClick={handleResume}
                style={{ 
                  marginTop: '16px',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px' 
                }}
              >
                <Play size={16} fill="currentColor" /> RESUME COMBAT
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
