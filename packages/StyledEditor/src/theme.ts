import {EditorView} from '@codemirror/view';
import {HighlightStyle, syntaxHighlighting} from '@codemirror/language';
import {tags} from '@lezer/highlight';

/** 写作界面主题：无行号、无括号高亮、加大行高与字体 */
export const writerTheme = EditorView.theme({
    '&': {
        fontSize: '18px',
        lineHeight: '1.7',
    },
    '.cm-content': {
        fontFamily: '"Noto Sans SC", "Source Sans 3", system-ui, sans-serif',
        padding: '1em 0',
    },
    '.cm-line': {
        padding: '0 0.5em',
    },
    /** 语法标记独立配置 */
    '.cm-headerMark': {color: '#999', fontSize: '.5em'},
    '.cm-quoteMark': {color: '#999'},
    '.cm-listMark': {color: '#999'},
    '.cm-linkMark': {color: '#999'},
    '.cm-emphasisMark': {color: '#999'},
    '.cm-codeMark': {color: '#999'},
    /** 引用块整体样式 */
    '.tok-quote': {
        borderLeft: '4px solid #ddd',
        paddingLeft: '1em',
        fontStyle: 'italic',
        color: '#666',
    },
});

/** Markdown 语义高亮：标题、粗体、斜体、链接 */
export const markdownHighlightStyle = HighlightStyle.define([
    {tag: tags.heading1, fontSize: '2em', fontWeight: 'bold', fontFamily: '"Noto Sans SC", "Source Sans 3", system-ui, sans-serif'},
    {
        tag: tags.heading2,
        fontSize: '1.6em',
        fontWeight: 'bold',
        fontFamily: '"Noto Sans SC", "Source Sans 3", system-ui, sans-serif',
    },
    {
        tag: tags.heading3,
        fontSize: '1.3em',
        fontWeight: 'bold',
        fontFamily: '"Noto Sans SC", "Source Sans 3", system-ui, sans-serif',
    },
    {tag: tags.strong, fontWeight: 'bold'},
    {tag: tags.emphasis, fontStyle: 'italic'},
    {tag: tags.link, color: '#0066cc', textDecoration: 'underline'},
    {tag: tags.url, color: '#0066cc'},
    {
        tag: tags.monospace,
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        padding: '0 4px',
    },
    {tag: tags.quote, color: '#666', fontStyle: 'italic'},
]);

export const markdownHighlight = syntaxHighlighting(markdownHighlightStyle);
