/** @jsxImportSource @emotion/react */
import Link from 'next/link'
import Head from 'next/head'
import firebase from 'firebase'
import { css } from '@emotion/react'
import { htmlToText } from 'html-to-text'
import { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'

import Header from '../../components/header'
import Spinner from '../../components/spinner'
import Container from '../../components/container'
import ProfileSettingsModal from '../../components/profile-settings-modal'

import theme from '../../lib/theme'
import { truncate } from '../../lib/utils'
import FIREBASE_CONIFG from '../../lib/firebase-config'
import { getPostByID, getUserByID } from '../../lib/db'

if (firebase.apps.length === 0) {
  firebase.initializeApp(FIREBASE_CONIFG)
}

function List({ uid }) {
  const [list, setList] = useState([])

  useEffect(() => {
    ;(async () => {
      const user = await getUserByID(uid)
      const postPromises = user.readingList.map(async pid => {
        const post = await getPostByID(pid)
        const author = await firebase
          .firestore()
          .collection('users')
          .doc(post.author)
          .get()
        post.author = author.data()
        return post
      })
      const posts = await Promise.all(postPromises)
      console.log(posts)
      setList(posts)
    })()
  }, [])

  if (list.length > 0)
    return (
      <ul
        css={css`
          list-style: none;
        `}
      >
        {list.map(post => (
          <li key={post.id}>
            <Link href={`/${post.author.name}/${post.slug}`}>
              <a style={{ textDecoration: 'none', color: 'inherit' }}>
                <h3
                  css={css`
                    font-size: 1rem;
                    font-weight: 400;
                    margin-bottom: 0.6rem;
                  `}
                >
                  {post.title || 'Untitled'}
                </h3>

                <div
                  css={css`
                    display: flex;
                    align-items: center;
                    color: ${theme.colors.grey[3]};
                    font-size: 0.9rem;
                  `}
                >
                  <img
                    src={post.author.photo}
                    alt="Profile picture"
                    css={css`
                      width: 1.5rem;
                      border-radius: 1rem;
                      margin-right: 0.75rem;
                    `}
                  />
                  <p>{post.author.displayName}</p>
                </div>

                <p
                  css={css`
                    max-width: 25rem;
                    color: ${theme.colors.grey[4]};
                    font-family: 'Newsreader', serif;
                    line-height: 1.5em;
                    margin-top: 0.5rem;
                  `}
                >
                  {post.excerpt || truncate(htmlToText(post.content), 25)}
                </p>
              </a>
            </Link>
          </li>
        ))}
      </ul>
    )

  return <p>You have no posts saved to read later.</p>
}

export default function ReadingList() {
  const [user, userLoading, userError] = useAuthState(firebase.auth())

  useEffect(() => {
    if (!user && !userLoading && !userError) {
      router.push('/')
      return
    }
  }, [user, userLoading, userError])

  return (
    <>
      <Header>
        <Link href="/dashboard">
          <a>Dashboard</a>
        </Link>
        <ProfileSettingsModal Trigger={() => 'Profile'} uid={user?.uid} />
        <button onClick={() => firebase.auth().signOut()}>Sign Out</button>
      </Header>

      {userLoading ? (
        <Spinner />
      ) : userError ? (
        <>
          <p>Oop, we've had an error:</p>
          <pre>{JSON.stringify(error)}</pre>
        </>
      ) : (
        <>
          <Head>
            <link
              href="https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,600;1,400;1,600"
              rel="stylesheet"
            />
          </Head>
          <List uid={user.uid} />
        </>
      )}
    </>
  )
}

ReadingList.getLayout = page => (
  <Container
    maxWidth="640px"
    css={css`
      margin-top: 5rem;
    `}
  >
    {page}
  </Container>
)
