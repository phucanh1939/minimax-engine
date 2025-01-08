import { MinimaxEngine } from "../minimax/MinimaxEngine";

export interface GomokuState {
    currentPlayer: number;
    bitboardMax: bigint;
    bitboardMin: bigint;
};
type GomokuMove = number;
type GomokuHash = string;

const PATTERN_OPEN_4 = 1;
const PATTERN_BLOCKED_4 = 2;
const PATTERN_OPEN_3 = 3;
const PATTERN_BLOCKED_3 = 4;
const PATTERN_OPEN_2 = 5;
const PATTERN_BLOCKED_2 = 6;

export class GomokuEngine extends MinimaxEngine <GomokuState, GomokuMove, GomokuHash>{

    private boardSize: number = 10;
    private boardLength: number = 100;
    private fourDirections: number[];
    private eightDirections: number[];

    constructor(boardSize: number, lookAhead: number) {
        super();
        this.boardSize = boardSize;
        this.lookAhead = lookAhead;
        this.boardLength = boardSize * boardSize;
        this.fourDirections = [1, this.boardSize, this.boardSize + 1, this.boardSize - 1];
        this.eightDirections = [1, this.boardSize, this.boardSize + 1, this.boardSize - 1, -1, -this.boardSize, -this.boardSize - 1, -this.boardSize + 1];
    }
    
    public evaluate(state: GomokuState): number {
        // TODO

        return Math.floor(Math.random() * 20001) - 10000;
    }

    public getStateHash(state: GomokuState): string {
        // Convert bitboards to binary string and concatenate them with currentPlayer
        const bitboardMaxStr = state.bitboardMax.toString(2).padStart(this.boardLength, '0');
        const bitboardMinStr = state.bitboardMin.toString(2).padStart(this.boardLength, '0');
        const currentPlayerStr = state.currentPlayer > 0 ? "1" : "0";
        // Concatenate bitboardMax, bitboardMin, and currentPlayer as a single string
        const concatenatedStr = bitboardMaxStr + bitboardMinStr + currentPlayerStr;
        return concatenatedStr;
    }

    public isTerminal(state: GomokuState): boolean {
        return this.isWinningBoard(state);
    }

    public getPossibleMoves(state: GomokuState): number[] {
        var moves: number[] = [];
        for (let i = 0; i < this.boardLength; i++) {
            if (this.hasValueAt(state, i)) continue;
            if (this.hasNeighbor(state, i)) moves.push(i);
        }
        return moves;
    }

    public makeMove(state: GomokuState, move: number): boolean {
        if (this.isBitSet(state.bitboardMax, move)) return false;
        if (this.isBitSet(state.bitboardMax, move)) return false;
        if (!this.isValidIndex(move)) return false;
        this.setValueAt(state, move, state.currentPlayer);
        state.currentPlayer = -state.currentPlayer;
        return true;
    }

    public undoMove(state: GomokuState, move: number): boolean {
        if (!this.isValidIndex(move)) return false;
        this.clearValueAt(state, move);
        state.currentPlayer = -state.currentPlayer;
        return true;
    }

    // ==========================================================

    public isWinningBoard(state: GomokuState): boolean {
        return this.hasWinningLine(state.bitboardMax) || this.hasWinningLine(state.bitboardMin);
    }

    public hasWinningLine(bitboard: bigint): boolean {
        for (const direction of this.fourDirections) {
            let shifted = bitboard;
            for (let i = 0; i < 4; i++) { // Check for 5 consecutive bits
                shifted &= (shifted >> BigInt(direction));
                if (shifted === 0n) break;
            }
            if (shifted !== 0n) return true;
        }
        return false;
    };

    public hasNeighbor(state: GomokuState, index: number, range: number = 1): boolean {
        for (const direction of this.eightDirections) {
            for (let step = 1; step <= range; step++) {
                const neighborIndex = index + step * direction;
                if (this.hasValueAt(state, neighborIndex)) return true;
            }
        }
        return false;
    }

    public hasValueAt(state: GomokuState, index: number): boolean {
        if (!this.isValidIndex(index)) return false;
        const mask = 1n << BigInt(index);
        return ((state.bitboardMax | state.bitboardMin) & mask) !== 0n;
    }

