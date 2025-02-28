import { DefaultEngine } from "./DefaultEngine";
import { GomokuEngine, GomokuEngineConfig, GomokuEngineType } from "./GomokuEngine";

export class GomokuEngineFactory {
    public static create(config: GomokuEngineConfig): GomokuEngine {
        return new DefaultEngine(config);
    }
}