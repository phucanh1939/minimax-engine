export interface StateCacheEntry {
    depth: number,
    value: number,
    flag: number,
}

export enum StateCacheFlag {
    Exact =  0,
    Lower = -1,
    Upper =  1,
}


/**
 * Used to find best move from a game state
 * Valid game: 2 players, zero-sum, perfect information
 */
export abstract class MinimaxEngine<TGameState, TGameMove, TStateHash> {
    protected lookahead = 1;
    protected treeCache: Map<TStateHash, StateCacheEntry> = new Map();

    public abstract loadState(state: TGameState): void;
    public abstract clearState(): void;
    public abstract evaluate(hash: TStateHash): number;
    public abstract evaluateTerminal(hash: TStateHash): number;
    public abstract getStateHash(): TStateHash;
    public abstract isTerminal(): boolean;
    public abstract getPotentialMoves(): TGameMove[];
    public abstract getNextMoves(): TGameMove[];
    public abstract makeMove(move: TGameMove): boolean;
    public abstract undoMove(move: TGameMove): boolean;
    public abstract getCurrentPlayer(): number;

    protected negamaxCalls = 0;
    protected evaluateCalls = 0;
    protected terminalCalls = 0;
    protected evaluateTime = 0;
    protected ternimalExecutionTime = 0;
    protected hashCalls = 0;
    protected hashTime = 0;
    protected leafNodeCount = 0;

    public setLookAhead(lookahead: number) {
        this.lookahead = lookahead;
    }

    public resetGame() {
        this.treeCache.clear();
    }

    protected negamax(depth: number, alpha: number, beta: number, color: number): number {
        this.negamaxCalls++;
        // Save alpha
        const alphaOrigin = alpha;

        // Check cache
        var startTime = Date.now();
        var hash = this.getStateHash();
        var entry = this.treeCache.get(hash);
        this.hashTime += (Date.now()) - startTime;
        this.hashCalls++;
        if (entry && entry.depth >= depth) {
            if (entry.flag == StateCacheFlag.Exact) return entry.value;
            else if (entry.flag == StateCacheFlag.Lower && entry.value > alpha) alpha = entry.value;
            else if (entry.flag == StateCacheFlag.Upper && entry.value < beta) beta = entry.value
            if (alpha >= beta) return entry.value;
        }

        // Check for leaf
        if (depth === 0) {
            var startTime = Date.now();
            var result = color * this.evaluate(hash);
            this.evaluateTime += (Date.now() - startTime);
            this.evaluateCalls++;
            this.leafNodeCount++;
            return result
        }
        
        var startTime = Date.now();
        var isTerminal = this.isTerminal();
        this.ternimalExecutionTime += Date.now() - startTime;
        this.terminalCalls++;

        if (isTerminal) {
            this.leafNodeCount++;
            return color * this.evaluateTerminal(hash);
        }

        const moves = this.getPotentialMoves();
        var maxValue = -Infinity;
        for (const move of moves) {
            this.makeMove(move);
            const value = -this.negamax(depth - 1, -beta, -alpha, -color);
            this.undoMove(move);
            if (value > maxValue) {
                maxValue = value;
                if (maxValue > alpha) alpha = maxValue;
            }
            if (alpha >= beta) break;
        }

        // Update trans table
        const flag = maxValue <= alphaOrigin ? StateCacheFlag.Upper : maxValue >= beta ? StateCacheFlag.Lower : StateCacheFlag.Exact;
        // const flag = maxValue <= alpha ? TransTableFlag.Upper : maxValue >= beta ? TransTableFlag.Lower : TransTableFlag.Exact;
        this.treeCache.set(hash, {value: maxValue, depth: depth, flag: flag});
        return maxValue;
    }

    public findBestMove(state: TGameState): TGameMove | null {
        this.loadState(state);
        const moves = this.getPotentialMoves();
        const bestMove = this.findBestMoveIn(moves, this.lookahead);
        this.clearState();
        return bestMove;
    }

    protected resetTestValue() {
        this.negamaxCalls = 0;
        this.evaluateCalls = 0;
        this.leafNodeCount = 0;
        this.terminalCalls = 0;
        this.evaluateTime = 0;
        this.ternimalExecutionTime = 0;
        this.hashTime = 0;
    }

    protected printTestValue() {
        // console.log("   - negamaxCalls = " + this.negamaxCalls);
        // console.log("   - leafNodeCount = " + this.leafNodeCount);
        // console.log("   - evaluateCalls = " + this.evaluateCalls);
        // console.log("   - terminalCalls = " + this.terminalCalls);
        // console.log("   - evaluateTime = " + this.evaluateTime + " (ms)");
        // console.log("   - ternimalExecutionTime = " + this.ternimalExecutionTime + " (ms)");
        // console.log("   - hashTime = " + this.hashTime + " (ms)");
    }

    protected findBestMoveIn(moves: TGameMove[], depth: number): TGameMove | null {
        this.resetTestValue();
        // if (moves.length === 1) return moves[0];
        let bestMoves: TGameMove[] = [];
        let bestValue = -Infinity;
        const player = this.getCurrentPlayer();
        // console.log("   - depth = " + depth);
        // console.log("   - movesCount = " + moves.length);
        var start = Date.now();
        for (const move of moves) {
            if (!this.makeMove(move)) continue;
            const value = -this.negamax(depth - 1, -Infinity, Infinity, -player);
            // console.log(`   - Move ${move}'s value = ${value}`);
            this.undoMove(move);
            if (value > bestValue) {
                bestMoves = []
                bestMoves.push(move);
                bestValue = value;
            } else if (value === bestValue) {
                bestMoves.push(move);
            }
        }
        var time = Date.now() - start;
        this.printTestValue();
        // console.log("   - totalTime = " + time);
        // console.log("|||||||||||||||||||||||||||||||||||||||||||||");
        if (bestMoves.length === 0) return null;
        if (bestMoves.length === 1) return bestMoves[0];
        const randomIndex = Math.floor(Math.random() * bestMoves.length);
        return bestMoves[randomIndex];
    }
}
