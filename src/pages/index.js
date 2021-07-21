import firebase from 'firebase'
import { useAuthState } from 'react-firebase-hooks/auth'
import Link from 'next/link'

import { setUser, userWithIDExists } from '../lib/db'
import FIREBASE_CONIFG from '../lib/firebase-config'

if (firebase.apps.length === 0) {
  firebase.initializeApp(FIREBASE_CONIFG)
}

export default function Home() {
  const [user, loading, error] = useAuthState(firebase.auth())

  if (loading) {
    return <p>Loading...</p>
  } else if (error) {
    return (
      <>
        <p>Oop, we've had an error:</p>
        <pre>{JSON.stringify(error)}</pre>
      </>
    )
  } else if (!user) {
    return (
      <main>
        <h1>Welcome to urblog!</h1>
        <button
          onClick={() => {
            const googleAuthProvider = new firebase.auth.GoogleAuthProvider()
            firebase
              .auth()
              .signInWithPopup(googleAuthProvider)
              .then(async cred => {
                console.log('hello??')
                let userExists = await userWithIDExists(cred.user.uid)
                if (!userExists) {
                  await setUser(cred.user.uid, {
                    name: cred.user.uid,
                    displayName: 'Anonymous',
                    about: 'Nothing to say about you.',
                    posts: [],
                  })
                }
              })
          }}
        >
          Sign in with Google
        </button>
      </main>
    )
  }

  return (
    <p>
      Go to{' '}
      <Link href="/dashboard">
        <a>Dasboard</a>
      </Link>
      <button onClick={() => firebase.auth().signOut()}>Sign Out</button>
    </p>
  )
}
