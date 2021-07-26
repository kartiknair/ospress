/** @jsxImportSource @emotion/react */
import firebase from 'firebase'
import { useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { css } from '@emotion/react'

import FIREBASE_CONIFG from '../../lib/firebase-config'
import { createPostForUser } from '../../lib/db'
import Button from '../../components/button'
import Spinner from '../../components/spinner'
import Container from '../../components/container'
import theme from '../../lib/theme'

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
    return (
      <Container maxWidth="420px">
        <Spinner />
      </Container>
    )
  } else if (userError || postsError) {
    return (
      <Container maxWidth="420px">
        <p>Oop, we've had an error:</p>
        <pre>{JSON.stringify(error)}</pre>
      </Container>
    )
  }

  return (
    <Container maxWidth="420px">
      <Button
        css={css`
          font-size: 0.9rem;
          margin-left: auto;
        `}
        onClick={async () => {
          const newPostsId = await createPostForUser(user.uid)
          router.push(`/dashboard/${newPostsId}`)
        }}
      >
        Create post
      </Button>

      <ul
        css={css`
          list-style: none;
        `}
      >
        {posts.map(post => (
          <li
            key={post.id}
            css={css`
              margin: 1rem 0;
            `}
          >
            <Link href={`/dashboard/${post.id}`}>
              <a
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  borderBottom: `1px dotted ${theme.colors.grey[2]}`,
                }}
              >
                {!post.published && '[DRAFT]'} {post.title}
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  )
}
