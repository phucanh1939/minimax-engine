import { MinimaxEngine } from "../../minimax/MinimaxEngine";
import { GomokuHash, GomokuMove, GomokuState, Vec2 } from "../defines/GomokuState";
import { EightDirections, FourDirections, WinningCount } from "../defines/GomokoConstant";
import { PatternMap, PatternType, PatternValue, PatternValueMap, WinValue } from "../defines/GomokuPattern";
import { GomokoPieceType } from "../defines/GomokuPieceType";

const MovesCutOff = 8;

export class GomokuEngine extends MinimaxEngine<GomokuState, GomokuMove, GomokuHash> {
    protected board: number[] = [];
    protected boardSize: number = 0;
    protected currentPlayer: number = 0;
    protected moves: GomokuMove[] = [];
    protected stateCache: Map<number, number> = new Map();

    constructor(lookahead: number) {
        super();
        this.lookahead = lookahead;
    }

    public getCurrentSign(): number {
        return this.currentPlayer === GomokoPieceType.MAX ? 1 : -1;
    }

    public evaluate(hash: GomokuHash): number {
        const cacheValue = this.stateCache.get(hash);
        if (cacheValue !== null && cacheValue !== undefined) {
            return cacheValue;
        }
        var patternCount = this.countPattern();
        var value = patternCount.value;
        if (value < WinValue && value > -WinValue) {
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

    public evaluateTerminal(hash: GomokuHash): number {
        var value =  this.currentPlayer > 0 ? WinValue : - WinValue;
        this.stateCache.set(hash, value);
        return value;
    }

    public loadState(state: GomokuState) {
        this.board = state.board;
        this.boardSize = state.boardSize;
        this.currentPlayer = state.currentPlayer;
        this.moves.push(state.lastMove);
    }

    public clearState(): void {
        this.moves = [];
    }

    public resetGame(): void {
        super.resetGame();
        this.stateCache.clear();
    }

    public getStateHash(): number {
        const base = 31; // A small prime number for hashing
        const mod = 1e9 + 7; // A large prime number for modulo
        const addition = 10; // to make value positive
    
        let hash = 0;
    
        // Calculate the hash for the board
        for (let i = 0; i < this.board.length; i++) {
            hash = (hash * base + this.board[i] + addition) % mod;
        }
    
        // Incorporate the currentPlayer into the hash
        hash = (hash * base + this.currentPlayer + addition) % mod;
    
        return hash;
    }

    public getLastMove(): GomokuMove {
        return this.moves[this.moves.length - 1];
    }

    public isTerminal(): boolean {
        return this.hasWinningLine(this.getLastMove());
    }

    public getCurrentPlayer(): number {
        return this.currentPlayer;
    }

    public getNextMoves(): GomokuMove[] {
        let moves = [];
        const isMaxPlayer = this.currentPlayer === GomokoPieceType.MAX;
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const index = row * this.boardSize + col;
                if (this.board[index] === 0 && this.hasNeighbor(row, col)) {
                    moves.push(index);
                }
            }
        }
        return moves;
    }

