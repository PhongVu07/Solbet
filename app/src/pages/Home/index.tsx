import React from "react";
import { Button, Col, Row, Typography } from "antd";
import { Link } from "react-router-dom";
import { ComponentContainer, OptionCard } from "./style.home";
import { PAGES } from "constants/pages";
import usePool from "temp/usePool/hook";
import { Connection, PublicKey } from "@solana/web3.js";

const { Title, Paragraph } = Typography;

const Home = () => {
  let connection: Connection = new Connection(
    "https://api.testnet.solana.com",
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
            <Paragraph>Create a pool so everyone can join and stake</Paragraph>
            <Link to={PAGES.POOL_MANAGER}>
              <Button type="primary">Create a Pool</Button>
            </Link>
          </OptionCard>
        </Col>
        <Col md={12} sm={12}>
          <OptionCard>
            <Paragraph>Join a pool, stake token and earn</Paragraph>
            <Link to={PAGES.STAKING}>
              <Button type="primary">Join a Pool</Button>
            </Link>
          </OptionCard>
        </Col>
      </Row>
    </ComponentContainer>
  );
};

export default Home;
