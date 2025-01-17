import { Gomoku } from "./gomoku/Gomoku";
import { DefaultPatternValueMap, PatternType } from "./gomoku/defines/GomokuPattern";
import { GomokoPieceType } from "./gomoku/defines/GomokuPieceType";
import { GomokuEngineConfig } from "./gomoku/engine/GomokuEngine";
import { GomokuEngine2 } from "./gomoku/engine/GomokuEngine2";
// import { GomokuEngine } from "./gomoku/GomokuEngine";
// import { GomokuEngine } from "./engine";

let boardSize = 15;
let botPlayer = -1;
let isPlayerWithBot = true;
let gomoku = new Gomoku(boardSize);
const engineConfig: GomokuEngineConfig = {
    lookahead: 3,
    currentPlayerValueScaler: 1.5,
    patternValues: DefaultPatternValueMap,
    movesCutoff: 8
};
let engine = new GomokuEngine2(engineConfig);


// UI
const boardElement = document.getElementById("board")!;
const gameStatusElement = document.getElementById("game-status")!;
const botStatusElement = document.getElementById("bot-status")!;
const resetButton = document.getElementById("reset-button")!;
const undoButton = document.getElementById("undo-button")!;
const valueSelectElement = document.getElementById("value-select") as HTMLSelectElement; // Dropdown element

valueSelectElement.addEventListener("change", () => {
    var lookahead = parseInt(valueSelectElement.value); // Update lookahead when dropdown value changes
    if (!lookahead || lookahead <= 0) lookahead = 1;
    engine.setLookAhead(lookahead);
});

function loadConfig() {
    const patternToIdMap = {
        [PatternType.OPEN_5]: "open-5",
        [PatternType.BLOCKED_5]: "blocked-5",
        [PatternType.BLOCKED_BROKEN_5]: "blocked-broken-5",
        [PatternType.OPEN_4]: "open-4",
        [PatternType.OPEN_BROKEN_5]: "open-broken-5",
        [PatternType.BLOCKED_4]: "blocked-4",
        [PatternType.OPEN_BROKEN_4]: "open-broken-4",
        [PatternType.BLOCKED_BROKEN_4]: "blocked-broken-4",
        [PatternType.OPEN_BROKEN_3]: "open-broken-3",
        [PatternType.OPEN_3]: "open-3",
        [PatternType.BLOCKED_3]: "blocked-3",
        [PatternType.BLOCKED_BROKEN_3]: "blocked-broken-3",
        [PatternType.OPEN_2]: "open-2",
        [PatternType.OPEN_BROKEN_2]: "open-broken-2",
    };

    Object.entries(patternToIdMap).forEach(([pattern, id]) => {
        const input = document.getElementById(id) as HTMLInputElement;
        if (input) {
            const value = engine.getPatternValue(Number(pattern)) || 0; // Retrieve pattern value
            input.value = value.toString(); // Set input value
            input.addEventListener("input", (event) => {
                const target = event.target as HTMLInputElement;
                const newValue = parseFloat(target.value) || 0; // Parse the input value or default to 0
                engine.setPatternValue(Number(pattern), newValue); // Update the engine's value
                // console.log(`Pattern ${pattern} updated to ${newValue}`);
            });
        }
    });

    const scalerInput = document.getElementById("scaler") as HTMLInputElement;
    scalerInput.value = engine.getCurrentPlayerValueScaler().toString(); // Set input value
    scalerInput.addEventListener("input", (event) => {
        const target = event.target as HTMLInputElement;
        const newValue = parseFloat(target.value) || 0; // Parse the input value or default to 0
        engine.setCurrentPlayerValueScaler(newValue); // Update the engine's value
    });

    const sureWinCheckBox = document.getElementById('surewincheckbox') as HTMLInputElement;

    // Set the value of the checkbox (true means checked, false means unchecked)
    sureWinCheckBox.checked = engine.isCheckSureWin();  // You can set this to false if you want it unchecked by default

    // Add an event listener to detect changes in the checkbox state
    sureWinCheckBox.addEventListener('change', function () {
        engine.setCheckSureWin(sureWinCheckBox.checked);
    });
}

// Initialize the board UI
function createBoardUI() {
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
    gameStatusElement.textContent = gomoku.currentPlayer !== botPlayer ? "Player Turn" : "Bot Turn";
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
    // console.log(`PLAYER ${gomoku.currentPlayer} MOVE: ${index}`);
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

function getCellUI(move: number): HTMLElement | null {
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
    gameStatusElement.textContent = "Player 1's Turn";
    updateBoardUI();
    if (isPlayerWithBot && gomoku.currentPlayer === botPlayer) {
        var center = gomoku.center();
        makeMove(center - 1);
    }
});

undoButton.addEventListener("click", () => {
    gomoku.undoMoves(2);
    updateBoardUI();
    console.log("_______-gomoku.currentPlayer " + gomoku.currentPlayer );
    if (isPlayerWithBot && gomoku.currentPlayer === botPlayer) {
        botStatusElement.textContent = "Thinking...";
        setTimeout(() => botMove(), 10);
        botMove();
    }
});

// Initialize everything
createBoardUI();
loadConfig();
updateBoardUI();
