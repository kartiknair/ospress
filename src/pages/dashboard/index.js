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
    <Container
      maxWidth="640px"
      css={css`
        margin-top: 5rem;
      `}
    >
      <header
        css={css`
          display: flex;
          margin-bottom: 5rem;

          a:first-child {
            margin-left: auto;
          }

          a {
            display: block;
            margin-right: 1.5rem;
            text-decoration: none;
          }

          a,
          button {
            color: ${theme.colors.grey[2]};
            cursor: pointer;
            transition: all 200ms ease;
          }

          a:hover,
          button:hover {
            color: ${theme.colors.grey[3]};
          }

          button {
            margin-right: 0;
          }

          button {
            border: none;
            padding: 0;
            margin: 0;
            background: none;
          }
        `}
      >
        <Link href="/dashboard/profile">
          <a>Profile</a>
        </Link>
        <button onClick={() => firebase.auth().signOut()}>Sign Out</button>
      </header>

      <Button
        type="outline"
        css={css`
          font-size: 0.9rem;
          margin-right: auto;
        `}
        onClick={async () => {
          const newPostsId = await createPostForUser(user.uid)
          router.push(`/dashboard/${newPostsId}`)
        }}
      >
        New post
      </Button>

      <ul
        css={css`
          margin-top: 3.5rem;
          list-style: none;
        `}
      >
        {posts.map(post => (
          <li
            key={post.id}
            css={css`
              margin: 1rem 0;
              display: flex;
              a {
                margin-left: 3rem;
              }

              @media (max-width: 720px) {
                display: block;
                margin: 2rem 0;

                a {
                  margin: 0;
                }
                p {
                  margin-bottom: 0.75rem;
                }
              }
            `}
          >
            <p
              css={css`
                width: 9rem;
                font-size: 0.9rem;
                color: ${theme.colors.grey[3]};
              `}
            >
              <time>{post.lastEdited.toDate().toDateString()}</time>
            </p>
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
