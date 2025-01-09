import { MinimaxEngine } from "../minimax/MinimaxEngine";
import { GomokuConstant } from "./GomokuConstant";

export interface GomokuState {
    currentPlayer: number;
    bitboardMax: bigint;
    bitboardMin: bigint;
};
export type GomokuMove = number;
export type GomokuHash = string;
export type Vec2 = {x: number, y: number};

export const WINNING_COUNT = 5;
export const FOUR_DIRECTIONS = [
    {x:  1, y:  0}, // horizontal
    {x:  0, y:  1}, // vertical
    {x:  1, y:  1}, // bot-right
    {x: -1, y:  1}, // bot-left
];
export const EIGHT_DIRECTIONS = [
    {x:  1, y:  0}, // horizontal
    {x: -1, y:  0}, // horizontal
    {x:  0, y:  1}, // vertical
    {x:  0, y: -1}, // vertical
    {x:  1, y:  1}, // bot-right
    {x: -1, y: -1}, // bot-right
    {x: -1, y:  1}, // bot-left
    {x:  1, y: -1}, // bot-left
];
export abstract class GomokuEngine extends MinimaxEngine <GomokuState, GomokuMove, GomokuHash>{

    protected boardSize: number = 10;
    protected boardLength: number = 100;
    protected eightDirections: number[];

    // mask
    protected rowMask: bigint;
    protected rowShiftRightMask: bigint;
    protected rowShiftLeftMask: bigint;

    constructor(boardSize: number, lookAhead: number) {
        super();
        this.boardSize = boardSize;
        this.lookAhead = lookAhead;
        this.boardLength = boardSize * boardSize;
        
        // directions
        this.eightDirections = [1, this.boardSize, this.boardSize + 1, this.boardSize - 1, -1, -this.boardSize, -this.boardSize - 1, -this.boardSize + 1];

        // mask
        this.rowMask = (1n << BigInt(this.boardSize)) - 1n;
        this.rowShiftRightMask = BigInt('0b' + ('0' + '1'.repeat(this.boardSize - 1)).repeat(this.boardSize));
        this.rowShiftLeftMask = BigInt('0b' + ('1'.repeat(this.boardSize - 1) + '0').repeat(this.boardSize));
    }
    
    public abstract evaluate(state: GomokuState): number;

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

    public shiftBoard(bitboard: bigint, direction: Vec2): bigint {
        var result = bitboard;
        if (direction.x !== 0) result = this.shiftBoardHorizontal(result, direction.x);
        if (direction.y !== 0) result = this.shiftBoardVertical(result, direction.y);
        return result;
    }

    public shiftBoardHorizontal(bitboard: bigint, direction: number): bigint {
        if (direction == 0) return bitboard;
        if (direction > 0) return (bitboard >> BigInt(1)) & this.rowShiftRightMask; // shift right
        return (bitboard << BigInt(1)) & this.rowShiftLeftMask; // shift left
    }

    public shiftBoardVertical(bitboard: bigint, direction: number): bigint {
        if (direction == 0) return bitboard;
        if (direction > 0) return bitboard >> BigInt(this.boardSize); // shift down
        return bitboard << BigInt(this.boardSize); // shift up
    }

    public isWinningBoard(state: GomokuState): boolean {
        return this.hasWinningLine(state.bitboardMax) || this.hasWinningLine(state.bitboardMin);
    }

