'use client'
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import SearchCard from '@/components/search/SearchCard/SearchCard';
import SearchIcon from '@/assets/search.svg';
import { getSearchSuggestions } from '@/actions/search';
import { useDebounce } from '@/hooks/useDebounce';
import { PROVINCE_OPTIONS } from '@/constants/personForm';
import styles from './RecommendationSearch.module.scss';

// Format province value to label
const formatProvince = (province) => {
  if (!province) return '';
  const found = PROVINCE_OPTIONS.find((opt) => opt.value === province);
  return found ? found.label : province;
};

// Helper function to format API data to component format
const formatSearchResult = (item) => {
  switch (item.type) {
    case 'persona':
      return {
        id: item.id,
        query: `${item.firstName} ${item.lastName || ''}`.trim(),
        description: `${item.industry} - ${item.company || 'Independiente'}`,
        avatar: item.avatarUrl,
        type: 'persona'
      };
    case 'empresa':
      return {
        id: item.id,
        query: item.firstName,
        description: `${item.industry} - ${formatProvince(item.province)}`,
        avatar: item.avatarUrl,
        type: 'empresa'
      };
    case 'parque_industrial':
      return {
        id: item.id,
        query: item.firstName,
        description: `${item.industry} - ${formatProvince(item.province)}`,
        avatar: item.avatarUrl,
        type: 'parque_industrial'
      };
    case 'community':
      return {
        id: item.id,
        query: item.name,
        description: `${item.sector} - ${item.membersCount} miembros`,
        avatar: item.avatarUrl,
        type: 'community'
      };
    default:
      return {
        id: item.id,
        query: item.name || item.firstName || 'Sin nombre',
        description: item.sector || item.industry || 'Sin descripción',
        avatar: item.avatarUrl,
        type: item.type
      };
  }
};

const RecommendationSearch = ({
  isOpen,
  onClose,
  onSelect,
  searchQuery = '',
  title = 'Resultados de búsqueda',
  placement = 'absolute',
}) => {
  const router = useRouter();
  const [filteredRecommendations, setFilteredRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const currentQueryRef = useRef('');
  const isLoadingRef = useRef(false);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Effect para filtrar recomendaciones con debounce
  useEffect(() => {
    const filterRecommendations = async (query) => {
      // Prevent duplicate API calls for the same query
      if (!query || query.length < 1 || query === currentQueryRef.current || isLoadingRef.current) {
        if (!query || query.length < 1) {
          setFilteredRecommendations([]);
          currentQueryRef.current = '';
        }
        return;
      }

      currentQueryRef.current = query;
      isLoadingRef.current = true;
      setIsLoading(true);
      
      try {
        const response = await getSearchSuggestions(query);
        
        // Si no hay resultados (summary.total === 0), mostrar array vacío
        if (response.summary?.total === 0) {
          setFilteredRecommendations([]);
        } else {
          // Formatear los resultados y limitar a 3
          const formattedResults = response.data
            .slice(0, 3)
            .map(item => formatSearchResult(item));
          setFilteredRecommendations(formattedResults);
        }
      } catch (error) {
        console.error('Error fetching search suggestions:', error);
        setFilteredRecommendations([]);
      } finally {
        isLoadingRef.current = false;
        setIsLoading(false);
      } 
    };

    if (!isOpen) {
      setFilteredRecommendations([]);
      currentQueryRef.current = '';
      return;
    }
    
    filterRecommendations(debouncedSearchQuery);
  }, [debouncedSearchQuery, isOpen]);

  const handleSelect = (recommendation) => {
    if (onSelect) {
      onSelect(recommendation.query, recommendation);
    }
    // Push to search page with general ref param instead of id
    const typeKey = recommendation.type;
    const ref = recommendation.id;
    router.push(`/buscar?keyword=${encodeURIComponent(recommendation.query)}&type=${encodeURIComponent(typeKey)}&ref=${encodeURIComponent(ref)}`);
  };

  const handleViewAll = () => {
    // Lógica para ver todos los resultados
    router.push(`/buscar?keyword=${encodeURIComponent(searchQuery)}`);
    onClose();
  };

  return (
    <SearchCard title={title} isOpen={isOpen} onClose={onClose} placement={placement}>
      <div className={styles.recommendationsContainer}>
        {isLoading ? (
          <div className={styles.loadingItem}>
            <span className={styles.loadingText}>Buscando...</span>
          </div>
        ) : filteredRecommendations.length > 0 ? (
          <>
            {filteredRecommendations.map((recommendation) => (
              <div 
                key={recommendation.id} 
                className={styles.recommendationItem}
                onClick={() => handleSelect(recommendation)}
              >
                <div className={styles.searchInfo}>
                  <SearchIcon className={styles.searchIcon}/>
                    <span className={styles.queryText}>{recommendation.query}</span>
                    <span className={styles.descriptionText}>{recommendation.description}</span>
                </div>
                <div className={styles.logoContainer}>
                  <div className={styles.companyLogo}>
                    <div className={styles.avatar}>
                      <img 
                        src={recommendation.avatar || "/images/profile.svg"} 
                        alt={recommendation.query}
                        className={styles.avatarImage}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className={styles.separator} />
            
            <div className={styles.viewAllItem} onClick={handleViewAll}>
              <span className={styles.viewAllText}>Ver todos los resultados</span>
            </div>
          </>
        ) : (
          <div className={styles.noResultsItem}>
            <span className={styles.noResultsText}>No se encontraron resultados</span>
          </div>
        )}
      </div>
    </SearchCard>
  );
};

export default RecommendationSearch;
