import 'modern-normalize'
import { Global, css } from '@emotion/react'

import theme from '../lib/theme'
import Head from 'next/head'

const App = ({ Component, pageProps }) => {
  const getLayout = Component.getLayout || (page => page)

  return (
    <>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500"
          rel="stylesheet"
        />
      </Head>
      <Global
        styles={css`
          // By default we use Inter, since it is our UI font
          *,
          *::before,
          *::after {
            margin: 0;
            padding: 0;
          }

          html {
            font-size: 100%;
          }

          body {
            background: ${theme.colors.grey[1]};
            font-family: 'Inter', sans-serif;
          }

          h1,
          h2,
          h3,
          h4,
          h5,
          h6 {
            font-weight: 500;
          }

          @media (max-width: 420px) {
            html {
              font-size: 90%;
            }
          }

          // Proesemirror
          .ProseMirror-focused {
            outline: none;
          }

          .ProseMirror .is-editor-empty:first-child::before {
            content: attr(data-placeholder);
            float: left;
            color: inherit;
            opacity: 0.5;
            pointer-events: none;
            height: 0;
          }
        `}
      />

      {getLayout(<Component {...pageProps} />)}
    </>
  )
}

export default App