    public hasWinningLine(bitboard: bigint): boolean {
        for (const direction of FOUR_DIRECTIONS) {
            let shifted = bitboard;
            for (let i = 0; i < WINNING_COUNT - 1; i++) { // Check for 5 consecutive bits
                shifted &= this.shiftBoard(shifted, direction);
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

    public getValueAt(state: GomokuState, index: number): number {
        if ((state.bitboardMax & (1n << BigInt(index))) !== 0n)
            return 1;
        if ((state.bitboardMin & (1n << BigInt(index))) !== 0n)
            return -1;
        return 0;
    }

    public toIndex(row: number, col: number): number {
        return row * this.boardSize + col;
    }

    public isOutOfBounds(row: number, col: number): boolean {
        return row < 0 || row >= this.boardSize || col < 0 || col >= this.boardSize;
    }

    // ==================================================================================

    private countByDirection(row: number, col: number, direction: Vec2, currentPlayerBitBoard: bigint, enemyBitBoard: bigint, indeces: number[]) {
        let count = 0;
        let step = 1;
        let currentRow = row;
        let currentCol = col;
        let isBlocked = false;
        let isBounded = false;
        while(true) {
            currentRow = row + direction.y * step;
            currentCol = col + direction.x * step;
            if (this.isOutOfBounds(currentRow, currentCol))  {
                isBounded = true;
                break;
            }
            let currentIndex = this.toIndex(currentRow, currentCol);
            if (this.isBitSet(enemyBitBoard, currentIndex)) {
                isBlocked = true; // break by blocked
                break;
            }
            if (!this.isBitSet(currentPlayerBitBoard, currentIndex)) {
                break; // break at empty cell
            } 
            indeces.push(currentIndex);
            count++;
            step++;
        }
        return {
            count: count,
            indeces: indeces,
            isBlocked: isBlocked,
            isBounded: isBounded,
        };
    }

    private getDirectionPattern(row: number, col: number, direction: Vec2, currentPlayerBitBoard: bigint, enemyBitBoard: bigint) {
        let index = this.toIndex(row, col);
        let indeces = [index];
        let backwardDir = {x: -direction.x, y: -direction.y};
        let countForward = this.countByDirection(row, col, direction, currentPlayerBitBoard, enemyBitBoard, indeces);
        let countBackward = this.countByDirection(row, col, backwardDir, currentPlayerBitBoard, enemyBitBoard, indeces);
        let totalCount = 1 + countBackward.count + countForward.count;
        let isLeftBlocked = countBackward.isBlocked;
        let isRightBlocked = countForward.isBlocked;
        let isLeftBounded = countBackward.isBounded;
        let isRightBounded = countForward.isBounded;
        return {
            pattern: GomokuConstant.getPattern(totalCount, isLeftBlocked, isRightBlocked, isLeftBounded, isRightBounded),
            indeces: indeces
        };
    }

    public countPattern(state: GomokuState) {
        let masks = new Array(this.boardLength).fill(0);
        let nDirections = FOUR_DIRECTIONS.length;
        let mark = Array.from({ length: nDirections }, () => new Array(this.boardLength).fill(false));
        let patternCountsForMax: Map<number, number> = new Map();
        let patternCountsForMin: Map<number, number> = new Map();
        let totalValue = 0;
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                var index = this.toIndex(row, col);
                // TODO can NOT skip like that (it will MISS some pattern)
                // NEED TO CACHE WITH DIRECTION INFO (index, direction) -> mask
                // if (masks[index] !== 0) continue;
                let currentValue = this.getValueAt(state, index);
                if (currentValue === 0) continue;
                let isMaxPlayer = currentValue > 0;
                let currentPlayerBitBoard = isMaxPlayer ? state.bitboardMax : state.bitboardMin;
                let enemyBitBoard = isMaxPlayer ? state.bitboardMin : state.bitboardMax;
                let sign = isMaxPlayer ? 1 : -1;
                let patternCounts = isMaxPlayer ? patternCountsForMax : patternCountsForMin;
                for (let directionIndex = 0; directionIndex < nDirections; directionIndex++) {
                    if (mark[directionIndex][index]) continue; // Skip processed direction for this index
                    const direction = FOUR_DIRECTIONS[directionIndex];
                    var directionPattern = this.getDirectionPattern(row, col, direction, currentPlayerBitBoard, enemyBitBoard);
                    if (!directionPattern || !directionPattern.pattern) continue;
                    const partternMask = directionPattern.pattern.mask;
                    patternCounts.set(partternMask, (patternCounts.get(partternMask) || 0) + 1);
                    for (const idx of directionPattern.indeces) {
                        let currentMask = Math.abs(masks[idx]);
                        masks[idx] = (currentMask | partternMask) * sign;
                        totalValue += (directionPattern.pattern.value * sign);
                        // Check for multiple/mixed mask
                        if (partternMask === currentMask) {
                            // Multiple mask (e.g multiple open3, blocked4,  etc.)
                            let multiMaskParttern = GomokuConstant.getMultiMaskPattern(currentMask);
                            if (multiMaskParttern) {
                                patternCounts.set(multiMaskParttern, (patternCounts.get(multiMaskParttern) || 0) + 1);
                            }
                        } else if (currentMask !== 0) {
                            // mixed mask (ex. open 3 x blocked 4)
                            let mixedMask = currentMask | partternMask;
                            patternCounts.set(mixedMask, (patternCounts.get(mixedMask) || 0) + 1);
                        }
                        // mark the inde for this direction
                        mark[directionIndex][idx] = true;
                    }
                }
            }
        }
        return {
            masks: masks,
            patternCountsForMax: patternCountsForMax,
            patternCountsForMin: patternCountsForMin,
            totalValue: totalValue
        }
    }

    public whoIsSureWin(patternCountsForMax: Map<number, number>, patternCountsForMin: Map<number, number>, nextPlayer: number): number{
        var isMaxPlayer = nextPlayer > 0;
        var patternForAttackPlayer = isMaxPlayer ? patternCountsForMax : patternCountsForMin;
        var patternForDefensePlayer = isMaxPlayer ? patternCountsForMin : patternCountsForMax;

        // attack
        var attackOpen4 = patternForAttackPlayer.get(GomokuConstant.PATTERN_OPEN_4) || 0;
        var attackBlocked4 = patternForAttackPlayer.get(GomokuConstant.PATTERN_BLOCKED_4) || 0;
        var attackOpen3 = patternForAttackPlayer.get(GomokuConstant.PATTERN_OPEN_3) || 0;
        var attackBlocked3 = patternForAttackPlayer.get(GomokuConstant.PATTERN_BLOCKED_3) || 0;

        // def
        var defOpen4 = patternForDefensePlayer.get(GomokuConstant.PATTERN_OPEN_4) || 0;
        var defBlocked4 = patternForDefensePlayer.get(GomokuConstant.PATTERN_BLOCKED_4) || 0;
        var defBlocked4x = patternForDefensePlayer.get(GomokuConstant.PATTERN_BLOCKED_4X) || 0;
        var defOpen3xBlocked4 = patternForDefensePlayer.get(GomokuConstant.PATTERN_OPEN_3_X_BLOCKED_4) || 0;
        var defOpen3x = patternForDefensePlayer.get(GomokuConstant.PATTERN_OPEN_3X) || 0;
        
        if (attackOpen4 > 0) return nextPlayer;
        if (attackBlocked4 > 0) return nextPlayer;
        if (attackOpen3 > 0 && defOpen4 === 0 && defBlocked4 === 0) return nextPlayer;
        
        var attackNo4 = attackOpen4 === 0 && attackBlocked4 === 0
        var attackNo3 = attackOpen3 === 0 && attackBlocked3 === 0
        if (defOpen4 > 0 && attackNo4) return -nextPlayer;
        if (defOpen3x > 0 && attackNo4 && attackNo3) return -nextPlayer;
        if (defOpen3xBlocked4 > 0 && attackNo4) return -nextPlayer;
        if (defBlocked4x > 0 && attackNo4) return -nextPlayer;

        return 0;
    }
}