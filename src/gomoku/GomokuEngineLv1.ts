import { GomokuEngine, GomokuState } from "./GomokuEngine";

export class GomokuEngineLv1 extends GomokuEngine {
    // constructor(boardSize: number, lookAhead: number) {
    //     super(boardSize, lookAhead);
    // }
    
    public evaluate(state: GomokuState): number {
        return Math.floor(Math.random() * 20001) - 10000;
    }
}