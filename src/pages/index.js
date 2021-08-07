/** @jsxImportSource @emotion/react */
import Head from 'next/head'
import firebase from 'firebase'
import { css } from '@emotion/react'
import { useAuthState } from 'react-firebase-hooks/auth'

import FIREBASE_CONIFG from '../lib/firebase-config'
import { setUser, userWithIDExists } from '../lib/db'

import meta from '../components/meta'
import Spinner from '../components/spinner'
import Container from '../components/container'
import Button, { LinkButton } from '../components/button'

if (firebase.apps.length === 0) {
  firebase.initializeApp(FIREBASE_CONIFG)
}

export default function Home() {
  const [user, loading, error] = useAuthState(firebase.auth())

  if (error) {
    return (
      <>
        <p>Oop, we&apos;ve had an error:</p>
        <pre>{JSON.stringify(error)}</pre>
      </>
    )
  }

  return (
    <div>
      <div
        css={css`
          margin-top: 0rem;
          margin-bottom: 2.5rem;

          @media (max-width: 720px) {
            margin-bottom: 10rem;
          }

          width: 2rem;
          height: 2rem;

          background-image: url('/images/logo-light.png');
          background-position: center;
          background-repeat: no-repeat;
          background-size: 2rem;

          html[data-theme='dark'] & {
            background-image: url('/images/logo-dark.png');
          }
        `}
      ></div>
      <h1
        css={css`
          font-size: 1.5rem;
          letter-spacing: -0.02rem;
          margin-bottom: 1.5rem;
        `}
      >
        An ultra-minimal platform for anybody who writes
      </h1>
      <ul
        css={css`
          list-style: none;
          color: var(--grey-3);
          margin-bottom: 2.5rem;

          li {
            margin: 0.75rem 0;
          }

          li::before {
            display: inline-block;
            content: '';
            font-size: 0.9rem;
            margin-right: 0.5rem;
          }
        `}
      >
        <li>No ads</li>
        <li>No paywalls</li>
        <li>Open-source</li>
      </ul>
      {loading ? (
        <Button>
          <Spinner />
        </Button>
      ) : user ? (
        <div
          css={css`
            display: flex;
          `}
        >
          <LinkButton href="/dashboard">Dasboard</LinkButton>
          <Button
            css={css`
              margin-left: 1rem;
            `}
            type="outline"
            onClick={() => firebase.auth().signOut()}
          >
            Sign Out
          </Button>
        </div>
      ) : (
        <Button
          onClick={() => {
            const googleAuthProvider = new firebase.auth.GoogleAuthProvider()
            firebase
              .auth()
              .signInWithPopup(googleAuthProvider)
              .then(async cred => {
                let userExists = await userWithIDExists(cred.user.uid)
                if (!userExists) {
                  await setUser(cred.user.uid, {
                    name: cred.user.uid,
                    displayName: cred.user.displayName || 'Anonymous',
                    about: 'Nothing to say about you.',
                    posts: [],
                    photo: cred.user.photoURL,
                    readingList: [],
                  })
                }
              })
          }}
        >
          Sign in with Google
        </Button>
      )}
    </div>
  )
}

Home.getLayout = function HomeLayout(page) {
  return (
    <Container maxWidth="420px">
      <Head>
        {meta({
          title: 'OSPress',
          description:
            'An ultra minimal blogging platform for anybody who writes',
          url: '/',
        })}
      </Head>
      {page}
    </Container>
  )
}
