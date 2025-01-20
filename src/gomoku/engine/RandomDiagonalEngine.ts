import { FourDirections, TwoDirections } from "../defines/GomokuConstant";
import { GomokuPattern, PatternType, WinValue } from "../defines/GomokuPattern";
import { GomokuPieceType } from "../defines/GomokuPieceType";
import { GomokuHash, GomokuMove, GomokuState } from "../defines/GomokuState";
import { GomokuEngine } from "./GomokuEngine";

export class RandomDiagonalEngine extends GomokuEngine {
    public evaluate(hash: GomokuHash): number {
        const cacheValue = this.stateCache.get(hash);
        if (cacheValue !== null && cacheValue !== undefined) {
            return cacheValue;
        }
        var random = Math.random();
        var directions = random > 0.2 ? FourDirections : TwoDirections;
        var patternCount = this.countPattern(directions);
        var value = patternCount.value;
        if (this.checkSureWin && value < WinValue && value > -WinValue) {
            var sureWinPlayer = this.whoSureWin(patternCount.maxPatterns, patternCount.minPatterns);
            if (sureWinPlayer > 0) {
                value = WinValue;
            }
            else if (sureWinPlayer < 0) {
                value = -WinValue;
            }
        }
        this.stateCache.set(hash, value);
        return value;
    }

    protected isNeedToBlock(pattern: GomokuPattern) {
        return pattern.type == PatternType.OPEN_4 || this.getPatternValue(pattern.type) >= WinValue;
    }

    protected findMostBlockMove(): GomokuMove {
        const opponent = -this.currentPlayer;
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const index = row * this.boardSize + col;
                const cell = this.board[index];
                if (cell !== GomokuPieceType.EMPTY) continue; // Skip cell that not empty
                if (!this.hasNeighbor(row, col, 1)) continue; // Skip cell with no neighbor
                // ######### opponent #########
                this.setValueAt(index, opponent);
                for (const direction of FourDirections) {
                    // forward
                    let pattern = this.getPatternAt(row, col, direction.x, direction.y, true);
                    if (this.hasWinningLine(index) || this.isNeedToBlock(pattern)) {                        
                        this.clearValueAt(index);
                        return index;
                    }
                }
                this.clearValueAt(index);
            }
        }
        return -1;
    }

    public findBestMove(state: GomokuState): GomokuMove | null {
        this.loadState(state);
        let blockMove = this.findMostBlockMove();
        if (blockMove >= 0) return blockMove;
        let moves = this.getNextMovesWithCutoff();
        let bestMove = this.findBestMoveIn(moves, 1);
        this.clearState();
        return bestMove;
    }
};
