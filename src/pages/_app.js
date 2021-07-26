import 'modern-normalize'
import { Global, css } from '@emotion/react'

import theme from '../lib/theme'

const App = ({ Component, pageProps }) => (
  <>
    <Global
      styles={css`
        @font-face {
          font-family: 'Inter';
          font-style: normal;
          font-weight: 400;
          font-display: swap;
          src: url('/fonts/Inter-Regular.woff2') format('woff2'),
            url('/fonts/Inter-Regular.woff') format('woff');
        }

        @font-face {
          font-family: 'Inter';
          font-style: normal;
          font-weight: 500;
          font-display: swap;
          src: url('/fonts/Inter-Medium.woff2') format('woff2'),
            url('/fonts/Inter-Medium.woff') format('woff');
        }

        @font-face {
          font-family: 'Newsreader';
          font-style: normal;
          font-weight: 400;
          font-display: swap;
          src: url('/fonts/NewsreaderText-Regular.woff2') format('woff2'),
            url('/fonts/NewsreaderText-Regular.woff2') format('woff');
        }

        @font-face {
          font-family: 'Newsreader';
          font-style: italic;
          font-weight: 400;
          font-display: swap;
          src: url('/fonts/NewsreaderText-Italic.woff2') format('woff2'),
            url('/fonts/NewsreaderText-Italic.woff2') format('woff');
        }

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
      `}
    />
    <Component {...pageProps} />
  </>
)

export default App
