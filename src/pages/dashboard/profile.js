import firebase from 'firebase'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useDocumentData } from 'react-firebase-hooks/firestore'

import FIREBASE_CONIFG from '../../lib/firebase-config'
import { userWithNameExists } from '../../lib/db'

if (firebase.apps.length === 0) {
  firebase.initializeApp(FIREBASE_CONIFG)
}

function Editor({ user }) {
  const [clientUser, setClientUser] = useState({
    name: '',
    displayName: '',
    about: '',
  })
  const [usernameErr, setUsernameErr] = useState(null)

  useEffect(() => {
    setClientUser(user)
  }, [])

  return (
    <main>
      <button
        disabled={
          user.name === clientUser.name &&
          user.displayName === clientUser.displayName &&
          user.about === clientUser.about &&
          !usernameErr
        }
        onClick={async () => {
          if (clientUser.name !== user.name) {
            let nameClashing = await userWithNameExists(clientUser.name)
            if (nameClashing) {
              setUsernameErr('That username is in use already.')
              return
            } else if (clientUser.name === 'dashboard') {
              setUsernameErr('That username is reserved.')
              return
            }
          }

          let toSave = { ...clientUser }
          delete toSave.id
          await firebase
            .firestore()
            .collection('users')
            .doc(user.id)
            .set(toSave)
          setUsernameErr(null)
        }}
      >
        Save changes
      </button>
      <input
        type="text"
        value={clientUser.displayName}
        onChange={e =>
          setClientUser(prevUser => ({
            ...prevUser,
            displayName: e.target.value,
          }))
        }
      />
      <input
        type="text"
        value={clientUser.name}
        onChange={e => {
          setUsernameErr(false)
          setClientUser(prevUser => ({ ...prevUser, name: e.target.value }))
        }}
      />
      {usernameErr !== null && <p>{usernameErr}</p>}
      <textarea
        value={clientUser.about}
        onChange={e =>
          setClientUser(prevUser => ({ ...prevUser, about: e.target.value }))
        }
      />
    </main>
  )
}

export default function ProfileEditor() {
  const router = useRouter()
  const [user, userLoading, userError] = useAuthState(firebase.auth())
  const [userdata, userdataLoading, userdataError] = useDocumentData(
    firebase.firestore().doc(`users/${user?.uid}`),
    {
      idField: 'id',
    },
  )

  useEffect(() => {
    console.log(userdata, userdataLoading, userdataError)
    if (!user && !userLoading && !userError) {
      router.push('/')
      return
    } else if (!userdata && !userdataLoading && !userdataError) {
      router.push('/')
      return
    }
  }, [user, userLoading, userError, userdata, userdataLoading, userdataError])

  if (userError || userdataError) {
    return (
      <>
        <p>Oop, we've had an error:</p>
        <pre>{JSON.stringify(userError)}</pre>
        <pre>{JSON.stringify(userdataError)}</pre>
      </>
    )
  } else if (userdata) {
    return <Editor user={userdata} />
  }

  return <p>Loading...</p>
}
