import { World } from '../World';
import { Component } from '../components';

/**
 * High-performance HTML5 Canvas rendering system.
 * Implements beautiful glowing animations, stained glass/brass aesthetics, and mechanical details.
 */
export function RenderSystem(
  world: World,
  ctx: CanvasRenderingContext2D,
  time: number // total game time in seconds for animations
): void {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  ctx.save();
  if (world.screenShake > 0) {
    const dx = (Math.random() - 0.5) * world.screenShake;
    const dy = (Math.random() - 0.5) * world.screenShake;
    ctx.translate(dx, dy);
  }

  // 1. Clear background with a subtle grid or nebula glow
  ctx.fillStyle = '#0B0C10'; // Deep Space Dark
  ctx.fillRect(0, 0, width, height);

  // Subtle background grids for a tech/steampunk blueprints overlay
  ctx.strokeStyle = 'rgba(31, 40, 51, 0.2)';
  ctx.lineWidth = 1;
  const gridSize = 40;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Draw entities
  for (let i = 0; i < world.maxEntities; i++) {
    if (world.active[i] === 0) continue;

    const x = world.transformX[i];
    const y = world.transformY[i];
    const rotation = world.transformRotation[i];
    const radius = world.colliderRadius[i];

    // --- 2. RENDER ORBS ---
    if (world.tagIsOrb[i] === 1) {
      ctx.save();
      ctx.translate(x, y);
      
      // Floating/bobbing effect based on time
      const bob = Math.sin(time * 5 + i) * 2;
      ctx.translate(0, bob);
      
      // Pulse scale
      const scale = 1 + Math.sin(time * 8 + i) * 0.15;
      ctx.scale(scale, scale);

      // Cyan outer glow
      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur = 8;
      
      // Outer Diamond
      ctx.fillStyle = 'rgba(0, 229, 255, 0.4)';
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 1.5;
      
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(5, 0);
      ctx.lineTo(0, 6);
      ctx.lineTo(-5, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      // Inner glowing core
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      continue;
    }

    // --- 3. RENDER PROJECTILES ---
    if (world.tagIsProjectile[i] === 1) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);

      const type = world.projectileType[i];

      if (type === 1) {
        // Repeater (Standard Bolt)
        ctx.shadowColor = '#00E5FF';
        ctx.shadowBlur = 6;
        ctx.fillStyle = '#00E5FF';
        ctx.fillRect(-6, -2, 12, 4);

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-3, -1, 6, 2);
      } else if (type === 2) {
        // Cannon (Heavy Plasma Ball)
        ctx.shadowColor = '#00E5FF';
        ctx.shadowBlur = 12;
        ctx.fillStyle = 'rgba(0, 229, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#00E5FF';
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
      } else if (type === 3) {
        // Boomerang (Spinning propeller blades)
        const spinAngle = time * 20;
        ctx.rotate(spinAngle);
        ctx.strokeStyle = '#B5A642'; // Brass blades
        ctx.lineWidth = 3;
        ctx.shadowColor = '#00E5FF';
        ctx.shadowBlur = 6;
        
        for (let b = 0; b < 3; b++) {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(8, -radius/2, 0, -radius);
          ctx.stroke();
          ctx.rotate((Math.PI * 2) / 3);
        }
        
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#00E5FF';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (type === 4) {
        // Tesla Chain (Jagged electric particle)
        ctx.shadowColor = '#00E5FF';
        ctx.shadowBlur = 8;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(-4, (Math.random() - 0.5) * 8);
        ctx.lineTo(2, (Math.random() - 0.5) * 8);
        ctx.lineTo(10, 0);
        ctx.stroke();
      } else if (type === 5) {
        // Sawblade (Spinning gear)
        const spinAngle = time * 15;
        ctx.rotate(spinAngle);
        
        ctx.shadowColor = '#00E5FF';
        ctx.shadowBlur = 8;
        ctx.strokeStyle = '#B5A642'; // Brass gear body
        ctx.fillStyle = 'rgba(181, 166, 66, 0.1)';
        ctx.lineWidth = 2;
        
        // Draw gear circle
        ctx.beginPath();
        ctx.arc(0, 0, radius - 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Draw gear teeth
        const teethCount = 12;
        ctx.fillStyle = '#CB6D51'; // Copper teeth
        for (let t = 0; t < teethCount; t++) {
          ctx.save();
          ctx.rotate((Math.PI * 2 / teethCount) * t);
          ctx.beginPath();
          ctx.moveTo(-3, -radius + 4);
          ctx.lineTo(0, -radius - 1);
          ctx.lineTo(3, -radius + 4);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }

        // Cyan hub
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#00E5FF';
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (type === 7) {
        // Companion Drone: Small brass orb with spinning rings and cyan glowing center
        ctx.strokeStyle = '#B5A642'; // Brass
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgba(0, 229, 255, 0.1)';
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Small spinning propeller/wings
        const spinAngle = time * 8;
        ctx.rotate(spinAngle);
        ctx.strokeStyle = '#CB6D51'; // Copper
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-radius - 3, 0);
        ctx.lineTo(radius + 3, 0);
        ctx.stroke();

        // Cyan glowing center core
        ctx.shadowColor = '#00E5FF';
        ctx.shadowBlur = 6;
        ctx.fillStyle = '#00E5FF';
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      continue;
    }

    // --- 4. RENDER POPUPS ---
    if (world.tagIsPopup[i] === 1) {
      ctx.save();
      ctx.translate(x, y);

      const lifeRatio = world.popupLifetime[i] / world.popupMaxLifetime[i];
      ctx.globalAlpha = Math.min(1, lifeRatio * 1.5); // Fade out at end

      // Snappy pop scale-up animation
      const ageRatio = 1.0 - lifeRatio;
      let scale = 1.0;
      if (ageRatio < 0.2) {
        scale = 1.6 - (ageRatio / 0.2) * 0.6; // Snap scale-down from 1.6x to 1.0x
      }
      ctx.scale(scale, scale);

      const isCrit = world.popupIsCrit[i] === 1;
      const value = world.popupValue[i];

      ctx.font = isCrit ? 'italic 800 22px Outfit' : '700 16px Outfit';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (isCrit) {
        // Double shadow for crit numbers
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.fillStyle = '#FFE135'; // Electric Yellow
        ctx.fillText(`CRIT ${value}`, 0, 0);
      } else {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(value.toString(), 0, 0);
      }

      ctx.restore();
      continue;
    }

    // --- 5. RENDER PLAYER AUTOMATON ---
    if (world.tagIsPlayer[i] === 1) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);

      // Neon Cyan Base Glow
      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur = 12;
      
      // Brass structural border
      ctx.strokeStyle = '#B5A642';
      ctx.lineWidth = 3;
      
      // Inner glowing energy core (cyan stained glass)
      ctx.fillStyle = 'rgba(0, 229, 255, 0.2)';
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Mechanical details: brass gears or quadrants inside the circle
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(181, 166, 66, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-radius, 0);
      ctx.lineTo(radius, 0);
      ctx.moveTo(0, -radius);
      ctx.lineTo(0, radius);
      ctx.stroke();

      // Outer mechanical shielding (heavy copper segments)
      ctx.strokeStyle = '#CB6D51';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, radius + 2, -Math.PI / 4, Math.PI / 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, radius + 2, Math.PI * 3/4, Math.PI * 5/4);
      ctx.stroke();

      // Aether Core (Glowing Cyan center)
      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#00E5FF';
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();

      // Front direction arrow
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#00E5FF';
      ctx.beginPath();
      ctx.moveTo(radius + 2, 0);
      ctx.lineTo(radius - 5, -5);
      ctx.lineTo(radius - 5, 5);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
      
      // Draw HP Bar right above player in canvas (optional, but good for feedback)
      // Usually, HUD handles this, but a small overlay under player is neat
      const hp = world.statsHP[i];
      const maxHp = world.statsMaxHP[i];
      const hpRatio = Math.max(0, hp / maxHp);
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(x - 20, y + radius + 8, 40, 4);
      
      ctx.fillStyle = hpRatio > 0.25 ? '#39FF14' : '#FF3131';
      ctx.fillRect(x - 20, y + radius + 8, 40 * hpRatio, 4);
      
      continue;
    }

    // --- 6. RENDER ENEMIES ---
    if (world.tagIsEnemy[i] === 1) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);

      // Check the size/health of enemy to determine types
      const maxHp = world.statsMaxHP[i];
      const hp = world.statsHP[i];
      const hpRatio = Math.max(0, hp / maxHp);

      // Determine Enemy Type by stats or scale (MVP types based on radius/maxHp)
      let enemyType = 1; // 1 = Swarmer, 2 = Ranged, 3 = Elite, 4 = Boss
      if (radius > 25) {
        enemyType = 4; // Boss
      } else if (radius > 16) {
        enemyType = 3; // Elite
      } else if (world.hasComponent(i, Component.Weapon)) {
        enemyType = 2; // Ranged
      }

      if (enemyType === 1) {
        // Swarmer: Jagged mechanical spider
        ctx.fillStyle = '#1F2833'; // Slate metal body
        ctx.strokeStyle = '#CB6D51'; // Copper claws
        ctx.lineWidth = 2;

        // Draw simple mechanical limbs
        for (let l = 0; l < 4; l++) {
          const limbAngle = (Math.PI / 4) + (l * Math.PI / 2);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(limbAngle) * (radius * 1.5), Math.sin(limbAngle) * (radius * 1.5));
          ctx.stroke();
        }

        // Inner glowing magenta core
        ctx.shadowColor = '#FF00E5';
        ctx.shadowBlur = 6;
        ctx.fillStyle = '#FF00E5';
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
        
      } else if (enemyType === 2) {
        // Ranged: Floating Arcane Turret (Triangular stained glass)
        ctx.strokeStyle = '#B5A642'; // Brass outline
        ctx.fillStyle = 'rgba(255, 0, 229, 0.15)'; // Magenta stained glass fill
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(-radius * 0.7, -radius * 0.8);
        ctx.lineTo(-radius * 0.7, radius * 0.8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Spinning core inside
        ctx.save();
        ctx.rotate(time * 5);
        ctx.shadowColor = '#FF00E5';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#FF00E5';
        ctx.fillRect(-3, -3, 6, 6);
        ctx.restore();

      } else if (enemyType === 3) {
        // Elite: Heavily Shielded Mech
        ctx.shadowColor = '#FF00E5';
        ctx.shadowBlur = 8;
        
        // Copper armor body
        ctx.fillStyle = '#CB6D51';
        ctx.strokeStyle = '#1F2833';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Dual heavy brass shields on front sides
        ctx.strokeStyle = '#B5A642';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, radius + 2, -Math.PI / 3, -Math.PI / 12);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, radius + 2, Math.PI / 12, Math.PI / 3);
        ctx.stroke();

        // Pulsing core
        ctx.shadowBlur = 4;
        ctx.fillStyle = '#FF00E5';
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.4, 0, Math.PI * 2);
        ctx.fill();

      } else if (enemyType === 4) {
        // Boss: The Brass Colossus
        // Concentric spinning mechanical rings
        ctx.strokeStyle = '#B5A642'; // Brass outer ring
        ctx.lineWidth = 4;
        ctx.shadowColor = '#FF00E5';
        ctx.shadowBlur = 15;
        
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner copper gear ring spinning oppositely
        ctx.save();
        ctx.rotate(-time * 1.5);
        ctx.strokeStyle = '#CB6D51';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, radius - 8, 0, Math.PI * 2);
        ctx.stroke();
        
        // Gear teeth
        const bossTeeth = 8;
        ctx.fillStyle = '#CB6D51';
        for (let bt = 0; bt < bossTeeth; bt++) {
          ctx.rotate((Math.PI * 2) / bossTeeth);
          ctx.fillRect(-4, -radius, 8, 8);
        }
        ctx.restore();

        // Central massive pulsing power core
        const corePulse = radius * 0.45 + Math.sin(time * 10) * 3;
        const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, corePulse);
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.3, '#FF00E5');
        grad.addColorStop(1, 'rgba(255, 0, 229, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, corePulse, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // Enemy HP Bar
      if (hpRatio < 1.0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(x - radius, y - radius - 10, radius * 2, 3);
        ctx.fillStyle = '#FF3131'; // Neon Red for damaged enemies
        ctx.fillRect(x - radius, y - radius - 10, radius * 2 * hpRatio, 3);
      }
    }
  }
  
  ctx.restore();
}
