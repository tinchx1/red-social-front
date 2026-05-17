"use client";
import React from "react";
import styles from "./DataTable.module.scss";
import { Spinner } from "@/components/ui";
/**
 * @param {{
 *   data: Array<any>;
 *   columns: Array<{
 *     key: string;
 *     label: string;
 *     sortable?: boolean;
 *     render?: (value: any, row: any) => React.ReactNode;
 *   }>;
 *   className?: string;
 *   loading?: boolean;
 * }} props
 */
export default function DataTable({ data = [], columns = [], className = "", loading = false, userId = null }) {
  return (
    <div className={`${styles.tableContainer} ${className}`}>
      <table className={styles.table}>
        <thead className={styles.header}>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className={styles.body}>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className={styles.loading}>
                <div className={styles.loadingSpinner}>
                  <div className={styles.spinner}></div>
                  <span>Cargando <Spinner color="white" size="small" /></span>
                </div>
              </td>
            </tr>
          ) : data && data.length > 0 ? (
            data.map((row, index) => (
                <tr key={row.id || row.userId || index}>
                {columns.map((column) => {
                  const value = row[column.key];
                  
                  if (column.render) {
                    return (
                      <td key={column.key}>
                        {column.render(value, row, userId)}
                      </td>
                    );
                  }
                  
                  return (
                    <td key={column.key}>
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className={styles.noData}>
                No hay datos disponibles
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}


