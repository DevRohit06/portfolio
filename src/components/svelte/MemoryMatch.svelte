<script lang="ts">
  import { onMount } from "svelte";

  interface Card {
    id: number;
    emoji: string;
    isFlipped: boolean;
    isMatched: boolean;
  }

  const EMOJIS = ["🚀", "💻", "⚡", "🎯", "🔥", "💡", "🎨", "🌟"];

  let cards: Card[] = [];
  let flippedCards: number[] = [];
  let moves = 0;
  let matches = 0;
  let isLocked = false;
  let gameComplete = false;
  let bestMoves = 0;

  function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  function initGame() {
    const selectedEmojis = EMOJIS.slice(0, 6); // Use 6 pairs for 12 cards (4x3 grid)
    const pairs = [...selectedEmojis, ...selectedEmojis];
    const shuffled = shuffleArray(pairs);

    cards = shuffled.map((emoji, index) => ({
      id: index,
      emoji,
      isFlipped: false,
      isMatched: false,
    }));

    flippedCards = [];
    moves = 0;
    matches = 0;
    isLocked = false;
    gameComplete = false;
  }

  function handleCardClick(cardId: number) {
    if (isLocked) return;

    const card = cards.find((c) => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    card.isFlipped = true;
    cards = [...cards];
    flippedCards = [...flippedCards, cardId];

    if (flippedCards.length === 2) {
      moves++;
      isLocked = true;

      const [firstId, secondId] = flippedCards;
      const firstCard = cards.find((c) => c.id === firstId)!;
      const secondCard = cards.find((c) => c.id === secondId)!;

      if (firstCard.emoji === secondCard.emoji) {
        // Match found
        firstCard.isMatched = true;
        secondCard.isMatched = true;
        matches++;
        cards = [...cards];
        flippedCards = [];
        isLocked = false;

        if (matches === 6) {
          gameComplete = true;
          if (bestMoves === 0 || moves < bestMoves) {
            bestMoves = moves;
            localStorage.setItem("memoryBestMoves", String(bestMoves));
          }
        }
      } else {
        // No match - flip back after delay
        setTimeout(() => {
          firstCard.isFlipped = false;
          secondCard.isFlipped = false;
          cards = [...cards];
          flippedCards = [];
          isLocked = false;
        }, 800);
      }
    }
  }

  onMount(() => {
    const saved = localStorage.getItem("memoryBestMoves");
    if (saved) {
      bestMoves = parseInt(saved, 10);
    }
    initGame();
  });
</script>

<div class="memory-game">
  <div class="game-header">
    <h3 class="game-title">Memory Match</h3>
    <div class="scores">
      <span class="score">Moves: {moves}</span>
      {#if bestMoves > 0}
        <span class="score best">Best: {bestMoves}</span>
      {/if}
    </div>
  </div>

  <div class="game-board">
    {#each cards as card (card.id)}
      <button
        class="card"
        class:flipped={card.isFlipped || card.isMatched}
        class:matched={card.isMatched}
        on:click={() => handleCardClick(card.id)}
        disabled={card.isMatched}
      >
        <span class="card-front">?</span>
        <span class="card-back">{card.emoji}</span>
      </button>
    {/each}
  </div>

  {#if gameComplete}
    <p class="message">Completed in {moves} moves! 🎉</p>
    <button class="play-again-btn" on:click={initGame}>
      Play Again
    </button>
  {:else}
    <p class="message">Find all {6} pairs</p>
  {/if}
</div>

<style>
  .memory-game {
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

  .game-board {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
    width: 200px;
  }

  .card {
    aspect-ratio: 1;
    border: 1px solid var(--border-color);
    background: var(--bg-secondary);
    cursor: pointer;
    position: relative;
    perspective: 1000px;
    font-size: 1.25rem;
  }

  .card-front,
  .card-back {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    backface-visibility: hidden;
    transition: transform 0.3s ease;
  }

  .card-front {
    background: var(--bg-secondary);
    color: var(--text-secondary);
    font-weight: bold;
  }

  .card-back {
    background: var(--bg-primary);
    transform: rotateY(180deg);
  }

  .card.flipped .card-front {
    transform: rotateY(180deg);
  }

  .card.flipped .card-back {
    transform: rotateY(0deg);
  }

  .card.matched {
    opacity: 0.7;
    cursor: default;
  }

  .card:hover:not(.flipped):not(.matched) {
    border-color: var(--accent-primary);
  }

  .message {
    margin: 1rem 0 0.5rem;
    font-size: 0.875rem;
    color: var(--text-secondary);
    text-align: center;
  }

  .play-again-btn {
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

  .play-again-btn:hover {
    background: var(--accent-secondary);
    transform: translateY(-1px);
  }
</style>
