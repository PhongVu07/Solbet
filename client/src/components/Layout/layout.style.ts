import styled from "styled-components";
import { Header } from "antd/lib/layout/layout";

export const ComponentContainer = styled.div`
  min-height: 100vh;
`;

export const StyledHeader = styled(Header)`
  height: 64px;
  padding: 0 240px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  > div {
    display: flex;
  }
`;

export const HeaderItem = styled.div`
  color: white;
  margin: 0 20px;
`;

export const Container = styled.div`
  padding: 30px 16px 10px;
  max-width: 1024px;
  margin: auto;
`;
