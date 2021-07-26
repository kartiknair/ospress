/** @jsxImportSource @emotion/react */
import firebase from 'firebase'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useDocumentData } from 'react-firebase-hooks/firestore'
import { css } from '@emotion/react'

import FIREBASE_CONIFG from '../../lib/firebase-config'
import { postWithUserIDAndSlugExists } from '../../lib/db'

import Container from '../../components/container'
import Button from '../../components/button'
import Input, { Textarea } from '../../components/input'

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
  }, [])

  return (
    <Container maxWidth="560px">
      <div
        css={css`
          display: flex;
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
          onClick={async () => {
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
            await firebase
              .firestore()
              .collection('posts')
              .doc(post.id)
              .set(toSave)
            setSlugErr(false)
          }}
        >
          Save changes
        </Button>
        <Button
          css={css`
            font-size: 0.9rem;
          `}
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
      </div>

      <div
        css={css`
          margin-top: 2.5rem;
          margin-bottom: 1rem;
        `}
      >
        <label
          htmlFor="post-title"
          css={css`
            display: block;
            margin-bottom: 0.5rem;
          `}
        >
          Title
        </label>
        <Input
          type="text"
          id="post-title"
          value={clientPost.title}
          onChange={e =>
            setClientPost(prevPost => ({ ...prevPost, title: e.target.value }))
          }
        />
      </div>

      <div
        css={css`
          margin-top: 2.5rem;
          margin-bottom: 1rem;
        `}
      >
        <label
          htmlFor="post-excerpt"
          css={css`
            display: block;
            margin-bottom: 0.5rem;
          `}
        >
          Excerpt
        </label>
        <Input
          type="text"
          id="post-excerpt"
          placeholder="Short description about the post..."
          value={clientPost.excerpt}
          onChange={e =>
            setClientPost(prevPost => ({
              ...prevPost,
              excerpt: e.target.value,
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
            setClientPost(prevPost => ({ ...prevPost, slug: e.target.value }))
          }}
        />
        {slugErr && <p>Invalid slug. That slug is already in use.</p>}
      </div>

      <div
        css={css`
          margin-bottom: 1rem;
        `}
      >
        <label
          htmlFor="post-content"
          css={css`
            display: block;
            margin-bottom: 0.5rem;
          `}
        >
          Content
        </label>
        <Textarea
          id="post-content"
          value={clientPost.content}
          onChange={e =>
            setClientPost(prevPost => ({
              ...prevPost,
              content: e.target.value,
            }))
          }
        />
      </div>
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
    console.log(post, postLoading, postError)
    if (!user && !userLoading && !userError) {
      router.push('/')
      return
    } else if (!post && !postLoading && !postError) {
      router.push('/')
      return
    }
  }, [user, userLoading, userError, post, postLoading, postError])

  if (userError || postError) {
    return (
      <>
        <p>Oop, we've had an error:</p>
        <pre>{JSON.stringify(userError)}</pre>
        <pre>{JSON.stringify(postError)}</pre>
      </>
    )
  } else if (post) {
    return <Editor post={post} />
  }

  return <p>Loading...</p>
}
