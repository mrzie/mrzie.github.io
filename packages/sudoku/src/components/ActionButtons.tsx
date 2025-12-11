import React from 'react';
import {styled} from '@linaria/react';

interface ActionButtonsProps {
    selectedCell: [number, number] | null;
    onClear: () => void;
    isComplete: boolean;
    onCheck: () => void;
}

const ClearButton = styled.button`
    width: 100%;
    padding: 12px;
    background-color: transparent;
    color: var(--text-secondary);
    border: 2px solid var(--grid-border);
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    touch-action: manipulation;
    min-height: 44px;
    margin-bottom: 24px;
    transition: border-color 0.2s, color 0.2s;

    &:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
    }
`;

const CheckButton = styled.button`
    width: 100%;
    padding: 16px;
    background-color: var(--button-bg);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    touch-action: manipulation;
    min-height: 56px;
    margin-bottom: env(safe-area-inset-bottom, 16px);
    transition: background-color 0.2s;

    &:hover {
        background-color: var(--button-hover);
    }
`;

export const ActionButtons: React.FC<ActionButtonsProps> = ({
    selectedCell,
    onClear,
    isComplete,
    onCheck,
}) => (
    <>
        {selectedCell && <ClearButton onClick={onClear}>清除</ClearButton>}
        {isComplete && <CheckButton onClick={onCheck}>检查答案</CheckButton>}
    </>
);
