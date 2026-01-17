<script lang="ts">
  import { onMount } from "svelte";

  type Color = "green" | "red" | "yellow" | "blue";

  const COLORS: Color[] = ["green", "red", "yellow", "blue"];
  const FREQUENCIES: Record<Color, number> = {
    green: 392,   // G4
    red: 329.63,  // E4
    yellow: 261.63, // C4
    blue: 196,    // G3
  };

  let sequence: Color[] = [];
  let playerSequence: Color[] = [];
  let isPlaying = false;
  let isShowingSequence = false;
  let activeColor: Color | null = null;
  let score = 0;
  let highScore = 0;
  let gameState: "idle" | "playing" | "gameover" = "idle";
  let message = "Press Start to Play";

  let audioContext: AudioContext | null = null;

  function initAudio() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  function playTone(color: Color, duration = 300) {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = FREQUENCIES[color];
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  }

  function getRandomColor(): Color {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
  }

  async function startGame() {
    initAudio();
    sequence = [];
    playerSequence = [];
    score = 0;
    gameState = "playing";
    message = "Watch the sequence...";
    await nextRound();
  }

  async function nextRound() {
    playerSequence = [];
    sequence.push(getRandomColor());
    await showSequence();
    message = "Your turn!";
  }

  async function showSequence() {
    isShowingSequence = true;
    await sleep(500);

    for (const color of sequence) {
      activeColor = color;
      playTone(color);
      await sleep(400);
      activeColor = null;
      await sleep(200);
    }

    isShowingSequence = false;
  }

  function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function handleColorClick(color: Color) {
    if (isShowingSequence || gameState !== "playing") return;

    initAudio();
    activeColor = color;
    playTone(color, 200);

    setTimeout(() => {
      activeColor = null;
    }, 200);

    playerSequence.push(color);

    const currentIndex = playerSequence.length - 1;

    if (playerSequence[currentIndex] !== sequence[currentIndex]) {
      // Wrong color - game over
      gameOver();
      return;
    }

    if (playerSequence.length === sequence.length) {
      // Completed the sequence
      score = sequence.length;
      if (score > highScore) {
        highScore = score;
        localStorage.setItem("simonHighScore", String(highScore));
      }
      message = `Level ${score} complete!`;
      await sleep(1000);
      await nextRound();
    }
  }

  function gameOver() {
    gameState = "gameover";
    message = `Game Over! Score: ${score}`;

    // Flash red effect
    playErrorSound();
  }

  function playErrorSound() {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 100;
    oscillator.type = "sawtooth";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }

  onMount(() => {
    const saved = localStorage.getItem("simonHighScore");
    if (saved) {
      highScore = parseInt(saved, 10);
    }
  });
</script>

<div class="simon-game">
  <div class="game-header">
    <h3 class="game-title">Simon Says</h3>
    <div class="scores">
      <span class="score">Level: {score}</span>
      <span class="high-score">Best: {highScore}</span>
    </div>
  </div>

  <div class="game-board" class:disabled={isShowingSequence}>
    <button
      class="color-btn green"
      class:active={activeColor === "green"}
      on:click={() => handleColorClick("green")}
      disabled={isShowingSequence || gameState !== "playing"}
      aria-label="Green"
    ></button>
    <button
      class="color-btn red"
      class:active={activeColor === "red"}
      on:click={() => handleColorClick("red")}
      disabled={isShowingSequence || gameState !== "playing"}
      aria-label="Red"
    ></button>
    <button
      class="color-btn yellow"
      class:active={activeColor === "yellow"}
      on:click={() => handleColorClick("yellow")}
      disabled={isShowingSequence || gameState !== "playing"}
      aria-label="Yellow"
    ></button>
    <button
      class="color-btn blue"
      class:active={activeColor === "blue"}
      on:click={() => handleColorClick("blue")}
      disabled={isShowingSequence || gameState !== "playing"}
      aria-label="Blue"
    ></button>
  </div>

  <p class="message">{message}</p>

  {#if gameState === "idle" || gameState === "gameover"}
    <button class="start-btn" on:click={startGame}>
      {gameState === "gameover" ? "Play Again" : "Start Game"}
    </button>
  {/if}
</div>

<style>
  .simon-game {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
    border: 1px solid var(--border-color);
  }

  .game-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    width: 100%;
  }

  .game-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0;
    color: var(--text-primary);
  }

  .scores {
    display: flex;
    gap: 1rem;
    font-size: 0.875rem;
    color: var(--text-secondary);
  }

  .high-score {
    color: var(--accent-primary);
  }

  .game-board {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    width: 180px;
    height: 180px;
    padding: 8px;
    border-radius: 50%;
  }

  .game-board.disabled {
    pointer-events: none;
  }

  .color-btn {
    border: none;
    cursor: pointer;
    transition: filter 0.1s ease, transform 0.1s ease;
    opacity: 0.6;
  }

  .color-btn:hover:not(:disabled) {
    opacity: 0.8;
  }

  .color-btn.active {
    opacity: 1;
    filter: brightness(1.3);
    transform: scale(1.02);
  }

  .color-btn:disabled {
    cursor: not-allowed;
  }

  .color-btn.green {
    background: #22c55e;
    border-radius: 100% 0 0 0;
  }

  .color-btn.red {
    background: #ef4444;
    border-radius: 0 100% 0 0;
  }

  .color-btn.yellow {
    background: #eab308;
    border-radius: 0 0 0 100%;
  }

  .color-btn.blue {
    background: #3b82f6;
    border-radius: 0 0 100% 0;
  }

  .message {
    margin: 1rem 0 0.5rem;
    font-size: 0.875rem;
    color: var(--text-secondary);
    text-align: center;
    min-height: 1.5em;
  }

  .start-btn {
    padding: 0.625rem 1.25rem;
    background: var(--accent-primary);
    color: white;
    border: none;
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.2s ease;
  }

  .start-btn:hover {
    background: var(--accent-secondary);
    transform: translateY(-1px);
  }
</style>
