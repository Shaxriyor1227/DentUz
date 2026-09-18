import React from 'react';
import styles from './DataTable.module.css';

export default function DataTable({
  columns = [],
  data = [],
  keyField = 'id',
  onRowClick,
  emptyMessage = 'Ma\'lumot topilmadi',
  className = ''
}) {
  return (
    <div className={`${styles.tableContainer} ${className}`}>
      <div className={styles.scrollArea}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  className={`${styles.th} ${col.align === 'right' ? styles.thRight : ''}`}
                  style={{ width: col.width }}
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={styles.emptyState}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={row[keyField] || rowIdx}
                  className={styles.tr}
                  onClick={() => onRowClick && onRowClick(row)}
                  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={col.key || colIdx}
                      className={`${styles.td} ${
                        col.align === 'right' ? styles.tdRight : ''
                      }`}
                    >
                      {col.render ? col.render(row[col.key], row, rowIdx) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
