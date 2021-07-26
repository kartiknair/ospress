/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'

const Container = props => {
  const { maxWidth, ...otherProps } = props
  return (
    <main
      css={css`
        max-width: ${maxWidth};
        margin: 10rem auto 0 auto;
      `}
      {...otherProps}
    >
      {props.children}
    </main>
  )
}

export default Container
