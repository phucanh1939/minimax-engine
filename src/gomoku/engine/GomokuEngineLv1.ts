import { GomokuEngine } from "./GomokuEngine";

export class GomokuEngineLv1 extends GomokuEngine {
    // constructor(boardSize: number, lookahead: number) {
    //     super(boardSize, lookahead);
    // }
    
    public evaluate(): number {
        return Math.floor(Math.random() * 20001) - 10000;
    }
}