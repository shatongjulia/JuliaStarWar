import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  PLAYER_SPEED, 
  PLAYER_SIZE, 
  BULLET_SPEED, 
  BULLET_SIZE,
  ENEMY_CONFIGS,
  POWERUP_CONFIGS,
  VICTORY_LEVEL
} from '../constants';
import { GameState, EnemyType, PowerUpType, GameStats, Achievement } from '../types';

interface GameCanvasProps {
  gameState: GameState;
  onGameOver: (stats: GameStats) => void;
  onUpdateStats: (stats: GameStats) => void;
  onAchievementUnlock: (achievementId: string) => void;
}

// Entity Classes
class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;

  constructor(x: number, y: number, color: string) {
    this.x = x;
    this.y = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 5 + 2;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.life = 1;
    this.maxLife = Math.random() * 0.5 + 0.5;
    this.color = color;
    this.size = Math.random() * 3 + 1;
  }

  update(dt: number) {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= dt / this.maxLife;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.globalAlpha = Math.max(0, this.life);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

class Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;

  constructor(x: number, y: number, vx = 0, vy = -BULLET_SPEED) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.size = BULLET_SIZE;
    this.color = '#fff';
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#fff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

class Enemy {
  x: number;
  y: number;
  type: EnemyType;
  speed: number;
  health: number;
  maxHealth: number;
  size: number;
  color: string;
  score: number;

  constructor(x: number, type: EnemyType, level: number) {
    const config = ENEMY_CONFIGS[type];
    this.x = x;
    this.y = -config.size;
    this.type = type;
    this.speed = config.speed * (1 + (level - 1) * 0.1);
    this.health = config.health + Math.floor((level - 1) / 3);
    this.maxHealth = this.health;
    this.size = config.size;
    this.color = config.color;
    this.score = config.score;
  }

  update() {
    this.y += this.speed;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    
    // Glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;

    // Draw enemy shape based on type
    if (this.type === EnemyType.BASIC) {
      // Main body
      ctx.beginPath();
      ctx.moveTo(0, this.size / 2);
      ctx.lineTo(-this.size / 2, -this.size / 2);
      ctx.lineTo(0, -this.size / 4);
      ctx.lineTo(this.size / 2, -this.size / 2);
      ctx.closePath();
      ctx.fill();
      
      // Wings
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-this.size / 2, -this.size / 2);
      ctx.lineTo(-this.size * 0.7, 0);
      ctx.moveTo(this.size / 2, -this.size / 2);
      ctx.lineTo(this.size * 0.7, 0);
      ctx.stroke();

      // Core
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(0, 0, this.size / 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === EnemyType.FAST) {
      // Sleek body
      ctx.beginPath();
      ctx.moveTo(0, this.size / 2);
      ctx.lineTo(-this.size / 3, -this.size / 2);
      ctx.lineTo(0, -this.size / 3);
      ctx.lineTo(this.size / 3, -this.size / 2);
      ctx.closePath();
      ctx.fill();

      // Side fins
      ctx.fillStyle = this.color;
      ctx.globalAlpha = 0.6;
      ctx.fillRect(-this.size / 2, -this.size / 4, this.size / 6, this.size / 2);
      ctx.fillRect(this.size / 2 - this.size / 6, -this.size / 4, this.size / 6, this.size / 2);
      ctx.globalAlpha = 1;
    } else {
      // Heavy Tanker
      ctx.roundRect(-this.size / 2, -this.size / 2, this.size, this.size, 8);
      ctx.fill();
      
      // Armor plates
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(-this.size / 3, -this.size / 3, this.size * 0.66, this.size * 0.66);
      
      // Turrets
      ctx.fillStyle = '#000';
      ctx.fillRect(-this.size / 4, -this.size / 2, this.size / 8, this.size / 4);
      ctx.fillRect(this.size / 8, -this.size / 2, this.size / 8, this.size / 4);
    }

    // Health bar for heavy
    if (this.maxHealth > 1) {
      const healthPct = this.health / this.maxHealth;
      ctx.fillStyle = '#333';
      ctx.fillRect(-this.size/2, -this.size/2 - 10, this.size, 4);
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.size/2, -this.size/2 - 10, this.size * healthPct, 4);
    }

    ctx.restore();
  }
}

