import React, { useEffect, useRef, useState } from "react";
import "./../styles/App.css";

const LEVELS = {
  easy: { label: "Easy", pairs: 4 },
  normal: { label: "Normal", pairs: 8 },
  hard: { label: "Hard", pairs: 16 },
};

const shuffle = (tiles) => {
  const shuffled = [...tiles];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const otherIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[otherIndex]] = [
      shuffled[otherIndex],
      shuffled[index],
    ];
  }
  return shuffled;
};

const createTiles = (pairCount) =>
  shuffle(Array.from({ length: pairCount }, (_, index) => index + 1).flatMap(
    (number) => [number, number]
  ));

const App = () => {
  const [selectedLevel, setSelectedLevel] = useState("easy");
  const [gameLevel, setGameLevel] = useState(null);
  const [tiles, setTiles] = useState([]);
  const [revealed, setRevealed] = useState([]);
  const [matched, setMatched] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const timeoutRef = useRef(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    []
  );

  const startGame = (level = selectedLevel) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setSelectedLevel(level);
    setGameLevel(level);
    setTiles(createTiles(LEVELS[level].pairs));
    setRevealed([]);
    setMatched([]);
    setAttempts(0);
  };

  const revealTile = (index) => {
    if (
      revealed.length === 2 ||
      revealed.includes(index) ||
      matched.includes(index)
    ) {
      return;
    }

    const nextRevealed = [...revealed, index];
    setRevealed(nextRevealed);

    if (nextRevealed.length !== 2) {
      return;
    }

    setAttempts((count) => count + 1);
    const [firstIndex, secondIndex] = nextRevealed;
    if (tiles[firstIndex] === tiles[secondIndex]) {
      setMatched((previousMatched) => [...previousMatched, ...nextRevealed]);
      setRevealed([]);
      return;
    }

    timeoutRef.current = setTimeout(() => {
      setRevealed([]);
      timeoutRef.current = null;
    }, 800);
  };

  const gameIsComplete =
    gameLevel !== null && matched.length === LEVELS[gameLevel].pairs * 2;

  return (
    <main>
      <h1>Memory Game</h1>
      <section className="levels_container" aria-label="Difficulty levels">
        {Object.entries(LEVELS).map(([level, details]) => (
          <label key={level}>
            <input
              id={level}
              name="difficulty"
              type="radio"
              value={level}
              checked={selectedLevel === level}
              onChange={() => setSelectedLevel(level)}
            />
            {details.label}
          </label>
        ))}
        <button type="button" onClick={() => startGame()}>
          Start Game
        </button>
      </section>

      {gameLevel && (
        <section aria-label={`${LEVELS[gameLevel].label} game`}>
          <h2>{LEVELS[gameLevel].label} Mode</h2>
          <p aria-live="polite">Attempts: {attempts}</p>
          <div className="cells_container">
            {tiles.map((number, index) => {
              const isVisible = revealed.includes(index) || matched.includes(index);
              return (
                <button
                  aria-label={`Tile ${index + 1}${isVisible ? `, ${number}` : ", hidden"}`}
                  aria-pressed={isVisible}
                  className="cell"
                  data-number={number}
                  disabled={matched.includes(index) || revealed.length === 2}
                  key={index}
                  onClick={() => revealTile(index)}
                  type="button"
                >
                  {isVisible ? number : "?"}
                </button>
              );
            })}
          </div>
          {gameIsComplete && (
            <p role="status">
              All pairs matched in {attempts} {attempts === 1 ? "attempt" : "attempts"}!
            </p>
          )}
          <button type="button" onClick={() => startGame(gameLevel)}>
            Play Again
          </button>
          <button
            type="button"
            onClick={() => {
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
              }
              setGameLevel(null);
            }}
          >
            Choose Level
          </button>
        </section>
      )}
    </main>
  );
};

export default App;
