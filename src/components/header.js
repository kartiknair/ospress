/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import theme from '../lib/theme'

const Header = props => (
  <header
    css={css`
      display: flex;
      margin-bottom: 5rem;

      a:first-of-type {
        margin-left: auto;
      }

      a {
        display: block;
        text-decoration: none;
      }

      a,
      button {
        color: ${theme.colors.grey[2]};
        cursor: pointer;
        margin-right: 1.5rem;
        transition: all 200ms ease;
      }

      a:hover,
      button:hover {
        color: ${theme.colors.grey[3]};
      }

      button:last-of-type {
        margin-right: 0;
      }

      button {
        border: none;
        padding: 0;
        background: none;
      }
    `}
    {...props}
  >
    {props.children}
  </header>
)

export default Header
