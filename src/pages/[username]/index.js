/** @jsxImportSource @emotion/react */
import firebase from 'firebase'
import Link from 'next/link'
import { css } from '@emotion/react'
import { htmlToText } from 'html-to-text'

import { getUserByName } from '../../lib/db'
import FIREBASE_CONIFG from '../../lib/firebase-config'
import theme from '../../lib/theme'

import Container from '../../components/container'

if (firebase.apps.length === 0) {
  firebase.initializeApp(FIREBASE_CONIFG)
}

const truncate = (words, maxWords) => {
  const split = words.split(' ')

  if (split.length <= maxWords) return words

  return split.slice(0, maxWords).join(' ') + '...'
}

export default function Profile({ user }) {
  return (
    <Container maxWidth="640px">
      <img
        src={user.photo}
        css={css`
          width: 5rem;
          border-radius: 2.5rem;
        `}
      />
      <h1
        css={css`
          font-size: 1.5rem;
          letter-spacing: -0.03em;
          margin: 1.5rem 0 1rem 0;
        `}
      >
        {user.displayName}
      </h1>

      <p
        css={css`
          color: ${theme.colors.grey[4]};
          font-size: 1.125rem;
          font-family: 'Newsreader', serif;
          line-height: 1.5em;
        `}
      >
        {user.about}
      </p>

      <ul
        css={css`
          list-style: none;
          margin-top: 3rem;
        `}
      >
        {user.posts.map(post => (
          <li key={post.id}>
            <Link href={`/${user.name}/${post.slug}`}>
              <a style={{ textDecoration: 'none', color: 'inherit' }}>
                <h3
                  css={css`
                    font-size: 1rem;
                    font-weight: 400;
                  `}
                >
                  {post.title}
                </h3>
              </a>
            </Link>

            <p
              css={css`
                margin: 0.75rem 0;
                font-size: 0.9rem;
                color: ${theme.colors.grey[3]};
              `}
            >
              {new Date(post.lastEdited).toDateString()}
            </p>

            <p
              css={css`
                max-width: 25rem;
                color: ${theme.colors.grey[4]};
                font-family: 'Newsreader', serif;
                line-height: 1.5em;
              `}
            >
              {post.excerpt || truncate(htmlToText(post.content), 25)}
            </p>
          </li>
        ))}
      </ul>
    </Container>
  )
}

export async function getStaticPaths() {
  const snapshot = await firebase.firestore().collection('users').get()
  const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  return {
    paths: users.map(u => ({ params: { username: u.name } })),
    fallback: 'blocking',
  }
}

export async function getStaticProps({ params }) {
  const { username } = params

  try {
    const user = await getUserByName(username)
    user.posts = user.posts.map(p => ({
      ...p,
      lastEdited: p.lastEdited.toDate().getTime(),
    }))
    user.posts = user.posts.filter(p => p.published)
    return {
      props: { user },
    }
  } catch (err) {
    return { notFound: true }
  }
}