    public isValidIndex(index: number): boolean {
        return index >= 0 && index < this.boardLength;
    }

    public isBitSet(bitboard: bigint, index: number): boolean {
        return (bitboard & (1n << BigInt(index))) !== 0n;
    }

    public setValueAt(state: GomokuState, index: number, value: number) {
        if (value > 0) {
            state.bitboardMax |= 1n << BigInt(index);
        } else if (value < 0) {
            state.bitboardMin |= 1n << BigInt(index);
        } else {
            state.bitboardMax &= ~(1n << BigInt(index));
            state.bitboardMin &= ~(1n << BigInt(index));
        }
    }

    public clearValueAt(state: GomokuState, index: number) {
        state.bitboardMax &= ~(1n << BigInt(index));
        state.bitboardMin &= ~(1n << BigInt(index));
    }

    // ==================================================================================

    public countPatterns(bitboard: bigint): Map<number, number> {
        const patternCounts = new Map<number, number>();
        const checkedIndices = new Set<number>();  // Track checked indices
        
        for (let i = 0; i < this.boardSize * this.boardSize; i++) {
            if ((bitboard & (1n << BigInt(i))) !== 0n && !checkedIndices.has(i)) {
                this.checkPatternsFrom(i, bitboard, patternCounts, checkedIndices);
            }
        }

        return patternCounts;
    }

    // Check patterns from a given index for a given bitboard
    private checkPatternsFrom(index: number, bitboard: bigint, patternCounts: Map<number, number>, checkedIndices: Set<number>): void {
        for (let direction of this.eightDirections) {
            this.checkPatternInDirection(index, direction, bitboard, patternCounts, checkedIndices);
        }
    }

    // Check for patterns in a specific direction (horizontal, vertical, diagonal)
    private checkPatternInDirection(index: number, direction: number, bitboard: bigint, patternCounts: Map<number, number>, checkedIndices: Set<number>): void {
        for (let patternLength = 2; patternLength <= 4; patternLength++) {
            let patternMask = this.checkConsecutiveBits(index, direction, patternLength, bitboard);
            if (patternMask) {
                const patternType = this.getPatternType(patternLength, index, direction, bitboard);
                patternCounts.set(patternType, (patternCounts.get(patternType) || 0) + 1);
                // Mark the indices of the pattern as checked
                for (let i = 0; i < patternLength; i++) {
                    checkedIndices.add(index + i * direction);
                }
            }
        }
    }

    // Check if the consecutive bits in the given direction form a pattern of the specified length
    private checkConsecutiveBits(index: number, direction: number, patternLength: number, bitboard: bigint): bigint | null {
        let consecutiveBits = 0n;
        for (let i = 0; i < patternLength; i++) {
            const checkIndex = index + i * direction;
            if (this.isValidIndex(checkIndex)) {
                consecutiveBits |= (1n << BigInt(checkIndex));
            } else {
                return null; // Out of bounds, no valid pattern
            }
        }
        return consecutiveBits;
    }

    // Get the pattern type as a number based on the pattern length
    private getPatternType(patternLength: number, index: number, direction: number, bitboard: bigint): number {
        const patternMask = this.checkConsecutiveBits(index, direction, patternLength, bitboard);
        if (!patternMask) return 0; // Invalid Pattern

        const leftNeighbor = this.isValidIndex(index - direction);
        const rightNeighbor = this.isValidIndex(index + (patternLength * direction));

        const isBlocked = (leftNeighbor && (bitboard & (1n << BigInt(index - direction)))) !== 0n || 
                          (rightNeighbor && (bitboard & (1n << BigInt(index + (patternLength * direction))))) !== 0n;

        if (isBlocked) {
            return patternLength === 4 ? PATTERN_BLOCKED_4 : patternLength === 3 ? PATTERN_BLOCKED_3 : PATTERN_BLOCKED_2;  // Blocked patterns
        } else {
            return patternLength === 4 ? PATTERN_OPEN_4 : patternLength === 3 ? PATTERN_OPEN_3 : PATTERN_OPEN_2;  // Open patterns
        }
    }
}