class PowerUp {
  x: number;
  y: number;
  type: PowerUpType;
  size: number;
  color: string;
  speed: number = 2;

  constructor(x: number, y: number, type: PowerUpType) {
    this.x = x;
    this.y = y;
    this.type = type;
    const config = POWERUP_CONFIGS[type];
    this.size = config.size;
    this.color = config.color;
  }

  update() {
    this.y += this.speed;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    
    ctx.shadowBlur = 20;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;
    
    // Hexagon shape
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const px = Math.cos(angle) * (this.size / 2);
      const py = Math.sin(angle) * (this.size / 2);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    // Icon
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.type === PowerUpType.TRIPLE_SHOT ? 'T' : 'S', 0, 0);

    ctx.restore();
  }
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, onGameOver, onUpdateStats, onAchievementUnlock }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Game State Refs
  const playerRef = useRef({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 100,
    vx: 0,
    vy: 0,
    health: 3,
    invincible: 0,
    shield: false,
    tripleShot: 0,
    lastShot: 0,
  });

  const keysRef = useRef<Record<string, boolean>>({});
  const bulletsRef = useRef<Bullet[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<{x: number, y: number, size: number, speed: number}[]>([]);
  const statsRef = useRef<GameStats>({
    score: 0,
    health: 3,
    level: 1,
    enemiesDestroyed: 0,
    powerUpsCollected: 0,
    distanceTraveled: 0,
  });

  const startTimeRef = useRef(Date.now());
  const lastTimeRef = useRef(performance.now());
  const nextEnemyTimeRef = useRef(0);
  const nextLevelScoreRef = useRef(1000);

  // Initialize stars
  useEffect(() => {
    const stars = [];
    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 2 + 0.5,
      });
    }
    starsRef.current = stars;
  }, []);

  // Handle Input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Game Loop
  const update = useCallback((time: number) => {
    if (gameState !== GameState.PLAYING) return;

    const dt = (time - lastTimeRef.current) / 1000;
    lastTimeRef.current = time;

    const player = playerRef.current;
    const stats = statsRef.current;

    // Player Movement
    player.vx = 0;
    player.vy = 0;
    if (keysRef.current['ArrowLeft'] || keysRef.current['KeyA']) player.vx = -PLAYER_SPEED;
    if (keysRef.current['ArrowRight'] || keysRef.current['KeyD']) player.vx = PLAYER_SPEED;
    if (keysRef.current['ArrowUp'] || keysRef.current['KeyW']) player.vy = -PLAYER_SPEED;
    if (keysRef.current['ArrowDown'] || keysRef.current['KeyS']) player.vy = PLAYER_SPEED;

    player.x = Math.max(PLAYER_SIZE, Math.min(CANVAS_WIDTH - PLAYER_SIZE, player.x + player.vx));
    player.y = Math.max(PLAYER_SIZE, Math.min(CANVAS_HEIGHT - PLAYER_SIZE, player.y + player.vy));

    if (player.invincible > 0) player.invincible -= dt;
    if (player.tripleShot > 0) player.tripleShot -= dt;

    // Shooting
    if (keysRef.current['Space'] && time - player.lastShot > 150) {
      if (player.tripleShot > 0) {
        bulletsRef.current.push(new Bullet(player.x, player.y));
        bulletsRef.current.push(new Bullet(player.x - 15, player.y, -2));
        bulletsRef.current.push(new Bullet(player.x + 15, player.y, 2));
      } else {
        bulletsRef.current.push(new Bullet(player.x, player.y));
      }
      player.lastShot = time;
    }

    // Update Stars
    starsRef.current.forEach(star => {
      star.y += star.speed;
      if (star.y > CANVAS_HEIGHT) star.y = 0;
    });

    // Update Bullets
    bulletsRef.current.forEach((bullet, i) => {
      bullet.update();
      if (bullet.y < 0 || bullet.x < 0 || bullet.x > CANVAS_WIDTH) {
        bulletsRef.current.splice(i, 1);
      }
    });

    // Spawn Enemies
    if (time > nextEnemyTimeRef.current) {
      const types = [EnemyType.BASIC, EnemyType.BASIC, EnemyType.FAST];
      if (stats.level >= 2) types.push(EnemyType.FAST);
      if (stats.level >= 3) types.push(EnemyType.HEAVY);
      
      const type = types[Math.floor(Math.random() * types.length)];
      const x = Math.random() * (CANVAS_WIDTH - 100) + 50;
      enemiesRef.current.push(new Enemy(x, type, stats.level));
      
      const spawnRate = Math.max(500, 2000 - (stats.level * 150));
      nextEnemyTimeRef.current = time + spawnRate;
    }

    // Update Enemies
    enemiesRef.current.forEach((enemy, i) => {
      enemy.update();
      
      // Collision with Player
      const dx = enemy.x - player.x;
      const dy = enemy.y - player.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      if (dist < (enemy.size + PLAYER_SIZE) / 2) {
        if (player.invincible <= 0) {
          if (player.shield) {
            player.shield = false;
            player.invincible = 2;
          } else {
            player.health--;
            stats.health = player.health;
            player.invincible = 2;
            if (player.health <= 0) {
              onGameOver(stats);
            }
          }
          // Explosion at collision
          for (let k = 0; k < 10; k++) {
            particlesRef.current.push(new Particle(player.x, player.y, '#fff'));
          }
        }
        enemiesRef.current.splice(i, 1);
      }

      // Escape penalty
      if (enemy.y > CANVAS_HEIGHT + enemy.size) {
        enemiesRef.current.splice(i, 1);
        stats.score = Math.max(0, stats.score - 50);
      }
    });

    // Collision: Bullets vs Enemies
    bulletsRef.current.forEach((bullet, bi) => {
      enemiesRef.current.forEach((enemy, ei) => {
        const dx = bullet.x - enemy.x;
        const dy = bullet.y - enemy.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < enemy.size / 2 + bullet.size) {
          enemy.health--;
          bulletsRef.current.splice(bi, 1);
          
          if (enemy.health <= 0) {
            stats.score += enemy.score;
            stats.enemiesDestroyed++;
            
            // Achievement: First Blood
            if (stats.enemiesDestroyed === 1) onAchievementUnlock('first_blood');
            // Achievement: Ace Pilot
            if (stats.score >= 5000) onAchievementUnlock('ace_pilot');

            // Level Up
            if (stats.score >= nextLevelScoreRef.current) {
              stats.level++;
              if (stats.level >= VICTORY_LEVEL) {
                onGameOver({ ...stats }); // We'll handle victory in App.tsx
              }
              nextLevelScoreRef.current += 1000 * stats.level;
              enemiesRef.current = []; // Clear screen
              if (stats.level === 5) onAchievementUnlock('unstoppable');
            }

            // Chance to drop powerup
            if (Math.random() < 0.15) {
              const type = Math.random() > 0.5 ? PowerUpType.TRIPLE_SHOT : PowerUpType.SHIELD;
              powerUpsRef.current.push(new PowerUp(enemy.x, enemy.y, type));
            }

            // Explosion particles
            for (let k = 0; k < 15; k++) {
              particlesRef.current.push(new Particle(enemy.x, enemy.y, enemy.color));
            }
            enemiesRef.current.splice(ei, 1);
          }
        }
      });
    });

    // Update PowerUps
    powerUpsRef.current.forEach((pu, i) => {
      pu.update();
      const dx = pu.x - player.x;
      const dy = pu.y - player.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      if (dist < (pu.size + PLAYER_SIZE) / 2) {
        if (pu.type === PowerUpType.TRIPLE_SHOT) {
          player.tripleShot = 10;
        } else {
          player.shield = true;
        }
        stats.powerUpsCollected++;
        if (stats.powerUpsCollected === 5) onAchievementUnlock('power_hungry');
        powerUpsRef.current.splice(i, 1);
      }

      if (pu.y > CANVAS_HEIGHT + pu.size) {
        powerUpsRef.current.splice(i, 1);
      }
    });

    // Update Particles
    particlesRef.current.forEach((p, i) => {
      p.update(dt);
      if (p.life <= 0) particlesRef.current.splice(i, 1);
    });

    // Achievement: Survivor
    if (Date.now() - startTimeRef.current > 60000) {
      onAchievementUnlock('survivor');
    }

    onUpdateStats({ ...stats });
  }, [gameState, onGameOver, onUpdateStats, onAchievementUnlock]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Stars
    ctx.fillStyle = '#fff';
    starsRef.current.forEach(star => {
      ctx.globalAlpha = star.speed / 3;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Draw Particles
    particlesRef.current.forEach(p => p.draw(ctx));

    // Draw PowerUps
    powerUpsRef.current.forEach(pu => pu.draw(ctx));

    // Draw Enemies
    enemiesRef.current.forEach(enemy => enemy.draw(ctx));

    // Draw Bullets
    bulletsRef.current.forEach(bullet => bullet.draw(ctx));

    // Draw Player
    const player = playerRef.current;
    if (player.invincible <= 0 || Math.floor(Date.now() / 100) % 2 === 0) {
      ctx.save();
      ctx.translate(player.x, player.y);
      
      // Engine Glow
      const gradient = ctx.createRadialGradient(0, 20, 0, 0, 20, 30);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 20, 20, 0, Math.PI * 2);
      ctx.fill();

      // Ship Body
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#3b82f6';
      
      // Main Hull
      const hullGradient = ctx.createLinearGradient(0, -PLAYER_SIZE/2, 0, PLAYER_SIZE/2);
      hullGradient.addColorStop(0, '#fff');
      hullGradient.addColorStop(1, '#cbd5e1');
      ctx.fillStyle = hullGradient;
      
      ctx.beginPath();
      ctx.moveTo(0, -PLAYER_SIZE/2);
      ctx.lineTo(-PLAYER_SIZE/4, -PLAYER_SIZE/4);
      ctx.lineTo(-PLAYER_SIZE/2, PLAYER_SIZE/2);
      ctx.lineTo(0, PLAYER_SIZE/4);
      ctx.lineTo(PLAYER_SIZE/2, PLAYER_SIZE/2);
      ctx.lineTo(PLAYER_SIZE/4, -PLAYER_SIZE/4);
      ctx.closePath();
      ctx.fill();

      // Cockpit Detail
      ctx.fillStyle = '#0ea5e9';
      ctx.beginPath();
      ctx.ellipse(0, -PLAYER_SIZE/8, PLAYER_SIZE/8, PLAYER_SIZE/6, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Wing details
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-PLAYER_SIZE/4, -PLAYER_SIZE/4);
      ctx.lineTo(-PLAYER_SIZE/2, PLAYER_SIZE/4);
      ctx.moveTo(PLAYER_SIZE/4, -PLAYER_SIZE/4);
      ctx.lineTo(PLAYER_SIZE/2, PLAYER_SIZE/4);
      ctx.stroke();

      // Engine Thrusters
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(-PLAYER_SIZE/6, PLAYER_SIZE/3, PLAYER_SIZE/12, PLAYER_SIZE/6);
      ctx.fillRect(PLAYER_SIZE/6 - PLAYER_SIZE/12, PLAYER_SIZE/3, PLAYER_SIZE/12, PLAYER_SIZE/6);

      // Cockpit
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(0, -5, 5, 0, Math.PI * 2);
      ctx.fill();

      // Shield
      if (player.shield) {
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#8b5cf6';
        ctx.beginPath();
        ctx.arc(0, 0, PLAYER_SIZE * 0.8, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    }

  }, []);

  useEffect(() => {
    let frameId: number;
    const loop = (time: number) => {
      update(time);
      draw();
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [update, draw]);

  // Touch Controls
  const handleTouchMove = (e: React.TouchEvent) => {
    if (gameState !== GameState.PLAYING) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const touch = e.touches[0];
    const x = (touch.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const y = (touch.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);
    playerRef.current.x = Math.max(PLAYER_SIZE, Math.min(CANVAS_WIDTH - PLAYER_SIZE, x));
    playerRef.current.y = Math.max(PLAYER_SIZE, Math.min(CANVAS_HEIGHT - PLAYER_SIZE, y));
    
    // Auto-shoot on touch
    if (performance.now() - playerRef.current.lastShot > 150) {
      keysRef.current['Space'] = true;
      setTimeout(() => { keysRef.current['Space'] = false; }, 50);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black"
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="max-w-full max-h-full object-contain shadow-2xl"
        onTouchMove={handleTouchMove}
      />
    </div>
  );
};

export default GameCanvas;
