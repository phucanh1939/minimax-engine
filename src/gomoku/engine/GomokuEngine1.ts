import { GomokuEngine } from "./GomokuEngine";

export class GomokuEngine1 extends GomokuEngine {
    public evaluate(): number {
        return Math.floor(Math.random() * 20001) - 10000;
    }
}