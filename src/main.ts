import { Gomoku } from "./gomoku/Gomoku";
import { GomokoPieceType } from "./gomoku/defines/GomokuPieceType";
import { GomokuEngine2 } from "./gomoku/engine/GomokuEngine2";
// import { GomokuEngine } from "./gomoku/GomokuEngine";
// import { GomokuEngine } from "./engine";

let boardSize = 15;
let lookahead = 3;
let botPlayer = -1;
let isPlayerWithBot = true;
let gomoku = new Gomoku(boardSize);
let engine = new GomokuEngine2(lookahead);

// UI
const boardElement = document.getElementById("board")!;
const gameStatusElement = document.getElementById("game-status")!;
const botStatusElement = document.getElementById("bot-status")!;
const resetButton = document.getElementById("reset-button")!;
const valueSelectElement = document.getElementById("value-select") as HTMLSelectElement; // Dropdown element

valueSelectElement.addEventListener("change", () => {
    lookahead = parseInt(valueSelectElement.value); // Update lookahead when dropdown value changes
    if (!lookahead || lookahead <= 0) lookahead = 1;
    engine.setLookAhead(lookahead);
});


// Initialize the board UI
function createBoardUI() {
    console.log("+++++++++++++++++");
    const cellSize = 30; // Size of each cell
    const gapSize = 1; // Size of the gap between cells

    // Set the board container size dynamically
    boardElement.style.width = `${boardSize * cellSize + (boardSize - 1) * gapSize}px`;
    boardElement.style.height = `${boardSize * cellSize + (boardSize - 1) * gapSize}px`;
    boardElement.style.gridTemplateColumns = `repeat(${boardSize}, ${cellSize}px)`;

    boardElement.innerHTML = "";

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

        if (value === GomokoPieceType.MAX) {
            htmlCell.textContent = "X"; // Player 1 (human) uses "X"
            htmlCell.classList.add("player1");
        } else if (value === GomokoPieceType.MIN) {
            htmlCell.textContent = "O"; // Player 2 (bot) uses "O"
            htmlCell.classList.add("player2");
        } else if (value === GomokoPieceType.BLOCKER) {
            htmlCell.textContent = "#";
        }

        htmlCell.classList.remove("player1", "player2");
    });
}

// Handle cell clicks (Player's turn)
function handleCellClick(row: number, col: number) {
    // Check some condition
    if (gomoku.getValueAtRowCol(row, col) !== 0 || gomoku.isWinningBoard()) return;
    if (isPlayerWithBot && gomoku.getCurrentPlayer() === botPlayer) return; // not player turn to move

    // Player make his move
    makeMove(gomoku.toIndex(row, col));

    // Check for game over
    if (checkEndGame()) return;

    // Debug
    printPatternInfo();

    // Bot move
    if (isPlayerWithBot && gomoku.currentPlayer === botPlayer) {
        botStatusElement.textContent = "Thinking...";
        setTimeout(() => botMove(), 10);
    }

    // Test possible move
    // engine.loadState(gomoku.toState());
    // var moves = engine.getNextMoves();
    // // console.log("MOVES: " + JSON.stringify(moves));
    // for (const move of moves) {
    //     makeMove(move);
    // }
}

function makeMove(index: number) {
    console.log(`PLAYER ${gomoku.currentPlayer} MOVE: ${index}`);
    gomoku.makeMove(index);
    updateBoardUI();
    gameStatusElement.textContent = gomoku.currentPlayer !== botPlayer ? "Player Turn" : "Bot Turn";
}

function printPatternInfo() {
    // console.log('--------------------------------------------------------------')
    // var state = gomoku.toState();
    // engine.loadState(state);
    // var patternResult = engine.countPattern();
    // engine.clearState();
    // console.log (`- Patterns for MAX player (1): `)
    // for (const [key, value] of patternResult.maxPatterns) {
    //     console.log(`   + ${PatternType[key]}: ${value}`);
    // }
    // console.log (`- Patterns for MIN player (-1): `)
    // for (const [key, value] of patternResult.minPatterns) {
    //     console.log(`   + ${PatternType[key]}: ${value}`);
    // }


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
    const move = engine.findBestMove(gomoku.toState());
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
    engine.setLookAhead(lookahead);
    gameStatusElement.textContent = "Player 1's Turn";
    updateBoardUI();
    if (isPlayerWithBot && gomoku.currentPlayer === botPlayer) {
        var center = gomoku.center();
        makeMove(center - 1);
    }
});

// Initialize everything
createBoardUI();
updateBoardUI();
