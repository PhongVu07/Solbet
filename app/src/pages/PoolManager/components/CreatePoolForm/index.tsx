import React from "react";
import { useConnectedWallet } from "@saberhq/use-solana";
import { Button, Form, Input, InputNumber } from "antd";
import * as anchor from "@project-serum/anchor";
import { Connection } from "@solana/web3.js";
import { createPool } from "temp/actions/createPool";

const CreatePoolForm: React.FC = () => {
    const wallet = useConnectedWallet();
    const connection = new Connection("https://api.devnet.solana.com");

  const onFinish = async (values: any) => {
    try {
      if (!wallet) {
        throw new Error("Wallet not connected");
      }
      const { mint, period } = values;
      const provider = new anchor.AnchorProvider(connection, wallet, {});

      const tx = await createPool(period, mint, provider);
      console.log(tx);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Form
      name="basic"
      labelCol={{ span: 12, offset: 6 }}
      wrapperCol={{ span: 12, offset: 6 }}
      initialValues={{ period: 600 }}
      autoComplete="off"
      layout="vertical"
      onFinish={onFinish}
    >
      <h3 style={{ textAlign: "center" }}>Create Pool</h3>
      <Form.Item label="Token Mint" name="mint" required>
        <Input style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item label="Lock Period" name="period" required>
        <InputNumber style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Create
        </Button>
      </Form.Item>
    </Form>
  );
};
export default CreatePoolForm;
