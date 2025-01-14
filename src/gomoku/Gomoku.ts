import { FourDirections, WinningCount } from "./defines/GomokoConstant";
import { GomokoPieceType } from "./defines/GomokuPieceType";
import { GomokuState } from "./defines/GomokuState";

export class Gomoku {
    private boardSize: number;
    public board: number[];
    public currentPlayer: number = 1;
    protected moves: number[] = [];


    constructor(boardSize: number) {
        this.boardSize = boardSize;
        this.board = Array(this.boardSize * this.boardSize).fill(0);

        // fill center with a blocker
        this.blockCenter();
    }

    private blockCenter() {
        this.board[this.center()] = GomokoPieceType.BLOCKER;
    }

    public center(): number {
        var center = Math.floor(this.boardSize / 2);
        return center * this.boardSize + center;
    }

    public toIndex(row: number, col: number): number {
        return row * this.boardSize + col;
    }

    public getValueAt(index: number): number {
        return this.board[index];
    }

    private setValueAt(index: number, value: number) {
        this.board[index] = value;
    }

    public isInBounds(row: number, col: number): boolean {
        return row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize;
    }

    public getValueAtRowCol(row: number, col: number): number {
        if (!this.isInBounds(row, col)) return 0;
        return this.getValueAt(this.toIndex(row, col));
    }

    // ==============================================================================================

    public reset(): void {
        this.board = Array(this.boardSize * this.boardSize).fill(0);
        this.currentPlayer = 1;
        this.moves = [];
        this.blockCenter();
    }

    public getCurrentPlayer(): number {
        return this.currentPlayer;
    }

    public makeMove(move: number): boolean {
        if (move < 0 || move >= this.board.length) return false;
        if (this.board[move] !== GomokoPieceType.EMPTY) return false;
        this.board[move] = this.currentPlayer;
        this.currentPlayer = -this.currentPlayer;
        this.moves.push(move);
        return true;
    }

    public undoMoves(nMoves: number): boolean {
        if (this.moves.length < nMoves) return false;
        for (var i = 0; i < nMoves; i++) {
            var lastMove = this.moves.pop() || -1;
            if (lastMove >= 0) {
                this.board[lastMove] = 0;
                this.currentPlayer = -this.currentPlayer;
            }
        }

        return true;
    }

    public isOutOfBounds(row: number, col: number): boolean {
        return row < 0 || row >= this.boardSize || col < 0 || col >= this.boardSize;
    }

    protected countPiece(piece: number, fromRow: number, fromCol: number, dx: number, dy: number): { count: number, blocked: boolean } {
        let step = 1;
        let count = 0;
        let blocked = false;
        while (true) {
            const currRow = fromRow + step * dy;
            const currCol = fromCol + step * dx;
            if (this.isOutOfBounds(currRow, currCol)) break;
            const currIndex = currRow * this.boardSize + currCol;
            const currentPiece = this.board[currIndex];
            if (currentPiece === piece) {
                count++;
                step++;
            } else if (currentPiece === GomokoPieceType.EMPTY) {
                break;
            } else {
                blocked = true;
                break;
            }
        }
        return { count: count, blocked: blocked };
    }

    protected hasWinningLine(index: number): boolean {
        if (index < 0 || index >= this.board.length) return false;
        var piece = this.board[index];
        if (piece === GomokoPieceType.EMPTY) return false;
        if (piece === GomokoPieceType.BLOCKER) return false;
        const row = Math.floor(index / this.boardSize);
        const col = index % this.boardSize;
        for (const direction of FourDirections) {
            var countForward = this.countPiece(piece, row, col, direction.x, direction.y);
            var countBackward = this.countPiece(piece, row, col, -direction.x, -direction.y);
            var count = 1 + countForward.count + countBackward.count;
            if (count > WinningCount) return true;
            if (countBackward.blocked && countForward.blocked) return false;
            if (count >= WinningCount) return true;
        }
        return false;
    }

    public isWinningBoard(): boolean {
        return this.hasWinningLine(this.getLastMove());
    }

    public getLastMove() {
        return this.moves.length > 0 ? this.moves[this.moves.length - 1] : -1;
    }

    public isBoardFull(): boolean {
        return this.board.every(cell => cell !== 0);
    }

    public toState(): GomokuState {
        return {
            board: this.board,
            boardSize: this.boardSize,
            currentPlayer: this.currentPlayer,
            lastMove: this.getLastMove()
        }
    }
}