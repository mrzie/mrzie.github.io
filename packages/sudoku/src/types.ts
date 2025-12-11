export type CellValue = number | null;
export type Notes = Set<number>;

export interface GameState {
    puzzle: CellValue[][];
    solution: CellValue[][];
    userInput: CellValue[][];
    notes: Notes[][];
    errors: boolean[][];
}
