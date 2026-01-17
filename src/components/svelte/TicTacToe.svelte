<script lang="ts">
  type Player = "X" | "O" | null;
  type Board = Player[];

  let board: Board = Array(9).fill(null);
  let currentPlayer: "X" | "O" = "X";
  let winner: Player = null;
  let isDraw = false;
  let playerScore = 0;
  let aiScore = 0;
  let gameActive = true;

  const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
  ];

  function checkWinner(board: Board): Player {
    for (const combo of WINNING_COMBINATIONS) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  }

  function checkDraw(board: Board): boolean {
    return board.every(cell => cell !== null);
  }

  function getAvailableMoves(board: Board): number[] {
    return board.reduce((moves: number[], cell, index) => {
      if (cell === null) moves.push(index);
      return moves;
    }, []);
  }

  function minimax(board: Board, depth: number, isMaximizing: boolean): number {
    const result = checkWinner(board);
    if (result === "O") return 10 - depth;
    if (result === "X") return depth - 10;
    if (checkDraw(board)) return 0;

    const availableMoves = getAvailableMoves(board);

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (const move of availableMoves) {
        board[move] = "O";
        const score = minimax(board, depth + 1, false);
        board[move] = null;
        bestScore = Math.max(score, bestScore);
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (const move of availableMoves) {
        board[move] = "X";
        const score = minimax(board, depth + 1, true);
        board[move] = null;
        bestScore = Math.min(score, bestScore);
      }
      return bestScore;
    }
  }

  function getBestMove(board: Board): number {
    let bestScore = -Infinity;
    let bestMove = 0;
    const availableMoves = getAvailableMoves(board);

    // Add some randomness for easier gameplay (70% optimal, 30% random)
    if (Math.random() < 0.3 && availableMoves.length > 1) {
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    for (const move of availableMoves) {
      board[move] = "O";
      const score = minimax(board, 0, false);
      board[move] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    return bestMove;
  }

  function handleCellClick(index: number) {
    if (!gameActive || board[index] || currentPlayer !== "X") return;

    board[index] = "X";
    board = [...board];

    winner = checkWinner(board);
    if (winner) {
      gameActive = false;
      playerScore++;
      return;
    }

    if (checkDraw(board)) {
      isDraw = true;
      gameActive = false;
      return;
    }

    currentPlayer = "O";

    // AI move with slight delay
    setTimeout(() => {
      if (!gameActive) return;

      const aiMove = getBestMove(board);
      board[aiMove] = "O";
      board = [...board];

      winner = checkWinner(board);
      if (winner) {
        gameActive = false;
        aiScore++;
        return;
      }

      if (checkDraw(board)) {
        isDraw = true;
        gameActive = false;
        return;
      }

      currentPlayer = "X";
    }, 400);
  }

  function resetGame() {
    board = Array(9).fill(null);
    currentPlayer = "X";
    winner = null;
    isDraw = false;
    gameActive = true;
  }

  function getStatusMessage(): string {
    if (winner === "X") return "You win! 🎉";
    if (winner === "O") return "AI wins!";
    if (isDraw) return "It's a draw!";
    if (currentPlayer === "X") return "Your turn";
    return "AI thinking...";
  }
</script>

<div class="tictactoe-game">
  <div class="game-header">
    <h3 class="game-title">Tic-Tac-Toe</h3>
    <div class="scores">
      <span class="score">You: {playerScore}</span>
      <span class="score ai">AI: {aiScore}</span>
    </div>
  </div>

  <div class="game-board">
    {#each board as cell, index}
      <button
        class="cell"
        class:x={cell === "X"}
        class:o={cell === "O"}
        on:click={() => handleCellClick(index)}
        disabled={!gameActive || cell !== null || currentPlayer !== "X"}
      >
        {cell || ""}
      </button>
    {/each}
  </div>

  <p class="message">{getStatusMessage()}</p>

  {#if !gameActive}
    <button class="play-again-btn" on:click={resetGame}>
      Play Again
    </button>
  {/if}
</div>

<style>
  .tictactoe-game {
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
  }

  .score {
    color: #22c55e;
  }

  .score.ai {
    color: #ef4444;
  }

  .game-board {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4px;
    width: 180px;
    height: 180px;
    background: var(--border-color);
    padding: 4px;
  }

  .cell {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-secondary);
    border: none;
    font-size: 2rem;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.15s ease;
  }

  .cell:hover:not(:disabled) {
    background: var(--bg-primary);
  }

  .cell:disabled {
    cursor: not-allowed;
  }

  .cell.x {
    color: var(--accent-primary);
  }

  .cell.o {
    color: var(--text-secondary);
  }

  .message {
    margin: 1rem 0 0.5rem;
    font-size: 0.875rem;
    color: var(--text-secondary);
    text-align: center;
    min-height: 1.5em;
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
