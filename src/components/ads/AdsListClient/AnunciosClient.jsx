"use client";

import { useState } from "react";
import AdsListClient from "@/components/ads/AdsListClient/AdsListClient";
import { Input, Button } from "@/components/ui";
import { VolverButton } from "@/components";
import CloseCircleIcon from "@/assets/close_ring.svg?react";
import dayjs from "dayjs";
import styles from "@/styles/pages/AdsTables.module.scss";
import filterStyles from "@/components/ads/AdsListClient/AdsListClient.module.scss";
import ButtonAds from "../ButtonAds/ButtonAds";

/**
 * @param {{
 *   clientId: string;
 *   initialData?: { ads?: any[]; profile?: any };
 *   hasNoResults?: boolean;
 * }}
 */
export default function AnunciosClient({
  clientId,
  initialData,
  hasNoResults,
}) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const handleDateFromChange = (value) => {
    setDateFrom(value);
    if (value && dateTo && dayjs(value).isAfter(dayjs(dateTo))) {
      setDateTo("");
    }
  };

  const handleDateToChange = (value) => {
    setDateTo(value);
    if (value && dateFrom && dayjs(value).isBefore(dayjs(dateFrom))) {
      setDateFrom("");
    }
  };

  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
  };

  return (
    <div
      className={`${styles.container} ${
        hasNoResults ? styles.emptyContainer : ""
      }`}
    >
      <div
        className={
          styles.header + " " + (hasNoResults ? styles.emptyHeader : "")
        }
      >
        {hasNoResults ? null : <VolverButton />}
        <h1 className={styles.title}>ANUNCIOS</h1>
        <div className={filterStyles.headerFilters}>
          <div className={filterStyles.dateFilterContainer}>
            <div className={filterStyles.dateInputContainer}>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  const value = e?.target?.value || e;
                  handleDateFromChange(value);
                }}
                label="Desde"
                className={filterStyles.dateInput}
              />
              {dateFrom && (
                <span
                  className={filterStyles.clearButton}
                  onClick={() => handleDateFromChange("")}
                  aria-label="clear"
                  role="button"
                >
                  <CloseCircleIcon height={15} width={15} />
                </span>
              )}
            </div>
            <div className={filterStyles.dateInputContainer}>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  const value = e?.target?.value || e;
                  handleDateToChange(value);
                }}
                label="Hasta"
                className={filterStyles.dateInput}
              />
              {dateTo && (
                <span
                  className={filterStyles.clearButton}
                  onClick={() => handleDateToChange("")}
                  aria-label="clear"
                  role="button"
                >
                  <CloseCircleIcon height={15} width={15} />
                </span>
              )}
            </div>
          </div>
          <Button
            onClick={clearFilters}
            disabled={!dateFrom && !dateTo}
            className={filterStyles.clearFiltersBtn}
          >
            Limpiar filtros
          </Button>
        </div>
      </div>
      <AdsListClient
        clientId={clientId}
        initialData={initialData}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={handleDateFromChange}
        onDateToChange={handleDateToChange}
        onClearFilters={clearFilters}
      />
    </div>
  );
}
