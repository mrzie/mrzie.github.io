import {useState, useCallback, useEffect} from 'react';
import type {TableSegment} from './parseMarkdown';

interface TablePreviewProps {
    segment: TableSegment;
    onChange?: (header: string[], rows: string[][]) => void;
}

export function TablePreview({segment, onChange}: TablePreviewProps) {
    const [header, setHeader] = useState(segment.header);
    const [rows, setRows] = useState(segment.rows);
    const [menu, setMenu] = useState<{edge: 'right' | 'left' | 'bottom'; rowIdx: number; colIdx: number; isHeader: boolean} | null>(null);

    useEffect(() => {
        setHeader(segment.header);
        setRows(segment.rows);
    }, [segment.header, segment.rows]);

    const addRowAfter = useCallback(
        (afterIdx: number) => {
            const newRow = header.map(() => '');
            const next = [...rows.slice(0, afterIdx + 1), newRow, ...rows.slice(afterIdx + 1)];
            setRows(next);
            onChange?.(header, next);
        },
        [header, rows, onChange],
    );

    const addColumnAfter = useCallback(
        (afterIdx: number) => {
            const newHeader = [...header.slice(0, afterIdx + 1), '', ...header.slice(afterIdx + 1)];
            const newRows = rows.map((r) => [...r.slice(0, afterIdx + 1), '', ...r.slice(afterIdx + 1)]);
            setHeader(newHeader);
            setRows(newRows);
            onChange?.(newHeader, newRows);
        },
        [header, rows, onChange],
    );

    const deleteRow = useCallback(
        (idx: number) => {
            setMenu(null);
            const next = rows.filter((_, i) => i !== idx);
            setRows(next);
            onChange?.(header, next);
        },
        [header, rows, onChange],
    );

    const deleteColumn = useCallback(
        (idx: number) => {
            setMenu(null);
            const newHeader = header.filter((_, i) => i !== idx);
            const newRows = rows.map((r) => r.filter((_, i) => i !== idx));
            setHeader(newHeader);
            setRows(newRows);
            onChange?.(newHeader, newRows);
        },
        [header, rows, onChange],
    );

    const colCount = Math.max(header.length, ...rows.map((r) => r.length));

    const renderEdge = (
        edge: 'right' | 'left' | 'bottom',
        rowIdx: number,
        colIdx: number,
        isHeader: boolean,
    ) => {
        const bodyRowIdx = isHeader ? -1 : rowIdx;
        const showMenu =
            menu?.edge === edge &&
            menu.rowIdx === rowIdx &&
            menu.colIdx === colIdx &&
            menu.isHeader === isHeader;

        if (edge === 'right' || edge === 'left') {
            // 竖线：列操作
            const canDelete = colCount > 1;
            // left 边 + 在此列左侧插入，right 边 + 在此列右侧插入
            const onAdd = edge === 'left'
                ? () => addColumnAfter(colIdx - 1)
                : () => addColumnAfter(colIdx);
            return (
                <div className={`preview-table__edge preview-table__edge--${edge}`}>
                    <div className="preview-table__edge-btns">
                        <button
                            type="button"
                            className="preview-table__edge-btn"
                            onClick={onAdd}
                            title={edge === 'left' ? '在左侧添加列' : '在右侧添加列'}
                        >
                            +
                        </button>
                        <button
                            type="button"
                            className="preview-table__edge-btn"
                            disabled={!canDelete}
                            onClick={() => setMenu({edge, rowIdx, colIdx, isHeader})}
                            title="列操作"
                        >
                            ⋯
                        </button>
                    </div>
                    {showMenu && (
                        <div
                            className={`preview-table__dropdown preview-table__dropdown--${edge}`}
                            onMouseLeave={() => setMenu(null)}
                        >
                            <button
                                type="button"
                                disabled={colCount <= 1}
                                onClick={() => deleteColumn(colIdx)}
                            >
                                删除列
                            </button>
                        </div>
                    )}
                </div>
            );
        }

        // 横线（bottom）：行操作
        const canDelete = !isHeader && rows.length > 1;
        return (
            <div className="preview-table__edge preview-table__edge--bottom">
                <div className="preview-table__edge-btns">
                    <button
                        type="button"
                        className="preview-table__edge-btn"
                        onClick={() => addRowAfter(bodyRowIdx)}
                        title="在下方添加行"
                    >
                        +
                    </button>
                    {!isHeader && (
                        <button
                            type="button"
                            className="preview-table__edge-btn"
                            disabled={!canDelete}
                            onClick={() => setMenu({edge: 'bottom', rowIdx, colIdx, isHeader})}
                            title="行操作"
                        >
                            ⋯
                        </button>
                    )}
                </div>
                {showMenu && (
                    <div
                        className="preview-table__dropdown preview-table__dropdown--bottom"
                        onMouseLeave={() => setMenu(null)}
                    >
                        <button
                            type="button"
                            disabled={rows.length <= 1}
                            onClick={() => deleteRow(bodyRowIdx)}
                        >
                            删除行
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const renderCell = (
        content: string,
        rowIdx: number,
        colIdx: number,
        isHeader: boolean,
    ) => {
        return (
            <>
                <span className="preview-table__cell">{content}</span>
                {renderEdge('right', rowIdx, colIdx, isHeader)}
                {renderEdge('bottom', rowIdx, colIdx, isHeader)}
                {/* 左边线仅在第一列渲染 */}
                {colIdx === 0 && renderEdge('left', rowIdx, colIdx, isHeader)}
            </>
        );
    };

    return (
        <div className="preview-table">
            <table className="preview-table__table">
                <thead>
                    <tr>
                        {Array.from({length: colCount}, (_, i) => (
                            <th key={i}>{renderCell(header[i] ?? '', 0, i, true)}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, rowIdx) => (
                        <tr key={rowIdx}>
                            {Array.from({length: colCount}, (_, colIdx) => (
                                <td key={colIdx}>
                                    {renderCell(row[colIdx] ?? '', rowIdx, colIdx, false)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