    public getNextMovesWithCutoff(): GomokuMove[] {
        let moves = [];
        let lastValidIndex = -1;
        const isMaxPlayer = this.currentPlayer === GomokoPieceType.MAX;
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const index = row * this.boardSize + col;
                if (this.board[index] === 0 && this.hasNeighbor(row, col)) {
                    lastValidIndex = index;
                    this.makeMove(index);
                    if (this.hasWinningLine(index)) {
                        this.undoMove(index);
                        return [index];
                    }
                    const hash = this.getStateHash();
                    const value = this.evaluate(hash);
                    const isEnemyWillWin = (value * this.currentPlayer) >= WinValue;
                    this.undoMove(index);
                    if (isEnemyWillWin) continue; // ignore move that allow enemy to win
                    moves.push({ index: index, value: value });
                    console.log(`------move ${index}: ${value}`);
                }
            }
        }
        if (moves.length === 0) {
            console.log("===========> LOSE ANY WAY!!!! ");
            return [lastValidIndex];
        }
        const cutoffMoves = moves
            .sort((a, b) => isMaxPlayer ? b.value - a.value : a.value - b.value) // Sort based on `currentPlayer`
            .slice(0, MovesCutOff) // Take the first `count` moves;
        // console.log("NEXT MOVES: " + JSON.stringify(cutoffMoves));
        return cutoffMoves.map(move => move.index); // Extract the `index` property
    }

    public makeMove(move: GomokuMove): boolean {
        if (move < 0 || move >= this.board.length) return false;
        if (this.board[move] !== GomokoPieceType.EMPTY) return false;
        this.board[move] = this.currentPlayer;
        this.currentPlayer = -this.currentPlayer;
        this.moves.push(move);
        return true;
    }

    public undoMove(move: GomokuMove): boolean {
        if (move < 0 || move >= this.board.length) return false;
        this.board[move] = 0;
        this.currentPlayer = -this.currentPlayer;
        this.moves.pop();
        return true;
    }

    // ==========================================================

    protected countPiece(piece: number, fromRow: number, fromCol: number, dx: number, dy: number) {
        let step = 1;
        let count = 0;
        while (true) {
            const currRow = fromRow + step * dy;
            const currCol = fromCol + step * dx;
            if (this.isOutOfBounds(currRow, currCol)) break;
            const currIndex = currRow * this.boardSize + currCol;
            if (this.board[currIndex] !== piece) break;
            count++;
            step++;
        }
        return count;
    }

    protected hasWinningLine(index: number): boolean {
        if (index < 0 || index >= this.board.length) return false;
        var piece = this.board[index];
        if (piece === GomokoPieceType.EMPTY) return false;
        if (piece === GomokoPieceType.BLOCKER) return false;
        const row = Math.floor(index / this.boardSize);
        const col = index % this.boardSize;
        for (const direction of FourDirections) {
            var count = 1;
            count += this.countPiece(piece, row, col, direction.x, direction.y);
            if (count >= WinningCount) return true;
            count += this.countPiece(piece, row, col, -direction.x, -direction.y);
            if (count >= WinningCount) return true;
        }
        return false;
    }

    public hasNeighbor(row: number, col: number, range: number = 1): boolean {
        for (const direction of EightDirections) {
            for (let step = 1; step <= range; step++) {
                const toRow = row + step * direction.y;
                const toCol = col + step * direction.x;
                if (this.isOutOfBounds(toRow, toCol)) continue;
                const index = toRow * this.boardSize + toCol;
                if (this.board[index] !== 0) return true;
            }
        }
        return false;
    }

    public isOutOfBounds(row: number, col: number): boolean {
        return row < 0 || row >= this.boardSize || col < 0 || col >= this.boardSize;
    }

    // ==================================================================================
    protected getPatternValueAt(row: number, col: number, player: number): number {
        if (this.isOutOfBounds(row, col)) return PatternValue.BLOCKER;
        const index = row * this.boardSize + col;
        const piece = this.board[index];
        if (piece === 0) return PatternValue.EMPTY; // if cell empty, return 0
        if (piece === player) return PatternValue.PIECE; // if this is player's cell -> return pattern for count
        return PatternValue.BLOCKER;  // other case, return as blocker piece
    }

    protected getPatternAt(row: number, col: number, direction: Vec2) {
        if (this.isOutOfBounds(row, col)) return { indeces: [], pattern: PatternType.NONE }
        // init to the back piece of this direction
        const index = row * this.boardSize + col;
        const piece = this.board[index];
        if (piece === GomokoPieceType.EMPTY || piece === GomokoPieceType.BLOCKER)
            return { indeces: [], pattern: PatternType.NONE }
        // init the pattern value to the back piece from current position
        const backRow = row - direction.y;
        const backCol = col - direction.x;
        const backIndex = backRow * this.boardSize + backCol;
        var pattern = this.getPatternValueAt(backRow, backCol, piece);
        // console.log(`Back of index ${index} - ${backIndex}: ${pattern.toString(16)}`);
        // Add current piece
        pattern = (pattern << 4) | PatternValue.PIECE;
        let indeces = [index];
        let countEmpty = 0;
        for (let step = 1; step <= WinningCount; step++) {
            const currRow = row + step * direction.y;
            const currCol = col + step * direction.x;
            const currIndex = currRow * this.boardSize + currCol;
            const patternValue = this.getPatternValueAt(currRow, currCol, piece);
            pattern = (pattern << 4) | patternValue;
            // Break when reach 2nd empty space
            if (patternValue === PatternValue.EMPTY) {
                countEmpty++;
                if (countEmpty >= 2) break;
            }
            // Break when reach a blocker
            if (patternValue === PatternValue.BLOCKER) {
                break;
            }
            if (patternValue === PatternValue.PIECE) {
                indeces.push(currIndex);
            }
        }

        return {
            indeces: indeces,
            pattern: this.getPatternType(pattern)
        }
    }

    public countPattern() {
        const directions = FourDirections;
        const directionLength = directions.length;
        var value = 0;
        var maxPatterns: Map<PatternType, number> = new Map();
        var minPatterns: Map<PatternType, number> = new Map();
        var processedCells: boolean[][] = Array.from({ length: directionLength }, () => Array(this.boardSize).fill(false));
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const index = row * this.boardSize + col;
                const piece = this.board[index];
                if (piece !== GomokoPieceType.MAX && piece !== GomokoPieceType.MIN) continue; // TODO skip empty cell & BLOCKER
                const isMaxPlayer = piece === GomokoPieceType.MAX;
                const patterns = isMaxPlayer ? maxPatterns : minPatterns;
                const sign = isMaxPlayer ? 1 : -1;
                const weight = piece === this.currentPlayer ? 1.5 : 1;
                for (let directionIndex = 0; directionIndex < directionLength; directionIndex++) {
                    if (processedCells[directionIndex][index]) continue;
                    const direction = directions[directionIndex];
                    var directionPattern = this.getPatternAt(row, col, direction);
                    if (!directionPattern.pattern) continue;
                    const pattern = directionPattern.pattern;
                    // mark all the indeces in pattern as processed for this direction
                    for (const idx of directionPattern.indeces) {
                        processedCells[directionIndex][idx] = true;
                    }
                    // count the pattern
                    const count = (patterns.get(pattern) || 0) + 1;
                    patterns.set(directionPattern.pattern, count);
                    const patternValue = this.getPatternValue(directionPattern.pattern);
                    if (patternValue >= WinValue) return {value: WinValue * sign, maxPatterns: maxPatterns, minPatterns: minPatterns};
                    // console.log(`PLAYER ${piece}: ${PatternType[directionPattern.pattern]} at ${index} in direction ${direction.x} ${direction.y}`);
                    // update the value
                    value += (sign * patternValue * weight * count);
                }
            }
        }

        return {
            value: value,
            maxPatterns: maxPatterns,
            minPatterns: minPatterns
        }
    }

    protected whoSureWin(maxPatterns: Map<PatternType, number>, minPatterns: Map<PatternType, number>): number {
        var currentPlayerPatterns, nextPlayerPatterns;
        if (this.currentPlayer === GomokoPieceType.MAX) {
            currentPlayerPatterns = maxPatterns;
            nextPlayerPatterns = minPatterns;
        } else {
            currentPlayerPatterns = minPatterns;
            nextPlayerPatterns = maxPatterns;
        }

        var currentPlayerOpen4Count = currentPlayerPatterns.get(PatternType.OPEN_4) || 0;
        var currentPlayerBlocked4Count = currentPlayerPatterns.get(PatternType.BLOCKED_4) || 0;
        var currentPlayerOpenBroken4Count = currentPlayerPatterns.get(PatternType.OPEN_BROKEN_4) || 0;
        var currentPlayerBlockedBroken4Count = currentPlayerPatterns.get(PatternType.BLOCKED_BROKEN_4) || 0;
        var currentPlayerOpen3Count = currentPlayerPatterns.get(PatternType.OPEN_3) || 0;
        var currentPlayerOpenBroken3Count = currentPlayerPatterns.get(PatternType.OPEN_BROKEN_3) || 0;

        var nextPlayerOpen4Count = nextPlayerPatterns.get(PatternType.OPEN_4) || 0;
        var nextPlayerBlocked4Count = nextPlayerPatterns.get(PatternType.BLOCKED_4) || 0;
        var nextPlayerOpenBroken4Count = nextPlayerPatterns.get(PatternType.OPEN_BROKEN_4) || 0;
        var nextPlayerBlockedBroken4Count = nextPlayerPatterns.get(PatternType.BLOCKED_BROKEN_4) || 0;
        var nextPlayerOpen3Count = nextPlayerPatterns.get(PatternType.OPEN_3) || 0;
        var nextPlayerOpenBroken3Count = nextPlayerPatterns.get(PatternType.OPEN_BROKEN_3) || 0;
        var nextPlayer4Count = nextPlayerOpen4Count + nextPlayerBlocked4Count + nextPlayerOpenBroken4Count + nextPlayerBlockedBroken4Count;
        var nextPlayer4PossibleOpen4Count = nextPlayerOpen3Count + nextPlayerOpenBroken3Count;
        var nextPlayer4AndOpen3Count = nextPlayer4Count + nextPlayer4PossibleOpen4Count;

        var currentPlayerHas4 = currentPlayerOpen4Count > 0 ||
            currentPlayerBlocked4Count > 0 ||
            currentPlayerOpenBroken4Count > 0 ||
            currentPlayerBlockedBroken4Count > 0;
        var currentPlayerHasOpen4NextTurn = currentPlayerOpen3Count > 0 ||
            currentPlayerOpenBroken3Count > 0;
        var nextPlayerHas4 = nextPlayerOpen4Count > 0 ||
            nextPlayerBlocked4Count > 0 ||
            nextPlayerOpenBroken4Count > 0 ||
            nextPlayerBlockedBroken4Count > 0;

        if (currentPlayerHas4 || (currentPlayerHasOpen4NextTurn && !nextPlayerHas4)) {
            return this.currentPlayer;
        }

        if (nextPlayerOpen4Count > 0 ||
            nextPlayer4Count > 1 ||
            nextPlayer4AndOpen3Count > 1 ||
            (nextPlayer4PossibleOpen4Count > 1 && !currentPlayerHasOpen4NextTurn)
        ) {
            return -this.currentPlayer;
        }
        return 0;
    }

    protected getPatternType(pattern: number): PatternType {
        return PatternMap.get(pattern) || PatternType.NONE;
    }
    
    protected getPatternValue(pattern: PatternType): number {
        return PatternValueMap.get(pattern) || 0;
    }
}