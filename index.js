// get the name and the sign of a player and returns them wrapped in an object
const player = (name, sign) => {
  return { name, sign };
};

// the Gameboard factory represents the state of the board
// the board is an object that simulate a 2D 3x3 array, every cell is initialized with null
// Manages the reset, addition and the current stautus of the board
const gameBoard = (function () {
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

// The gameController factory represent the state of the game
// takes care of updating, resetting and finding any winning combinations in the board
const gameController = (function () {
  const board = gameBoard;
  const players = [player("player 1", "X"), player("player 2", "O")];
  let currentPlayer = players[0];
  let gameEnd = false;
  let draw = false;

  const playRound = (sign, index) => {
    board.update(sign, index);
    checkWinner();
    currentPlayer = currentPlayer === players[0] ? players[1] : players[0];
  };

  // Check every cell of a determined tris of the board
  // Returns true if all 3 are equal and !null or false if not
  const checkCombination = (cells) => {
    return cells.every((cell) => cell !== null && cell === cells[0]);
  };

  const checkDraw = (board) => {
    return Object.values(board)
      .flat()
      .every((cell) => cell !== null);
  };

  // Finds if a tris has been made in all the possible board combinations
  // Choose the winner based on the tris sign
  const checkWinner = () => {
    const currentBoard = board.status();

    // Main and Secondary diagonal
    let diagonal1 = [currentBoard[0][0], currentBoard[1][1], currentBoard[2][2]];
    let diagonal2 = [currentBoard[0][2], currentBoard[1][1], currentBoard[2][0]];
    if (checkCombination(diagonal1)) {
      gameEnd = true;
    }
    if (checkCombination(diagonal2)) {
      gameEnd = true;
    }

    // Rows and Columns
    for (let i = 0; i < 3; i++) {
      let row = currentBoard[i];
      let col = [currentBoard[0][i], currentBoard[1][i], currentBoard[2][i]];
      if (checkCombination(row)) {
        gameEnd = true;
      }
      if (checkCombination(col)) {
        gameEnd = true;
      }
    }
    if (checkDraw(currentBoard)) {
      draw = true;
    }
  };

  const isGameOver = () => gameEnd;
  const isDraw = () => draw;
  const getCurrentPlayer = () => currentPlayer;

  const newGame = () => {
    board.clear();
    gameEnd = false;
    draw = false;
    currentPlayer = players[0];
  };

  return { playRound, getCurrentPlayer, isGameOver, isDraw, newGame };
})();

// The gameUI factory only manages the display of the game on the web page
// The actual gameplay and controls are done in the gameBoard and gameController factory
const gameUI = (function (doc) {
  const controller = gameController;
  const boardContainer = doc.querySelector(".board-container");
  const dialog = doc.querySelector(".win-popup");
  const winnerParagraph = doc.querySelector(".winner-message");
  const Reset = doc.querySelector(".new-game");
  // The indexes of the cells in the page match the indexes of the board
  // So when i click a cell i know in what position it is
  const index = ["00", "01", "02", "10", "11", "12", "20", "21", "22"];

  const createBoard = () => {
    for (let i = 0; i < 9; i++) {
      const cell = doc.createElement("div");
      cell.setAttribute("class", `cell ${index[i]}`);
      boardContainer.appendChild(cell);
    }
  };

  // Based on the cells that are clicked the gameBoard is updated and gameController searches for any winning combinations
  // When a combination is found a modal is displayed with the name of the winner, when closed it will reset the game
  const playGame = () => {
    // initial board
    createBoard();

    boardContainer.addEventListener("click", (event) => {
      const cell = event.target.closest(".cell");
      const currentPlayer = controller.getCurrentPlayer();

      if (cell && !cell.textContent) {
        const cellIndex = cell.classList[1];
        cell.textContent = currentPlayer.sign;
        controller.playRound(currentPlayer.sign, cellIndex);
        console.table(gameBoard.status());
      }

      // Checks if the game has finished
      if (controller.isGameOver()) {
        dialog.showModal();
        winnerParagraph.textContent = `${currentPlayer.name} Wins!`;
      }

      // Checks if all the cells have been filled but no tris has been made
      if (controller.isDraw() && !controller.isGameOver()) {
        dialog.showModal();
        winnerParagraph.textContent = "It's a draw";
      }
    });

    // deletes the old board and create a new one, also reset the Board object
    Reset.addEventListener("click", () => {
      dialog.close();
      boardContainer.innerHTML = "";
      createBoard();
      controller.newGame();
    });
  };

  return { playGame };
})(document);

const interface = gameUI;
interface.playGame();
