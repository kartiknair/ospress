/** @jsxImportSource @emotion/react */
import firebase from 'firebase'
import { css } from '@emotion/react'
import sanitize from 'sanitize-html'
import Link from 'next/link'
import Head from 'next/head'

import { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'

import { getPostByUsernameAndSlug, getUserByID } from '../../lib/db'
import FIREBASE_CONIFG from '../../lib/firebase-config'
import theme from '../../lib/theme'

import { IconButton } from '../../components/button'
import Container from '../../components/container'
import PostContainer from '../../components/post-container'

if (firebase.apps.length === 0) {
  firebase.initializeApp(FIREBASE_CONIFG)
}

function AddToReadingListButton({ uid, pid }) {
  const [user, setUser] = useState({ readingList: [] })
  const [inList, setInList] = useState(false)

  useEffect(() => {
    ;(async () => {
      const data = await getUserByID(uid)
      setUser(data)
    })()
  }, [])

  useEffect(() => {
    setInList(user.readingList.includes(pid))
  }, [user])

  return (
    <IconButton
      css={css`
        margin-left: auto;
      `}
      onClick={async () => {
        const arrayAdd = firebase.firestore.FieldValue.arrayUnion
        const arrayRemove = firebase.firestore.FieldValue.arrayRemove

        await firebase
          .firestore()
          .collection('users')
          .doc(uid)
          .update({
            readingList: inList ? arrayRemove(pid) : arrayAdd(pid),
          })

        setUser({
          ...user,
          readingList: inList
            ? user.readingList.filter(id => id != pid)
            : [...user.readingList, pid],
        })
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1.5rem"
        height="1.5rem"
        fill={theme.colors.grey[3]}
        viewBox="0 0 256 256"
      >
        <rect width="256" height="256" fill="none"></rect>
        {inList ? (
          <path d="M192,24H96A16.01833,16.01833,0,0,0,80,40V56H64A16.01833,16.01833,0,0,0,48,72V224a8.00026,8.00026,0,0,0,12.65039,6.50977l51.34277-36.67872,51.35743,36.67872A7.99952,7.99952,0,0,0,176,224V184.6897l19.35059,13.82007A7.99952,7.99952,0,0,0,208,192V40A16.01833,16.01833,0,0,0,192,24Zm0,152.45508-16-11.42676V72a16.01833,16.01833,0,0,0-16-16H96V40h96Z"></path>
        ) : (
          <>
            <path
              d="M168,224l-56.0074-40L56,224V72a8,8,0,0,1,8-8h96a8,8,0,0,1,8,8Z"
              fill="none"
              stroke={theme.colors.grey[3]}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="16"
            ></path>
            <path
              d="M88,64V40a8,8,0,0,1,8-8h96a8,8,0,0,1,8,8V192l-32-22.85412"
              fill="none"
              stroke={theme.colors.grey[3]}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="16"
            ></path>
          </>
        )}
      </svg>
    </IconButton>
  )
}

export default function Post({ post }) {
  const [user, _loading, _error] = useAuthState(firebase.auth())

  return (
    <Container maxWidth="640px">
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,600;1,400;1,600"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono"
          rel="stylesheet"
        />
      </Head>

      <h1
        css={css`
          font-size: 1.5rem;
          letter-spacing: -0.03em;
          margin-bottom: 2rem;
        `}
      >
        {post.title}
      </h1>

      <div
        css={css`
          display: flex;
          align-items: center;
          color: ${theme.colors.grey[3]};
        `}
      >
        <img
          src={post.author.photo}
          alt="Profile picture"
          css={css`
            width: 2rem;
            border-radius: 1rem;
            margin-right: 1rem;
          `}
        />
        <p>
          <Link href={`/${post.author.name}`}>
            <a
              style={{
                color: 'inherit',
                textDecoration: 'none',
                borderBottom: `1px dotted ${theme.colors.grey[2]}`,
              }}
            >
              {post.author.displayName}
            </a>
          </Link>{' '}
          / {new Date(post.lastEdited).toDateString()}
        </p>
      </div>

      <PostContainer
        dangerouslySetInnerHTML={{ __html: sanitize(post.content) }}
        css={css`
          margin-bottom: 5rem;
        `}
      />

      {user ? (
        <footer>
          <AddToReadingListButton uid={user.uid} pid={post.id} />
        </footer>
      ) : (
        ''
      )}
    </Container>
  )
}

export async function getStaticPaths() {
  const snapshot = await firebase.firestore().collection('posts').get()
  let posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  posts = posts.filter(p => p.published)

  return {
    paths: posts.map(post => ({
      params: { username: post.author, slug: post.slug },
    })),
    fallback: 'blocking',
  }
}

export async function getStaticProps({ params }) {
  const { username, slug } = params

  try {
    const post = await getPostByUsernameAndSlug(username, slug)
    if (!post.published) {
      return { notFound: true }
    }
    const userDoc = await firebase
      .firestore()
      .collection('users')
      .doc(post.author)
      .get()
    post.author = userDoc.data()
    post.lastEdited = post.lastEdited.toDate().getTime()
    return {
      props: { post, revalidate: 1 },
    }
  } catch (err) {
    console.log(err)
    return { notFound: true }
  }
}
