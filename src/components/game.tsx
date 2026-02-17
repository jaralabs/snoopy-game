import { useEffect } from "react";

const Game = () => {
  useEffect(() => {
    let disposed = false;
    let game: import("phaser").Game | null = null;

    const startGame = async () => {
      const [{ default: Phaser }, { gameConfig }] = await Promise.all([import("phaser"), import("../game/config")]);
      if (disposed) {
        return;
      }
      game = new Phaser.Game(gameConfig);
    };

    void startGame();

    return () => {
      disposed = true;
      game?.destroy(true);
    };
  }, []);

  return <div id="game-host" className="h-full w-full" />;
};

export default Game;
