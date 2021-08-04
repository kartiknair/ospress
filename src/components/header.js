/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import theme from '../lib/theme'

const Header = props => (
  <header
    css={css`
      display: flex;
      margin-bottom: 5rem;

      a:first-child {
        margin-left: auto;
      }

      a {
        display: block;
        margin-right: 1.5rem;
        text-decoration: none;
      }

      a,
      button {
        color: ${theme.colors.grey[2]};
        cursor: pointer;
        transition: all 200ms ease;
      }

      a:hover,
      button:hover {
        color: ${theme.colors.grey[3]};
      }

      button {
        margin-right: 0;
      }

      button {
        border: none;
        padding: 0;
        margin: 0;
        background: none;
      }
    `}
    {...props}
  >
    {props.children}
  </header>
)

export default Header
