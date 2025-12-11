import React, {useState, useEffect} from 'react';
import {makepuzzle, ratepuzzle, solvepuzzle} from 'sudoku';
import {styled} from '@linaria/react';
import './index.css';
import {GameState, CellValue, Notes, DifficultyKey} from './types';
import {SudokuHeader} from './components/Header';
import {SudokuGrid} from './components/Grid';
import {NumberPad} from './components/NumberPad';
import {ActionButtons} from './components/ActionButtons';

const Container = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 16px;
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
`;

const Spacer = styled.div`
    height: env(safe-area-inset-bottom, 16px);
`;

const STORAGE_KEY = 'sudoku-game-state';
const STORAGE_DIFFICULTY_KEY = 'sudoku-difficulty';

const DIFFICULTY_CONFIG: Record<DifficultyKey, {label: string; range: [number, number]}> = {
    easy: {label: '简单', range: [0, 1]},
    medium: {label: '普通', range: [1, 3]},
    hard: {label: '困难', range: [3, Infinity]},
};

const DIFFICULTY_OPTIONS = (Object.keys(DIFFICULTY_CONFIG) as DifficultyKey[]).map(key => ({
    value: key,
    label: DIFFICULTY_CONFIG[key].label,
}));

const distanceToRange = (value: number, [min, max]: [number, number]) => {
    if (value < min) return min - value;
    if (value > max) return value - max;
    return 0;
};

const convertToGrid = (puzzle: number[]): CellValue[][] => {
    const grid: CellValue[][] = [];
    for (let i = 0; i < 9; i++) {
        grid[i] = [];
        for (let j = 0; j < 9; j++) {
            const idx = i * 9 + j;
            const value = puzzle[idx];
            grid[i][j] = value === null ? null : value + 1;
        }
    }
    return grid;
};

const generateNewGame = (difficulty: DifficultyKey): GameState => {
    let puzzle = makepuzzle();
    const rating = ratepuzzle(puzzle, 3);
    let bestDistance = distanceToRange(rating, DIFFICULTY_CONFIG[difficulty].range);

    for (let i = 0; i < 50; i++) {
        const candidate = makepuzzle();
        const candidateRating = ratepuzzle(candidate, 3);
        const candidateDistance = distanceToRange(
            candidateRating,
            DIFFICULTY_CONFIG[difficulty].range
        );

        if (candidateDistance === 0) {
            puzzle = candidate;
            break;
        }

        if (candidateDistance < bestDistance) {
            puzzle = candidate;
            bestDistance = candidateDistance;
        }
    }

    const solution = solvepuzzle(puzzle);
    const puzzleGrid = convertToGrid(puzzle);
    const solutionGrid = convertToGrid(solution);

    const userInput: CellValue[][] = puzzleGrid.map(row => [...row]);
    const notes: Notes[][] = Array(9)
        .fill(null)
        .map(() => Array(9).fill(null).map(() => new Set<number>()));
    const errors: boolean[][] = Array(9)
        .fill(null)
        .map(() => Array(9).fill(false));

    return {
        puzzle: puzzleGrid,
        solution: solutionGrid,
        userInput,
        notes,
        errors,
    };
};

const loadGameFromStorage = (): GameState | null => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return null;
        const data = JSON.parse(stored);
        return {
            ...data,
            notes: data.notes.map((row: number[][]) =>
                row.map((cell: number[]) => new Set(cell))
            ),
        };
    } catch {
        return null;
    }
};

const loadDifficultyFromStorage = (): DifficultyKey => {
    const stored = localStorage.getItem(STORAGE_DIFFICULTY_KEY);
    if (stored === 'easy' || stored === 'medium' || stored === 'hard') {
        return stored;
    }
    return 'medium';
};

const saveDifficultyToStorage = (difficulty: DifficultyKey) => {
    try {
        localStorage.setItem(STORAGE_DIFFICULTY_KEY, difficulty);
    } catch {
        // ignore storage errors
    }
};

const saveGameToStorage = (state: GameState) => {
    try {
        const data = {
            ...state,
            notes: state.notes.map((row: Notes[]) => row.map((cell: Notes) => Array.from(cell))),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
        // ignore storage errors
    }
};


const App: React.FC = () => {
    const [difficulty, setDifficulty] = useState<DifficultyKey>(() => loadDifficultyFromStorage());
    const [gameState, setGameState] = useState<GameState>(() => {
        const loaded = loadGameFromStorage();
        return loaded || generateNewGame(loadDifficultyFromStorage());
    });
    const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);

    useEffect(() => {
        saveGameToStorage(gameState);
    }, [gameState]);

    useEffect(() => {
        saveDifficultyToStorage(difficulty);
    }, [difficulty]);

    const startNewGame = (nextDifficulty: DifficultyKey) => {
        const newGame = generateNewGame(nextDifficulty);
        setGameState(newGame);
        setSelectedCell(null);
        setDifficulty(nextDifficulty);
        localStorage.removeItem(STORAGE_KEY);
    };

    const handleBlankClick = (event: React.MouseEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement;
        if (target.closest('[data-interactive="true"]')) return;
        setSelectedCell(null);
    };

    const handleCellClick = (row: number, col: number) => {
        if (gameState.puzzle[row][col] !== null) return;
        if (selectedCell && selectedCell[0] === row && selectedCell[1] === col) {
            setSelectedCell(null);
        } else {
            setSelectedCell([row, col]);
        }
    };

    const handleNumberClick = (num: number) => {
        if (!selectedCell) return;
        const [row, col] = selectedCell;
        if (gameState.puzzle[row][col] !== null) return;

        setGameState((prev: GameState) => {
            const newState: GameState = {...prev};
            const newUserInput = newState.userInput.map((r: CellValue[]) => [...r]);
            const newNotes = newState.notes.map((r: Notes[]) => r.map((c: Notes) => new Set(c)));

            if (newNotes[row][col].has(num)) {
                newNotes[row][col].delete(num);
            } else {
                newNotes[row][col].add(num);
            }
            newUserInput[row][col] = null;

            return {
                ...newState,
                userInput: newUserInput,
                notes: newNotes,
                errors: Array(9)
                    .fill(null)
                    .map(() => Array(9).fill(false)),
            };
        });
    };

    const handleClear = () => {
        if (!selectedCell) return;
        const [row, col] = selectedCell;
        if (gameState.puzzle[row][col] !== null) return;

        setGameState((prev: GameState) => {
            const newState: GameState = {...prev};
            const newUserInput = newState.userInput.map((r: CellValue[]) => [...r]);
            const newNotes = newState.notes.map((r: Notes[]) => r.map((c: Notes) => new Set(c)));

            newUserInput[row][col] = null;
            newNotes[row][col].clear();

            return {
                ...newState,
                userInput: newUserInput,
                notes: newNotes,
                errors: Array(9)
                    .fill(null)
                    .map(() => Array(9).fill(false)),
            };
        });
    };

    const handleCheck = () => {
        setGameState((prev: GameState) => {
            const errors: boolean[][] = Array(9)
                .fill(null)
                .map(() => Array(9).fill(false));
            let hasError = false;

            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    if (prev.userInput[i][j] !== prev.solution[i][j]) {
                        errors[i][j] = true;
                        hasError = true;
                    }
                }
            }

            if (!hasError) {
                alert('恭喜！数独解答正确！');
            }

            return {...prev, errors};
        });
    };

    const handleNewGame = () => {
        if (confirm('要重新开始吗？当前进度会被清除。')) {
            startNewGame(difficulty);
        }
    };

    const handleNewGameWithDifficulty = (value: DifficultyKey) => {
        const label = DIFFICULTY_CONFIG[value].label;
        const confirmed = confirm(`要以 ${label} 难度新开一局吗？当前进度会被清除。`);
        if (confirmed) {
            startNewGame(value);
        }
    };

    const isComplete = () => {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (gameState.userInput[i][j] === null) {
                    return false;
                }
            }
        }
        return true;
    };

    return (
        <Container onClickCapture={handleBlankClick}>
            <SudokuHeader
                onNewGame={handleNewGame}
                difficulty={difficulty}
                difficultyLabel={DIFFICULTY_CONFIG[difficulty].label}
                difficultyOptions={DIFFICULTY_OPTIONS}
                onNewGameWithDifficulty={handleNewGameWithDifficulty}
            />

            <SudokuGrid
                gameState={gameState}
                selectedCell={selectedCell}
                onCellClick={handleCellClick}
            />

            <NumberPad
                selectedCell={selectedCell}
                notes={gameState.notes}
                onNumberClick={handleNumberClick}
            />

            <ActionButtons
                selectedCell={selectedCell}
                onClear={handleClear}
                isComplete={isComplete()}
                onCheck={handleCheck}
            />

            <Spacer />
        </Container>
    );
};

export default App;
