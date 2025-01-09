import { GomokuEngine, GomokuState } from "./GomokuEngine";
import { GomokuEngineLv2 } from "./GomokuEngineLv2";

export class Gomoku implements GomokuState{
    private boardSize: number = 10;
    private boardLength: number = 100;
    public currentPlayer: number = 1;
    public bitboardMax: bigint = 0n;
    public bitboardMin: bigint = 0n;
    public engine: GomokuEngine;

    constructor(boardSize: number, lookAhead: number) {
        this.boardSize = boardSize;
        this.boardLength = boardSize * boardSize;
        this.engine = new GomokuEngineLv2(boardSize, lookAhead);
    }

    public toIndex(row: number, col: number): number {
        return this.engine.toIndex(row, col);
    }

    public getValueAt(index: number): number {
        if ((this.bitboardMax & (1n << BigInt(index))) !== 0n)
            return 1;
        if ((this.bitboardMin & (1n << BigInt(index))) !== 0n)
            return -1;
        return 0;
    }

    private setValueAt(index: number, value: number) {
        this.engine.setValueAt(this, index, value);
    }

    public isInBounds(row: number, col: number): boolean {
        return row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize;
    }

    public getValueAtRowCol(row: number, col: number): number {
        if (!this.isInBounds(row, col)) return 0;
        return this.getValueAt(this.toIndex(row, col));
    }

    public printBoard() {
        // console.log("#####################################################");
        let board = '';
        for (let i = 0; i < this.boardSize; i++) {
            board += '#';
            for (let j = 0; j < this.boardSize; j++) {
                const index = i * this.boardSize + j;
                const isMaxSet = (this.bitboardMax & (1n << BigInt(index))) !== 0n;
                const isMinSet = (this.bitboardMin & (1n << BigInt(index))) !== 0n;
                if (isMaxSet) {
                    board += 'X ';
                } else if (isMinSet) {
                    board += 'O ';
                } else {
                    board += '. ';
                }
            }
            board += "#\n";
        }
        // console.log(board);
        // console.log("Current Player: " + (this.currentPlayer === 1 ? 'X' : 'O'));
        // console.log("#####################################################");
    }

    // ==============================================================================================

    public loadGame(board: number[], boardSize: number, player: number) {
        this.boardSize = boardSize;
        this.currentPlayer = player;
        for (var i = 0; i < board.length; i++) {
            this.setValueAt(i, board[i]);
        }
    }

    public reset(): void {
        this.bitboardMax = 0n;
        this.bitboardMin = 0n;
        this.currentPlayer = 1;
        this.engine.clearCache();
    }

    public getCurrentPlayer(): number {
        return this.currentPlayer;
    }

    public makeMove(index: number): boolean {
        return this.engine.makeMove(this, index);
    }

    public isWinningBoard(): boolean {
        return this.engine.isWinningBoard(this);
    }

    public isBoardFull(): boolean {
        const allOccupied = this.bitboardMax | this.bitboardMin;
        const fullBoard = (1n << BigInt(this.boardLength)) - 1n;
        return allOccupied === fullBoard;
    }

    public getPossibleMoves(): number[] {
        return this.engine.getPossibleMoves(this);
    }
}