import { Button, Menu } from "antd";
import { PAGES } from "constants/pages";
import React from "react";
import { Link } from "react-router-dom";
import {
  ComponentContainer,
  Container,
  HeaderItem,
  StyledHeader,
} from "./layout.style";

interface IProps {
  children: React.ReactNode;
}

const Layout: React.FC<IProps> = ({ children }) => {
  return (
    <ComponentContainer>
      <StyledHeader>
        <div>
          <Link to={PAGES.HOME}>
            <HeaderItem>Home</HeaderItem>
          </Link>
          <Link to={PAGES.POOL_MANAGER}>
            <HeaderItem>Pool Manager</HeaderItem>
          </Link>
          <Link to={PAGES.STAKING}>
            <HeaderItem>Staking</HeaderItem>
          </Link>
        </div>
        <Button type="primary">Wallet</Button>
      </StyledHeader>
      <Container>{children}</Container>
    </ComponentContainer>
  );
};

export default Layout;
