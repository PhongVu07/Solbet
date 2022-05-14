use anchor_lang::prelude::*;
use anchor_lang::solana_program::clock;

use crate::schemas::*;
use crate::instructions::constants::*;

pub fn update_rewards(
    pool: &mut Account<Pool>,
    user: Option<&mut Box<Account<User>>>,
    total_staked: u64,
) -> Result<()> {
    let clock = clock::Clock::get().unwrap();
    let last_time_reward_applicable =
        last_time_reward_applicable(pool.reward_duration_end, clock.unix_timestamp);

    pool.reward_per_token_stored = reward_per_token(
        total_staked,
        pool.reward_per_token_stored,
        last_time_reward_applicable,
        pool.last_update_time,
        pool.reward_rate,
    );

    pool.last_update_time = last_time_reward_applicable;

    if let Some(u) = user {
        u.reward_per_token_pending = earned(
            u.balance_staked,
            pool.reward_per_token_stored,
            u.reward_per_token_complete,
            u.reward_per_token_pending,
        );
        u.reward_per_token_complete = pool.reward_per_token_stored;
    }
    Ok(())
}

pub fn last_time_reward_applicable(reward_duration_end: u64, unix_timestamp: i64) -> u64 {
    return std::cmp::min(unix_timestamp.try_into().unwrap(), reward_duration_end);
}

pub fn reward_per_token(
    total_staked: u64,
    reward_per_token_stored: u128,
    last_time_reward_applicable: u64,
    last_update_time: u64,
    reward_rate: u64,
) -> u128 {
    if total_staked == 0 {
        return reward_per_token_stored;
    }

    return reward_per_token_stored
        .checked_add(
            (last_time_reward_applicable as u128)
                .checked_sub(last_update_time as u128)
                .unwrap()
                .checked_mul(reward_rate as u128)
                .unwrap()
                .checked_mul(PRECISION)
                .unwrap()
                .checked_div(total_staked as u128)
                .unwrap(),
        )
        .unwrap();
}

pub fn earned(
    balance_staked: u64,
    reward_per_token: u128,
    user_reward_per_token_paid: u128,
    user_reward_pending: u64,
) -> u64 {
    return (balance_staked as u128)
        .checked_mul(
            (reward_per_token as u128)
                .checked_sub(user_reward_per_token_paid as u128)
                .unwrap(),
        )
        .unwrap()
        .checked_div(PRECISION)
        .unwrap()
        .checked_add(user_reward_pending as u128)
        .unwrap()
        .try_into()
        .unwrap();
}