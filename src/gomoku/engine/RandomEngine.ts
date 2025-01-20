import { GomokuEngine } from "./GomokuEngine";

export class RandomEngine extends GomokuEngine {
    public evaluate(): number {
        return Math.floor(Math.random() * 20001) - 10000;
    }
}