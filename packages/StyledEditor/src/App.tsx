import {useEffect, useRef, useState, forwardRef, useImperativeHandle} from 'react';
import {EditorState} from '@codemirror/state';
import {EditorView, drawSelection, keymap} from '@codemirror/view';
import {history, defaultKeymap, indentWithTab} from '@codemirror/commands';
import {markdown} from '@codemirror/lang-markdown';
import {writerTheme, markdownHighlight} from './theme';
import {headingMarkExtension} from './syntaxMarks';
import * as commands from './keymaps';
import {parseMarkdownToSegments, tableToMarkdown} from './preview/parseMarkdown';
import {Preview} from './preview/Preview';

const STORAGE_KEY = 'styled_editor_content';

const initialDoc = `# Hello

Write **Markdown** here.

- List item
- Another one
- inline \`code\`
- 苟利国家生死以
`;

export interface StyledEditorProps {
    /** 初始模式：true 分栏，false 仅编辑。可通过界面按键切换 */
    splitView?: boolean;
}

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

const App = forwardRef<StyledEditorRef, StyledEditorProps>(({splitView: initialSplitView = false}, ref) => {
    const [splitView, setSplitView] = useState(initialSplitView);
    const [previewContent, setPreviewContent] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    const saveTimerRef = useRef<number | null>(null);

    const handleTableChange = (raw: string, tableIndex: number, header: string[], rows: string[][]) => {
        const view = viewRef.current;
        if (!view) return;
        const content = view.state.doc.toString();
        const newTable = tableToMarkdown(header, rows);
        const parts = content.split(raw);
        if (parts.length <= tableIndex) return;
        const newContent =
            parts.slice(0, tableIndex + 1).join(raw) + newTable + parts.slice(tableIndex + 1).join(raw);
        if (newContent === content) return;
        view.dispatch({
            changes: {from: 0, to: content.length, insert: newContent},
        });
        setPreviewContent(newContent);
        localStorage.setItem(STORAGE_KEY, newContent);
    };

    // 自动保存 + 预览同步（防抖 1秒）
    const handleDocChange = (content: string) => {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = window.setTimeout(() => {
            localStorage.setItem(STORAGE_KEY, content);
            setPreviewContent(content);
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
        setPreviewContent(savedDoc || initialDoc);

        return () => {
            view.destroy();
            viewRef.current = null;
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        };
    }, []);

    return (
        <div className={`styled-editor ${splitView ? 'styled-editor--split' : ''}`}>
            <div className="styled-editor__body">
                <div ref={containerRef} className="styled-editor__editor" />
                {splitView && (
                    <div className="styled-editor__preview">
                        <Preview
                            segments={parseMarkdownToSegments(previewContent)}
                            onTableChange={handleTableChange}
                        />
                    </div>
                )}
            </div>
            <button
                type="button"
                className="styled-editor__toggle"
                onClick={() => setSplitView((v) => !v)}
                title={splitView ? '切换为仅编辑' : '切换为分栏预览'}
            >
                {splitView ? '编辑' : '分栏'}
            </button>
        </div>
    );
});

App.displayName = 'StyledEditor';

export default App;
