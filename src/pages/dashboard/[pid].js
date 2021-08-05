/** @jsxImportSource @emotion/react */
import Head from 'next/head'
import firebase from 'firebase'
import tinykeys from 'tinykeys'
import { css } from '@emotion/react'
import { useEffect, useState } from 'react'
import StarterKit from '@tiptap/starter-kit'
import router, { useRouter } from 'next/router'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useEditor, EditorContent } from '@tiptap/react'
import { useDocumentData } from 'react-firebase-hooks/firestore'

import Text from '@tiptap/extension-text'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Placeholder from '@tiptap/extension-placeholder'

import * as Dialog from '@radix-ui/react-dialog'

import FIREBASE_CONIFG from '../../lib/firebase-config'
import { postWithUserIDAndSlugExists, removePostForUser } from '../../lib/db'

import Input from '../../components/input'
import Spinner from '../../components/spinner'
import Container from '../../components/container'
import ModalOverlay from '../../components/modal-overlay'
import PostContainer from '../../components/post-container'
import Button, { IconButton } from '../../components/button'

if (firebase.apps.length === 0) {
  firebase.initializeApp(FIREBASE_CONIFG)
}

function Editor({ post }) {
  const [clientPost, setClientPost] = useState({
    title: '',
    content: '',
    slug: '',
    excerpt: '',
    published: true,
  })

  const [slugErr, setSlugErr] = useState(false)

  useEffect(() => {
    setClientPost(post)
  }, [post])

  async function saveChanges() {
    if (clientPost.slug !== post.slug) {
      let slugClashing = await postWithUserIDAndSlugExists(
        post.author,
        clientPost.slug,
      )
      if (slugClashing) {
        setSlugErr(true)
        return
      }
    }

    let toSave = {
      ...clientPost,
      lastEdited: firebase.firestore.Timestamp.now(),
    }
    delete toSave.id // since we get the id from the document not the data
    await firebase.firestore().collection('posts').doc(post.id).set(toSave)
    setSlugErr(false)
  }

  useEffect(() => {
    let unsubscribe = tinykeys(window, {
      '$mod+KeyS': e => {
        e.preventDefault()
        saveChanges()
      },
    })

    return () => {
      unsubscribe()
    }
  })

  const ParagraphDocument = Document.extend({ content: 'paragraph' })

  const titleEditor = useEditor({
    content: post.title,
    extensions: [
      ParagraphDocument,
      Paragraph,
      Text,
      Placeholder.configure({
        placeholder: "Your post's title...",
      }),
    ],
    onUpdate: ({ editor: newEditor }) => {
      setClientPost(prevPost => ({
        ...prevPost,
        title: newEditor.getHTML().slice(3, -4),
      }))
    },
  })

  const excerptEditor = useEditor({
    content: post.excerpt,
    extensions: [
      ParagraphDocument,
      Paragraph,
      Text,
      Placeholder.configure({
        placeholder: 'A short excerpt describing your post...',
      }),
    ],
    onUpdate: ({ editor: newEditor }) => {
      setClientPost(prevPost => ({
        ...prevPost,
        excerpt: newEditor.getHTML().slice(3, -4),
      }))
    },
  })

  const contentEditor = useEditor({
    content: post.content,
    autofocus: 'end',
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder,
    ],
    onUpdate: ({ editor: newEditor }) => {
      setClientPost(prevPost => ({ ...prevPost, content: newEditor.getHTML() }))
    },
  })

  return (
    <Container maxWidth="640px">
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,600;1,400;1,600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div
        css={css`
          display: flex;
          align-items: center;

          button:first-of-type {
            margin-left: auto;
          }

          button:last-child {
            margin-left: 1rem;
          }
        `}
      >
        <Button
          css={css`
            margin-left: auto;
            margin-right: 1rem;
            font-size: 0.9rem;
          `}
          type="outline"
          disabled={
            post.title === clientPost.title &&
            post.slug === clientPost.slug &&
            post.content === clientPost.content &&
            post.excerpt === clientPost.excerpt &&
            !slugErr
          }
          onClick={saveChanges}
        >
          Save changes
        </Button>

        <Dialog.Root>
          <Dialog.Trigger as={IconButton}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1.5rem"
              height="1.5rem"
              fill="var(--grey-4)"
              viewBox="0 0 256 256"
            >
              <rect width="256" height="256" fill="none"></rect>
              <circle cx="128" cy="128" r="12"></circle>
              <circle cx="128" cy="64" r="12"></circle>
              <circle cx="128" cy="192" r="12"></circle>
            </svg>
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
            <Dialog.Title>Post Settings</Dialog.Title>
            <Dialog.Description
              css={css`
                margin: 1rem 0 0.5rem 0;
                max-width: 20rem;
                color: var(--grey-3);
                font-size: 0.9rem;
              `}
            >
              Make changes to your post&apos;s metadata, changes are saved
              automatically.
            </Dialog.Description>
            <div
              css={css`
                margin: 1.5rem 0;
              `}
            >
              <label
                htmlFor="post-slug"
                css={css`
                  display: block;
                  margin-bottom: 0.5rem;
                `}
              >
                Slug
              </label>
              <Input
                type="text"
                id="post-slug"
                value={clientPost.slug}
                onChange={e => {
                  setSlugErr(false)
                  setClientPost(prevPost => ({
                    ...prevPost,
                    slug: e.target.value,
                  }))
                }}
              />
              {slugErr && <p>Invalid slug. That slug is already in use.</p>}
            </div>

            <div
              css={css`
                display: flex;

                button {
                  margin-left: 0;
                  margin-right: 1rem;
                }

                button:last-child {
                  margin-right: auto;
                }

                button {
                  font-size: 0.9rem;
                }
              `}
            >
              <Button
                onClick={async () => {
                  await firebase
                    .firestore()
                    .collection('posts')
                    .doc(post.id)
                    .update({ published: !post.published })
                }}
              >
                {post.published ? 'Make Draft' : 'Publish'}
              </Button>
              <Button
                type="outline"
                onClick={async () => {
                  await removePostForUser(post.author, post.id)
                  router.push('/dashboard')
                }}
              >
                Delete
              </Button>
            </div>

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
      </div>

      <div
        css={css`
          margin-top: 5rem;
          font-size: 1.5rem;
          font-weight: 500;
        `}
      >
        <EditorContent editor={titleEditor} />
      </div>

      <div
        css={css`
          .ProseMirror-focused {
            outline: none;
          }

          margin: 1.5rem 0;
          font-size: 1.15rem;
          font-weight: 500;
          color: var(--grey-4);
        `}
      >
        <EditorContent editor={excerptEditor} />
      </div>

      <PostContainer
        css={css`
          .ProseMirror-focused {
            outline: none;
          }

          margin-bottom: 5rem;
        `}
      >
        <EditorContent editor={contentEditor} />
      </PostContainer>
    </Container>
  )
}

export default function PostEditor() {
  const router = useRouter()
  const [user, userLoading, userError] = useAuthState(firebase.auth())
  const [post, postLoading, postError] = useDocumentData(
    firebase.firestore().doc(`posts/${router.query.pid}`),
    {
      idField: 'id',
    },
  )

  useEffect(() => {
    if (!user && !userLoading && !userError) {
      router.push('/')
      return
    } else if (!post && !postLoading && !postError) {
      router.push('/')
      return
    }
  }, [router, user, userLoading, userError, post, postLoading, postError])

  if (userError || postError) {
    return (
      <Container maxWidth="560px">
        <p>Oop, we&apos;ve had an error:</p>
        <pre>{JSON.stringify(userError)}</pre>
        <pre>{JSON.stringify(postError)}</pre>
      </Container>
    )
  } else if (post) {
    return <Editor post={post} />
  }

  return (
    <Container maxWidth="560px">
      <Spinner />
    </Container>
  )
}
