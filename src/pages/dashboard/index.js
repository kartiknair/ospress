import firebase from 'firebase'
import { useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import { useRouter } from 'next/router'
import Link from 'next/link'

import FIREBASE_CONIFG from '../../lib/firebase-config'
import { createPostForUser } from '../../lib/db'

if (firebase.apps.length === 0) {
  firebase.initializeApp(FIREBASE_CONIFG)
}

export default function Dashboard() {
  const router = useRouter()

  const [user, userLoading, userError] = useAuthState(firebase.auth())
  const [posts, postsLoading, postsError] = useCollectionData(
    firebase
      .firestore()
      .collection('posts')
      .where('author', '==', user ? user.uid : ''),
    { idField: 'id' },
  )

  useEffect(() => {
    if (!user && !userLoading && !userError) {
      router.push('/')
      return
    }
  }, [user, userLoading, userError])

  if (userLoading || postsLoading) {
    return <p>Loading...</p>
  } else if (userError || postsError) {
    return (
      <>
        <p>Oop, we've had an error:</p>
        <pre>{JSON.stringify(error)}</pre>
      </>
    )
  }

  return (
    <main>
      <button
        onClick={async () => {
          console.log(user.uid)
          const newPostsId = await createPostForUser(user.uid)
          router.push(`/dashboard/${newPostsId}`)
        }}
      >
        Create post
      </button>

      <h1>Posts:</h1>
      <ul>
        {posts.map(post => (
          <li key={post.id}>
            <Link href={`/dashboard/${post.id}`}>
              <a>
                {!post.published && '[DRAFT]'} {post.title}
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
