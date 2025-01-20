import { DefaultEngine } from "./DefaultEngine";
import { GomokuEngine, GomokuEngineConfig, GomokuEngineType } from "./GomokuEngine";
import { RandomDiagonalEngine } from "./RandomDiagonalEngine";

export class GomokuEngineFactory {
    public static create(config: GomokuEngineConfig): GomokuEngine {
        switch (config.type) {
            case GomokuEngineType.NoDiagonal:
                return new RandomDiagonalEngine(config);
        }
        return new DefaultEngine(config);
    }
}