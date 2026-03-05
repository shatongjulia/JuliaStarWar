export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 1000;

export const PLAYER_SPEED = 7;
export const PLAYER_SIZE = 40;

export const BULLET_SPEED = 10;
export const BULLET_SIZE = 4;

export const ENEMY_CONFIGS = {
  BASIC: {
    speed: 3,
    health: 1,
    score: 100,
    size: 35,
    color: '#3b82f6', // blue-500
  },
  FAST: {
    speed: 6,
    health: 1,
    score: 200,
    size: 25,
    color: '#f59e0b', // amber-500
  },
  HEAVY: {
    speed: 1.5,
    health: 3,
    score: 500,
    size: 50,
    color: '#ef4444', // red-500
  }
};

export const POWERUP_CONFIGS = {
  TRIPLE_SHOT: {
    duration: 10000,
    color: '#10b981', // emerald-500
    size: 30,
  },
  SHIELD: {
    duration: 0, // One-time use
    color: '#8b5cf6', // violet-500
    size: 30,
  }
};

export const INITIAL_ACHIEVEMENTS = [
  {
    id: 'first_blood',
    title: '第一滴血',
    description: '击毁第一架敌机',
    unlocked: false,
    icon: 'Target',
  },
  {
    id: 'survivor',
    title: '生存者',
    description: '在单场游戏中坚持超过60秒',
    unlocked: false,
    icon: 'Shield',
  },
  {
    id: 'ace_pilot',
    title: '王牌飞行员',
    description: '单场得分超过5000分',
    unlocked: false,
    icon: 'Trophy',
  },
  {
    id: 'power_hungry',
    title: '能量渴望',
    description: '在一场游戏中收集5个道具',
    unlocked: false,
    icon: 'Zap',
  },
  {
    id: 'unstoppable',
    title: '势不可挡',
    description: '达到第5关',
    unlocked: false,
    icon: 'Flame',
  }
];
