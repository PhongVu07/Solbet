use anchor_lang::prelude::*;

#[account]
// #[derive(Default)]
pub struct User {
    /// Pool the this user belongs to.
    pub pool: Pubkey,
    /// The owner of this account.
    pub authority: Pubkey,
    /// The amount of token A claimed.
    pub reward_per_token_complete: u128,
    /// The amount of token A pending claim.
    pub reward_per_token_pending: u64,
    /// The amount staked.
    pub balance_staked: u64,
    /// Maturity time.
    pub maturity_time: u64,
    /// Signer bump.
    pub bump: u8,
}

// 8 + 32 + 32 + 16 + 8 * 3 + 2
impl User {
    pub const SIZE: usize = 114;
}