use anchor_lang::prelude::*;

#[account]
pub struct Pool {
    /// Privileged account.
    pub authority: Pubkey,
    /// bump to derive the program-derived address owning the vaults.
    pub bump: u8,
    /// Paused state of the program
    pub paused: bool,
    /// Mint of the token that can be staked.
    pub staking_mint: Pubkey,
    /// Vault to store staked tokens.
    pub staking_vault: Pubkey,
    /// Mint of the reward A token.
    pub reward_mint: Pubkey,
    /// Vault to store reward A tokens.
    pub reward_vault: Pubkey,
    /// The period which rewards are linearly distributed.
    pub reward_duration: u64,
    /// The timestamp at which the current reward period ends.
    pub reward_duration_end: u64,
    /// Period to lock staked token and rewards
    pub lock_period: u64,
    /// The last time reward states were updated.
    pub last_update_time: u64,
    /// Rate of reward A distribution.
    pub reward_rate: u64,
    /// Last calculated reward A per pool token.
    pub reward_per_token_stored: u128,
    /// Users staked
    pub user_stake_count: u32,
    /// Total staked amount
    pub total_staked: u64,
    /// authorized funders
    /// [] because short size, fixed account size, and ease of use on
    /// client due to auto generated account size property
    pub funders: [Pubkey; 5],
}

// 8 + 32 + 1 + 1 + 32 * 4 + 8 * 5 + 16 + 4 + 8 + 32 * 5
impl Pool {
    pub const SIZE: usize = 398;
}