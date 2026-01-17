<script lang="ts">
  import { onMount } from "svelte";

  type GameState = "waiting" | "ready" | "go" | "clicked" | "too-early";

  let gameState: GameState = "waiting";
  let startTime = 0;
  let reactionTime = 0;
  let bestTime = 0;
  let attempts: number[] = [];
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  function startGame() {
    gameState = "ready";
    reactionTime = 0;

    // Random delay between 1.5 and 4 seconds
    const delay = 1500 + Math.random() * 2500;

    timeoutId = setTimeout(() => {
      gameState = "go";
      startTime = performance.now();
    }, delay);
  }

  function handleClick() {
    if (gameState === "waiting" || gameState === "clicked" || gameState === "too-early") {
      startGame();
      return;
    }

    if (gameState === "ready") {
      // Clicked too early
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      gameState = "too-early";
      return;
    }

    if (gameState === "go") {
      const endTime = performance.now();
      reactionTime = Math.round(endTime - startTime);
      attempts.push(reactionTime);
      attempts = attempts.slice(-5); // Keep last 5 attempts

      if (bestTime === 0 || reactionTime < bestTime) {
        bestTime = reactionTime;
        localStorage.setItem("reactionBestTime", String(bestTime));
      }

      gameState = "clicked";
    }
  }

  function getAverageTime(): number {
    if (attempts.length === 0) return 0;
    return Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length);
  }

  function getReactionRating(time: number): string {
    if (time < 200) return "Incredible! 🚀";
    if (time < 250) return "Excellent! ⚡";
    if (time < 300) return "Great! 🎯";
    if (time < 400) return "Good! 👍";
    if (time < 500) return "Average";
    return "Keep practicing!";
  }

  function getStateMessage(): string {
    switch (gameState) {
      case "waiting":
        return "Click to Start";
      case "ready":
        return "Wait for green...";
      case "go":
        return "Click NOW!";
      case "too-early":
        return "Too early! Click to retry";
      case "clicked":
        return `${reactionTime}ms - ${getReactionRating(reactionTime)}`;
    }
  }

  function getStateColor(): string {
    switch (gameState) {
      case "waiting":
      case "clicked":
        return "var(--bg-secondary)";
      case "ready":
        return "#ef4444";
      case "go":
        return "#22c55e";
      case "too-early":
        return "#f97316";
    }
  }

  onMount(() => {
    const saved = localStorage.getItem("reactionBestTime");
    if (saved) {
      bestTime = parseInt(saved, 10);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  });
</script>

<div class="reaction-game">
  <div class="game-header">
    <h3 class="game-title">Reaction Time</h3>
    <div class="scores">
      {#if bestTime > 0}
        <span class="score best">Best: {bestTime}ms</span>
      {/if}
      {#if attempts.length > 0}
        <span class="score avg">Avg: {getAverageTime()}ms</span>
      {/if}
    </div>
  </div>

  <button
    class="game-area"
    style="background-color: {getStateColor()}"
    on:click={handleClick}
  >
    <span class="message" class:small={gameState === "clicked"}>
      {getStateMessage()}
    </span>
  </button>

  {#if gameState === "clicked"}
    <p class="instruction">Click to try again</p>
  {:else if gameState === "waiting"}
    <p class="instruction">Test your reflexes!</p>
  {/if}
</div>

<style>
  .reaction-game {
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

  .score.best {
    color: var(--accent-primary);
  }

  .game-area {
    width: 180px;
    height: 180px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.1s ease;
    user-select: none;
  }

  .game-area:hover {
    transform: scale(1.02);
  }

  .game-area:active {
    transform: scale(0.98);
  }

  .message {
    color: white;
    font-size: 1rem;
    font-weight: 600;
    text-align: center;
    padding: 1rem;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  .message.small {
    font-size: 0.875rem;
  }

  .instruction {
    margin: 1rem 0 0;
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-align: center;
  }
</style>
