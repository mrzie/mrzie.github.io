import React from 'react';
import {styled} from '@linaria/react';
import {Notes} from '../types';

interface NumberPadProps {
    selectedCell: [number, number] | null;
    notes: Notes[][];
    onNumberClick: (num: number) => void;
}

const NumberButtonsContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(9, 1fr);
    gap: 8px;
    margin-bottom: 12px;

    @media (max-width: 600px) {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        padding-bottom: 4px;
    }
`;

const NumberButton = styled.button<{active: boolean}>`
    background-color: white;
    border: 2px solid var(--grid-border);
    border-radius: 50%;
    font-size: 20px;
    font-weight: bold;
    color: var(--text-primary);
    cursor: pointer;
    touch-action: manipulation;
    min-height: 52px;
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: box-shadow 0.2s;
    box-shadow: ${props =>
        props.active ? '0 0 0 3px rgba(249, 115, 22, 0.25)' : 'none'};

    @media (max-width: 600px) {
        font-size: 18px;
        min-height: 48px;
    }
`;

export const NumberPad: React.FC<NumberPadProps> = ({selectedCell, notes, onNumberClick}) => (
    <NumberButtonsContainer>
        {Array.from({length: 9}, (_, n) => {
            const num = n + 1;
            const active = selectedCell ? notes[selectedCell[0]][selectedCell[1]].has(num) : false;
            return (
                <NumberButton key={num} active={active} onClick={() => onNumberClick(num)}>
                    {num}
                </NumberButton>
            );
        })}
    </NumberButtonsContainer>
);
