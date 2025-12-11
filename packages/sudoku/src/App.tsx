import React, {useState, useEffect} from 'react';
import {makepuzzle, solvepuzzle} from 'sudoku';
import {styled} from '@linaria/react';
import './index.css';
import {GameState, CellValue, Notes} from './types';
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

const generateNewGame = (): GameState => {
    const puzzle = makepuzzle();
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
    const [gameState, setGameState] = useState<GameState>(() => {
        const loaded = loadGameFromStorage();
        return loaded || generateNewGame();
    });
    const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);

    useEffect(() => {
        saveGameToStorage(gameState);
    }, [gameState]);

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
        if (confirm('确定要开始新游戏吗？当前进度将丢失。')) {
            const newGame = generateNewGame();
            setGameState(newGame);
            setSelectedCell(null);
            localStorage.removeItem(STORAGE_KEY);
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
        <Container>
            <SudokuHeader onNewGame={handleNewGame} />

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
