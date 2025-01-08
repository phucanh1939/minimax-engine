import { Gomoku } from "./gomoku/Gomoku";
// import { GomokuEngine } from "./gomoku/GomokuEngine";
// import { GomokuEngine } from "./engine";

const boardSize = 10;
const lookAhead = 3;
const gomoku = new Gomoku(boardSize, lookAhead);

// UI
const boardElement = document.getElementById("board")!;
const gameStatusElement = document.getElementById("game-status")!;
const botStatusElement = document.getElementById("bot-status")!;
const resetButton = document.getElementById("reset-button")!;

// let engine = new GomokuEngine(boardSize, 4);

// Initialize the board UI
function createBoardUI() {
    boardElement.innerHTML = "";
    boardElement.style.gridTemplateColumns = `repeat(${boardSize}, 20px)`;

    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.y = row.toString();
            cell.dataset.x = col.toString();

            cell.addEventListener("click", () => handleCellClick(row, col));
            boardElement.appendChild(cell);
        }
    }
}

// Update the board UI to display X and O
function updateBoardUI() {
    const cells = document.querySelectorAll(".cell");
    cells.forEach((cell) => {
        const htmlCell = cell as HTMLElement;
        const col = parseInt(htmlCell.dataset.x!);
        const row = parseInt(htmlCell.dataset.y!);
        const value = gomoku.getValueAtRowCol(row, col);

        htmlCell.textContent = ""; // Clear the cell before updating

        if (value === 1) {
            htmlCell.textContent = "X"; // Player 1 (human) uses "X"
            htmlCell.classList.add("player1");
        } else if (value === -1) {
            htmlCell.textContent = "O"; // Player 2 (bot) uses "O"
            htmlCell.classList.add("player2");
        }

        htmlCell.classList.remove("player1", "player2");
    });
}

// Handle cell clicks (Player's turn)
function handleCellClick(row: number, col: number) {
    // Check some condition
    if (gomoku.getValueAtRowCol(row, col) !== 0 || gomoku.isWinningBoard()) return;
    // if (gomoku.getCurrentPlayer() <= 0) return; // not player turn to move

    // Player make his move
    makeMove(gomoku.toIndex(row, col));

    // Update turn text
    var currentPlayer = gomoku.getCurrentPlayer();
    gameStatusElement.textContent = currentPlayer === 1 ? "Player Turn" : "Bot Turn";

    // Check for game over
    if (gomoku.isBoardFull()) {
        gameStatusElement.textContent = "It's a draw!";
        return;
    }
    if (gomoku.isWinningBoard()) {
        gameStatusElement.textContent = currentPlayer === -1 ? `Player wins!` : "Bot win";
        return;
    }

    // Bot move
    // if (currentPlayer === -1) {
    //     botStatusElement.textContent = "Thinking...";
    //     setTimeout(() => botMove(), 1);
    // }

    // Test possible move
    // var moves = gomoku.getAvailableMoves();
    // for (const move of moves) {
    //     makeMove(move);
    // }

    var patterns_max = gomoku.engine.countPatterns(gomoku.bitboardMax);
    var patterns_min = gomoku.engine.countPatterns(gomoku.bitboardMin);
    console.log(`Patterns for Player Max (bitboardMax) ${gomoku.bitboardMax.toString(2)}:`);
    console.log(patterns_max);
    
    console.log(`Patterns for Player Min (bitboardMin) ${gomoku.bitboardMin}:`);
    console.log(patterns_min);

}

function makeMove(index: number) {
    gomoku.makeMove(index);
    updateBoardUI();
}

// Bot makes a random move
function botMove() {
    var start = Date.now();
    const move = gomoku.engine.findBestMove(gomoku, gomoku.currentPlayer);
    var dt = Date.now() - start;
    botStatusElement.textContent = "Time: " + dt;
    if (move) makeMove(move);
}

function getCellUI(move: number):  HTMLElement | null {
    const cells = document.querySelectorAll(".cell");
    for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        const htmlCell = cell as HTMLElement;
        const col = parseInt(htmlCell.dataset.x!);
        const row = parseInt(htmlCell.dataset.y!);
        const index = gomoku.toIndex(row, col);
        if (index == move) return htmlCell;
    }
    return null;
}

// Reset the game
resetButton.addEventListener("click", () => {
    gomoku.reset();
    gameStatusElement.textContent = "Player 1's Turn";
    updateBoardUI();
});

// Initialize everything
createBoardUI();
updateBoardUI();
