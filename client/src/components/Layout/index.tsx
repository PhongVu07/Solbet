import React from "react";
import {
  ComponentContainer,
  Container,
} from "./layout.style";

interface IProps {
  children: React.ReactNode;
}

const Layout: React.FC<IProps> = ({ children }) => {
  return (
    <ComponentContainer>
      <Container>{children}</Container>
    </ComponentContainer>
  );
};

export default Layout;
