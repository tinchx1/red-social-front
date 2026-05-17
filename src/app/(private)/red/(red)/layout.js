import React from 'react';
import styles from '@/styles/layout/red.module.scss';
import { RedAside, BlockedSection, ContactSuggestionsList } from '@/components';
import { getMyProfile, getProfileStats } from '@/actions/profile';
import UsersIcon from '@/assets/users.svg';

export const metadata = {
	title: 'Mi Red',
};

async function RedAsideWithData({ isBlocked = false }) {
	let contactsCount = 0;
	let contactRequestsCount = 0;
	try {
		const stats = await getProfileStats();
		contactsCount = stats.contacts.totalContacts || 0;
		contactRequestsCount = stats.contacts.pendingRequests || 0;
	} catch (error) {
		console.error('Error fetching profile stats:', error);
	}

	return (
		<RedAside 
			contactsCount={contactsCount}
			solicitudesCount={contactRequestsCount}
			isBlocked={isBlocked}
		/>
	);
}

export default async function RedLayout({ children }) {
	let isFreePlan = false;
	try {
		const profile = await getMyProfile();
		isFreePlan = profile?.subscription?.key === "free";
	} catch (error) {
		console.error('Error fetching profile:', error);
	}

	return (
		<section className={styles.container + ' container-padding'}>
			<h2 className={styles.title}>Mi Red</h2>
			{/* <Suspense fallback={<AsideSkeleton variant="red" />}> */}
				<RedAsideWithData isBlocked={isFreePlan} />
			{/* </Suspense> */}
			<main className={styles.main} style={{ position: 'relative' }}>
				{isFreePlan ? (
					<>
						<div 
							style={{ 
								opacity: 0.6,
								filter: 'blur(0.8px)',
							}}
						>
							<ContactSuggestionsList forceEmpty={true} />
						</div>
						<div
							style={{
								position: "absolute",
								top: 0,
								left: 0,
								right: 0,
								bottom: 0,
								zIndex:  99,
								pointerEvents: "auto",
								backgroundColor: "transparent",
							}}
						>
							<BlockedSection desc='Para ampliar tu red, 
contratá un plan que se ajuste a tus necesidades'  icon={<UsersIcon />} />
						</div>
					</>
				) : (
					children
				)}
			</main>
		</section>
	);
}


