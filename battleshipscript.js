// Updated battleshipscript.js
document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.getElementById("start-game");
  const restartButton = document.getElementById("restart-game");
  const gameBoard = document.getElementById("game-board");
  const gameOver = document.getElementById("game-over");
  const gameMessage = document.getElementById("game-message");
  const playAgainButton = document.getElementById("play-again");

  const scoreDisplay = document.getElementById("score");
  const highScoreDisplay = document.getElementById("high-score");

  let board = [];
  let ships = [];
  let hits = 0;
  let score = 0;
  let moves = 0;
  const totalShips = 5;
  const shipLengths = [5, 4, 3, 3, 2];
  let highScore = localStorage.getItem("highScore") || 0;

  function createBoard() {
      board = [];
      gameBoard.innerHTML = "";
      for (let i = 0; i < 10; i++) {
          const row = [];
          for (let j = 0; j < 10; j++) {
              const button = document.createElement("button");
              button.classList.add("cell");
              button.dataset.row = i;
              button.dataset.col = j;
              button.addEventListener("click", () => handleCellClick(i, j));
              gameBoard.appendChild(button);
              row.push({ hasShip: false, hit: false });
          }
          board.push(row);
      }
  }

  function placeShips() {
      ships = [];
      shipLengths.forEach((length) => {
          let placed = false;
          while (!placed) {
              const isHorizontal = Math.random() < 0.5;
              const row = Math.floor(Math.random() * 10);
              const col = Math.floor(Math.random() * 10);

              if (canPlaceShip(row, col, length, isHorizontal)) {
                  placeShip(row, col, length, isHorizontal);
                  ships.push({ row, col, length, isHorizontal });
                  placed = true;
              }
          }
      });
  }

  function canPlaceShip(row, col, length, isHorizontal) {
      for (let i = 0; i < length; i++) {
          const r = row + (isHorizontal ? 0 : i);
          const c = col + (isHorizontal ? i : 0);

          if (r >= 10 || c >= 10 || board[r][c].hasShip) return false;

          for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                  const nr = r + dr;
                  const nc = c + dc;

                  if (nr >= 0 && nr < 10 && nc >= 0 && nc < 10) {
                      if (board[nr][nc].hasShip) return false;
                  }
              }
          }
      }
      return true;
  }

  function placeShip(row, col, length, isHorizontal) {
      for (let i = 0; i < length; i++) {
          const r = row + (isHorizontal ? 0 : i);
          const c = col + (isHorizontal ? i : 0);
          board[r][c].hasShip = true;
      }
  }

  function handleCellClick(row, col) {
      if (board[row][col].hit) return;

      board[row][col].hit = true;
      const cell = document.querySelector(
          `.cell[data-row="${row}"][data-col="${col}"]`
      );

      moves++;

      if (board[row][col].hasShip) {
          cell.classList.add("hit");
          hits++;
          score += 50; // Add points for a hit

          const sunkShip = checkIfShipSunk(row, col);
          if (sunkShip) {
              markSurroundingSquares(sunkShip);
              score += 200; // Add points for sinking a ship
          }

          if (hits === shipLengths.reduce((a, b) => a + b, 0)) {
              score += Math.max(0, 1000 - moves * 10); // Bonus for speed
              endGame(true);
          }
      } else {
          cell.classList.add("miss");
          score -= 20; // Deduct points for a miss
      }

      updateScoreboard();
  }

  function checkIfShipSunk(row, col) {
      for (let ship of ships) {
          let { row: shipRow, col: shipCol, length, isHorizontal } = ship;
          let shipCells = [];
          for (let i = 0; i < length; i++) {
              const r = shipRow + (isHorizontal ? 0 : i);
              const c = shipCol + (isHorizontal ? i : 0);
              shipCells.push({ row: r, col: c });
          }

          if (shipCells.some(cell => cell.row === row && cell.col === col)) {
              const isSunk = shipCells.every(
                  cell => board[cell.row][cell.col].hit
              );
              if (isSunk) return ship;
          }
      }
      return null;
  }

  function markSurroundingSquares(ship) {
      const { row: shipRow, col: shipCol, length, isHorizontal } = ship;

      for (let i = -1; i <= length; i++) {
          for (let j = -1; j <= 1; j++) {
              const r = shipRow + (isHorizontal ? j : i);
              const c = shipCol + (isHorizontal ? i : j);

              if (
                  r >= 0 &&
                  r < 10 &&
                  c >= 0 &&
                  c < 10 &&
                  !board[r][c].hasShip &&
                  !board[r][c].hit
              ) {
                  board[r][c].hit = true;
                  const cell = document.querySelector(
                      `.cell[data-row="${r}"][data-col="${c}"]`
                  );
                  cell.classList.add("miss");
              }
          }
      }
  }

  function endGame(won) {
      gameOver.style.display = "block";
      if (won) {
          gameMessage.textContent = `You Win! Your Score: ${score}`;
          if (score > highScore) {
              highScore = score;
              localStorage.setItem("highScore", highScore);
          }
      } else {
          gameMessage.textContent = "Game Over!";
      }
      updateScoreboard();
  }

  function startGame() {
      startButton.style.display = "none";
      restartButton.style.display = "inline-block";
      gameBoard.style.display = "grid";
      gameOver.style.display = "none";
      hits = 0;
      moves = 0;
      score = 0;
      createBoard();
      placeShips();
      updateScoreboard();
  }

  function updateScoreboard() {
      scoreDisplay.textContent = `Score: ${score}`;
      highScoreDisplay.textContent = `High Score: ${highScore}`;
  }

  startButton.addEventListener("click", startGame);
  restartButton.addEventListener("click", startGame);
  playAgainButton.addEventListener("click", startGame);
});
