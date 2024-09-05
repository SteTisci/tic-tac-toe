// Factory function representing the game's underlying board logic, independent of the DOM
const gameBoard = (function () {
  let board = Array(9).fill(null);

  // Resets the board to its initial state (empty cells)
  const clear = () => {
    board = Array(9).fill(null);
  };

  // Updates the board with the player's sign (X or O) at the specified index
  const update = (sign, index) => {
    board[index] = sign;
  };

  // Returns a copy of the current board state to avoid direct mutation
  const status = () => board.slice();

  return { clear, update, status };
})();

// Manages the game's core logic, including win and draw detection
const gameController = (function () {
  let gameOver = false;
  let draw = false;

  // Checks for a winning combination or determines if the game ends in a draw
  const checkWinner = (currentBoard) => {
    const winningCombination = [
      ["0", "1", "2"], // Top row
      ["3", "4", "5"], // Middle row
      ["6", "7", "8"], // Bottom row
      ["0", "3", "6"], // Left column
      ["1", "4", "7"], // Middle column
      ["2", "5", "8"], // Right column
      ["0", "4", "8"], // Diagonal top-left to bottom-right
      ["2", "4", "6"], // Diagonal top-right to bottom-left
    ];

    // Check each winning combination to see if any player has won
    for (let combo of winningCombination) {
      const [a, b, c] = combo;
      if (currentBoard[a] !== null && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        gameOver = true;
        return combo;
      }
    }

    // If no winner and all cells are filled, declare a draw
    if (currentBoard.every((cell) => cell !== null)) {
      draw = true;
    }

    return null;
  };

  // Resets the game state for a new game
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
  const gameSettings = doc.querySelector(".settings-dialog");
  const startBtn = doc.querySelector(".start-game");
  const boardContainer = doc.querySelector(".board-container");
  const playerInfo = doc.querySelector(".player-text");
  const resetBtn = doc.querySelector(".reset");

  // Creates the visual representation of the game board
  const createBoard = () => {
    boardContainer.innerHTML = ""; // Clear previous board if any
    for (let i = 0; i < 9; i++) {
      const cell = doc.createElement("div");
      cell.setAttribute("class", "cell");
      cell.setAttribute("data-index", i);
      boardContainer.appendChild(cell);
    }
  };

  // Manages dialog options (sign and game type selection)
  const manageDialog = () => {
    const signChoice = doc.querySelector(".p1-sign");
    const signBtns = signChoice.querySelectorAll(".p1-sign button");
    signChoice.addEventListener("click", (event) => toggleActiveButton(event, signBtns));

    const gameType = doc.querySelector(".game-type");
    const gameTypeBtns = gameType.querySelectorAll(".game-type button");
    gameType.addEventListener("click", (event) => toggleActiveButton(event, gameTypeBtns));
  };

  // Toggles the active button for sign or game type selection
  const toggleActiveButton = (click, buttons) => {
    buttons.forEach((button) => button.classList.remove("active"));
    click.target.classList.add("active");
  };

  // Updates a specific cell on the board with the current player's sign
  const update = (cell, player) => {
    cell.textContent = player.sign;
  };

  // Randomly selects an empty cell for the bot's move
  const chooseBotMove = () => {
    const emptyCells = Array.from(doc.querySelectorAll(".cell")).filter((cell) => !cell.textContent);
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  };

  // Highlights the winning combination of cells when a player wins
  const highlightWinCombo = (combo) => {
    const cells = boardContainer.querySelectorAll(".cell");
    cells.forEach((cell) => {
      if (combo.includes(cell.dataset.index)) {
        cell.style.backgroundColor = "#34C3BE"; // Highlight winning cells
      }
    });
  };

  // Displays the win message for the current player
  const winMessage = (player) => {
    playerInfo.textContent = `${player.name} Wins!`;
    resetBtn.style.display = "inline"; // Show reset button
  };

  // Displays a draw message if the game ends in a tie
  const drawMessage = () => {
    playerInfo.textContent = "It's a tie!";
    resetBtn.style.display = "inline"; // Show reset button
  };

  // Resets the board's visual state
  const reset = () => {
    boardContainer.innerHTML = ""; // Clear the board visually
    playerInfo.textContent = ""; // Clear player info message
  };

  return {
    createBoard,
    manageDialog,
    update,
    chooseBotMove,
    highlightWinCombo,
    winMessage,
    drawMessage,
    reset,
    boardContainer,
    gameSettings,
    resetBtn,
    startBtn,
  };
})(document);

