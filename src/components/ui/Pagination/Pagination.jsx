"use client";
import React from "react";
import styles from "./Pagination.module.scss";
import { Button, Select } from "@/components/ui";

const range = (start, end) => {
  const result = [];
  for (let i = start; i <= end; i += 1) result.push(i);
  return result;
};

const ELLIPSIS = "…";

/**
 * @param {Object} props
 * @param {number} props.totalItems
 * @param {number} props.pageSize
 * @param {number} props.currentPage
 * @param {(page:number)=>void} props.onPageChange
 * @param {number} [props.siblingCount]
 * @param {string} [props.className]
 * @param {boolean} [props.showTotals]
 * @param {string} [props.itemName]
 * @param {number[]} [props.pageSizeOptions]
 * @param {(size:number)=>void} [props.onPageSizeChange]
 */
const Pagination = ({
  totalItems,
  pageSize,
  currentPage,
  onPageChange,
  siblingCount = 1,
  className = "",
  showTotals = false,
  itemName = "Items",
  pageSizeOptions = [10, 20, 30, 50],
  onPageSizeChange,
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const clampedCurrent = Math.min(Math.max(1, currentPage), totalPages);

  const totalPageNumbers = siblingCount * 2 + 5;

  const paginationRange = React.useMemo(() => {
    if (totalPageNumbers >= totalPages) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(clampedCurrent - siblingCount, 1);
    const rightSiblingIndex = Math.min(
      clampedCurrent + siblingCount,
      totalPages
    );

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = range(1, leftItemCount);
      return [...leftRange, ELLIPSIS, totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = range(totalPages - rightItemCount + 1, totalPages);
      return [firstPageIndex, ELLIPSIS, ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [
        firstPageIndex,
        ELLIPSIS,
        ...middleRange,
        ELLIPSIS,
        lastPageIndex,
      ];
    }

    return range(1, totalPages);
  }, [clampedCurrent, siblingCount, totalPages, totalPageNumbers]);

  const isFirst = clampedCurrent === 1;
  const isLast = clampedCurrent === totalPages;

  const handleChange = (page) => {
    if (page < 1 || page > totalPages || page === clampedCurrent) return;
    onPageChange?.(page);
  };

  return (
    <nav
      className={`${styles.pagination} ${className}`.trim()}
      aria-label="Pagination"
    >
      <div className={styles.paginationInfo}>
        <span className={styles.pageText}>
          {clampedCurrent} de {totalPages}
        </span>
      </div>

      <div className={styles.paginationControls}>
        <Button
          size="xs"
          onClick={() => handleChange(1)}
          disabled={isFirst}
          aria-label="First page"
          type="button"
        >
          <svg
            className={styles.icon}
            width="12"
            height="12"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11 6L5 12L11 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M18 6L12 12L18 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>

        <Button
          size="xs"
          onClick={() => handleChange(clampedCurrent - 1)}
          disabled={isFirst}
          aria-label="Previous page"
          type="button"
        >
          <svg
            className={styles.icon}
            width="12"
            height="12"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 18L9 12L15 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>

        <ul className={styles.pages}>
          {paginationRange.map((item, idx) => {
            if (item === ELLIPSIS) {
              return (
                <li key={`dots-${idx}`} className={styles.ellipsis} aria-hidden>
                  {ELLIPSIS}
                </li>
              );
            }

            const page = item;
            const isActive = page === clampedCurrent;
            return (
              <li key={page}>
                <Button
                  type="button"
                  variant={isActive ? "default" : "light-blue"}
                  className={styles.pageButton}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => handleChange(page)}
                  size="xs"
                >
                  {page}
                </Button>
              </li>
            );
          })}
        </ul>

        <Button
          size="xs"
          onClick={() => handleChange(clampedCurrent + 1)}
          disabled={isLast}
          aria-label="Next page"
          type="button"
        >
          <svg
            className={styles.icon}
            width="12"
            height="12"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 18L15 12L9 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>

        <Button
          size="xs"
          onClick={() => handleChange(totalPages)}
          disabled={isLast}
          aria-label="Last page"
          type="button"
        >
          <svg
            className={styles.icon}
            width="12"
            height="12"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 6L12 12L6 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13 6L19 12L13 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>
      </div>

      <div className={styles.controls}>
        {showTotals && (
          <span className={styles.totals} aria-live="polite">
            {clampedCurrent} / {totalPages}
          </span>
        )}
        <Select
          value={pageSize}
          onChange={(val) => onPageSizeChange?.(Number(val))}
          options={pageSizeOptions.map((n) => ({ value: n, label: String(n) }))}
          placeholder={String(pageSize)}
          truncate
          className={styles.pageSizeSelect}
          placement="top"
          dropdownWidth="100px"
        />
        <span className={styles.totals}>{itemName} por página</span>
      </div>
    </nav>
  );
};

export default Pagination;
