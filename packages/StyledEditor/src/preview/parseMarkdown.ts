import {marked, type Tokens} from 'marked';

marked.use({gfm: true});

/** 分段类型 */
export type SegmentType = 'table' | 'other';

/** 表格分段 */
export interface TableSegment {
    type: 'table';
    raw: string;
    header: string[];
    align: Array<'left' | 'center' | 'right' | null>;
    rows: string[][];
}

/** 其他分段，保留原始 HTML */
export interface OtherSegment {
    type: 'other';
    html: string;
}

export type Segment = TableSegment | OtherSegment;

/** 表格数据转 markdown */
export function tableToMarkdown(header: string[], rows: string[][]): string {
    const escape = (s: string) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
    const colCount = header.length;
    const pad = (r: string[]) => [...r, ...Array(Math.max(0, colCount - r.length)).fill('')].slice(0, colCount);
    const headerRow = '| ' + header.map(escape).join(' | ') + ' |';
    const sep = '| ' + header.map(() => '---').join(' | ') + ' |';
    const bodyRows = rows.map((r) => '| ' + pad(r).map(escape).join(' | ') + ' |');
    return [headerRow, sep, ...bodyRows].join('\n');
}

/** 将 markdown 解析为分段数组，表格单独拆出 */
export function parseMarkdownToSegments(markdown: string): Segment[] {
    const tokens = marked.lexer(markdown);
    const segments: Segment[] = [];
    const otherTokens: Tokens.Generic[] = [];

    const flushOther = () => {
        if (otherTokens.length > 0) {
            const html = marked.parser(otherTokens);
            if (html.trim()) {
                segments.push({type: 'other', html});
            }
            otherTokens.length = 0;
        }
    };

    for (const token of tokens) {
        if (typeof token !== 'object' || !('type' in token)) continue;

        if (token.type === 'table') {
            flushOther();
            const t = token as Tokens.Table;
            const header = (t.header || []).map((c) => c.text ?? '');
            const align = (t.align || []).map((a) =>
                a === 'left' ? 'left' : a === 'center' ? 'center' : a === 'right' ? 'right' : null,
            );
            const rows = (t.rows || []).map((row) => row.map((c) => c.text ?? ''));
            segments.push({type: 'table', raw: t.raw, header, align, rows});
        } else {
            otherTokens.push(token as Tokens.Generic);
        }
    }
    flushOther();

    return segments;
}
