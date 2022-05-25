import { PublicKey } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
//@ts-ignore
import BufferLayout from "buffer-layout";

export const SOLPOOL_PROGRAM_ID = new PublicKey(
  "F1CrmG8QNUczRGFsyDfwnc1qBRL8UJDVtZgL43zhYiXQ"
);

export const PRECISION = new anchor.BN("18446744073709551615");
