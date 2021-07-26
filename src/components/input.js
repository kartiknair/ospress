/** @jsxImportSource @emotion/react */
import theme from '../lib/theme'
import { css } from '@emotion/react'

const inputStyles = css`
  display: block;
  width: 15rem;
  padding: 0.75rem 1.5rem;
  background: none;
  border: 1px solid ${theme.colors.grey[2]};
  outline: none;
  border-radius: 0.5rem;

  color: ${theme.colors.grey[4]};
  &::placeholder {
    color: ${theme.colors.grey[3]};
  }
`

const Input = props => (
  <input
    {...props}
    css={css`
      ${inputStyles}
    `}
  />
)

export const Textarea = props => (
  <textarea
    {...props}
    css={css`
      ${inputStyles}
    `}
  />
)

export default Input
