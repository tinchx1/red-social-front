"use client";
import { Input } from "@/components/ui";
import styles from "./SearchBar.module.scss";
import SearchIcon from "@/assets/search.svg";
import { useState } from "react";

export const SearchbarContainer = ({
  onSearch,
  placeholder = "Buscar comunidades",
  title = "Comunidades recomendadas",
}) => {
  const [searchParam, setSearchParam] = useState("");

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchParam(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchParam);
    }
  };

  return (
    <div className={styles.container}>
      {title && <p className={styles.title}>{title}</p>}
      <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
        <Input
          type="text"
          placeholder={placeholder}
          style={{ borderRadius: "20px", padding: "20px" }}
          icon={<SearchIcon />}
          iconPosition="right"
          rounded="large"
          value={searchParam}
          onChange={handleSearchChange}
        />
      </form>
    </div>
  );
};
