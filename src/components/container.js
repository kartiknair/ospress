/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'

const Container = props => (
  <main
    css={css`
      max-width: ${props.maxWidth};
      margin: 10rem auto 0 auto;
    `}
    {...props}
  >
    {props.children}
  </main>
)

export default Container
