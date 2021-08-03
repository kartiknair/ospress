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
import Spinner from '../../components/spinner'
import theme from '../../lib/theme'

if (firebase.apps.length === 0) {
  firebase.initializeApp(FIREBASE_CONIFG)
}

const StyledLabel = props => (
  <label
    css={css`
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
      color: ${theme.colors.grey[3]};
    `}
    {...props}
  >
    {props.children}
  </label>
)

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
            } else if (clientUser.name === '') {
              setUsernameErr('Username cannot be empty.')
              return
            } else if (!clientUser.name.match(/^[a-z0-9-]+$/i)) {
              setUsernameErr(
                'Username can only consist of letters (a-z,A-Z), numbers (0-9) and dashes (-).',
              )
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
          margin-top: 5rem;

          div {
            margin-bottom: 1.5rem;
          }
        `}
      >
        <div>
          <StyledLabel htmlFor="profile-display-name">Display Name</StyledLabel>
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

        <div>
          <StyledLabel htmlFor="profile-username">Name</StyledLabel>
          <Input
            id="profile-username"
            type="text"
            value={clientUser.name}
            onChange={e => {
              setUsernameErr(false)
              setClientUser(prevUser => ({ ...prevUser, name: e.target.value }))
            }}
          />
          {usernameErr !== null && (
            <p
              css={css`
                font-size: 0.9rem;
                color: ${theme.colors.grey[3]};
                width: 20rem;
                margin-top: 1rem;
              `}
            >
              {usernameErr}
            </p>
          )}
        </div>

        <div>
          <StyledLabel htmlFor="profile-about">About</StyledLabel>
          <Textarea
            id="profile-about"
            value={clientUser.about}
            onChange={e =>
              setClientUser(prevUser => ({
                ...prevUser,
                about: e.target.value,
              }))
            }
          />
        </div>
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
      <Container maxWidth="560px">
        <p>Oop, we've had an error:</p>
        <pre>{JSON.stringify(userError)}</pre>
        <pre>{JSON.stringify(userdataError)}</pre>
      </Container>
    )
  } else if (userdata) {
    return <Editor user={userdata} />
  }

  return (
    <Container maxWidth="560px">
      <Spinner />
    </Container>
  )
}
