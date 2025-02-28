export class ZobristHasher {
  private zobristTable: bigint[][];
  private hash: bigint;
  private size: number;

  constructor(boardSize: number) {
    this.size = boardSize;
    this.hash = 0n;
    this.zobristTable = this.initTable();
  }

  private initTable(): bigint[][] {
    const table: bigint[][] = [];
    const totalCells = this.size * this.size;

    for (let index = 0; index < totalCells; index++) {
      table[index] = [
        this.randomBigInt(), // Player -1
        this.randomBigInt(), // Player 1
        this.randomBigInt(), // Custom Blocker (2)
      ];
    }
    return table;
  }

  private randomBigInt(): bigint {
    const randomValues = crypto.getRandomValues(new Uint32Array(2));
    return (BigInt(randomValues[0]) << 32n) | BigInt(randomValues[1]);
  }

  public setValue(index: number, value: number): void {
    this.hash ^= BigInt(this.zobristTable[index][this.valueToIndex(value)]);
  }

  public clearValue(index: number, value: number): void {
    this.hash ^= BigInt(this.zobristTable[index][this.valueToIndex(value)]);
  }

  public getHash(): bigint {
    return this.hash;
  }
  
  public clear(): void {
    this.hash = 0n;
  }

  private valueToIndex(value: number): number {
    if (value < 0) return 0;
    if (value === 3) return 2;
    return value;
  }
}
