/** @jsxImportSource @emotion/react */
import Link from 'next/link'
import firebase from 'firebase'
import { useEffect } from 'react'
import { css } from '@emotion/react'
import { useRouter } from 'next/router'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'

import { createPostForUser } from '../../lib/db'
import FIREBASE_CONIFG from '../../lib/firebase-config'

import Button from '../../components/button'
import Header from '../../components/header'
import Spinner from '../../components/spinner'
import Container from '../../components/container'
import ProfileSettingsModal from '../../components/profile-settings-modal'

if (firebase.apps.length === 0) {
  firebase.initializeApp(FIREBASE_CONIFG)
}

function formatDate(date) {
  const year = date.getFullYear()
  let month = '' + (date.getMonth() + 1)
  let day = '' + date.getDate()

  if (month.length < 2) month = '0' + month
  if (day.length < 2) day = '0' + day

  return [day, month, year].join('-')
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

  return (
    <>
      <Header>
        <Link href="/dashboard/list">
          <a>Reading List</a>
        </Link>
        <ProfileSettingsModal Trigger={() => 'Profile'} uid={user?.uid} />
        <button onClick={() => firebase.auth().signOut()}>Sign Out</button>
      </Header>

      {userLoading || postsLoading ? (
        <Spinner />
      ) : userError || postsError ? (
        <>
          <p>Oop, we've had an error:</p>
          <pre>{JSON.stringify(error)}</pre>
        </>
      ) : (
        <>
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
                  margin: 1.5rem 0;
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
                    width: 7rem;
                    font-size: 0.9rem;
                    color: var(--grey-3);
                  `}
                >
                  <time>{formatDate(post.lastEdited.toDate())}</time>
                </p>
                <Link href={`/dashboard/${post.id}`}>
                  <a
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      borderBottom: `1px dotted var(--grey-2)`,
                    }}
                  >
                    {!post.published && (
                      <span
                        css={css`
                          display: inline-block;
                          background: var(--grey-2);
                          color: var(--grey-4);
                          opacity: 0.7;
                          padding: 0.25rem;
                          border-radius: 0.25rem;
                          font-size: 0.9rem;
                        `}
                      >
                        DRAFT
                      </span>
                    )}
                    {'  '}
                    {post.title || 'Untitled'}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}

Dashboard.getLayout = page => (
  <Container
    maxWidth="640px"
    css={css`
      margin-top: 5rem;
    `}
  >
    {page}
  </Container>
)
