import { World } from './World';
import { MovementSystem } from './systems/MovementSystem';
import { RenderSystem } from './systems/RenderSystem';

export class GameLoop {
  private world: World;
  private ctx: CanvasRenderingContext2D;
  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private totalTime: number = 0;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  
  // Time scale for slow motion effects (e.g., 0.1 during level up roulette)
  public timeScale: number = 1.0;

  // External update hooks (optional, for React UI sync)
  private onUpdateCallback?: (dt: number) => void;

  // Additional system references to be bound during later phases
  public aiSystem?: (world: World, dt: number) => void;
  public combatSystem?: (world: World, dt: number) => void;
  public collisionSystem?: (world: World, dt: number) => void;
  public damageSystem?: (world: World, dt: number) => void;
  public waveSpawner?: (world: World, dt: number) => void;
  public skillSystem?: (world: World, dt: number) => void;

  constructor(world: World, ctx: CanvasRenderingContext2D) {
    this.world = world;
    this.ctx = ctx;
  }

  public start(onUpdate?: (dt: number) => void): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.onUpdateCallback = onUpdate;
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  public stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public pause(): void {
    this.isPaused = true;
  }

  public resume(): void {
    if (!this.isPaused) return;
    this.isPaused = false;
    this.lastTime = performance.now(); // Reset time anchor to avoid giant leap on resume
  }

  private loop = (timestamp: number): void => {
    if (!this.isRunning) return;

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(this.loop);

    // Calculate actual delta time in seconds
    let dt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    // Cap delta time to prevent massive jumps (e.g. focus loss/tab suspend)
    if (dt > 0.1) dt = 0.1;

    // Apply timeScale (e.g. for slow-mo)
    const scaledDt = dt * this.timeScale;

    if (!this.isPaused) {
      this.totalTime += scaledDt;
      
      // Decay screen shake
      if (this.world.screenShake > 0) {
        this.world.screenShake = Math.max(0, this.world.screenShake - scaledDt * 15);
      }
      
      // Execute systems in GDD pipeline order: Skill -> AI -> Move -> Spawn -> Combat -> Collision -> Damage
      
      // 0. Skill System (Phase 4)
      if (this.skillSystem) {
        this.skillSystem(this.world, scaledDt);
      }
      
      // 1. AI System (Phase 3)
      if (this.aiSystem) {
        this.aiSystem(this.world, scaledDt);
      }
      
      // 2. Movement System (Phase 1)
      MovementSystem(this.world, scaledDt, this.ctx.canvas.width, this.ctx.canvas.height);
      
      // 3. Enemy Wave Spawner (Phase 3)
      if (this.waveSpawner) {
        this.waveSpawner(this.world, scaledDt);
      }

      // 4. Combat Shooting System (Phase 3)
      if (this.combatSystem) {
        this.combatSystem(this.world, scaledDt);
      }

      // 5. Collision Detection System (Phase 3)
      if (this.collisionSystem) {
        this.collisionSystem(this.world, scaledDt);
      }

      // 6. Damage & Death Processing System (Phase 3)
      if (this.damageSystem) {
        this.damageSystem(this.world, scaledDt);
      }

      // React callback for HUD/UI synchronizations
      if (this.onUpdateCallback) {
        this.onUpdateCallback(scaledDt);
      }
    }

    // 7. Render System (always draws, even when paused, to show static screen)
    // Pass real time to keep animations (like glowing, gear spin, etc.) running smoothly during pause/slow-mo
    RenderSystem(this.world, this.ctx, performance.now() / 1000);
  };
}
