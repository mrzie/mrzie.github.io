import React from 'react';
import {styled} from '@linaria/react';

export type DialogProps = {
    type: 'alert' | 'confirm';
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    closing?: boolean;
};

const Overlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    z-index: 10;
    animation: overlayFadeIn 150ms ease forwards;

    @keyframes overlayFadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    @keyframes overlayFadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }

    &[data-closing='true'] {
        animation: overlayFadeOut 150ms ease forwards;
    }
`;

const Panel = styled.div<{closing?: boolean}>`
    background: white;
    border-radius: 12px;
    padding: 20px 20px 16px;
    max-width: 320px;
    width: 100%;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
    animation: dialogEnter 180ms ease forwards;
    transform-origin: center;

    @keyframes dialogEnter {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes dialogExit {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-6px);
        }
    }

    &[data-closing='true'] {
        animation: dialogExit 180ms ease forwards;
    }
`;

const Message = styled.div`
    font-size: 16px;
    color: var(--text-primary);
    line-height: 1.5;
    margin-bottom: 16px;
`;

const Actions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 8px;
`;

const Button = styled.button<{primary?: boolean}>`
    padding: 10px 14px;
    min-width: 88px;
    border-radius: 8px;
    border: ${props => (props.primary ? 'none' : '1px solid var(--grid-border)')};
    background: ${props => (props.primary ? 'var(--button-bg)' : 'white')};
    color: ${props => (props.primary ? 'white' : 'var(--text-primary)')};
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    touch-action: manipulation;

    &:hover {
        background: ${props => (props.primary ? 'var(--button-hover)' : 'rgba(0, 0, 0, 0.04)')};
    }
`;

export const Dialog: React.FC<DialogProps> = ({
    type,
    message,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    closing,
}) => (
    <Overlay data-interactive="true" data-closing={closing ? 'true' : undefined}>
        <Panel data-interactive="true" data-closing={closing ? 'true' : undefined}>
            <Message>{message}</Message>
            <Actions>
                {type === 'confirm' && (
                    <Button onClick={onCancel}>{cancelText || '取消'}</Button>
                )}
                <Button primary onClick={onConfirm}>
                    {confirmText || '确定'}
                </Button>
            </Actions>
        </Panel>
    </Overlay>
);
