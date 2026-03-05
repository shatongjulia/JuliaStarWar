import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Info, Shield, Zap, Target, Trophy, Flame, Pause, RotateCcw, Home, Smartphone, MousePointer2 } from 'lucide-react';
import { GameState, GameStats, Achievement } from '../types';

interface UIOverlayProps {
  gameState: GameState;
  stats: GameStats;
  achievements: Achievement[];
  onStart: () => void;
  onResume: () => void;
  onPause: () => void;
  onRestart: () => void;
  onHome: () => void;
  unlockedAchievement?: Achievement | null;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({
  gameState,
  stats,
  achievements,
  onStart,
  onResume,
  onPause,
  onRestart,
  onHome,
  unlockedAchievement
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
      {/* HUD */}
      {gameState === GameState.PLAYING && (
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start pointer-events-auto">
          <div className="glass p-4 rounded-2xl flex flex-col gap-1 min-w-[150px]">
            <div className="text-xs text-white/60 font-display uppercase tracking-widest">Score</div>
            <div className="text-2xl font-display font-bold text-blue-400">{stats.score.toLocaleString()}</div>
            <div className="flex gap-1 mt-2">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < stats.health ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-white/10'}`}
                />
              ))}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            <div className="glass p-4 rounded-2xl text-center min-w-[100px]">
              <div className="text-xs text-white/60 font-display uppercase tracking-widest">Level</div>
              <div className="text-2xl font-display font-bold text-amber-400">{stats.level}</div>
            </div>
            <button 
              onClick={onPause}
              className="glass p-3 rounded-xl hover:bg-white/20 transition-colors"
            >
              <Pause size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Start Screen */}
      <AnimatePresence>
        {gameState === GameState.START && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="glass-dark p-10 rounded-[2rem] max-w-md w-full text-center pointer-events-auto relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500" />
            <h1 className="text-5xl font-display font-black mb-2 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
              Julia<br/>星际先锋
            </h1>
            <p className="text-white/60 mb-8 text-sm tracking-widest uppercase">Star Pioneer</p>
            
            <div className="space-y-4 mb-8">
              <button 
                onClick={onStart}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-display font-bold text-lg transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 group"
              >
                <Play size={20} className="group-hover:scale-110 transition-transform" />
                开始作战
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div className="glass p-3 rounded-xl">
                <div className="flex items-center gap-2 text-xs font-bold text-white/80 mb-2">
                  <MousePointer2 size={14} className="text-blue-400" />
                  电脑端操作
                </div>
                <ul className="text-[10px] text-white/50 space-y-1">
                  <li>• 方向键/WASD 移动</li>
                  <li>• 空格键 射击 | P键 暂停</li>
                </ul>
              </div>
              <div className="glass p-3 rounded-xl">
                <div className="flex items-center gap-2 text-xs font-bold text-white/80 mb-2">
                  <Smartphone size={14} className="text-emerald-400" />
                  手机端操作
                </div>
                <ul className="text-[10px] text-white/50 space-y-1">
                  <li>• 触摸屏幕 移动战机</li>
                  <li>• 移动时 自动射击</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pause Screen */}
      <AnimatePresence>
        {gameState === GameState.PAUSED && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-dark p-8 rounded-3xl max-w-xs w-full text-center pointer-events-auto"
          >
            <h2 className="text-3xl font-display font-bold mb-6">游戏暂停</h2>
            <div className="space-y-3">
              <button 
                onClick={onResume}
                className="w-full py-3 bg-white text-black rounded-xl font-bold hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
              >
                <Play size={18} />
                继续游戏
              </button>
              <button 
                onClick={onRestart}
                className="w-full py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw size={18} />
                重新开始
              </button>
              <button 
                onClick={onHome}
                className="w-full py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
              >
                <Home size={18} />
                返回主页
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Screen */}
      <AnimatePresence>
        {gameState === GameState.GAME_OVER && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-dark p-10 rounded-[2.5rem] max-w-md w-full text-center pointer-events-auto"
          >
            <h2 className="text-4xl font-display font-black mb-2 text-red-500">任务失败</h2>
            <p className="text-white/40 mb-8 uppercase tracking-widest text-xs">Mission Failed</p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="glass p-4 rounded-2xl">
                <div className="text-[10px] text-white/40 uppercase font-display">Final Score</div>
                <div className="text-2xl font-display font-bold">{stats.score.toLocaleString()}</div>
              </div>
              <div className="glass p-4 rounded-2xl">
                <div className="text-[10px] text-white/40 uppercase font-display">Level Reached</div>
                <div className="text-2xl font-display font-bold">{stats.level}</div>
              </div>
            </div>

            <div className="mb-8 text-left">
              <div className="text-xs font-bold text-white/60 mb-3 uppercase tracking-wider">获得的成就</div>
              <div className="flex flex-wrap gap-2">
                {achievements.filter(a => a.unlocked).map(a => (
                  <div key={a.id} className="glass px-3 py-1.5 rounded-full flex items-center gap-2 text-[10px] font-bold text-amber-400 border-amber-400/30">
                    <Trophy size={12} />
                    {a.title}
                  </div>
                ))}
                {achievements.filter(a => a.unlocked).length === 0 && (
                  <div className="text-xs text-white/30 italic">暂无成就</div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={onRestart}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-display font-bold text-lg transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2"
              >
                <RotateCcw size={20} />
                再次尝试
              </button>
              <button 
                onClick={onHome}
                className="w-full py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
              >
                <Home size={18} />
                返回主页
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Victory Screen */}
      <AnimatePresence>
        {gameState === GameState.WIN && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-dark p-10 rounded-[2.5rem] max-w-md w-full text-center pointer-events-auto border-amber-400/50"
          >
            <div className="w-20 h-20 bg-amber-400/20 rounded-full flex items-center justify-center text-amber-400 mx-auto mb-6 animate-pulse">
              <Trophy size={48} />
            </div>
            <h2 className="text-4xl font-display font-black mb-2 text-amber-400">任务成功</h2>
            <p className="text-white/40 mb-8 uppercase tracking-widest text-xs">Mission Accomplished</p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="glass p-4 rounded-2xl">
                <div className="text-[10px] text-white/40 uppercase font-display">Final Score</div>
                <div className="text-2xl font-display font-bold text-amber-400">{stats.score.toLocaleString()}</div>
              </div>
              <div className="glass p-4 rounded-2xl">
                <div className="text-[10px] text-white/40 uppercase font-display">Level Reached</div>
                <div className="text-2xl font-display font-bold text-amber-400">{stats.level}</div>
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={onRestart}
                className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-display font-bold text-lg transition-all shadow-[0_0_20px_rgba(217,119,6,0.4)] flex items-center justify-center gap-2"
              >
                <RotateCcw size={20} />
                再次挑战
              </button>
              <button 
                onClick={onHome}
                className="w-full py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
              >
                <Home size={18} />
                返回主页
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement Notification */}
      <AnimatePresence>
        {unlockedAchievement && (
          <motion.div 
            initial={{ opacity: 0, y: -100, x: '-50%' }}
            animate={{ opacity: 1, y: 40, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.8, x: '-50%' }}
            className="fixed top-0 left-1/2 glass p-4 rounded-2xl flex items-center gap-4 min-w-[280px] sm:min-w-[320px] z-[100] border-amber-400/50 shadow-[0_0_30px_rgba(251,191,36,0.2)]"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-400 shrink-0">
              <Trophy size={24} />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">成就解锁!</div>
              <div className="text-sm font-bold text-white">{unlockedAchievement.title}</div>
              <div className="text-[10px] text-white/60 leading-tight">{unlockedAchievement.description}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
