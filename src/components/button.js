/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import Link from 'next/link'

import theme from '../lib/theme'

const buttonStyles = css`
  display: block;
  border: none;
  outline: none;
  cursor: pointer;

  padding: 0.75rem 1.5rem;
  background: ${theme.colors.grey[5]};
  color: ${theme.colors.grey[1]};
  border-radius: 0.33rem;

  border: none;

  transition: all 200ms ease;

  &:hover {
    background: ${theme.colors.grey[4]};
  }

  &:disabled {
    cursor: not-allowed;
    background: ${theme.colors.grey[4]};
    color: ${theme.colors.grey[2]};
  }
`

const outlineButtonStyles = css`
  ${buttonStyles}

  background: ${theme.colors.grey[1]};
  color: ${theme.colors.grey[4]};
  border: 1px solid ${theme.colors.grey[2]};

  &:hover {
    background: ${theme.colors.grey[1]};
    border: 1px solid ${theme.colors.grey[3]};
  }

  &:disabled {
    background: ${theme.colors.grey[1]};
    color: ${theme.colors.grey[2]};

    &:hover {
      background: ${theme.colors.grey[1]};
      border: 1px solid ${theme.colors.grey[2]};
    }
  }
`

export default function Button(props) {
  if (props.type === 'outline') {
    return (
      <button css={outlineButtonStyles} {...props}>
        {props.children}
      </button>
    )
  }
  return (
    <button css={buttonStyles} {...props}>
      {props.children}
    </button>
  )
}

export function LinkButton(props) {
  if (props.type === 'outline') {
    return (
      <Link {...props}>
        <a
          css={css`
            ${outlineButtonStyles}
            display: inline-block;
          `}
        >
          {props.children}
        </a>
      </Link>
    )
  }
  return (
    <Link {...props}>
      <a
        css={css`
          ${buttonStyles}
          display: inline-block;
        `}
      >
        {props.children}
      </a>
    </Link>
  )
}
