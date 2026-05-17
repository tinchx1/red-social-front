'use client';

import { createContext, useContext } from 'react';

const CreatorContext = createContext(null);

export const useCreator = () => {
  const context = useContext(CreatorContext);
  if (context === undefined) {
    throw new Error('useCreator must be used within a CreatorProvider');
  }

  // Check if creator has moderation rights
  // Only non-persona roles with full plan can moderate content
  const canModerate =
    context?.role?.key !== 'persona'

  return {
    ...context,
    canModerate
  };
};

export default function CreatorProvider({ creator, children }) {
  return (
    <CreatorContext.Provider value={creator}>
      {children}
    </CreatorContext.Provider>
  );
}
