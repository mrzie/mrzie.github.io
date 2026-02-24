import {memo} from 'react';
import {useRemarkSync} from 'react-remark';
import remarkGfm from 'remark-gfm';
import type {Segment} from './parseMarkdown';
import {TablePreview} from './TablePreview';

const REMARK_PLUGINS = [remarkGfm];

const MarkdownSegment = memo(function MarkdownSegment({markdown}: {markdown: string}) {
    return <div className="preview__segment">{useRemarkSync(markdown, {remarkPlugins: REMARK_PLUGINS})}</div>;
});

interface PreviewProps {
    segments: Segment[];
    /** raw: 原表格 markdown；tableIndex: 表格在文档中的序号（同 raw 出现顺序）；header/rows: 新数据 */
    onTableChange?: (raw: string, tableIndex: number, header: string[], rows: string[][]) => void;
}

export function Preview({segments, onTableChange}: PreviewProps) {
    let tableIndex = 0;
    return (
        <div className="preview">
            {segments.map((seg, i) =>
                seg.type === 'table' ? (
                    <TablePreview
                        key={i}
                        segment={seg}
                        onChange={
                            onTableChange
                                ? (h, r) => onTableChange(seg.raw, tableIndex++, h, r)
                                : undefined
                        }
                    />
                ) : (
                    <MarkdownSegment key={i} markdown={seg.markdown} />
                ),
            )}
        </div>
    );
}
