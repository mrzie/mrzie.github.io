import React from 'react';
import {styled} from '@linaria/react';

interface SudokuHeaderProps {
    onNewGame: () => void;
}

const HeaderContainer = styled.div`
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const Title = styled.h1`
    font-size: 24px;
    font-weight: bold;
    color: var(--primary-color);
`;

const Button = styled.button`
    padding: 8px 16px;
    background-color: var(--button-bg);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    touch-action: manipulation;
    min-height: 44px;
    min-width: 80px;
    transition: background-color 0.2s;

    &:hover {
        background-color: var(--button-hover);
    }
`;

export const SudokuHeader: React.FC<SudokuHeaderProps> = ({onNewGame}) => (
    <HeaderContainer>
        <Title>数独</Title>
        <Button onClick={onNewGame}>新游戏</Button>
    </HeaderContainer>
);
