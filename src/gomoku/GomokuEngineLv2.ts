import { GomokuEngine, GomokuState } from "./GomokuEngine";



export class GomokuEngineLv2 extends GomokuEngine {

    public evaluate(state: GomokuState): number {
        var result = this.countPattern(state);
        if (result.totalValue === Infinity || result.totalValue === -Infinity)
            return result.totalValue;
        var sureWinPlayer = this.whoIsSureWin(result.patternCountsForMax, result.patternCountsForMin, state.currentPlayer);
        // if (sureWinPlayer !== 0) console.warn("######### SURE WIN: " + sureWinPlayer);
        if (sureWinPlayer > 0) return Infinity;
        if (sureWinPlayer < 0) return -Infinity;
        return result.totalValue;
    }
};