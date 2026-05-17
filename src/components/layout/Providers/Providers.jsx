"use client";

import { PostsProvider } from "@/contexts/PostsContext";
import { SearchProvider } from "@/contexts/SearchContext";
import { SocketProvider } from "@/contexts/SocketContext";
import {
  MessageNotificationProvider,
  PlanProvider,
  FooterMenuProvider,
} from "@/contexts";
import { OpenChatsProvider } from "@/contexts/OpenChatsContext";
import { ProfileProvider } from "@/contexts/ProfileContext";

/**
 * @param {{
 *   children: React.ReactNode;
 *   initialPlan?: any;
 *   initialPosts?: any[];
 *   initialPagination?: { page: number; limit: number; total: number; pages: number };
 *   initialProfile?: any;
 *   initialProfileStats?: any;
 * }} props
 */
export default function Providers({
  children,
  initialPlan,
  initialPosts = [],
  initialPagination = { page: 1, limit: 10, total: 0, pages: 0 },
  initialProfile = null,
  initialProfileStats = null,
}) {
  return (
    <FooterMenuProvider>
      <ProfileProvider
        initialProfile={initialProfile}
        initialStats={initialProfileStats}
      >
        <PlanProvider initialPlan={initialPlan}>
          <SocketProvider>
            <SearchProvider>
              <MessageNotificationProvider>
                <OpenChatsProvider>
                  <PostsProvider
                    initialPosts={initialPosts}
                    initialPagination={initialPagination}
                  >
                    {children}
                  </PostsProvider>
                </OpenChatsProvider>
              </MessageNotificationProvider>
            </SearchProvider>
          </SocketProvider>
        </PlanProvider>
      </ProfileProvider>
    </FooterMenuProvider>
  );
}
