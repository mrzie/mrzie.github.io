import React from 'react';
import {styled} from '@linaria/react';
import {GameState} from '../types';

interface CellProps {
    hasError: boolean;
    isSelected: boolean;
    isRelated: boolean;
    isGiven: boolean;
    isMultiInput: boolean;
}

const GridContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(9, 1fr);
    gap: 2px;
    background-color: var(--grid-border);
    border: 2px solid var(--grid-border);
    border-radius: 8px;
    padding: 2px;
    margin-bottom: 16px;
`;

const Cell = styled.div<CellProps>`
    aspect-ratio: 1;
    background-color: ${props =>
        props.hasError
            ? 'var(--cell-error)'
            : props.isSelected
                ? 'var(--cell-selected)'
                : props.isRelated
                    ? 'rgba(254, 215, 170, 0.3)'
                    : 'var(--grid-bg)'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${props => (props.isMultiInput ? '10px' : '20px')};
    font-weight: ${props => (props.isGiven ? 'bold' : 600)};
    color: ${props => (props.isGiven ? 'var(--given-number)' : 'var(--answer-number)')};
    cursor: ${props => (props.isGiven ? 'default' : 'pointer')};
    touch-action: manipulation;
    user-select: none;
    position: relative;
`;

const NotesGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    width: 100%;
    height: 100%;
    padding: 2px;
    gap: 1px;
`;

interface NoteCellProps {
    fontSize: string;
}

const NoteCell = styled.div<NoteCellProps>`
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${props => props.fontSize};
    color: var(--note-color);
`;

interface SudokuGridProps {
    gameState: GameState;
    selectedCell: [number, number] | null;
    onCellClick: (row: number, col: number) => void;
}

export const SudokuGrid: React.FC<SudokuGridProps> = ({
    gameState,
    selectedCell,
    onCellClick,
}) => {
    const isSameRow = (r1: number, r2: number) => r1 === r2;
    const isSameCol = (c1: number, c2: number) => c1 === c2;
    const getBoxIndex = (row: number, col: number) =>
        Math.floor(row / 3) * 3 + Math.floor(col / 3);
    const isSameBox = (r1: number, c1: number, r2: number, c2: number) =>
        getBoxIndex(r1, c1) === getBoxIndex(r2, c2);

    return (
        <GridContainer>
            {Array.from({length: 81}, (_, idx) => {
                const row = Math.floor(idx / 9);
                const col = idx % 9;
                const value = gameState.userInput[row][col];
                const isGiven = gameState.puzzle[row][col] !== null;
                const isSelected = !!(selectedCell && selectedCell[0] === row && selectedCell[1] === col);
                const isRelated = !!(
                    selectedCell &&
                    (isSameRow(row, selectedCell[0]) ||
                        isSameCol(col, selectedCell[1]) ||
                        isSameBox(row, col, selectedCell[0], selectedCell[1]))
                );
                const hasError = gameState.errors[row][col];
                const notes = gameState.notes[row][col];
                const noteCount = notes.size;
                const isMultiInput = value === null && noteCount > 1;
                const displayNumber =
                    value !== null ? value : noteCount === 1 ? Array.from(notes)[0] ?? null : null;
                return (
                    <Cell
                        key={idx}
                        onClick={() => onCellClick(row, col)}
                        hasError={hasError}
                        isSelected={isSelected}
                        isRelated={isRelated}
                        isGiven={isGiven}
                        isMultiInput={isMultiInput}
                        data-interactive="true"
                    >
                        {isGiven || !isMultiInput ? (
                            displayNumber
                        ) : isMultiInput ? (
                            <NotesGrid>
                                {Array.from({length: 9}, (_, n) => {
                                    const num = n + 1;
                                    const fontSize =
                                        noteCount <= 3 ? '12px' : noteCount <= 6 ? '10px' : '8px';
                                    return (
                                        <NoteCell key={num} fontSize={fontSize}>
                                            {notes.has(num) ? num : ''}
                                        </NoteCell>
                                    );
                                })}
                            </NotesGrid>
                        ) : null}
                    </Cell>
                );
            })}
        </GridContainer>
    );
};
