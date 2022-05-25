import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useState, useEffect, useCallback } from "react";
import * as anchor from "@project-serum/anchor";
import { useConnectedWallet, useSolana } from "@saberhq/use-solana";
import { PublicKey, Connection } from "@solana/web3.js";

import { PRECISION, SOLPOOL_PROGRAM_ID } from "../constants";
import { PoolDetail, UserAccount } from "../types";
import {
  fetchUserAccount,
  getPoolDetail,
  getStakeAccount,
  getStakingProgram,
} from "../actions/utils";

type UseStakePool = {
  poolAddress: PublicKey;
  connection: Connection;
};

const usePool = ({ poolAddress, connection }: UseStakePool) => {
  const [reload, setReload] = useState(false);
  const [poolAccount, setPoolAccount] = useState<any>();
  const [poolDetail, setPoolDetail] = useState<PoolDetail | null>();
  const [userTokenAccount, setUserTokenAccount] = useState<any>();
  const [userAccount, setUserAccount] = useState<UserAccount>();
  const [userStakeAccount, setUserStakeAccount] = useState<any>();

  const connectedWallet = useConnectedWallet();

  const tokenMint = PublicKey.default;

  useEffect(() => {
    if (!!connectedWallet) {
      connection
        .getParsedTokenAccountsByOwner(connectedWallet.publicKey, {
          mint: tokenMint,
        })
        .then((d) => setUserTokenAccount(d))
        .catch((e) => console.log("get user token account error:", e));

      const stakingProgram = getStakingProgram(connection, connectedWallet);
      if (!!stakingProgram) {
        stakingProgram.account.pool
          .fetch(poolAddress)
          .then((d) => !!d && setPoolAccount(d))
          .catch((e) => console.log("get pool account error:", e));
      }

      fetchUserAccount(connectedWallet, poolAddress, connection)
        .then(({ userPoolAccount, userPoolDetail }) => {
          setUserAccount(userPoolAccount);
          setUserStakeAccount(userPoolDetail);
        })
        .catch((e) => console.log("get user account error:", e));
    }
  }, [connectedWallet, reload]);

  useEffect(() => {
    if (!!poolAccount && !!connection) {
      getPoolDetail(poolAccount, connection)
        .then((d) => !!d && setPoolDetail(d))
        .catch((e) => console.log("get pool detail error:", e));
    }
  }, [poolAccount, reload]);

  const handleUpdateUserStakeDetail = useCallback(async () => {
    const stakingProgram = getStakingProgram(connection, connectedWallet);

    const req =
      !!stakingProgram &&
      !!userAccount &&
      (await getStakeAccount(stakingProgram, userAccount.account));
    if (req) {
      const stakeAmount = parseFloat(req?.balanceStaked.toString() ?? 0);
      setUserStakeAccount(req);
    }
  }, [userAccount, userStakeAccount]);

  const stake = async (input: number) => {
    const stakingProgram = getStakingProgram(connection, connectedWallet);
    if (!userAccount || !stakingProgram || !connectedWallet) {
      return;
    }
    let POOL_SIGNER = new PublicKey(
      "6bKgLEfMW3d4Hwx2u53FJoLsTrsuobZQKaVJy582RJcA"
    );
    let STAKING_VAULT = new PublicKey(
      "4EFEhmf8Cp6nJz4i8pYXjyWyYwtP6pj3F4XkSz1G2Qmt"
    );

    const exist = await connection.getBalance(userAccount.account);

    const amount = new anchor.BN(input);
    let tx;
    if (!exist) {
      // Stake account does not exist
      const ix = await stakingProgram.methods
        .createUser()
        .accounts({
          pool: poolAddress,
          user: userAccount.account,
          owner: connectedWallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .instruction();

      tx = await stakingProgram.methods
        .stake(amount)
        .accounts({
          accounts: {
            pool: poolAddress,
            stakingVault: STAKING_VAULT,
            user: userAccount.account,
            owner: connectedWallet.publicKey,
            stakeFromAccount: userTokenAccount,
            poolSigner: POOL_SIGNER,
            tokenProgram: TOKEN_PROGRAM_ID,
          },
        })
        .postInstructions([ix])
        .rpc();
    } else {
      tx = await stakingProgram.methods
        .stake(amount)
        .accounts({
          accounts: {
            pool: poolAddress,
            stakingVault: STAKING_VAULT,
            user: userAccount.account,
            owner: connectedWallet.publicKey,
            stakeFromAccount: userTokenAccount,
            poolSigner: POOL_SIGNER,
            tokenProgram: TOKEN_PROGRAM_ID,
          },
        })
        .rpc();
    }

    return tx;
  };

  const unstake = async (input: number) => {
    const stakingProgram = getStakingProgram(connection, connectedWallet);
    if (
      !userAccount ||
      !userTokenAccount ||
      !stakingProgram ||
      !connectedWallet
    ) {
      return;
    }
    let POOL_SIGNER = new PublicKey(
      "6bKgLEfMW3d4Hwx2u53FJoLsTrsuobZQKaVJy582RJcA"
    );
    let STAKING_VAULT = new PublicKey(
      "4EFEhmf8Cp6nJz4i8pYXjyWyYwtP6pj3F4XkSz1G2Qmt"
    );

    const amount = new anchor.BN(input);

    const tx = await stakingProgram.methods
      .unstake(amount)
      .accounts({
        pool: poolAddress,
        stakingVault: STAKING_VAULT,
        user: userAccount.account,
        owner: connectedWallet.publicKey,
        stakeFromAccount: userTokenAccount,
        poolSigner: POOL_SIGNER,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    handleUpdateUserStakeDetail();

    return tx;
  };

  const claim = async () => {
    const stakingProgram = getStakingProgram(connection, connectedWallet);
    if (
      !userAccount ||
      !userTokenAccount ||
      !stakingProgram ||
      !connectedWallet
    ) {
      return;
    }

    let POOL_SIGNER = new PublicKey(
      "6bKgLEfMW3d4Hwx2u53FJoLsTrsuobZQKaVJy582RJcA"
    );
    let STAKING_VAULT = new PublicKey(
      "4EFEhmf8Cp6nJz4i8pYXjyWyYwtP6pj3F4XkSz1G2Qmt"
    );
    let REWARD_VAULT = new PublicKey(
      "BaZLBtwAGGkdyhivVvwWmdDoS8c9CAJYdt6esXTFswW5"
    );

    const tx = await stakingProgram.methods
      .claim()
      .accounts({
        pool: poolAddress,
        stakingVault: STAKING_VAULT,
        rewardVault: REWARD_VAULT,
        user: userAccount.account,
        owner: connectedWallet.publicKey,
        rewardAccount: userTokenAccount,
        poolSigner: POOL_SIGNER,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    handleUpdateUserStakeDetail();

    return tx;
  };

  const getPendingReward = () => {
    if (
      userStakeAccount &&
      poolDetail &&
      poolAccount
    ) {
      const totalStaked = new anchor.BN(poolDetail.tvl);
      const currentTime = Math.floor(Date.now() / 1000);
      const rewardDurationEnd = parseInt(
        poolAccount.rewardDurationEnd.toNumber()
      );
      const lastTimeRewardApplicable = new anchor.BN(
        currentTime > rewardDurationEnd ? rewardDurationEnd : currentTime
      );

      let rewardPerTokenStored: anchor.BN = poolAccount.rewardPerTokenStored;
      if (!totalStaked.isZero()) {
        rewardPerTokenStored = poolAccount.rewardPerTokenStored.add(
          lastTimeRewardApplicable
            .sub(poolAccount.lastUpdateTime)
            .mul(poolAccount.rewardRate)
            .mul(PRECISION)
            .div(totalStaked)
        );
      }
      const pendingAmount = userStakeAccount.balanceStaked
        .mul(
          rewardPerTokenStored.sub(userStakeAccount.rewardPerTokenComplete)
        )
        .div(PRECISION)
        .add(userStakeAccount.rewardPerTokenPending);

      return parseInt(pendingAmount) < 0
        ? 0
        : parseInt(pendingAmount);
    }

    return 0;
  };

  return {
    userStakeAccount,
    poolDetail,
    setReload,
    stake,
    unstake,
    claim,
    getPendingReward,
  };
};

export default usePool