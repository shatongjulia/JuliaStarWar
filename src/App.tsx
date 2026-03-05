import React, { useState, useCallback, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import { UIOverlay } from './components/UIOverlay';
import { GameState, GameStats, Achievement } from './types';
import { INITIAL_ACHIEVEMENTS } from './constants';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    health: 3,
    level: 1,
    enemiesDestroyed: 0,
    powerUpsCollected: 0,
    distanceTraveled: 0,
  });
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);

  const handleStart = () => {
    setStats({
      score: 0,
      health: 3,
      level: 1,
      enemiesDestroyed: 0,
      powerUpsCollected: 0,
      distanceTraveled: 0,
    });
    setGameState(GameState.PLAYING);
  };

  const handleGameOver = (finalStats: GameStats) => {
    setStats(finalStats);
    setGameState(GameState.GAME_OVER);
  };

  const handleUpdateStats = useCallback((newStats: GameStats) => {
    setStats(newStats);
  }, []);

  const handleAchievementUnlock = useCallback((id: string) => {
    setAchievements(prev => {
      const index = prev.findIndex(a => a.id === id);
      if (index !== -1 && !prev[index].unlocked) {
        const newAchievements = [...prev];
        newAchievements[index] = { ...newAchievements[index], unlocked: true };
        setUnlockedAchievement(newAchievements[index]);
        return newAchievements;
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    if (unlockedAchievement) {
      const timer = setTimeout(() => {
        setUnlockedAchievement(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [unlockedAchievement]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyP') {
        if (gameState === GameState.PLAYING) setGameState(GameState.PAUSED);
        else if (gameState === GameState.PAUSED) setGameState(GameState.PLAYING);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden scanline">
      <GameCanvas 
        gameState={gameState} 
        onGameOver={handleGameOver}
        onUpdateStats={handleUpdateStats}
        onAchievementUnlock={handleAchievementUnlock}
      />
      
      <UIOverlay 
        gameState={gameState}
        stats={stats}
        achievements={achievements}
        onStart={handleStart}
        onResume={() => setGameState(GameState.PLAYING)}
        onPause={() => setGameState(GameState.PAUSED)}
        onRestart={handleStart}
        onHome={() => setGameState(GameState.START)}
        unlockedAchievement={unlockedAchievement}
      />

      {/* Sidebar - Desktop Only */}
      <div className="hidden lg:flex absolute left-8 top-1/2 -translate-y-1/2 flex-col gap-6 pointer-events-none">
        <div className="glass p-6 rounded-3xl w-64">
          <h3 className="text-xs font-display font-bold text-blue-400 uppercase tracking-widest mb-4">操作指南</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">移动</span>
              <div className="flex gap-1">
                <kbd className="px-2 py-1 bg-white/10 rounded text-[10px] border border-white/20">W</kbd>
                <kbd className="px-2 py-1 bg-white/10 rounded text-[10px] border border-white/20">A</kbd>
                <kbd className="px-2 py-1 bg-white/10 rounded text-[10px] border border-white/20">S</kbd>
                <kbd className="px-2 py-1 bg-white/10 rounded text-[10px] border border-white/20">D</kbd>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">射击</span>
              <kbd className="px-2 py-1 bg-white/10 rounded text-[10px] border border-white/20">SPACE</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">暂停</span>
              <kbd className="px-2 py-1 bg-white/10 rounded text-[10px] border border-white/20">P</kbd>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-3xl w-64">
          <h3 className="text-xs font-display font-bold text-amber-400 uppercase tracking-widest mb-4">战术装备</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">T</div>
              <div>
                <div className="text-[10px] font-bold">三向子弹</div>
                <div className="text-[8px] text-white/40">大幅提升火力覆盖范围</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 border border-purple-500/30">S</div>
              <div>
                <div className="text-[10px] font-bold">能量护盾</div>
                <div className="text-[8px] text-white/40">抵御一次致命伤害</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
