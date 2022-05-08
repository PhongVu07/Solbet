use anchor_lang::{prelude::*, solana_program};
use anchor_spl::token::{Token, TokenAccount};
use anchor_lang::solana_program::{sysvar};

use crate::schemas::*;

#[derive(Accounts)]
pub struct ClosePool<'info> {
    #[account(mut)]
    /// CHECK: nothing to check.
    pub refundee: AccountInfo<'info>,
    #[account(mut)]
    pub staking_refundee: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub reward_refundee: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        close = refundee,
        has_one = authority,
        has_one = staking_vault,
        has_one = reward_vault,
        constraint = pool.paused,
        constraint = pool.reward_duration_end > 0,
        constraint = pool.reward_duration_end < sysvar::clock::Clock::get().unwrap().unix_timestamp.try_into().unwrap(),
        constraint = pool.user_stake_count == 0,
        constraint = pool.total_staked == 0,
    )]
    pub pool: Account<'info, Pool>,
    pub authority: Signer<'info>,
    #[account(mut)]
    pub staking_vault: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub reward_vault: Box<Account<'info, TokenAccount>>,
    #[account(
        seeds = [
            pool.to_account_info().key.as_ref()
        ],
        bump = pool.bump,
    )]
    /// CHECK: nothing to check.
    pub pool_signer: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
}

pub fn exec<'info>(ctx: Context<ClosePool>) -> Result<()> {
    let pool = &ctx.accounts.pool;

    let signer_seeds = &[
        pool.to_account_info().key.as_ref(),
        &[ctx.accounts.pool.bump],
    ];

    //instead of closing these vaults, we could technically just
    //set_authority on them. it's not very ata clean, but it'd work
    //if size of tx is an issue, thats an approach

    //close staking vault
    let staking_vault_balance = ctx.accounts.staking_vault.amount;

    if staking_vault_balance > 0 {
        let ix = spl_token::instruction::transfer(
            &spl_token::ID,
            ctx.accounts.staking_vault.to_account_info().key,
            ctx.accounts.staking_refundee.to_account_info().key,
            ctx.accounts.pool_signer.key,
            &[ctx.accounts.pool_signer.key],
            staking_vault_balance,
        )?;
        solana_program::program::invoke_signed(
            &ix,
            &[
                ctx.accounts.token_program.to_account_info(),
                ctx.accounts.staking_vault.to_account_info(),
                ctx.accounts.staking_refundee.to_account_info(),
                ctx.accounts.pool_signer.to_account_info(),
            ],
            &[signer_seeds],
        )?;
    }

    let ix = spl_token::instruction::close_account(
        &spl_token::ID,
        ctx.accounts.staking_vault.to_account_info().key,
        ctx.accounts.refundee.key,
        ctx.accounts.pool_signer.key,
        &[ctx.accounts.pool_signer.key],
    )?;
    solana_program::program::invoke_signed(
        &ix,
        &[
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.staking_vault.to_account_info(),
            ctx.accounts.refundee.to_account_info(),
            ctx.accounts.pool_signer.to_account_info(),
        ],
        &[signer_seeds],
    )?;

    //close token a vault
    let reward_vault_balance = ctx.accounts.reward_vault.amount;

    if reward_vault_balance > 0 {
        let ix = spl_token::instruction::transfer(
            &spl_token::ID,
            ctx.accounts.reward_vault.to_account_info().key,
            ctx.accounts.reward_refundee.to_account_info().key,
            ctx.accounts.pool_signer.key,
            &[ctx.accounts.pool_signer.key],
            reward_vault_balance,
        )?;
        solana_program::program::invoke_signed(
            &ix,
            &[
                ctx.accounts.token_program.to_account_info(),
                ctx.accounts.reward_vault.to_account_info(),
                ctx.accounts.reward_refundee.to_account_info(),
                ctx.accounts.pool_signer.to_account_info(),
            ],
            &[signer_seeds],
        )?;
    }
    let ix = spl_token::instruction::close_account(
        &spl_token::ID,
        ctx.accounts.reward_vault.to_account_info().key,
        ctx.accounts.refundee.key,
        ctx.accounts.pool_signer.key,
        &[ctx.accounts.pool_signer.key],
    )?;
    solana_program::program::invoke_signed(
        &ix,
        &[
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.reward_vault.to_account_info(),
            ctx.accounts.refundee.to_account_info(),
            ctx.accounts.pool_signer.to_account_info(),
        ],
        &[signer_seeds],
    )?;

    Ok(())
}