// Factory function to create a player object
const player = (name, sign, type) => {
  return { name, sign, type };
};

// Manages player turns and current player state
const playerController = (player1, player2) => {
  let currentPlayer = player1;

  // Switches to the next player after each turn
  const changePlayer = () => {
    currentPlayer = currentPlayer === player1 ? player2 : player1;
  };

  // Resets the game to start with the first player
  const resetCurrentPlayer = () => {
    currentPlayer = player1;
  };

  const getCurrentPlayer = () => currentPlayer;

  return { changePlayer, getCurrentPlayer, resetCurrentPlayer };
};

// Main game factory to manage the overall game flow
const game = (function () {
  const board = gameBoard;
  const controller = gameController;
  const DOM = DOMController;
  let player1 = null;
  let player2 = null;
  let players;

  // Initializes players based on user input from the settings dialog
  const initializePlayers = () => {
    DOM.startBtn.addEventListener("click", () => {
      const [sign, type] = setGameOptions();

      // Create players based on sign and game type selection
      if (sign.classList.contains("cross") && type.classList.contains("bot")) {
        player1 = player("Player 1", "X", "human");
        player2 = player("Player 2", "O", "bot");
      } else if (sign.classList.contains("circle") && type.classList.contains("bot")) {
        player1 = player("Player 1", "X", "bot");
        player2 = player("Player 2", "O", "human");
      } else if (type.classList.contains("players")) {
        player1 = player("Player 1", "X", "human");
        player2 = player("Player 2", "O", "human");
      }

      players = playerController(player1, player2);
      DOM.gameSettings.close();
      newGame();
    });
  };

  // Retrieves user-selected options from the dialog
  const setGameOptions = () => {
    const choices = [];
    const buttons = document.querySelectorAll(".p1-sign button, .game-type button");

    Array.from(buttons).forEach((element) => {
      if (element.classList.contains("active")) {
        choices.push(element);
      }
    });

    return choices;
  };

  // Handles a player's move when clicking on a cell
  const handlePlayerMove = (event) => {
    const selectedCell = event.target.closest(".cell");
    if (selectedCell && !selectedCell.textContent) {
      playRound(selectedCell);
    }
  };

  // Handles the bot's move
  const handleBotMove = () => {
    const currentPlayer = players.getCurrentPlayer();
    if (currentPlayer.type === "bot") {
      setTimeout(() => {
        const selectedCell = DOM.chooseBotMove();
        playRound(selectedCell);
      }, 500);
    }
  };

  // Toggles the ability to click on the board depending on the game state
  const toggleBoardClick = () => {
    if (controller.isGameOver() || controller.isDraw()) {
      DOM.boardContainer.removeEventListener("click", handlePlayerMove);
    } else {
      DOM.boardContainer.addEventListener("click", handlePlayerMove);
    }
  };

  // Plays a round by updating the board, checking for a winner or draw, and switching players
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

  // Starts a new game, resetting everything
  const newGame = () => {
    DOM.resetBtn.disabled = true;
    DOM.reset();
    board.clear();
    players.resetCurrentPlayer();
    controller.resetGameState();
    DOM.createBoard();
    handleBotMove();

    setTimeout(() => {
      DOM.resetBtn.disabled = false;
    }, 600);
  };

  // Initialize the game when the DOM is fully loaded
  document.addEventListener("DOMContentLoaded", () => {
    DOM.createBoard();
    DOM.gameSettings.showModal();
    DOM.manageDialog();
    toggleBoardClick();
    handleBotMove();
  });

  initializePlayers();

  DOM.boardContainer.addEventListener("click", handlePlayerMove);
  DOM.resetBtn.addEventListener("click", newGame);

  return { newGame };
})();
