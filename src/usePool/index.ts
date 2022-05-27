import { ConnectedWallet } from "@saberhq/use-solana";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useState, useEffect, useCallback } from "react";
import * as anchor from "@project-serum/anchor";
import { PublicKey, Connection } from "@solana/web3.js";

import { PRECISION, SOLPOOL_PROGRAM_ID } from "../constants";
import { PoolDetail, UserAccount, RawPoolAccount } from "../types";
import {
  fetchUserAccount,
  getPoolDetail,
  getStakeAccount,
  getStakingProgram,
} from "../actions";

type UseStakePool = {
  poolAddress: PublicKey;
  connection: Connection;
  wallet: anchor.Wallet | ConnectedWallet | null;
};

const usePool = ({ poolAddress, connection, wallet }: UseStakePool) => {
  const [reload, setReload] = useState(false);
  const [poolAccount, setPoolAccount] = useState<RawPoolAccount>();
  const [poolDetail, setPoolDetail] = useState<PoolDetail>();
  const [stakeUserTokenAccount, setStakeUserTokenAccount] = useState<any>();
  const [userAccount, setUserAccount] = useState<UserAccount>({
    account: PublicKey.default,
    bump: null,
  });
  const [userStakeAccount, setUserStakeAccount] = useState<any>();

  useEffect(() => {
    if (!!wallet && poolAddress !== PublicKey.default) {
      const stakingProgram = getStakingProgram(connection, wallet);
      if (!!stakingProgram) {
        stakingProgram.account.pool
          .fetch(poolAddress)
          //@ts-ignore
          .then((d: RawPoolAccount) => {
            if (d) {
              setPoolAccount(d);

              connection
                .getParsedTokenAccountsByOwner(wallet.publicKey, {
                  mint: d.stakingMint,
                })
                .then((d) => {
                  //@ts-ignore
                  setStakeUserTokenAccount(d.value[0].pubkey);
                })
                .catch((e) => console.log("get user token account error:", e));
            }
          })
          .catch((e) => console.log("get pool account error:", e));
      }

      fetchUserAccount(wallet, poolAddress, connection)
        .then(({ userPoolAccount, userPoolDetail }) => {
          setUserAccount(userPoolAccount);
          setUserStakeAccount(userPoolDetail);
        })
        .catch((e) => console.log("get user account error:", e));
    }
  }, [wallet, poolAddress.toString(), reload]);

  useEffect(() => {
    if (!!poolAccount && !!connection) {
      getPoolDetail(poolAccount, connection)
        .then((d) => !!d && setPoolDetail(d))
        .catch((e) => console.log("get pool detail error:", e));
    }
  }, [poolAccount, reload]);

  const handleUpdateUserStakeDetail = useCallback(async () => {
    const stakingProgram = getStakingProgram(connection, wallet);

    const req =
      !!stakingProgram &&
      !!userAccount &&
      (await getStakeAccount(stakingProgram, userAccount.account));
    if (req) {
      const stakeAmount = parseFloat(req?.balanceStaked.toString() ?? 0);
      setUserStakeAccount(req);
    }
  }, [userAccount, userStakeAccount]);

  const stake = useCallback(
    async (input: number) => {
      const stakingProgram = getStakingProgram(connection, wallet);
      if (!stakeUserTokenAccount || !stakingProgram || !poolAccount || !wallet) {
        throw new Error("Somethings wrong");
      }

      const [poolSigner, _bump] =
        await anchor.web3.PublicKey.findProgramAddress(
          [poolAddress.toBuffer()],
          stakingProgram.programId
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
            owner: wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .instruction();

        tx = await stakingProgram.methods
          .stake(amount)
          .accounts({
            pool: poolAddress,
            stakingVault: poolAccount.stakingVault,
            user: userAccount.account,
            owner: wallet.publicKey,
            stakeFromAccount: stakeUserTokenAccount,
            poolSigner,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .preInstructions([ix])
          .rpc();
      } else {
        tx = await stakingProgram.methods
          .stake(amount)
          .accounts({
            pool: poolAddress,
            stakingVault: poolAccount.stakingVault,
            user: userAccount.account,
            owner: wallet.publicKey,
            stakeFromAccount: stakeUserTokenAccount,
            poolSigner,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .rpc();
      }

      console.log(tx);
      return tx;
    },
    [userAccount, stakeUserTokenAccount, poolAccount]
  );

  const unstake = async (input: number) => {
    const stakingProgram = getStakingProgram(connection, wallet);
    if (
      !userAccount ||
      !stakeUserTokenAccount ||
      !stakingProgram ||
      !poolAccount ||
      !wallet
    ) {
      return;
    }

    const [poolSigner, _bump] = await anchor.web3.PublicKey.findProgramAddress(
      [poolAddress.toBuffer()],
      stakingProgram.programId
    );

    const amount = new anchor.BN(input);

    const tx = await stakingProgram.methods
      .unstake(amount)
      .accounts({
        pool: poolAddress,
        stakingVault: poolAccount.stakingVault,
        user: userAccount.account,
        owner: wallet.publicKey,
        stakeFromAccount: stakeUserTokenAccount,
        poolSigner,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    handleUpdateUserStakeDetail();

    return tx;
  };

  const claim = async () => {
    const stakingProgram = getStakingProgram(connection, wallet);
    if (
      !userAccount ||
      !stakeUserTokenAccount ||
      !stakingProgram ||
      !poolAccount ||
      !wallet
    ) {
      return;
    }

    const [poolSigner, _bump] = await anchor.web3.PublicKey.findProgramAddress(
      [poolAddress.toBuffer()],
      stakingProgram.programId
    );

    const tx = await stakingProgram.methods
      .claim()
      .accounts({
        pool: poolAddress,
        stakingVault: poolAccount.stakingVault,
        rewardVault: poolAccount.rewardVault,
        user: userAccount.account,
        owner: wallet.publicKey,
        rewardAccount: stakeUserTokenAccount,
        poolSigner,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    handleUpdateUserStakeDetail();

    console.log(tx)
    return tx;
  };

  const getPendingReward = useCallback(() => {
    if (userStakeAccount && poolDetail && poolAccount) {
      const totalStaked = new anchor.BN(poolDetail.tvl);
      const currentTime = Math.floor(Date.now() / 1000);
      const rewardDurationEnd = parseInt(
        poolAccount.rewardDurationEnd.toString()
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
        .mul(rewardPerTokenStored.sub(userStakeAccount.rewardPerTokenComplete))
        .div(PRECISION)
        .add(userStakeAccount.rewardPerTokenPending);

      return parseInt(pendingAmount) < 0 ? 0 : parseInt(pendingAmount);
    }

    return 0;
  }, [userStakeAccount, poolDetail, poolAccount]);

  return {
    userStakeAccount,
    poolAccount,
    poolDetail,
    setReload,
    stake,
    unstake,
    claim,
    getPendingReward,
  };
};

export default usePool;
