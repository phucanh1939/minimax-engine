import { FourDirections } from "../defines/GomokoConstant";
import { GomokuPattern, PatternType } from "../defines/GomokuPattern";
import { GomokoPieceType } from "../defines/GomokuPieceType";
import { GomokuMove, GomokuState } from "../defines/GomokuState";
import { GomokuEngine } from "./GomokuEngine";

enum MovePriority
{
    None = 0,
    Normal = 1,
    BlockMultiThreat3 = 2,
    ThreatSeq3 = 3,
    BlockMultiThreat4 = 4,
    ThreatSeq4 = 5,
    BlockWin = 6
}

// TODO move threat to another file 
type Threat = {
    pattern: PatternType,
    level: number,
    gain: number,
    rests: number[],
    costs: number[],
}

type MoveData = {
    index: GomokuMove,
    value: number
}

export class ThreatSearchEngine extends GomokuEngine {

    protected pattern2Threat(pattern: GomokuPattern): Threat | null {
        // TODO
    }

    protected getMaxThreatLevel(threats: Threat[]): number {
        let maxLevel = 0;
        for (const threat of threats) {
            if (threat.level > maxLevel) {
                maxLevel = threat.level;
            }
        }
        return maxLevel;
    }
    
    protected isSamePattern(pattern1: GomokuPattern, pattern2: GomokuPattern): boolean {
        if (pattern1.piece !== pattern2.piece) return false;
        if (pattern1.type !== pattern2.type) return false;
        if (pattern1.indeces.length !== pattern2.indeces.length) return false;
        let length = pattern1.indeces.length;
        for (let i = 0; i < length; i++) {
            if (pattern1.indeces[i] !== pattern2.indeces[i] &&              // compare same side
                pattern1.indeces[i] !== pattern2.indeces[length - i - 1]    // compare from revese side
            )
                return false;
        }
        return true;
    }

    protected isWinningPattern(pattern: GomokuPattern): boolean {
        // TODO
    }

    protected hasWinSequenceFrom(threat: Threat): boolean {
        // TODO
    }

    protected findMovesByPriority(): GomokuMove[] {
        let moves: MoveData[] = [];
        let threats: Threat[] = [];
        let maxPriority: MovePriority = MovePriority.None;
        const opponent = -this.currentPlayer;
        let maxOpponentThreatLevel = 0;
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const index = row * this.boardSize + col;
                const cell = this.board[index];
                if (cell !== GomokoPieceType.EMPTY) continue; // Skip cell that not empty
                if (this.hasNeighbor(row, col, 2)) continue; // Skip cell with no neighbor
                
                // ######### current player #########
                let playerValue = 0;
                this.makeMove(index);
                
                // Find pattern if player make a move at this index
                for (const direction of FourDirections) {
                    // forward
                    let pattern = this.getPatternAt(row, col, direction.x, direction.y, true);
                    if (this.isWinningPattern(pattern)) return [index];
                    playerValue += this.getPatternValue(pattern.type);
                    let threat = this.pattern2Threat(pattern);
                    if (threat) threats.push(threat);

                    // backward
                    let backPattern = this.getPatternAt(row, col, -direction.x, -direction.y, true);
                    if (this.isSamePattern(backPattern, pattern)) continue; // skip same pattern 
                    if (this.isWinningPattern(backPattern)) return [index];
                    playerValue += this.getPatternValue(backPattern.type);
                    threat = this.pattern2Threat(backPattern);
                    if (threat) threats.push(threat);
                }

                this.undoMove(index);

                // ######### opponent #########
                let opponentValue = 0;
                let opponentThreats: Threat[] = [];
                this.setValueAt(index, opponent);
                for (const direction of FourDirections) {
                    // forward
                    let pattern = this.getPatternAt(row, col, direction.x, direction.y, true);
                    if (this.isWinningPattern(pattern)) {
                        let priority = MovePriority.BlockWin;
                        if (priority > maxPriority) {
                            moves = [{index: index, value: 0}];
                            maxPriority = priority;
                        }
                    }
                    opponentValue += this.getPatternValue(pattern.type);
                    let threat = this.pattern2Threat(pattern);
                    if (threat) opponentThreats.push(threat);

                    // backward
                    let backPattern = this.getPatternAt(row, col, -direction.x, -direction.y, true);
                    if (this.isSamePattern(backPattern, pattern)) continue; // skip same pattern 
                    if (this.isWinningPattern(backPattern)) {
                        let priority = MovePriority.BlockWin;
                        if (priority > maxPriority) {
                            moves = [{index: index, value: 0}];
                            maxPriority = priority;
                        }
                    }
                    opponentValue += this.getPatternValue(backPattern.type);
                    threat = this.pattern2Threat(backPattern);
                    if (threat) opponentThreats.push(threat);
                }
                if (opponentThreats.length > 1) {
                    let threatLevel = this.getMaxThreatLevel(opponentThreats);
                    if (threatLevel > 0) {
                        let priority = threatLevel === 3 ? MovePriority.BlockMultiThreat3 : MovePriority.BlockMultiThreat4;
                        if (priority > maxPriority) {
                            moves = [{index: index, value: 0}];
                            maxPriority = priority;
                        }
                        if (threatLevel > maxOpponentThreatLevel) {
                            maxOpponentThreatLevel = threatLevel;
                        }
                    }
                }

                this.clearValueAt(index);

                // #### NORMAL MOVE
                if (maxPriority <= MovePriority.Normal) {
                    maxPriority = MovePriority.Normal;
                    moves.push({index: index, value: playerValue + opponentValue});
                }
            }
        }

        // ######### Check for win sequence #########
        // Only do this if max priority < BlockWin (there is no winning to break)
        if (maxPriority < MovePriority.BlockWin) {
            for (const threat of threats) {
                // If found a win sequence from a threat
                if (this.hasWinSequenceFrom(threat, maxOpponentThreatLevel)) {
                    // just follow it
                    return [threat.gain];
                }
            }
        }

        moves = moves.sort((a, b) => b.value - a.value).slice(0, this.movesCutoff);
        return moves.map(move => move.index);
    }

    public findBestMove(state: GomokuState): GomokuMove | null {
        this.loadState(state);
        let moves = this.findMovesByPriority();
        let bestMove = this.findBestMoveIn(moves, 1);
        this.clearState();
        return bestMove;

    }
};