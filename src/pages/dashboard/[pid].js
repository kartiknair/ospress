import firebase from 'firebase'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useDocumentData } from 'react-firebase-hooks/firestore'

import FIREBASE_CONIFG from '../../lib/firebase-config'
import { postWithUserIDAndSlugExists, setPost } from '../../lib/db'

if (firebase.apps.length === 0) {
  firebase.initializeApp(FIREBASE_CONIFG)
}

function Editor({ post }) {
  const [clientPost, setClientPost] = useState({
    title: '',
    content: '',
    slug: '',
    published: true,
  })
  const [slugErr, setSlugErr] = useState(false)
  useEffect(() => {
    setClientPost(post)
  }, [])

  return (
    <main>
      <button
        disabled={
          post.title === clientPost.title &&
          post.slug === clientPost.slug &&
          post.content === clientPost.content &&
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
      </button>
      <button
        onClick={async () => {
          await firebase
            .firestore()
            .collection('posts')
            .doc(post.id)
            .update({ published: !post.published })
        }}
      >
        {post.published ? 'Make Draft' : 'Publish'}
      </button>
      <input
        type="text"
        value={clientPost.title}
        onChange={e =>
          setClientPost(prevPost => ({ ...prevPost, title: e.target.value }))
        }
      />
      <input
        type="text"
        value={clientPost.slug}
        onChange={e => {
          setSlugErr(false)
          setClientPost(prevPost => ({ ...prevPost, slug: e.target.value }))
        }}
      />
      {slugErr && <p>Invalid slug. That slug is already in use.</p>}
      <textarea
        value={clientPost.content}
        onChange={e =>
          setClientPost(prevPost => ({ ...prevPost, content: e.target.value }))
        }
      />
    </main>
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
