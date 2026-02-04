import {useEffect, useRef, forwardRef, useImperativeHandle} from 'react';
import {EditorState} from '@codemirror/state';
import {EditorView, drawSelection, keymap} from '@codemirror/view';
import {history, defaultKeymap, indentWithTab} from '@codemirror/commands';
import {markdown} from '@codemirror/lang-markdown';
import {writerTheme, markdownHighlight} from './theme';
import {headingMarkExtension} from './syntaxMarks';
import * as commands from './keymaps';

const STORAGE_KEY = 'styled_editor_content';

const initialDoc = `# Hello

Write **Markdown** here.

- List item
- Another one
- inline \`code\`
- 苟利国家生死以
`;

export interface StyledEditorRef {
    view: EditorView | null;
    getContent: () => string;
    setContent: (content: string) => void;
    toggleStrong: () => boolean;
    toggleEmphasis: () => boolean;
    toggleUnderline: () => boolean;
    toggleStrikethrough: () => boolean;
    toggleCode: () => boolean;
    insertLink: () => boolean;
    insertImage: () => boolean;
    setHeading: (level: number) => boolean;
    toggleBlockquote: () => boolean;
    toggleUnorderedList: () => boolean;
    toggleOrderedList: () => boolean;
    toggleTaskList: () => boolean;
    insertTable: () => boolean;
    insertCodeBlock: () => boolean;
    insertMathBlock: () => boolean;
    insertHorizontalRule: () => boolean;
}

const App = forwardRef<StyledEditorRef, object>((_, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    const saveTimerRef = useRef<number | null>(null);

    // 自动保存逻辑（防抖 1秒）
    const handleDocChange = (content: string) => {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = window.setTimeout(() => {
            localStorage.setItem(STORAGE_KEY, content);
            console.log('Saved to local storage');
        }, 1000);
    };

    useImperativeHandle(ref, () => ({
        get view() {
            return viewRef.current;
        },
        getContent: () => viewRef.current?.state.doc.toString() || '',
        setContent: (content: string) => {
            if (viewRef.current) {
                viewRef.current.dispatch({
                    changes: {from: 0, to: viewRef.current.state.doc.length, insert: content},
                });
            }
        },
        toggleStrong: () => viewRef.current ? commands.toggleStrong(viewRef.current) : false,
        toggleEmphasis: () => viewRef.current ? commands.toggleEmphasis(viewRef.current) : false,
        toggleUnderline: () => viewRef.current ? commands.toggleUnderline(viewRef.current) : false,
        toggleStrikethrough: () => viewRef.current ? commands.toggleStrikethrough(viewRef.current) : false,
        toggleCode: () => viewRef.current ? commands.toggleCode(viewRef.current) : false,
        insertLink: () => viewRef.current ? commands.insertLink(viewRef.current) : false,
        insertImage: () => viewRef.current ? commands.insertImage(viewRef.current) : false,
        setHeading: (level: number) => viewRef.current ? commands.setHeading(viewRef.current, level) : false,
        toggleBlockquote: () => viewRef.current ? commands.toggleBlockquote(viewRef.current) : false,
        toggleUnorderedList: () => viewRef.current ? commands.toggleUnorderedList(viewRef.current) : false,
        toggleOrderedList: () => viewRef.current ? commands.toggleOrderedList(viewRef.current) : false,
        toggleTaskList: () => viewRef.current ? commands.toggleTaskList(viewRef.current) : false,
        insertTable: () => viewRef.current ? commands.insertTable(viewRef.current) : false,
        insertCodeBlock: () => viewRef.current ? commands.insertCodeBlock(viewRef.current) : false,
        insertMathBlock: () => viewRef.current ? commands.insertMathBlock(viewRef.current) : false,
        insertHorizontalRule: () => viewRef.current ? commands.insertHorizontalRule(viewRef.current) : false,
    }));

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // 从本地存储读取或使用默认值
        const savedDoc = localStorage.getItem(STORAGE_KEY);

        const state = EditorState.create({
            doc: savedDoc || initialDoc,
            extensions: [
                history(),
                drawSelection(),
                keymap.of([...commands.customKeymap, ...defaultKeymap, indentWithTab]),
                markdown(),
                writerTheme,
                markdownHighlight,
                headingMarkExtension,
                EditorView.updateListener.of((update) => {
                    if (update.docChanged) {
                        handleDocChange(update.state.doc.toString());
                    }
                }),
            ],
        });

        const view = new EditorView({
            state,
            parent: container,
        });
        viewRef.current = view;

        return () => {
            view.destroy();
            viewRef.current = null;
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        };
    }, []);

    return <div ref={containerRef} className="styled-editor" />;
});

App.displayName = 'StyledEditor';

export default App;
