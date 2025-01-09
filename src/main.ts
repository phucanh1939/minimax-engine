import { Gomoku } from "./gomoku/Gomoku";
import { GomokuConstant } from "./gomoku/GomokuConstant";
// import { GomokuEngine } from "./gomoku/GomokuEngine";
// import { GomokuEngine } from "./engine";

let boardSize = 15;
let lookAhead = 3;
let gomoku = new Gomoku(boardSize, lookAhead);
let botPlayer = -1;

// UI
const boardElement = document.getElementById("board")!;
const gameStatusElement = document.getElementById("game-status")!;
const botStatusElement = document.getElementById("bot-status")!;
const resetButton = document.getElementById("reset-button")!;
const valueSelectElement = document.getElementById("value-select") as HTMLSelectElement; // Dropdown element

valueSelectElement.addEventListener("change", () => {
    lookAhead = parseInt(valueSelectElement.value); // Update lookAhead when dropdown value changes
    if (!lookAhead || lookAhead <= 0) lookAhead = 1;
    console.log(`LookAhead updated to: ${lookAhead}`);
    gomoku.engine.setLookAhead(lookAhead);
});

function printAs2DArray(arr: any[], n: number) {
    var row = 0;
    for (let i = 0; i < arr.length; i += n) {
        // // console.log(arr.slice(i, i + n).join(' ') + (' '.repeat(10) + row));  // Join elements to print them in one line
        row++;
    }
}

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
    if (gomoku.getCurrentPlayer() === botPlayer) return; // not player turn to move

    // Player make his move
    makeMove(gomoku.toIndex(row, col));

    // Check for game over
    if (checkEndGame()) return;

    // Debug
    printPatternInfo();

    // Bot move
    if (gomoku.currentPlayer === botPlayer) {
        botStatusElement.textContent = "Thinking...";
        setTimeout(() => botMove(), 100);
    }

    // Test possible move
    // var moves = gomoku.getAvailableMoves();
    // for (const move of moves) {
    //     makeMove(move);
    // }
}

function makeMove(index: number) {
    // console.log("PLAYER MOVE: " + gomoku.currentPlayer);
    gomoku.makeMove(index);
    // console.log("PLAYER NEXT: " + gomoku.currentPlayer);
    updateBoardUI();
    gameStatusElement.textContent = gomoku.currentPlayer !== botPlayer ? "Player Turn" : "Bot Turn";
}

function printPatternInfo() {
    var patternResult = gomoku.engine.countPattern(gomoku);
    // console.log (`- Patterns for MAX player (1): `)
    for (const [key, value] of patternResult.patternCountsForMax) {
        var parttern = GomokuConstant.getPatternByMask(key);
        if (!parttern) continue;
        // console.log(`   + ${parttern.name}: ${value}`);
    }
    // console.log (`- Patterns for MIN player (-1): `)
    for (const [key, value] of patternResult.patternCountsForMin) {
        var parttern = GomokuConstant.getPatternByMask(key);
        if (!parttern) continue;
        // console.log(`   + ${parttern.name}: ${value}`);
    }
    // // console.log (`- Masks): `)
    // printAs2DArray(patternResult.masks, boardSize);
    // console.log(`- Total value: ${patternResult.totalValue} `);
    // console.log(`- Next player: ${gomoku.currentPlayer}`);
    // console.log(`- WHO IS SURE WIN: ${gomoku.engine.whoIsSureWin(patternResult.patternCountsForMax, patternResult.patternCountsForMin, gomoku.currentPlayer)}`);
    // console.log("================================================");
}

function checkEndGame() {
    if (gomoku.isBoardFull()) {
        gameStatusElement.textContent = "It's a draw!";
        return true;
    }
    if (gomoku.isWinningBoard()) {
        gameStatusElement.textContent = gomoku.currentPlayer === botPlayer ? `Player wins!` : "Bot win";
        return true;
    }
    return false;
}

// Bot makes a random move
function botMove() {
    var start = Date.now();
    const move = gomoku.engine.findBestMove(gomoku, gomoku.currentPlayer);
    var dt = Date.now() - start;
    botStatusElement.textContent = "Time: " + dt;
    if (move) makeMove(move);
    printPatternInfo();
    checkEndGame();
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
    botPlayer = -botPlayer;
    gomoku.reset();
    gomoku.engine.setLookAhead(lookAhead);
    gameStatusElement.textContent = "Player 1's Turn";
    updateBoardUI();
    if (gomoku.currentPlayer === botPlayer) {
        makeMove(Math.floor(boardSize * boardSize / 2))
    }
});

// Initialize everything
createBoardUI();
updateBoardUI();
