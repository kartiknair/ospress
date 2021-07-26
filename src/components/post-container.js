/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'

import theme from '../lib/theme'

const PostContainer = props => (
  <div
    css={css`
      color: ${theme.colors.grey[4]};
      margin-top: 2rem;
      font-size: 1.125rem;
      line-height: 1.5em;

      font-family: 'Newsreader', serif;

      p {
        margin: 1rem 0;
      }

      blockquote,
      hr {
        margin: 1.5rem 0;
      }

      h1,
      h2 {
        font-family: 'Inter', sans-serif;
        font-weight: 500;
        letter-spacing: -0.02em;
        margin: 1.5rem 0 0.5rem 0;
      }

      h1 {
        font-size: 1.5rem;
      }

      h2 {
        font-size: 1.25rem;
      }

      h3 {
        font-style: italic;
        font-size: 1.15rem;
      }

      blockquote > p {
        font-family: 'Inter', sans-serif;
        padding-left: 1.25rem;
        border-left: 0.15rem solid ${theme.colors.grey[2]};
      }

      pre {
        background: ${theme.colors.grey[5]};
        color: ${theme.colors.grey[2]};
        font-size: 1rem;
        font-family: monospace;
        border-radius: 0.5rem;
        padding: 1rem 1.5rem;
      }
    `}
    {...props}
  >
    {props.children}
  </div>
)

export default PostContainer
