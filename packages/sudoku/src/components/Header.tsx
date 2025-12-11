import React, {useEffect, useRef, useState} from 'react';
import {styled} from '@linaria/react';
import {DifficultyKey} from '../types';

interface SudokuHeaderProps {
    onNewGame: () => void;
    difficulty: DifficultyKey;
    difficultyLabel: string;
    difficultyOptions: {value: DifficultyKey; label: string}[];
    onNewGameWithDifficulty: (value: DifficultyKey) => void;
}

const HeaderContainer = styled.div`
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
`;

const DifficultyText = styled.div`
    font-size: 14px;
    color: var(--text-secondary);
`;

const Left = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const Controls = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
`;

const SplitButton = styled.div`
    position: relative;
    display: inline-flex;
    align-items: stretch;
    border-radius: 8px;
    overflow: visible;
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

const ArrowButton = styled(Button)`
    padding: 0 12px;
    border-left: 1px solid rgba(255, 255, 255, 0.3);
    min-width: 44px;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
`;

const MainButton = styled(Button)`
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
`;

const Dropdown = styled.div`
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    background: white;
    border: 1px solid var(--grid-border);
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    min-width: 160px;
    z-index: 2;
    animation: dropdownShow 140ms ease forwards;
    transform-origin: top right;

    @keyframes dropdownShow {
        from {
            opacity: 0;
            transform: translateY(-6px) scale(0.98);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    @keyframes dropdownHide {
        from {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
        to {
            opacity: 0;
            transform: translateY(-6px) scale(0.98);
        }
    }

    &[data-closing='true'] {
        animation: dropdownHide 140ms ease forwards;
    }
`;

const DropdownItem = styled.button`
    width: 100%;
    text-align: left;
    padding: 10px 12px;
    background: white;
    border: none;
    color: var(--text-primary);
    font-size: 14px;
    cursor: pointer;
    touch-action: manipulation;

    &:hover {
        background: rgba(249, 115, 22, 0.08);
    }
`;

export const SudokuHeader: React.FC<SudokuHeaderProps> = ({
    onNewGame,
    difficulty,
    difficultyLabel,
    difficultyOptions,
    onNewGameWithDifficulty,
}) => (
    <HeaderContainer>
        <Left>
            <DifficultyText>{`当前难度：${difficultyLabel}`}</DifficultyText>
        </Left>
        <Controls>
            <SplitNewGame
                onNewGame={onNewGame}
                options={difficultyOptions}
                current={difficulty}
                onSelect={onNewGameWithDifficulty}
            />
        </Controls>
    </HeaderContainer>
);

interface SplitNewGameProps {
    onNewGame: () => void;
    options: {value: DifficultyKey; label: string}[];
    current: DifficultyKey;
    onSelect: (value: DifficultyKey) => void;
}

const SplitNewGame: React.FC<SplitNewGameProps> = ({onNewGame, options, onSelect, current}) => {
    const [open, setOpen] = useState(false);
    const [closing, setClosing] = useState(false);
    const hideTimer = useRef<number | null>(null);

    const show = () => {
        if (hideTimer.current) {
            clearTimeout(hideTimer.current);
            hideTimer.current = null;
        }
        setClosing(false);
        setOpen(true);
    };

    const hide = () => {
        setClosing(true);
        hideTimer.current = window.setTimeout(() => {
            setOpen(false);
            setClosing(false);
            hideTimer.current = null;
        }, 140);
    };

    useEffect(
        () => () => {
            if (hideTimer.current) clearTimeout(hideTimer.current);
        },
        []
    );

    return (
        <SplitButton data-interactive="true" tabIndex={-1}>
            <MainButton onClick={onNewGame} data-interactive="true">
                新开一局
            </MainButton>
            <ArrowButton
                onClick={() => {
                    if (open) {
                        hide();
                    } else {
                        show();
                    }
                }}
                aria-label="选择难度并新开一局"
                data-interactive="true"
            >
                ▼
            </ArrowButton>
            {(open || closing) && (
                <Dropdown data-closing={closing ? 'true' : undefined}>
                    {options.map(option => (
                        <DropdownItem
                            key={option.value}
                            onClick={() => {
                                onSelect(option.value);
                                hide();
                            }}
                            data-interactive="true"
                        >
                            {`新开一局（${option.label}）${option.value === current ? ' *' : ''}`}
                        </DropdownItem>
                    ))}
                </Dropdown>
            )}
        </SplitButton>
    );
};
