import styles from './Skeleton.module.scss';

export default function Skeleton({ 
  width = '100%', 
  height = '20px', 
  borderRadius = '4px',
  className = '',
  variant = 'default' // 'default', 'text', 'circular', 'rectangular'
}) {
  const getVariantClass = () => {
    switch (variant) {
      case 'text':
        return styles.text;
      case 'circular':
        return styles.circular;
      case 'rectangular':
        return styles.rectangular;
      default:
        return styles.default;
    }
  };

  return (
    <div 
      className={`${styles.skeleton} ${getVariantClass()} ${className}`}
      style={{ 
        width, 
        height, 
        ...(variant !== 'circular' && { borderRadius })
      }}
    />
  );
}
