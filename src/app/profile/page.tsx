import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import ProfilePageWithLoading from '@/components/ProfilePageWithLoading';

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }
  // Pass auth from server so the client component does not need ClerkProvider context
  return <ProfilePageWithLoading initialUserId={userId} />;
}