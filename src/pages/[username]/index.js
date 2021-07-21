import firebase from 'firebase'
import Link from 'next/link'

import { getUserByName } from '../../lib/db'
import FIREBASE_CONIFG from '../../lib/firebase-config'

if (firebase.apps.length === 0) {
  firebase.initializeApp(FIREBASE_CONIFG)
}

export default function Profile({ user }) {
  return (
    <main>
      <h1>{user.displayName}'s profile page!</h1>
      <h2>Posts:</h2>
      <ul>
        {user.posts.map(post => (
          <li key={post.id}>
            <Link href={`/${user.name}/${post.slug}`}>
              <a>
                <h3>{post.title}</h3>
              </a>
            </Link>
            <p>{post.excerpt}</p>
          </li>
        ))}
      </ul>
    </main>
  )
}

export async function getStaticPaths() {
  const snapshot = await firebase.firestore().collection('users').get()
  const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  return {
    paths: users.map(u => ({ params: { username: u.name } })),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const { username } = params

  try {
    const user = await getUserByName(username)
    return {
      props: { user },
    }
  } catch (err) {
    return { notFound: true }
  }
}
