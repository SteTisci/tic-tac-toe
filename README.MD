# Game: Tic-Tac-Toe

## Overview

This code implements the logic for a Tic-Tac-Toe game, handling both the game board and user interactions. It is structured into distinct modules that separate concerns, such as the game logic, board manipulation, player management, and DOM updates. The game supports multiple players, including a bot (computer player) and can detect win conditions or draws, resetting the game when necessary.

### Modules

1. **Game Board (`gameBoard`)**:

   - Manages the underlying board state using an array of 9 cells.
   - Provides methods to clear the board, update a specific cell with a player's move, and retrieve the current board state.

2. **Game Controller (`gameController`)**:

   - Handles the core game logic like checking for a winner or determining if the game ends in a draw.
   - Tracks the game state (game over or draw) and maintains a scoreboard for players and draws.
   - Offers methods to reset the game state or the score.

3. **DOM Controller (`DOMController`)**:

   - Manages all user interface elements such as the game board, score, and player information.
   - Updates the game board UI based on player moves and game results (win or draw).
   - Contains methods to highlight the winning combination, update the score, and handle bot moves.
   - Also manages game settings, like selecting player signs (X/O) or the type of opponent (bot vs. human).

4. **Player Factory (`player`)**:

   - Factory function that creates player objects. Each player has a `name`, `sign` (X or O), and a `type` (human or bot).

5. **Player Controller (`playerController`)**:

   - Controls the current player's turn, switches players after each move, and resets the current player when needed.

6. **Main Game Module (`game`)**:
   - Coordinates the entire game flow by connecting the board, game logic, and DOM interactions.
   - Initializes the players, starts a new game, and manages player or bot moves.
   - Listens for user input to start a game, reset the game, or choose game settings.

### Features

- **Win and Draw Detection**:
  The game automatically checks for winning combinations or a full board draw after every move.
- **Bot Integration**:
  A simple bot randomly selects an empty cell to place its move if the player is competing against it.

- **Score Management**:
  Tracks the number of wins for each player and the number of draws, with the ability to reset scores.

- **UI Controls**:

  - Settings allow players to select their signs and game types (bot or two-player).
  - A reset button clears the board, and a score reset button resets the score.

- **Visual Feedback**:
  When a player wins, the winning cells are highlighted, and the UI updates to display win or draw messages.

### How It Works

1. **Game Initialization**:

   - Upon page load, the game board is created, and users can select game options.
   - Players are initialized based on the selected sign (X/O) and game type (vs. bot or another player).

2. **Player Moves**:

   - The game listens for player clicks on the board. If it's a valid move (i.e., the cell is empty), it updates the board both logically and visually.
   - After each move, it checks for a win or draw, switches players, and handles the bot's move if needed.

3. **Game Flow**:
   - When a win or draw occurs, the game displays the result, highlights the winning combination (if any), and updates the scoreboard.
   - The game can be reset to start a new round while keeping track of the score.

### Live Demo

<p><a href="https://stetisci.github.io/tic-tac-toe/" />Github Pages</p>
