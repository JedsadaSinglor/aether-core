import { create } from 'zustand';

export type GameState = 'PRE_RUN' | 'COMBAT' | 'ROULETTE' | 'GAMEOVER';

export interface StatAllocation {
  ATK: number;
  AGI: number;
  DEF: number;
  HP: number;
  LUK: number;
  INT: number;
}

export interface PlayerBuildConfig {
  statAllocation: StatAllocation;
  selectedAutomaton: string; // 'CHR_01' to 'CHR_06'
  selectedWeapon: string;    // 'WEP_01' to 'WEP_05'
  selectedAICore: 'Kiting' | 'Aggressive' | 'Adaptive';
}

export interface RunStats {
  currentStage: number;
  enemiesKilled: number;
  damageDealt: number;
  skillsCollected: string[];
}

interface GameStoreState {
  gameState: GameState;
  playerConfig: PlayerBuildConfig;
  runStats: RunStats;
  setGameState: (state: GameState) => void;
  setPlayerConfig: (config: Partial<PlayerBuildConfig>) => void;
  updateStatAllocation: (stat: keyof StatAllocation, amount: number) => void;
  resetStatAllocation: () => void;
  setRunStats: (stats: Partial<RunStats>) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStoreState>((set) => ({
  gameState: 'PRE_RUN',
  playerConfig: {
    statAllocation: {
      ATK: 0,
      AGI: 0,
      DEF: 0,
      HP: 0,
      LUK: 0,
      INT: 0
    },
    selectedAutomaton: 'CHR_01',
    selectedWeapon: 'WEP_01',
    selectedAICore: 'Aggressive'
  },
  runStats: {
    currentStage: 1,
    enemiesKilled: 0,
    damageDealt: 0,
    skillsCollected: []
  },
  setGameState: (state) => set({ gameState: state }),
  setPlayerConfig: (config) => set((state) => ({
    playerConfig: { ...state.playerConfig, ...config }
  })),
  updateStatAllocation: (stat, amount) => set((state) => {
    const currentAlloc = state.playerConfig.statAllocation[stat];
    const totalAllocated = Object.values(state.playerConfig.statAllocation).reduce((a, b) => a + b, 0);
    const newAlloc = currentAlloc + amount;
    
    // Limits check: points must be >= 0 and total allocated <= 100 points budget
    if (newAlloc < 0) return {};
    if (amount > 0 && totalAllocated + amount > 100) return {};

    return {
      playerConfig: {
        ...state.playerConfig,
        statAllocation: {
          ...state.playerConfig.statAllocation,
          [stat]: newAlloc
        }
      }
    };
  }),
  resetStatAllocation: () => set((state) => ({
    playerConfig: {
      ...state.playerConfig,
      statAllocation: {
        ATK: 0,
        AGI: 0,
        DEF: 0,
        HP: 0,
        LUK: 0,
        INT: 0
      }
    }
  })),
  setRunStats: (stats) => set((state) => ({
    runStats: { ...state.runStats, ...stats }
  })),
  resetGame: () => set({
    gameState: 'PRE_RUN',
    runStats: {
      currentStage: 1,
      enemiesKilled: 0,
      damageDealt: 0,
      skillsCollected: []
    }
  })
}));
