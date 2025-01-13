import { GomokuState } from "../defines/GomokuState";
import { GomokuEngine } from "../engine/GomokuEngine";
import { GomokuEngine1 } from "../engine/GomokuEngine1";
import { GomokuEngine2 } from "../engine/GomokuEngine2";

export class GomokuBot {
    private engine: GomokuEngine;

    constructor() {
        const config = {
            lookahead: 1,
            type: 2,
        }

        // Init engine with config
        switch (config.type) {
            case 1:
                this.engine = new GomokuEngine1(config.lookahead);
                break;
            case 2:
                this.engine = new GomokuEngine2(config.lookahead);
                break;
            default:
                this.engine = new GomokuEngine(config.lookahead);
        }
    }

    findBestMove(gameState: GomokuState) {
        var bestMove = this.engine.findBestMove(gameState);
        if (bestMove) return bestMove;
        return this.randomMove(gameState); // Just in case 
    }
    
    randomMove(gameState: GomokuState) {
        return -1;
    }
}