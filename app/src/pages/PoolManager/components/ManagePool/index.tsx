import React, { useEffect, useState } from "react";
import { useConnectedWallet } from "@saberhq/use-solana";
import { Connection } from "@solana/web3.js";
import {
  Button,
  Form,
  InputNumber,
  List,
  Select,
  Typography,
} from "antd";
import * as anchor from "@project-serum/anchor";
import { isEmpty } from "lodash";
import { getPools } from "utils/getPools";
import { NoPool, PoolManagerContainer } from "./style";

import { fund, getPoolDetail, RawPoolAccount } from "temp";

const { Title, Text } = Typography;
const { Option } = Select;

const ManagePool: React.FC = () => {
  const [pools, setPools] = useState<RawPoolAccount[]>([]);
  const hasPools = Array.isArray(pools) && pools.length > 0;

  const [selectedPoolPubkey, setSelectedPoolPubkey] = useState<string>("");
  const [poolDetail, setPoolDetail] = useState<any>({});
  const hasSelectedPool = !isEmpty(poolDetail);

  const wallet = useConnectedWallet();
  const connection = new Connection("https://api.devnet.solana.com");
  const [form] = Form.useForm();

  const handleGetPool = async () => {
    if (wallet) {
      const createdPools = await getPools(wallet, connection);
      setPools(createdPools);
    }
  };

  const handlePoolDetail = async (pubkey: string) => {
    const poolAccount = pools.find(
      (pool) => pool.publicKey.toString() === pubkey
    );
    const poolData = await getPoolDetail(poolAccount, connection);
    setPoolDetail({
      lockPeriod: poolAccount?.lockPeriod.toString(),
      rewardDuration: poolAccount?.rewardDuration.toString(),
      rewardDurationEnd: poolAccount?.rewardDurationEnd.toString(),
      ...poolData,
      rewardMint: poolAccount?.rewardMint.toString(),
      stakingMint: poolAccount?.stakingMint.toString(),
    });
  };

  const onFund = async ({ amount }: { amount: number }) => {
    try {
      if (wallet) {
        const provider = new anchor.AnchorProvider(connection, wallet, {});
        const poolAccount = pools.find(
          (pool) => pool.publicKey.toString() === selectedPoolPubkey
        );
        if (poolAccount) {
          await fund(amount, poolAccount, provider);
          await handlePoolDetail(selectedPoolPubkey);
        } else {
          throw new Error("Invalid Pool Account");
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    handleGetPool();
  }, [wallet]);

  useEffect(() => {
    if (selectedPoolPubkey) {
      handlePoolDetail(selectedPoolPubkey);
    }
  }, [selectedPoolPubkey]);

  return (
    <>
      {hasPools ? (
        <PoolManagerContainer>
          <Select
            placeholder="Select Pool"
            style={{ width: "60%", marginBottom: "32px", alignSelf: "center" }}
            onChange={(value) => setSelectedPoolPubkey(value)}
          >
            {pools.map((pool) => {
              const pubKey = pool.publicKey.toString();
              return (
                <Option value={pubKey} key={pubKey}>
                  {pubKey}
                </Option>
              );
            })}
          </Select>
          {hasSelectedPool && (
            <>
              <List
                bordered
                style={{ width: "100%", marginBottom: "32px" }}
                dataSource={Object.keys(poolDetail)}
                renderItem={(item) => (
                  <List.Item>
                    <Text>{item}</Text>
                    <Text>{poolDetail[item].toString()}</Text>
                  </List.Item>
                )}
              />
              <Form form={form} layout="inline" onFinish={onFund}>
                <Form.Item label="Fun Amount (tokens)" name="amount">
                  <InputNumber style={{ minWidth: "300px" }} />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Fund
                  </Button>
                </Form.Item>
              </Form>
            </>
          )}
        </PoolManagerContainer>
      ) : (
        <NoPool>
          <Title level={4}>No pool created yet</Title>
        </NoPool>
      )}
    </>
  );
};
export default ManagePool;
