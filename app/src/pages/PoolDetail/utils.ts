import dayjs from "dayjs";
import { formatLockPeriod } from "utils/staking";

import { PoolDetail, RawPoolAccount } from "temp";

export const formatPoolData = (poolDetail?: PoolDetail, poolAccount?: RawPoolAccount) => {
    if (!poolDetail || !poolAccount) {
        return
    }
    return {
        TVL: poolDetail.tvl,
        APR: poolDetail.apr,
        "Lock Period": formatLockPeriod(poolAccount.lockPeriod.toNumber()),
        "Staking Mint": poolAccount.stakingMint.toString(),
        "Reward Mint": poolAccount.rewardMint.toString(),
    }
}

export const formatUserData = (userStakeAccount: any, pendingReward: number) => {
    if (!userStakeAccount) {
        return
    }
    return {
        "Total Staked": userStakeAccount.balanceStaked.toString(),
        "Unlock Time": dayjs(userStakeAccount.maturityTime * 1000).format(('hh:mm DD-MM-YYYY')),
        "Pending Reward": pendingReward
    }
}