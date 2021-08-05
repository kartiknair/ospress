/** @jsxImportSource @emotion/react */
import firebase from 'firebase'
import { css } from '@emotion/react'
import { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useDocumentData } from 'react-firebase-hooks/firestore'

import { userWithNameExists } from '../lib/db'
import FIREBASE_CONIFG from '../lib/firebase-config'

import Button from '../components/button'
import Spinner from '../components/spinner'
import { IconButton } from '../components/button'
import Input, { Textarea } from '../components/input'
import ModalOverlay from '../components/modal-overlay'

if (firebase.apps.length === 0) {
  firebase.initializeApp(FIREBASE_CONIFG)
}

const StyledLabel = props => (
  <label
    css={css`
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
      color: var(--grey-3);
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
    posts: [],
    photo: '',
    readingList: [],
  })
  const [usernameErr, setUsernameErr] = useState(null)

  useEffect(() => {
    setClientUser(user)
  }, [user])

  return (
    <>
      <div
        css={css`
          margin: 1.5rem 0 2.5rem 0;

          font-size: 0.9rem;

          input,
          textarea {
            width: 20em;
          }

          textarea {
            min-height: 12em;
            resize: none;
          }

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
              setClientUser(prevUser => ({
                ...prevUser,
                name: e.target.value,
              }))
            }}
          />
          {usernameErr !== null && (
            <p
              css={css`
                font-size: 0.9rem;
                color: var(--grey-3);
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
    </>
  )
}

function ProfileEditor({ uid }) {
  const [user, userLoading, userError] = useDocumentData(
    firebase.firestore().doc(`users/${uid}`),
    {
      idField: 'id',
    },
  )

  if (userError) {
    return (
      <>
        <p>Oop, we&apos;ve had an error:</p>
        <pre>{JSON.stringify(userError)}</pre>
      </>
    )
  } else if (user) {
    return <Editor user={user} />
  }

  return <Spinner />
}

export default function ProfileSettingsModal(props) {
  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <props.Trigger />
      </Dialog.Trigger>

      <ModalOverlay />

      <Dialog.Content
        css={css`
          background: var(--grey-1);
          border-radius: 0.5rem;
          padding: 1.5rem;
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        `}
      >
        <Dialog.Title>Profile Settings</Dialog.Title>
        <Dialog.Description
          css={css`
            margin: 1rem 0 0.5rem 0;
            max-width: 20rem;
            color: var(--grey-3);
            font-size: 0.9rem;
          `}
        >
          Change your profile details and make sure to hit save when you&apos;re
          done.
        </Dialog.Description>

        <ProfileEditor uid={props.uid} />

        <Dialog.Close
          as={IconButton}
          css={css`
            position: absolute;
            top: 1rem;
            right: 1rem;
          `}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1rem"
            height="1rem"
            fill="currentColor"
            viewBox="0 0 256 256"
          >
            <rect width="256" height="256" fill="none"></rect>
            <line
              x1="200"
              y1="56"
              x2="56"
              y2="200"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="16"
            ></line>
            <line
              x1="200"
              y1="200"
              x2="56"
              y2="56"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="16"
            ></line>
          </svg>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Root>
  )
}