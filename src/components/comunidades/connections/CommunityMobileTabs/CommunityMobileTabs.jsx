"use client";
import React, { useState } from 'react';
import styles from './CommunityMobileTabs.module.scss';
import CommunityFeedWrapper from '@/components/comunidades/CommunityFeedWrapper';
import AddParticipants from '@/components/comunidades/profile/AddParticipants/AddParticipants';

/**
 * @param {{ 
 *   posts: any[]; 
 *   communityId: string; 
 *   hasMore?: boolean; 
 *   onLoadMore?: () => Promise<void>;
 *   isJoined: boolean;
 * }} props
 */
export default function CommunityMobileTabs({ 
  posts, 
  communityId, 
  hasMore, 
  onLoadMore, 
  isJoined 
}) {
  const [activeTab, setActiveTab] = useState('publicaciones');

  const tabs = [
    { id: 'publicaciones', label: 'Publicaciones' },
    { id: 'invitar', label: 'Invitar' }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.tabsHeader}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'publicaciones' && (
          <CommunityFeedWrapper
            posts={posts}
            communityId={communityId}
            hasMore={hasMore}
            isJoined={isJoined}
          />
        )}
        
        {activeTab === 'invitar' && (
          <AddParticipants communityId={communityId} />
        )}
      </div>
    </div>
  );
}
