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

  const score = {
    player1: 0,
    draws: 0,
    player2: 0,
  };

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

        if (currentBoard[a] === "X") {
          score.player1++;
        } else {
          score.player2++;
        }

        return combo;
      }
    }

    // If no winner and all cells are filled, declare a draw
    if (currentBoard.every((cell) => cell !== null)) {
      draw = true;
      score.draws++;
    }

    return null;
  };

  // Resets the game state for a new game
  const resetGameState = () => {
    gameOver = false;
    draw = false;
  };

  const resetScore = () => {
    score.player1 = 0;
    score.draws = 0;
    score.player2 = 0;
  };

  const isGameOver = () => gameOver;
  const isDraw = () => draw;
  const getCurrentScore = () => score;

  return { checkWinner, isGameOver, isDraw, getCurrentScore, resetGameState, resetScore };
})();

// Manages the game's UI interactions and visual updates
const DOMController = (function (doc) {
  const gameSettings = doc.querySelector(".game-initializer");
  const startBtn = doc.querySelector(".start-game");
  const mainGame = doc.querySelector(".game");
  const boardContainer = doc.querySelector(".board-container");
  const playerInfo = doc.querySelector(".turn-text");
  const resetBtn = doc.querySelector(".new-game");
  const optionBtn = doc.querySelector(".options");
  const resetScoreBtn = doc.querySelector(".reset-score");

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
  const manageGameSettings = () => {
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
    const clickedBtn = click.target.closest("button");

    if (clickedBtn) {
      clickedBtn.classList.add("active");
    }
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
        cell.style.backgroundColor = "#EF8354"; // Highlight winning cells
      }
    });
  };

  const updateScoreboard = (score) => {
    doc.querySelector(".player1-score").textContent = `${score.player1}`;
    doc.querySelector(".players-draws").textContent = `${score.draws}`;
    doc.querySelector(".player2-score").textContent = `${score.player2}`;
  };

  // Displays the win message for the current player
  const winMessage = (player) => {
    playerInfo.textContent = `${player.name} Wins!`;
    playerInfo.style.color = "#EF8354";
  };

  // Displays a draw message if the game ends in a draw
  const drawMessage = () => {
    playerInfo.textContent = "It's a Draw!";
  };

  // Resets the board's visual state
  const reset = () => {
    boardContainer.innerHTML = "";
    playerInfo.textContent = "";
    playerInfo.style.color = "#BFC0C0";
  };

  return {
    createBoard,
    manageGameSettings,
    update,
    chooseBotMove,
    highlightWinCombo,
    updateScoreboard,
    winMessage,
    drawMessage,
    reset,
    mainGame,
    boardContainer,
    gameSettings,
    playerInfo,
    resetBtn,
    startBtn,
    optionBtn,
    resetScoreBtn,
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
  const handleStartGame = () => {
    const [sign, type] = setGameOptions();

    if (!sign || !type) return;

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
    DOM.gameSettings.setAttribute("hidden", "true");
    DOM.mainGame.removeAttribute("hidden");
    newGame();
  };

  DOM.startBtn.addEventListener("click", handleStartGame);

  // Manage the game option from the dialog selection
  const initializePlayers = () => {
    DOM.startBtn.addEventListener("click", handleStartGame);
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
    const currentPlayer = players.getCurrentPlayer();
    const selectedCell = event.target.closest(".cell");

    DOM.playerInfo.textContent = `${currentPlayer.sign}'s turn`;
    if (selectedCell && !selectedCell.textContent) {
      playRound(selectedCell);
    }
  };

  // Handles the bot's move
  const handleBotMove = () => {
    const currentPlayer = players.getCurrentPlayer();

    DOM.playerInfo.textContent = `${currentPlayer.sign}'s turn`;
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
      DOM.updateScoreboard(controller.getCurrentScore());
    } else if (controller.isDraw()) {
      DOM.drawMessage();
      DOM.updateScoreboard(controller.getCurrentScore());
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
    toggleBoardClick();
    handleBotMove();

    setTimeout(() => {
      DOM.resetBtn.disabled = false;
    }, 600);
  };

  // Initialize the game when the DOM is fully loaded
  document.addEventListener("DOMContentLoaded", () => {
    DOM.createBoard();
    DOM.manageGameSettings();
    toggleBoardClick();
    DOM.updateScoreboard(controller.getCurrentScore());
  });

  initializePlayers();

  // Open the dialog for game related options
  DOM.optionBtn.addEventListener("click", () => {
    DOM.gameSettings.removeAttribute("hidden");
    DOM.mainGame.setAttribute("hidden", "true");

    // Prevent adding multiple event listener when the option button is clicked
    DOM.startBtn.removeEventListener("click", handleStartGame);
    initializePlayers();
  });

  DOM.resetBtn.addEventListener("click", newGame);
  DOM.resetScoreBtn.addEventListener("click", () => {
    controller.resetScore();
    DOM.updateScoreboard(controller.getCurrentScore());
  });
})();
