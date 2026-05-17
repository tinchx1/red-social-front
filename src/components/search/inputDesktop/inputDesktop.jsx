"use client";
import { useRouter } from "next/navigation";
import { useSearch } from "@/contexts";
import SearchIcon from "@/assets/search.svg";
import styles from "./inputDesktop.module.scss";

const InputDesktop = ({
  placeholder = "Buscar empresa o comunidad",
  onSearch,
  onInputChange,
  onInputClick,
  value = "",
  onClose,
}) => {
  const router = useRouter();
  const { searchInputRef } = useSearch();

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearchClick();
  };

  const handleSearchClick = () => {
    if (value.trim()) {
      router.push(`/buscar?keyword=${encodeURIComponent(value.trim())}`);
      if (onClose) {
        onClose();
      }
    }
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    if (onInputChange) {
      onInputChange(inputValue);
    }
  };

  const handleInputClick = () => {
    if (onInputClick) {
      onInputClick();
    }
  };

  return (
    <div className={styles.searchContainer}>
      <form onSubmit={handleSubmit}>
        <input
          ref={searchInputRef}
          type="text"
          placeholder={placeholder}
          className={styles.searchInput}
          value={value}
          onChange={handleInputChange}
          onClick={handleInputClick}
          data-search-input
        />
        <SearchIcon
          className={styles.searchIcon}
          preserveAspectRatio="xMidYMid meet"
          onClick={handleSearchClick}
          role="button"
          aria-label="Buscar"
          tabIndex={0}
        />
      </form>
    </div>
  );
};

export default InputDesktop;
