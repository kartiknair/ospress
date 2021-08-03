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
        font-family: monospace;
        border-radius: 0.5rem;
        padding: 1rem 1.5rem;
      }

      code {
        font-size: 0.9rem;
        font-family: 'JetBrains Mono', monospace;

        background: ${theme.colors.grey[2]}60;
        color: ${theme.colors.grey[4]};
        border-radius: 0.2rem;
        padding: 0.2rem;
      }

      pre code {
        background: none;
        color: ${theme.colors.grey[2]};
        border-radius: 0;
        padding: 0;
      }
    `}
    {...props}
  >
    {props.children}
  </div>
)

export default PostContainer
