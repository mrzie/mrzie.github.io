import unified from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import mdastToString from 'mdast-util-to-string';
import type {Root, Table} from 'mdast';

const parser = unified().use(remarkParse).use(remarkGfm);

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

/** 其他分段，保留原始 markdown */
export interface OtherSegment {
    type: 'other';
    markdown: string;
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
    const root = parser.parse(markdown) as Root;
    const segments: Segment[] = [];
    let otherStart: number | null = null;

    const flushOther = (end: number) => {
        if (otherStart !== null) {
            const text = markdown.slice(otherStart, end);
            if (text.trim()) {
                segments.push({type: 'other', markdown: text});
            }
            otherStart = null;
        }
    };

    for (const node of root.children) {
        if (node.type === 'table') {
            const pos = node.position!;
            flushOther(pos.start.offset!);

            const t = node as Table;
            const header = (t.children[0]?.children ?? []).map((cell) => mdastToString(cell));
            const align = (t.align ?? []).map((a) =>
                a === 'left' ? 'left' : a === 'center' ? 'center' : a === 'right' ? 'right' : null,
            );
            const rows = t.children.slice(1).map((row) => row.children.map((cell) => mdastToString(cell)));
            const raw = markdown.slice(pos.start.offset!, pos.end.offset!);
            segments.push({type: 'table', raw, header, align, rows});

            otherStart = pos.end.offset!;
        } else {
            if (otherStart === null) {
                otherStart = node.position!.start.offset!;
            }
        }
    }

    flushOther(markdown.length);

    return segments;
}
