<script lang="ts">
  import { onMount } from "svelte";
  import SimonSays from "./SimonSays.svelte";
  import TicTacToe from "./TicTacToe.svelte";
  import ReactionTime from "./ReactionTime.svelte";
  import MemoryMatch from "./MemoryMatch.svelte";

  const games = [
    { name: "Simon Says", component: SimonSays },
    { name: "Tic-Tac-Toe", component: TicTacToe },
    { name: "Reaction Time", component: ReactionTime },
    { name: "Memory Match", component: MemoryMatch },
  ];

  let currentGameIndex = 0;
  let currentGame = games[0];

  function selectRandomGame() {
    currentGameIndex = Math.floor(Math.random() * games.length);
    currentGame = games[currentGameIndex];
  }

  function nextGame() {
    currentGameIndex = (currentGameIndex + 1) % games.length;
    currentGame = games[currentGameIndex];
  }

  onMount(() => {
    selectRandomGame();
  });
</script>

<div class="random-game-container">
  <svelte:component this={currentGame.component} />

  <button class="shuffle-btn" on:click={nextGame} title="Try another game">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polyline points="16 3 21 3 21 8"></polyline>
      <line x1="4" y1="20" x2="21" y2="3"></line>
      <polyline points="21 16 21 21 16 21"></polyline>
      <line x1="15" y1="15" x2="21" y2="21"></line>
      <line x1="4" y1="4" x2="9" y2="9"></line>
    </svg>
    <span>Try another game</span>
  </button>
</div>

<style>
  .random-game-container {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .shuffle-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    font-family: inherit;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;
    align-self: center;
  }

  .shuffle-btn:hover {
    border-color: var(--accent-primary);
    color: var(--accent-primary);
  }
</style>
