import {EditorSelection, Transaction} from '@codemirror/state';
import {EditorView} from '@codemirror/view';

/**
 * 通用行内格式切换函数
 * 支持加粗、斜体、删除线、行内代码、下划线
 */
export const toggleInline = (view: EditorView, marker: string, endMarker?: string) => {
    const {state, dispatch} = view;
    const end = endMarker || marker;

    const changes = state.changeByRange((range) => {
        const text = state.sliceDoc(range.from, range.to);
        const isWrapped = text.startsWith(marker) && text.endsWith(end);

        if (isWrapped) {
            // 取消包装
            return {
                changes: [
                    {from: range.from, to: range.from + marker.length, insert: ''},
                    {from: range.to - end.length, to: range.to, insert: ''},
                ],
                range: EditorSelection.range(range.from, range.to - marker.length - end.length),
            };
        } else {
            // 添加包装
            if (range.empty) {
                return {
                    changes: [{from: range.from, insert: marker + end}],
                    range: EditorSelection.range(range.from + marker.length, range.from + marker.length),
                };
            }
            return {
                changes: [
                    {from: range.from, insert: marker},
                    {from: range.to, insert: end},
                ],
                range: EditorSelection.range(range.from + marker.length, range.to + marker.length),
            };
        }
    });

    dispatch(state.update(changes, {scrollIntoView: true, annotations: Transaction.userEvent.of('input')}));
    return true;
};

// --- 行内格式具体命令 ---
export const toggleStrong = (view: EditorView) => toggleInline(view, '**');
export const toggleEmphasis = (view: EditorView) => toggleInline(view, '*');
export const toggleUnderline = (view: EditorView) => toggleInline(view, '<u>', '</u>');
export const toggleStrikethrough = (view: EditorView) => toggleInline(view, '~~');
export const toggleCode = (view: EditorView) => toggleInline(view, '`');

/** 插入链接 */
export const insertLink = (view: EditorView) => {
    const {state, dispatch} = view;
    const changes = state.changeByRange((range) => {
        return {
            changes: [
                {from: range.from, insert: '['},
                {from: range.to, insert: '](url)'},
            ],
            range: EditorSelection.range(range.from + 1, range.to + 1),
        };
    });
    dispatch(state.update(changes, {scrollIntoView: true, annotations: Transaction.userEvent.of('input')}));
    return true;
};

/** 插入图片 */
export const insertImage = (view: EditorView) => {
    const {state, dispatch} = view;
    const changes = state.changeByRange((range) => {
        return {
            changes: [
                {from: range.from, insert: '!['},
                {from: range.to, insert: '](url)'},
            ],
            range: EditorSelection.range(range.from + 2, range.to + 2),
        };
    });
    dispatch(state.update(changes, {scrollIntoView: true, annotations: Transaction.userEvent.of('input')}));
    return true;
};

/**
 * 块级格式设置函数
 * 处理标题、引用、列表等行首前缀的设置与切换
 */
