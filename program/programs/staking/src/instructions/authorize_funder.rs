use anchor_lang::prelude::*;

use crate::errors::ErrorCode;
use crate::schemas::*;

#[derive(Accounts)]
pub struct FunderChange<'info> {
    // Global accounts for the staking instance.
    #[account(
        mut,
        has_one = authority,
    )]
    pub pool: Box<Account<'info, Pool>>,
    pub authority: Signer<'info>,
}


pub fn exec_authorize_funder(ctx: Context<FunderChange>, funder_to_add: Pubkey) -> Result<()> {
    if funder_to_add == ctx.accounts.pool.authority {
        return Err(ErrorCode::FunderAlreadyAuthorized.into());
    }
    let funders = &mut ctx.accounts.pool.funders;
    if funders.iter().any(|x| *x == funder_to_add) {
        return Err(ErrorCode::FunderAlreadyAuthorized.into());
    }
    let default_pubkey = Pubkey::default();
    if let Some(idx) = funders.iter().position(|x| *x == default_pubkey) {
        funders[idx] = funder_to_add;
    } else {
        return Err(ErrorCode::MaxFunders.into());
    }
    Ok(())
}

pub fn exec_deauthorize_funder(ctx: Context<FunderChange>, funder_to_remove: Pubkey) -> Result<()> {
    if funder_to_remove == ctx.accounts.pool.authority {
        return Err(ErrorCode::CannotDeauthorizePoolAuthority.into());
    }
    let funders = &mut ctx.accounts.pool.funders;
    if let Some(idx) = funders.iter().position(|x| *x == funder_to_remove) {
        funders[idx] = Pubkey::default();
    } else {
        return Err(ErrorCode::CannotDeauthorizeMissingAuthority.into());
    }
    Ok(())
}