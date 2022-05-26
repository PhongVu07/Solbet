import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  List,
  Row,
  Typography,
} from "antd";
import { ComponentContainer } from "./style";
import { Connection, PublicKey } from "@solana/web3.js";
import { useConnectedWallet } from "@saberhq/use-solana";

import { usePool } from "temp";
import { formatPoolData } from "./utils";

const { Search } = Input;
const { Title, Text } = Typography;

const PoolDetail: React.FC = () => {
  const [poolPubkey, setPoolPubkey] = useState<string>("");
  const wallet = useConnectedWallet();
  const [form] = Form.useForm();

  const connection: Connection = new Connection(
    "https://api.devnet.solana.com"
  );
  const {
    userStakeAccount,
    poolAccount,
    poolDetail,
    setReload,
    stake,
    unstake,
    claim,
    getPendingReward,
  } = usePool({
    poolAddress: poolPubkey ? new PublicKey(poolPubkey) : PublicKey.default,
    connection,
    wallet,
  });
  console.log(
    "Log ~ file: index.tsx ~ line 34 ~ userStakeAccount",
    userStakeAccount
  );

  const poolData = formatPoolData(poolDetail, poolAccount);

  return (
    <ComponentContainer>
      <Search
        style={{ width: "60%", marginBottom: "48px" }}
        placeholder="Input Pool Public Key"
        allowClear
        enterButton
        size="middle"
        onSearch={(value) => setPoolPubkey(value)}
      />
      <Row>
        <Col lg={16} md={16}>
          {poolData && (
            <List
              bordered
              style={{ width: "100%", marginBottom: "32px" }}
              dataSource={Object.keys(poolData)}
              renderItem={(item) => (
                <List.Item>
                  <Text>{item}</Text>
                  {/* @ts-ignore */}
                  <Text>{poolData[item]}</Text>
                </List.Item>
              )}
            />
          )}
        </Col>
        <Col lg={8} md={8}></Col>
      </Row>
      <Row>
        <Col>
          {poolData && (
            <Form form={form} layout="inline" onFinish={value => stake(value.amount)}>
              <Form.Item label="Stake Amount (tokens)" name="amount">
                <InputNumber style={{ minWidth: "300px" }} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Fund
                </Button>
              </Form.Item>
            </Form>
          )}
        </Col>
      </Row>
    </ComponentContainer>
  );
};
export default PoolDetail;
