use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

pub mod instructions;
pub use instructions::*;

pub mod schemas;
pub use schemas::*;

pub mod errors;
pub use errors::*;

#[program]
pub mod staking {
    use super::*;

    pub fn initialize_pool(
        ctx: Context<InitializePool>,
        pool_nonce: u8,
        reward_duration: u64,
        lock_period: u64,
    ) -> Result<()> {
        initialize_pool::exec(ctx, pool_nonce, reward_duration, lock_period)
    }

    pub fn create_user(ctx: Context<CreateUser>) -> Result<()> {
        create_user::exec(ctx)
    }

    pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
        stake::exec_stake(ctx, amount)
    }

    pub fn exec_unstake(ctx: Context<Stake>, amount: u64) -> Result<()> {
        stake::exec_stake(ctx, amount)
    }

    pub fn pause(ctx: Context<Pause>) -> Result<()> {
        pause::exec_pause(ctx)
    }

    pub fn unpause(ctx: Context<Unpause>) -> Result<()> {
        pause::exec_unpause(ctx)
    }

    pub fn authorize_funder(ctx: Context<FunderChange>, funder_to_add: Pubkey) -> Result<()> {
        authorize_funder::exec_authorize_funder(ctx, funder_to_add)
    }

    pub fn deauthorize_funder(ctx: Context<FunderChange>, funder_to_remove: Pubkey) -> Result<()> {
        authorize_funder::exec_deauthorize_funder(ctx, funder_to_remove)
    }

    pub fn fund(ctx: Context<Fund>, amount: u64) -> Result<()> {
        fund::exec(ctx, amount)
    }

    pub fn claim(ctx: Context<ClaimReward>) -> Result<()> {
        claim::exec(ctx)
    }

    pub fn close_pool(ctx: Context<ClosePool>) -> Result<()> {
        close_pool::exec(ctx)
    }
}

#[derive(Accounts)]
pub struct Initialize {}
