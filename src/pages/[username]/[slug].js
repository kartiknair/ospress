/** @jsxImportSource @emotion/react */
import firebase from 'firebase'
import { css } from '@emotion/react'

import { getPostByUsernameAndSlug } from '../../lib/db'
import FIREBASE_CONIFG from '../../lib/firebase-config'
import theme from '../../lib/theme'

import Container from '../../components/container'
import Link from 'next/link'

if (firebase.apps.length === 0) {
  firebase.initializeApp(FIREBASE_CONIFG)
}

export default function Post({ post }) {
  return (
    <Container maxWidth="640px">
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

      <div
        css={css`
          color: ${theme.colors.grey[4]};
          margin-top: 2rem;
          font-size: 1.125rem;
          font-family: 'Newsreader', serif;
          line-height: 1.5em;
        `}
      >
        <p>{post.content}</p>
      </div>
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
    return { notFound: true }
  }
}
