import {useCallback, useRef, useState} from 'react';
import {DialogProps} from '../components/Dialog';

type DialogState = (DialogProps & {closing?: boolean}) | null;

const EXIT_MS = 180;

export const useDialog = () => {
    const [dialog, setDialog] = useState<DialogState>(null);
    const timerRef = useRef<number | null>(null);

    const clearTimer = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    const closeWithFade = useCallback((after?: () => void) => {
        setDialog(prev => (prev ? {...prev, closing: true} : prev));
        clearTimer();
        timerRef.current = window.setTimeout(() => {
            setDialog(null);
            timerRef.current = null;
            after?.();
        }, EXIT_MS);
    }, []);

    const showAlert = useCallback((message: string) => {
        clearTimer();
        setDialog({
            type: 'alert',
            message,
            confirmText: '好的',
            onConfirm: () => closeWithFade(),
        });
    }, [closeWithFade]);

    const showConfirm = useCallback((message: string, onConfirm: () => void) => {
        clearTimer();
        setDialog({
            type: 'confirm',
            message,
            confirmText: '确定',
            cancelText: '取消',
            onConfirm: () => closeWithFade(onConfirm),
            onCancel: () => closeWithFade(),
        });
    }, [closeWithFade]);

    const close = useCallback(() => closeWithFade(), [closeWithFade]);

    return {dialog, showAlert, showConfirm, close};
};
