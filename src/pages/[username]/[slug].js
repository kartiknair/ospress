import firebase from 'firebase'

import { getPostByUsernameAndSlug } from '../../lib/db'
import FIREBASE_CONIFG from '../../lib/firebase-config'

if (firebase.apps.length === 0) {
  firebase.initializeApp(FIREBASE_CONIFG)
}

export default function Post({ post }) {
  return (
    <main>
      <h1>{post.title}</h1>
      <p>
        By {post.author} | Last edited:{' '}
        {new Date(post.lastEdited).toDateString()}
      </p>
      <p>{post.content}</p>
    </main>
  )
}

export async function getStaticPaths() {
  const snapshot = await firebase.firestore().collection('posts').get()
  let posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  posts = posts.filter(p => p.published)

  return {
    paths: posts.map(post => ({
      params: { username: post.author, slug: post.slug },
    })),
    fallback: 'blocking',
  }
}

export async function getStaticProps({ params }) {
  const { username, slug } = params

  try {
    const post = await getPostByUsernameAndSlug(username, slug)
    if (!post.published) {
      return { notFound: true }
    }
    post.lastEdited = post.lastEdited.toDate().getTime()
    return {
      props: { post, revalidate: 1 },
    }
  } catch (err) {
    return { notFound: true }
  }
}
