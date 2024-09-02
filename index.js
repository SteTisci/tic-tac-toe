// The gameBoard factory represents a hidden board that is updated in parallel with the board of the DOM
// All controls are performed on this board, so the game is not dependent on DOM manipulation
const gameBoard = (function () {
  // The board is an object that simulate a 2D 3x3 array
  const board = {
    0: [null, null, null],
    1: [null, null, null],
    2: [null, null, null],
  };

  const clear = () => {
    for (let i = 0; i < 3; i++) {
      board[i].splice(0, 3, null, null, null);
    }
  };

  // The index contains a 2 digit string representing:
  // 1 digit = row , 2 digit = column
  // example: index = "10" --> board[1][0]
  const update = (sign, index) => {
    const [row, col] = index.split("");
    if (board[row][col] === null) {
      board[row].splice(col, 1, sign);
    }
  };

  const status = () => board;

  return { clear, update, status };
})();

// The gameController factory is where all game-related controls are performed
const gameController = (function () {
  let winCombo = "";
  let gameEnd = false;
  let draw = false;

  // The parameters cells represents a combination on the board
  // Returns true if the combination has equal simbols and is !null
  const checkCombination = (cells) => {
    return cells.every((cell) => cell !== null && cell === cells[0]);
  };

  // Checks if the board has no more empty spaces
  const checkDraw = (board) => {
    return Object.values(board)
      .flat()
      .every((cell) => cell !== null);
  };

  // Finds if a tris has been made in all the possible board combinations
  // I need the win combo to mark the corresponding cells in the dom
  const checkWinner = (currentBoard) => {
    // Main and Secondary diagonal
    let diagonal1 = [currentBoard[0][0], currentBoard[1][1], currentBoard[2][2]];
    let diagonal2 = [currentBoard[0][2], currentBoard[1][1], currentBoard[2][0]];

    if (checkCombination(diagonal1)) {
      winCombo = ["00", "11", "22"];
    }
    if (checkCombination(diagonal2)) {
      winCombo = ["02", "11", "20"];
    }

    // Rows and Columns
    for (let i = 0; i < 3; i++) {
      let row = currentBoard[i];
      let col = [currentBoard[0][i], currentBoard[1][i], currentBoard[2][i]];

      if (checkCombination(row)) {
        winCombo = [`${i}0`, `${i}1`, `${i}2`];
      }
      if (checkCombination(col)) {
        winCombo = [`0${i}`, `1${i}`, `2${i}`];
      }
    }

    if (winCombo) {
      gameEnd = true;
    }
    if (checkDraw(currentBoard)) {
      draw = true;
    }
  };

  const reset = () => {
    winCombo = "";
    gameEnd = false;
    draw = false;
  };

  const isGameOver = () => gameEnd;
  const isDraw = () => draw;
  const getWinCombo = () => winCombo;

  return { getWinCombo, checkWinner, isGameOver, isDraw, reset };
})();

// The controllerDOM factory manages the display of the game on the web page
const controllerDOM = (function (doc) {
  const boardContainer = doc.querySelector(".board-container");
  const playerInfo = doc.querySelector(".player-text");
  const resetBtn = doc.querySelector(".reset");
  // The indexes of the cells in the page match the indexes of the board
  const index = ["00", "01", "02", "10", "11", "12", "20", "21", "22"];

  const createBoard = () => {
    for (let i = 0; i < 9; i++) {
      const cell = doc.createElement("div");
      cell.setAttribute("class", "cell");
      cell.setAttribute("data-index", `${index[i]}`);
      boardContainer.appendChild(cell);
    }
  };

  const update = (cell, player) => {
    cell.textContent = player.sign;
  };

  // Choose a random empty cell in the board
  const chooseBotMove = () => {
    const emptyCells = Array.from(doc.querySelectorAll(".cell")).filter((cell) => !cell.textContent);
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];

    return randomCell;
  };

  // Check if any of the index contained in the combo array match the index dataset of the cells
  // When one is found set the background color of the cell
  const markWinCombo = (combo) => {
    const cells = boardContainer.querySelectorAll(".cell");

    cells.forEach((cell) => {
      const correspondingCell = combo.includes(cell.dataset.index);

      if (correspondingCell) {
        cell.style.backgroundColor = "#34C3BE";
      }
    });
  };

  const winMessage = (player) => {
    playerInfo.textContent = `${player.name} Wins!`;
    resetBtn.style.display = "inline";
  };

  const drawMessage = () => {
    playerInfo.textContent = "It's a tie!";
    resetBtn.style.display = "inline";
  };

  const reset = () => {
    boardContainer.innerHTML = "";
    playerInfo.textContent = "";
    createBoard();
  };

  return {
    createBoard,
    update,
    chooseBotMove,
    markWinCombo,
    winMessage,
    drawMessage,
    reset,
    boardContainer,
    resetBtn,
  };
})(document);

