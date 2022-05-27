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

import { usePool } from "sol-pool";
import { formatPoolData, formatUserData } from "./utils";
import { pushNotification } from "utils/notification";

const { Search } = Input;
const { Text } = Typography;

const PoolDetail: React.FC = () => {
  const [poolPubkey, setPoolPubkey] = useState<string>("");
  const [pendingReward, setPendingReward] = useState(0);

  const wallet = useConnectedWallet() as any;
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

  const isTokenLocked =
    Date.now() <
    new Date(
      +(userStakeAccount?.maturityTime.toString() ?? 0) * 1000
    ).getTime();

  const poolData = formatPoolData(poolDetail, poolAccount);
  const userData = formatUserData(userStakeAccount, pendingReward);

  const handleStake = async (amount: number) => {
    try {
      await stake(amount);
      pushNotification("success", "Token staked");
    } catch (e) {
      console.log(e);
      pushNotification("error", "Error stake token");
    }
  };

  const handleClaim = async () => {
    try {
      await claim();
      pushNotification("success", "Token claimed");
    } catch (e) {
      console.log(e);
      pushNotification("error", "Error claim token");
    }
  };

  const handleUnstake = async (amount: number) => {
    try {
      await unstake(amount);
      pushNotification("success", "Token unstaked");
    } catch (e) {
      console.log(e);
      pushNotification("error", "Error unstake token");
    }
  };

  useEffect(() => {
    setPendingReward(getPendingReward());
  }, [userStakeAccount]);

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
      <Row gutter={20}>
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
        <Col lg={8} md={8}>
          {userData && (
            <>
              <List
                bordered
                style={{ width: "100%", marginBottom: "32px" }}
                dataSource={Object.keys(userData)}
                renderItem={(item) => (
                  <List.Item>
                    <Text>{item}</Text>
                    {/* @ts-ignore */}
                    <Text>{userData[item]}</Text>
                  </List.Item>
                )}
              />
              <Button
                type="primary"
                disabled={!pendingReward}
                onClick={handleClaim}
              >
                Claim
              </Button>
            </>
          )}
        </Col>
      </Row>
      <Row>
        <Col lg={12} md={12}>
          {poolData && (
            <Form
              form={form}
              layout="inline"
              onFinish={(value) => handleStake(value.stakeAmount)}
            >
              <Form.Item label="Stake Amount (tokens)" name="stakeAmount">
                <InputNumber style={{ minWidth: "200px" }} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Fund
                </Button>
              </Form.Item>
            </Form>
          )}
        </Col>
        <Col lg={12} md={12}>
          {userStakeAccount && (
            <Form
              form={form}
              layout="inline"
              onFinish={(value) => handleUnstake(value.unStakeAmount)}
            >
              <Form.Item label="Stake Amount (tokens)" name="unStakeAmount">
                <InputNumber style={{ minWidth: "200px" }} />
              </Form.Item>
              <Form.Item>
                <Button
                  danger
                  type="default"
                  htmlType="submit"
                  disabled={
                    userStakeAccount.balanceStaked.toNumber() === 0 ||
                    isTokenLocked
                  }
                >
                  Unstake
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