const setLinePrefix = (view: EditorView, prefix: string | ((current: string) => string | null)) => {
    const {state, dispatch} = view;
    const changes = state.changeByRange((range) => {
        const line = state.doc.lineAt(range.from);
        const currentText = line.text;

        let newText: string;
        if (typeof prefix === 'function') {
            const res = prefix(currentText);
            if (res === null) return {range}; // 无变化
            newText = res;
        } else {
            // 默认切换逻辑：如果已经有该前缀，则移除；否则替换已有前缀或新增
            // 这里简单处理：先移除已有的 Markdown 块标记再添加新的
            const cleaned = currentText.replace(/^([#\s>-\d.*+[\]]+)\s*/, '');
            newText = prefix + cleaned;
        }

        return {
            changes: {from: line.from, to: line.to, insert: newText},
            range: EditorSelection.range(line.from + newText.length, line.from + newText.length),
        };
    });
    dispatch(state.update(changes, {scrollIntoView: true, annotations: Transaction.userEvent.of('input')}));
    return true;
};

// --- 块级样式具体命令 ---
export const setHeading = (view: EditorView, level: number) => {
    if (level === 0) {
        return setLinePrefix(view, (text) =>
            text.replace(/^(#+\s*|>+\s*|[-*+]\s*|\d+\.\s*|(-\s\[[ xX]\]\s*))/, '')
        );
    }
    const prefix = '#'.repeat(level) + ' ';
    return setLinePrefix(view, prefix);
};

export const toggleBlockquote = (view: EditorView) => setLinePrefix(view, '> ');
export const toggleUnorderedList = (view: EditorView) => setLinePrefix(view, '- ');
export const toggleOrderedList = (view: EditorView) => setLinePrefix(view, '1. ');
export const toggleTaskList = (view: EditorView) => setLinePrefix(view, '- [ ] ');

/** 插入复杂块模板 */
export const insertBlock = (view: EditorView, template: string) => {
    const {state, dispatch} = view;
    const line = state.doc.lineAt(state.selection.main.from);
    const hasContent = line.text.trim().length > 0;
    const insertPos = hasContent ? line.to : line.from;
    const insertText = (hasContent ? '\n\n' : '') + template;

    dispatch(
        state.update({
            changes: {from: insertPos, insert: insertText},
            selection: EditorSelection.cursor(insertPos + insertText.length),
            scrollIntoView: true,
            annotations: Transaction.userEvent.of('input'),
        })
    );
    return true;
};

export const insertTable = (view: EditorView) =>
    insertBlock(view, '| Column 1 | Column 2 | Column 3 |\n| --- | --- | --- |\n| Row 1 | | |\n| Row 2 | | |');
export const insertCodeBlock = (view: EditorView) => insertBlock(view, '```\n\n```');
export const insertMathBlock = (view: EditorView) => insertBlock(view, '$$\n\n$$');
export const insertHorizontalRule = (view: EditorView) => insertBlock(view, '---\n');

/** 快捷键映射 */
export const customKeymap = [
    // 行内
    {key: 'Mod-b', run: toggleStrong},
    {key: 'Mod-i', run: toggleEmphasis},
    {key: 'Mod-u', run: toggleUnderline},
    {key: 'Mod-Shift-5', run: toggleStrikethrough},
    {key: 'Mod-Shift-`', run: toggleCode},
    {key: 'Mod-k', run: insertLink},
    {key: 'Mod-Shift-i', run: insertImage},
    {key: 'Mod-\\', run: (view: EditorView) => setHeading(view, 0)}, // 清除格式

    // 标题
    {key: 'Mod-1', run: (view: EditorView) => setHeading(view, 1)},
    {key: 'Mod-2', run: (view: EditorView) => setHeading(view, 2)},
    {key: 'Mod-3', run: (view: EditorView) => setHeading(view, 3)},
    {key: 'Mod-4', run: (view: EditorView) => setHeading(view, 4)},
    {key: 'Mod-5', run: (view: EditorView) => setHeading(view, 5)},
    {key: 'Mod-6', run: (view: EditorView) => setHeading(view, 6)},
    {key: 'Mod-0', run: (view: EditorView) => setHeading(view, 0)},

    // 块级
    {key: 'Mod-Shift-q', run: toggleBlockquote},
    {key: 'Mod-Alt-q', run: toggleBlockquote},
    {key: 'Mod-Shift-]', run: toggleUnorderedList},
    {key: 'Mod-Alt-u', run: toggleUnorderedList},
    {key: 'Mod-Shift-[', run: toggleOrderedList},
    {key: 'Mod-Alt-o', run: toggleOrderedList},
    {key: 'Mod-Shift-x', run: toggleTaskList},
    {key: 'Mod-Alt-x', run: toggleTaskList},

    // 插入
    {key: 'Mod-Shift-k', run: insertCodeBlock},
    {key: 'Mod-Alt-c', run: insertCodeBlock},
    {key: 'Mod-Shift-m', run: insertMathBlock},
    {key: 'Mod-Alt-b', run: insertMathBlock},
    {key: 'Mod-t', run: insertTable},
    {key: 'Mod-Alt-t', run: insertTable},
    {key: 'Mod-Alt--', run: insertHorizontalRule},
];
