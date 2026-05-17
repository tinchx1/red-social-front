'use client'
import { useEffect } from 'react'
import { usePosts } from '@/contexts/PostsContext'

/**
 * @param {{ membershipStatus: any; children: React.ReactNode }} props
 */
export function CommunityMembershipProvider({ membershipStatus, children }) {
  const { setCommunityMembershipStatus } = usePosts()

  useEffect(() => {
    setCommunityMembershipStatus(membershipStatus)
  }, [membershipStatus, setCommunityMembershipStatus])

  return children
}
