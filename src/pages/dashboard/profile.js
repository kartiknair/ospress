/** @jsxImportSource @emotion/react */
import firebase from 'firebase'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useDocumentData } from 'react-firebase-hooks/firestore'
import { css } from '@emotion/react'

import FIREBASE_CONIFG from '../../lib/firebase-config'
import { userWithNameExists } from '../../lib/db'

import Container from '../../components/container'
import Button from '../../components/button'
import Input, { Textarea } from '../../components/input'

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
    <Container maxWidth="560px">
      <Button
        css={css`
          margin-left: auto;
          font-size: 0.9rem;
        `}
        type="outline"
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
      </Button>

      <div
        css={css`
          margin-top: 2.5rem;
          margin-bottom: 1rem;
        `}
      >
        <label
          htmlFor="profile-display-name"
          css={css`
            display: block;
            margin-bottom: 0.5rem;
          `}
        >
          Display Name
        </label>
        <Input
          id="profile-display-name"
          type="text"
          value={clientUser.displayName}
          onChange={e =>
            setClientUser(prevUser => ({
              ...prevUser,
              displayName: e.target.value,
            }))
          }
        />
      </div>

      <div
        css={css`
          margin-bottom: 1rem;
        `}
      >
        <label
          htmlFor="profile-username"
          css={css`
            display: block;
            margin-bottom: 0.5rem;
          `}
        >
          Name
        </label>
        <Input
          id="profile-username"
          type="text"
          value={clientUser.name}
          onChange={e => {
            setUsernameErr(false)
            setClientUser(prevUser => ({ ...prevUser, name: e.target.value }))
          }}
        />
        {usernameErr !== null && <p>{usernameErr}</p>}
      </div>

      <div
        css={css`
          margin-bottom: 1rem;
        `}
      >
        <label
          htmlFor="profile-about"
          css={css`
            display: block;
            margin-bottom: 0.5rem;
          `}
        >
          About
        </label>
        <Textarea
          id="profile-about"
          value={clientUser.about}
          onChange={e =>
            setClientUser(prevUser => ({ ...prevUser, about: e.target.value }))
          }
        />
      </div>
    </Container>
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
