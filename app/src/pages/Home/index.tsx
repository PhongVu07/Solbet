import React from "react";
import { Button, Col, Row, Typography } from "antd";
import { Link } from "react-router-dom";
import { ComponentContainer, OptionCard } from "./style.home";
import { PAGES } from "constants/pages";
import { Connection, PublicKey } from "@solana/web3.js";

import { usePool } from "temp";

const { Title, Paragraph } = Typography;

const Home = () => {
  let connection: Connection = new Connection(
    "https://api.devnet.solana.com",
    "processed"
  );

  usePool({
    poolAddress: new PublicKey("93LyS9Y5ZugNuEUS5CeVLTkRYPeMMoA5obm8Mv8uen11"),
    connection,
  });

  return (
    <ComponentContainer>
      <Title>Welcome to Gold Pool</Title>
      <Row gutter={20}>
        <Col md={12} sm={12}>
          <OptionCard>
            <Paragraph>
              Create and manage pools so everyone can join and stake
            </Paragraph>
            <Link to={PAGES.POOL_MANAGER}>
              <Button type="primary">Pool Manager</Button>
            </Link>
          </OptionCard>
        </Col>
        <Col md={12} sm={12}>
          <OptionCard>
            <Paragraph>Join a pool, stake token and earn</Paragraph>
            <Link to={PAGES.STAKING}>
              <Button type="primary">Stake</Button>
            </Link>
          </OptionCard>
        </Col>
      </Row>
    </ComponentContainer>
  );
};

export default Home;
