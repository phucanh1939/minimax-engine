import { GomokoPieceType } from "../defines/GomokuPieceType";
import { GomokuMove, GomokuState } from "../defines/GomokuState";
import { GomokuEngine } from "./GomokuEngine";

enum MovePriority
{
    None = 0,
    Normal = 1,
    BlockMultiThreat3 = 2,
    ThreatSeq3 = 3,
    BlockMutiThreat4 = 4,
    ThreatSeq4 = 5,
    BlockWin = 6
}

interface Threat {
    gain: number,
    costs: number[],
    rests: number[]
}

export class ThreatSearchEngine extends GomokuEngine {

    protected isNeedOneMoveOnly(priority: MovePriority) {
        return priority >= MovePriority.BlockMultiThreat3;
    }

    protected isBlockWinMove(row: number, col: number): boolean {
        const index = row * this.boardSize + col;
        const opponent = this.getOpponent();
        this.setValueAt(index, opponent);
        var result = this.hasWinningLine(index);
        this.clearValueAt(index);
        return result;
    }

    /**
     * Threat level:
     * - 0: no threat
     * - 3: open 3
     * - 4: broken 4, blocked 4
     */
    protected getThreatSequenceLevel(row: number, col: number): number {
        return 0;
    }

    protected getBlockMultiThreatsLevel(row: number, col: number): number {
        return 0;
    }

    protected getMovePriority(row: number, col: number, lowestPriority: MovePriority): MovePriority {
        if (lowestPriority <= MovePriority.BlockWin && this.isBlockWinMove(row, col))
            return MovePriority.BlockWin;
        var seqLevel = 0;
        if (lowestPriority <= MovePriority.ThreatSeq4) {
            seqLevel =  this.getThreatSequenceLevel(row, col);
            if (seqLevel === 4) return MovePriority.ThreatSeq4;
        }
        var blockMultiThreatsLevel = 0;
        if (lowestPriority <= MovePriority.BlockMutiThreat4) {
            blockMultiThreatsLevel = this.getBlockMultiThreatsLevel(row, col);
            if (blockMultiThreatsLevel === 4) return MovePriority.BlockMutiThreat4;
        }
        if (lowestPriority <= MovePriority.ThreatSeq3) {
            if (seqLevel === 3) return MovePriority.ThreatSeq3;
        }
        if (lowestPriority <= MovePriority.BlockMultiThreat3) {
            if (blockMultiThreatsLevel === 3) return MovePriority.BlockMultiThreat3;
        }
        return MovePriority.Normal;
    }

    protected findMovesByPriority(): GomokuMove[] {
        let moves: GomokuMove[] = [];
        let lowestPriority: MovePriority = MovePriority.None;
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const index = row * this.boardSize + col;
                const cell = this.board[index];
                if (cell !== GomokoPieceType.EMPTY) continue; // Skip cell that not empty
                if (this.hasNeighbor(row, col, 2)) continue; // Skip cell with no neighbor
                if (this.isWinningMove(index)) { this.clearState(); return [index]; }
                var priority = this.getMovePriority(row, col, lowestPriority);
                if (priority < lowestPriority) continue; // Skip move with lower priority
                if (priority > lowestPriority) {
                    moves = [];
                    lowestPriority = priority; this.isNeedOneMoveOnly(priority) ? priority + 1 : priority;
                }
                moves.push(index);
            }
        }
        return moves;
    }

    public findBestMove(state: GomokuState): GomokuMove | null {
        this.loadState(state);
        let moves = this.findMovesByPriority();
        var bestMove = this.findBestMoveIn(moves, 1);
        this.clearState();
        return bestMove;

    }
};