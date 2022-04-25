import React from 'react'
import { ComponentContainer, Container, StyledHeader } from './layout.style'

interface IProps {
  children: React.ReactNode
}

const Layout: React.FC<IProps> = ({ children }) => {
  return (
    <ComponentContainer>
      <StyledHeader></StyledHeader>
      <Container>
        {children}
      </Container>
    </ComponentContainer>
  )
}

export default Layout
