const gameBoard = (function () {
  const board = {
    0: ["X", "O", "O"],
    1: ["O", "X", "O"],
    2: [null, "O", "X"],
  };

  const clearBoard = () => {
    for (let i = 0; i < 3; i++) {
      board[i].splice(0, 3, null, null, null);
    }
  };

  const updateBoard = (sign, index) => {
    const [row, col] = index.split("");
    if (board[row][col] === null) {
      board[row].splice(col, 1, sign);
    }
  };

  const boardStatus = () => board;

  return { clearBoard, updateBoard, boardStatus };
})();

const gameController = (function () {
  const { boardStatus } = gameBoard;
  let winner;
  let gameEnded = false;

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
        winner = row[0];
      }
      if (checkCombination(column)) {
        winner = column[0];
      }
    }
    // Main and Secondary diagonal
    let diagonal1 = [currentBoard[0][0], currentBoard[1][1], currentBoard[2][2]];
    let diagonal2 = [currentBoard[0][2], currentBoard[1][1], currentBoard[2][0]];

    if (checkCombination(diagonal1)) {
      winner = diagonal1[0];
    }
    if (checkCombination(diagonal2)) {
      winner = diagonal2[0];
    }

    if (winner) {
      gameEnded = true;
    }
  }

  const gameStatus = () => gameEnded;
  const getWinner = () => winner;

  return { findWinningCombinations, gameStatus, getWinner };
})();