const player = (name, sign, type) => {
  return { name, sign, type };
};

const playerController = (player1, player2) => {
  let currentPlayer = player1;

  const changePlayer = () => {
    currentPlayer = currentPlayer === player1 ? player2 : player1;
  };

  const setPlayerType = (player, choice) => {
    player.type = choice === "human" ? "human" : "bot";
  };

  const resetCurrentPlayer = () => {
    currentPlayer = player1;
  };

  const getCurrentPlayer = () => currentPlayer;

  return { changePlayer, getCurrentPlayer, setPlayerType, resetCurrentPlayer };
};

// The game facory is where the game runs
// Depends on the others facories to manage all the components of the game
const game = (function () {
  const board = gameBoard;
  const controller = gameController;
  const DOM = controllerDOM;
  const players = playerController(player("Player 1", "X", "bot"), player("Player 2", "O", "human"));

  // FIXME: playRound e progettata basandosi sul click dell'utente, ma non per forza avviene un click
  //        Cambiarla per fare in modo che si adatti alla logica sia del click che del bot

  const playRound = (event) => {
    let cell;
    const currentPlayer = players.getCurrentPlayer();

    // Check if the current player is a bot or a human and set the cell accordingly
    if (currentPlayer.type === "bot") {
      cell = DOM.chooseBotMove();
    } else {
      cell = event.target.closest(".cell");
    }

    if (cell && !cell.textContent) {
      const cellIndex = cell.dataset.index;

      DOM.update(cell, currentPlayer);
      board.update(currentPlayer.sign, cellIndex);

      const currentBoard = board.status();
      controller.checkWinner(currentBoard);

      if (controller.isGameOver()) {
        DOM.markWinCombo(controller.getWinCombo());
        DOM.winMessage(currentPlayer);
      } else if (controller.isDraw()) {
        DOM.drawMessage();
      } else {
        players.changePlayer();

        // If the next player is a bot, make the bot play
        if (players.getCurrentPlayer().type === "bot") {
          playBotRound();
        }
      }
    }
  };

  // Simulates a slight delay in the bot's move
  const playBotRound = () => {
    setTimeout(() => playRound(), 500);
  };

  const playGame = () => {
    DOM.createBoard();

    // Always add the event listener for click on the board container
    DOM.boardContainer.addEventListener("click", (event) => {
      if (players.getCurrentPlayer().type === "human") {
        playRound(event);
      }
    });

    // Handle the bot's turn at the start of the game if player 1 is a bot
    if (players.getCurrentPlayer().type === "bot") {
      playBotRound();
    }

    DOM.resetBtn.addEventListener("click", () => {
      DOM.reset();
      controller.reset();
      board.clear();
      players.resetCurrentPlayer();

      // If after reset it's the bot's turn, let the bot play first
      if (players.getCurrentPlayer().type === "bot") {
        playBotRound();
      }
    });
  };

  return { playGame };
})();

// FIXME: playgame viene chiamato solo quando la pagina viene caricata, causando problemi di gestione dei round sopratutto quando e il bot a iniziare
//        una possibile soluzione e chiamare playgame ogni volta che si inizia una nuova partita
game.playGame();

// TODO: aggiungere logica per selezione giocatore e bot
// TODO: mostrare turno giocatore
// TODO: aggiungere funzione per analizzare mosse giocate con tasto avanti e indietro quando il gioco e finito
// TODO: scelta bot in base alle caselle libere algoritmo minmax
// TODO: aggiungere scelta giocatore UI
// TODO: stile css
