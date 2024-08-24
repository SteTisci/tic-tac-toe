// get the name and the sign of a player and returns them wrapped in an object
const player = (name, sign) => {
  return { name, sign };
};

// the Gameboard factory represents the state of the board
// the board is an object that simulate a 2D 3x3 array, every cell is initialized with null
// Manages the reset and addition of elements
const gameBoard = (function () {
  const board = {
    0: [null, null, null],
    1: [null, null, null],
    2: [null, null, null],
  };

  const clearBoard = () => {
    for (let i = 0; i < 3; i++) {
      board[i].splice(0, 3, null, null, null);
    }
  };

  // The index contains a 2 digit string representing:
  // 1 digit = row , 2 digit = column
  // example: index = "10" --> board[1][0]
  const updateBoard = (sign, index) => {
    const [row, col] = index.split("");
    if (board[row][col] === null) {
      board[row].splice(col, 1, sign);
    }
  };

  const boardStatus = () => board;

  return { clearBoard, updateBoard, boardStatus };
})();

// The gameController factory represent the state of the game
// Look for possible tris and determine the end and winner of a game
// Inherits the board state from gameBoard
const gameController = (function () {
  const { boardStatus } = gameBoard;
  const players = [player("player 1", "X"), player("player 2", "O")];
  let winnerSign = "";
  let winner = "";
  let gameEnded = false;

  // Check every cell of a determined tris of the board
  // Returns true if all 3 are equal and !null or false if not
  function checkCombination(cells) {
    return cells.every((cell) => cell !== null && cell === cells[0]);
  }

  // Finds if a tris has been made in all the possible board combinations
  function findWinningCombinations() {
    const currentBoard = boardStatus();

    // Rows and Columns
    for (let i = 0; i < 3; i++) {
      let row = currentBoard[i];
      let column = [currentBoard[0][i], currentBoard[1][i], currentBoard[2][i]];

      if (checkCombination(row)) {
        winnerSign = row[0];
        break; // Stops the cicle if a winnerSign combination is found
      }
      if (checkCombination(column)) {
        winnerSign = column[0];
        break;
      }
    }
    // Main and Secondary diagonal
    let diagonal1 = [currentBoard[0][0], currentBoard[1][1], currentBoard[2][2]];
    let diagonal2 = [currentBoard[0][2], currentBoard[1][1], currentBoard[2][0]];

    if (checkCombination(diagonal1)) {
      winnerSign = diagonal1[0];
    }
    if (checkCombination(diagonal2)) {
      winnerSign = diagonal2[0];
    }
  }

  // FIXME: da sistemare la logica di fine gioco e decisione vincitore
  const gameOver = () => {
    gameEnded = winner ? true : false;
  };
  const isGameOver = () => gameEnded;

  const setGameWinner = () => {
    if (winnerSign) {
      winner = winnerSign === "X" ? players[0] : players[1];
    }
  };
  const getGameWinner = () => winner;

  return { findWinningCombinations, gameOver, isGameOver, setGameWinner, getGameWinner };
})();
