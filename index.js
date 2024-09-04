// Factory function representing the game's underlying board logic, independent of the DOM
const gameBoard = (function () {
  let board = Array(9).fill(null);

  // Resets the board to its initial state.
  const clear = () => {
    board = Array(9).fill(null);
  };

  // Updates the board with the player's sign at the specified index
  const update = (sign, index) => {
    board[index] = sign;
  };

  // Returns a copy of the current board state
  const status = () => board.slice();

  return { clear, update, status };
})();

// Manages the game's core logic, including win and draw detection
const gameController = (function () {
  let gameOver = false;
  let draw = false;

  // Checks if there's a winning combination on the current board or if the board is full, indicating a draw
  const checkWinner = (currentBoard) => {
    const winningCombination = [
      ["0", "1", "2"],
      ["3", "4", "5"],
      ["6", "7", "8"],
      ["0", "3", "6"],
      ["1", "4", "7"],
      ["2", "5", "8"],
      ["0", "4", "8"],
      ["2", "4", "6"],
    ];

    for (let combo of winningCombination) {
      const [a, b, c] = combo;
      if (currentBoard[a] !== null && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        gameOver = true;
        return combo;
      }
    }
    if (currentBoard.every((cell) => cell !== null)) {
      draw = true;
    }

    return null;
  };

  // Resets the game state flags
  const resetGameState = () => {
    gameOver = false;
    draw = false;
  };

  const isGameOver = () => gameOver;
  const isDraw = () => draw;

  return { checkWinner, isGameOver, isDraw, resetGameState };
})();

// Manages the game's UI interactions and visual updates
const DOMController = (function (doc) {
  const boardContainer = doc.querySelector(".board-container");
  const playerInfo = doc.querySelector(".player-text");
  const resetBtn = doc.querySelector(".reset");

  // Creates the visual representation of the game board
  const createBoard = () => {
    for (let i = 0; i < 9; i++) {
      const cell = doc.createElement("div");
      cell.setAttribute("class", "cell");
      cell.setAttribute("data-index", i);
      boardContainer.appendChild(cell);
    }
  };

  // Updates a cell's content based on the player's move
  const update = (cell, player) => {
    cell.textContent = player.sign;
  };

  // Chooses a random empty cell for the bot's move
  const chooseBotMove = () => {
    const emptyCells = Array.from(doc.querySelectorAll(".cell")).filter((cell) => !cell.textContent);
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  };

  // Highlights the winning combination on the board
  const highlightWinCombo = (combo) => {
    const cells = boardContainer.querySelectorAll(".cell");
    cells.forEach((cell) => {
      if (combo.includes(cell.dataset.index)) {
        cell.style.backgroundColor = "#34C3BE";
      }
    });
  };

  // Displays the win message for the winning player
  const winMessage = (player) => {
    playerInfo.textContent = `${player.name} Wins!`;
    resetBtn.style.display = "inline";
  };

  // Displays a draw message when the game ends in a tie
  const drawMessage = () => {
    playerInfo.textContent = "It's a tie!";
    resetBtn.style.display = "inline";
  };

  // Resets the board's visual state
  const reset = () => {
    boardContainer.innerHTML = "";
    playerInfo.textContent = "";
  };

  return {
    createBoard,
    update,
    chooseBotMove,
    highlightWinCombo,
    winMessage,
    drawMessage,
    reset,
    boardContainer,
    resetBtn,
  };
})(document);

// Factory function to create players with name, sign, and type
const player = (name, sign, type) => {
  return { name, sign, type };
};

// Manages player turns and state
const playerController = (player1, player2) => {
  let currentPlayer = player1;

  // Switches to the other player
  const changePlayer = () => {
    currentPlayer = currentPlayer === player1 ? player2 : player1;
  };

  // Resets to the first player
  const resetCurrentPlayer = () => {
    currentPlayer = player1;
  };

  const getCurrentPlayer = () => currentPlayer;

  return { player1, player2, changePlayer, getCurrentPlayer, resetCurrentPlayer };
};

// Main game factory to manage the overall game flow
const game = (function () {
  const board = gameBoard;
  const controller = gameController;
  const DOM = DOMController;
  const players = playerController(player("Player 1", "X", "bot"), player("Player 2", "O", "player"));

  // Handles a player's move, updating both the game state and UI
  const handlePlayerMove = (event) => {
    const selectedCell = event.target.closest(".cell");
    if (selectedCell && !selectedCell.textContent) {
      playRound(selectedCell);
    }
  };

  // Handles the bot's move with a slight delay
  const handleBotMove = () => {
    const currentPlayer = players.getCurrentPlayer();
    if (currentPlayer.type === "bot") {
      setTimeout(() => {
        const selectedCell = DOM.chooseBotMove();
        playRound(selectedCell);
      }, 500);
    }
  };

  // Toggles clickability of the board based on game state
  const toggleBoardClick = () => {
    if (controller.isGameOver() || controller.isDraw()) {
      DOM.boardContainer.removeEventListener("click", handlePlayerMove);
    } else {
      DOM.boardContainer.addEventListener("click", handlePlayerMove);
    }
  };

  // Executes a round of the game, handling player actions and checking game status
  const playRound = (selectedCell) => {
    const currentPlayer = players.getCurrentPlayer();
    const cellIndex = selectedCell.dataset.index;

    board.update(currentPlayer.sign, cellIndex);
    DOM.update(selectedCell, currentPlayer);

    const combo = controller.checkWinner(board.status());

    if (controller.isGameOver()) {
      DOM.highlightWinCombo(combo);
      DOM.winMessage(currentPlayer);
    } else if (controller.isDraw()) {
      DOM.drawMessage();
    } else {
      players.changePlayer();
      handleBotMove();
    }
    toggleBoardClick();
  };

  // Starts a new game, resetting all relevant components
  const newGame = () => {
    DOM.resetBtn.disabled = true;
    DOM.reset();
    board.clear();
    players.resetCurrentPlayer();
    controller.resetGameState();
    DOM.createBoard();
    handleBotMove();

    // Leave the time for the bot to make a move
    setTimeout(() => {
      DOM.resetBtn.disabled = false;
    }, 600);
  };

  // Initializes the game setup on DOM load
  document.addEventListener("DOMContentLoaded", () => {
    DOM.createBoard();
    toggleBoardClick();
    handleBotMove();
  });

  DOM.boardContainer.addEventListener("click", handlePlayerMove);
  DOM.resetBtn.addEventListener("click", newGame);

  return { newGame };
})();
