// get the name and the sign of a player and returns them wrapped in an object
const player = (name, sign) => {
  return { name, sign };
};

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
  const dialog = doc.querySelector(".win-popup");
  const winnerParagraph = doc.querySelector(".winner-message");
  const resetBtn = doc.querySelector(".reset");
  // The indexes of the cells in the page match the indexes of the board
  const index = ["00", "01", "02", "10", "11", "12", "20", "21", "22"];

  const createBoard = () => {
    for (let i = 0; i < 9; i++) {
      const cell = doc.createElement("div");
      cell.setAttribute("class", `cell ${index[i]}`);
      boardContainer.appendChild(cell);
    }
  };

  const update = (click, player) => {
    const cell = click.target.closest(".cell");

    if (cell && !cell.textContent) {
      cell.textContent = player.sign;
    }
  };

  // Check if any of the index contained in the combo array match the index class of the cells
  // When one is found set the background color of the cell
  const markWinCombo = (combo) => {
    const cells = boardContainer.querySelectorAll(".cell");

    cells.forEach((cell) => {
      const correspondingCell = combo.some((cls) => cell.classList.contains(cls));
      if (correspondingCell) {
        cell.style.backgroundColor = "#34C3BE";
      }
    });
  };

  const winMessage = (player) => {
    dialog.showModal();
    winnerParagraph.textContent = `${player.name} Wins!`;
  };

  const drawMessage = () => {
    dialog.showModal();
    winnerParagraph.textContent = "It's a tie!";
  };

  const reset = () => {
    dialog.close();
    boardContainer.innerHTML = "";
    createBoard();
  };

  return { createBoard, update, markWinCombo, winMessage, drawMessage, reset, boardContainer, resetBtn };
})(document);

// The game facory is where the game runs
// Depends on the others facories to manage all the components of the game
const game = (function () {
  const board = gameBoard;
  const controller = gameController;
  const DOM = controllerDOM;
  const players = [player("Player 1", "X"), player("Player 2", "O")];
  let currentPlayer = players[0];

  const changePlayer = () => {
    currentPlayer = currentPlayer === players[0] ? players[1] : players[0];
  };

  const playRound = (click) => {
    const cellIndex = click.target.closest(".cell").classList[1];

    DOM.update(click, currentPlayer);
    board.update(currentPlayer.sign, cellIndex);

    const currentBoard = board.status();
    controller.checkWinner(currentBoard);

    if (controller.isGameOver()) {
      DOM.markWinCombo(controller.getWinCombo());
      DOM.winMessage(currentPlayer);
    } else if (controller.isDraw()) {
      DOM.drawMessage();
    } else {
      changePlayer();
    }
  };

  const playGame = () => {
    DOM.createBoard();

    DOM.boardContainer.addEventListener("click", playRound);

    DOM.resetBtn.addEventListener("click", () => {
      DOM.reset();
      controller.reset();
      board.clear();
      currentPlayer = players[0];
    });
  };

  return { playGame };
})();

game.playGame();

// TODO: aggiungere logica per selezione giocatore e bot
// TODO: aggiungere funzione per analizzare mosse giocate con tasto avanti e indietro quando il gioco e finito
// TODO: scelta bot in base alle caselle libere algoritmo minmax
// TODO: aggiungere scelta giocatore UI
// TODO: stile css
