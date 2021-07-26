/** @jsxImportSource @emotion/react */
import firebase from 'firebase'
import { useAuthState } from 'react-firebase-hooks/auth'
import { css } from '@emotion/react'

import { setUser, userWithIDExists } from '../lib/db'
import FIREBASE_CONIFG from '../lib/firebase-config'
import Button, { LinkButton } from '../components/button'
import Spinner from '../components/spinner'
import Container from '../components/container'

if (firebase.apps.length === 0) {
  firebase.initializeApp(FIREBASE_CONIFG)
}

export default function Home() {
  const [user, loading, error] = useAuthState(firebase.auth())

  if (error) {
    return (
      <Container maxWidth="420px">
        <p>Oop, we've had an error:</p>
        <pre>{JSON.stringify(error)}</pre>
      </Container>
    )
  }

  return (
    <Container maxWidth="420px">
      <h1
        css={css`
          font-size: 1.5rem;
          letter-spacing: -0.02rem;
          margin-top: 15rem;
          margin-bottom: 1.5rem;
        `}
      >
        Ultra minimal blogging platform for anybody who writes
      </h1>
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
                  })
                }
              })
          }}
        >
          Sign in with Google
        </Button>
      )}
    </Container>
  )
}
