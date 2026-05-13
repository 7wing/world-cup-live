import { useParams } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { FriendList } from '@/components/profile/FriendList'
import { useFriends } from '@/hooks/useProfile'

export function FriendsPage() {
  const { userId } = useParams<{ userId: string }>()
  const { data: friends, isLoading } = useFriends(userId!)

  return (
    <PageWrapper>
      <h1 className="font-lexend font-black text-4xl uppercase italic mb-8">Friends</h1>
      {isLoading ? <div className="glass-card h-64 rounded-xl animate-pulse" /> : <FriendList friends={friends ?? []} />}
    </PageWrapper>
  )
}