import type {Segment} from './parseMarkdown';
import {TablePreview} from './TablePreview';

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
                    <div key={i} className="preview__segment" dangerouslySetInnerHTML={{__html: seg.html}} />
                ),
            )}
        </div>
    );
}
