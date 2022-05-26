import { PoolDetail, RawPoolAccount } from "temp";
import { formatLockPeriod } from "utils/staking";

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