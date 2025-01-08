import { IMinimaxGame } from "../minimax/IMinimaxGame";
import { GomokuConstant, GomokuMove, GomokuState } from "./GomokuDefines";

export class Gomoku implements IMinimaxGame<GomokuMove> {
    private board: number[];
    private boardSize: number = 10;
    private currentPlayer: number = 1;

    constructor(boardSize: number = 10) {
        this.boardSize = boardSize;
        this.board = new Array(boardSize * boardSize).fill(0);
    }

    public loadGame(board: number[], boardSize: number, player: number) {
        this.board = board;
        this.boardSize = boardSize;
        this.currentPlayer = player;
    }

    public getGameState(): GomokuState {
        return {
            board: this.board,
            boardSize: this.boardSize,
            currentPlayer: this.currentPlayer
        };
    }

    public printBoard() {
        console.log("#####################################################");
        for (let i = 0; i < this.boardSize; i++) {
            const row = this.board
                .slice(i * this.boardSize, (i + 1) * this.boardSize) // Extract the current row
                .map(cell => cell === 1 ? 'x' : cell === -1 ? 'o' : '.') // Map values to symbols
                .join(' '); // Join row elements with spaces
            console.log(row); // Print the row
        }
        console.log("#####################################################");
    
    }

    public reset(): void {
        this.board.fill(0);
        this.currentPlayer = 1;
    }

    public getCurrentPlayer(): number {
        return this.currentPlayer;
    }

    public makeMove(index: number): boolean {
        if (!this.isValidIndex(index)) return false;
        if (this.board[index] != 0) return false;
        this.board[index] = this.currentPlayer;
        this.changePlayer();
        return true;
    }

    public undoMove(index: number): boolean {
        if (!this.isValidIndex(index)) return false;
        this.board[index] = 0;
        this.changePlayer();
        return true;
    }

    public isGameOver(): boolean {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.checkWinFrom(row, col)) return true;
            }
        }
        return false;
    }

    public isBoardFull(): boolean {
        return this.board.every(cell => cell !== 0);
    }

    public isValidIndex(index: number): boolean {
        return index >= 0 && index < this.board.length;
    }

    public checkWinFrom(row: number, col: number): boolean {
        if (!this.isValidCell(row, col)) return false;
        if ( this.getValueAt(row, col) == 0) return false;
        for (const direction of GomokuConstant.DIRECTIONS_4) {
            let count = 1;
            count += this.countInDirection(row, col, direction.x, direction.y);
            count += this.countInDirection(row, col, -direction.x, -direction.y);
            if (count >= GomokuConstant.WINING_LENGTH) {
                return true;
            }
        }
        return false;
    }

    public countInDirection(row: number, col: number, dx: number, dy: number): number {
        let count = 0;
        let value = this.getValueAt(row, col);
        row += dy;
        col += dx;
        while (row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize) {
            if (this.getValueAt(row, col) !== value) return count;
            count++;
            row += dy;
            col += dx;
        }
        return count;
    }

    private changePlayer(): void {
        this.currentPlayer = -this.currentPlayer; // Toggle between 1 and -1
    }

    public toIndex(row: number, col: number): number {
        return row * this.boardSize + col;
    }

    public isValidCell(row: number, col: number): boolean {
        return row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize;
    }

    public getValueAt(row: number, col: number): number {
        if (!this.isValidCell(row, col)) return 0;
        return this.board[this.toIndex(row, col)];
    }

    public getAvailableMoves(): number[] {
        const moves: number[] = [];
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const index = this.toIndex(row, col);
                const value = this.board[index];
                if (value != 0) continue;
                if (this.hasNeighbor(row, col, GomokuConstant.NEIGHBOR_RANGE)){
                    moves.push(index);
                }
            }
        }
        return moves;
    }

    private hasNeighbor(row: number, col: number, range: number = 1): boolean {
        for (const direction of GomokuConstant.DIRECTIONS_8) {
            for (let step = 1; step <= range; step++) {
                const nRow = row + direction.x * step;
                const nCol = col + direction.y * step;
                if (!this.isValidCell(nRow, nCol)) continue;
                if (this.getValueAt(nRow, nCol) !== 0) return true;
            }
        }
        return false;
    }

    public evaluate(): number {
        // TODO
        return Math.floor(Math.random() * 20001) - 10000;
    }
}