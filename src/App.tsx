import { useGameStore } from './store/gameStore';
import PreRunScreen from './screens/PreRunScreen';
import CombatScreen from './screens/CombatScreen';
import RouletteScreen from './screens/RouletteScreen';
import GameOverScreen from './screens/GameOverScreen';

function App() {
  const { gameState } = useGameStore();

  return (
    <main className="game-viewport">
      {gameState === 'PRE_RUN' && <PreRunScreen />}
      
      {(gameState === 'COMBAT' || gameState === 'ROULETTE') && (
        <>
          <CombatScreen />
          {gameState === 'ROULETTE' && <RouletteScreen />}
        </>
      )}
      
      {gameState === 'GAMEOVER' && <GameOverScreen />}
    </main>
  );
}

export default App;
