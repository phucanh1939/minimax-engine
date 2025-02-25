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

    public setLookAhead(lookahead: number) {
        this.lookahead = lookahead;
    }

    public resetGame() {
        this.treeCache.clear();
    }

    protected negamax(depth: number, alpha: number, beta: number, color: number): number {
        // Save alpha
        const alphaOrigin = alpha;

        // Check cache
        var hash = this.getStateHash();
        var entry = this.treeCache.get(hash);
        if (entry && entry.depth >= depth) {
            if (entry.flag == StateCacheFlag.Exact) return entry.value;
            else if (entry.flag == StateCacheFlag.Lower && entry.value > alpha) alpha = entry.value;
            else if (entry.flag == StateCacheFlag.Upper && entry.value < beta) beta = entry.value
            if (alpha >= beta) return entry.value;
        }

        // Check for leaf
        if (depth === 0) return color * this.evaluate(hash);
        if (this.isTerminal()) return color * this.evaluateTerminal(hash);

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

    protected findBestMoveIn(moves: TGameMove[], depth: number): TGameMove | null {
        if (moves.length === 1) return moves[0];
        let bestMoves: TGameMove[] = [];
        let bestValue = -Infinity;
        const player = this.getCurrentPlayer();
        for (const move of moves) {
            if (!this.makeMove(move)) continue;
            const value = -this.negamax(depth - 1, -Infinity, Infinity, -player);
            this.undoMove(move);
            if (value > bestValue) {
                bestMoves = []
                bestMoves.push(move);
                bestValue = value;
            } else if (value === bestValue) {
                bestMoves.push(move);
            }
        }
        if (bestMoves.length === 0) return null;
        if (bestMoves.length === 1) return bestMoves[0];
        const randomIndex = Math.floor(Math.random() * bestMoves.length);
        return bestMoves[randomIndex];
    }
}
