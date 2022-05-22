import { Connection } from '@solana/web3.js';
import { SolanaApiUrl, SolanaCluster } from 'constants/solana';

export const getClusterDetail = () => {
  const cluster =
    process.env.REACT_APP_CLUSTER || SolanaCluster.MAINNET;
  let clusterApiUrl: string = SolanaApiUrl.MAINNET;
  if (cluster === SolanaCluster.LOCALNET) {
    clusterApiUrl = SolanaApiUrl.LOCALNET;
  }
  if (cluster === SolanaCluster.DEVNET) {
    clusterApiUrl = SolanaApiUrl.DEVNET;
  }
  if (cluster === SolanaCluster.TESTNET) {
    clusterApiUrl = SolanaApiUrl.TESTNET;
  }
  if (cluster === SolanaCluster.MAINNET) {
    clusterApiUrl = SolanaApiUrl.MAINNET;
  }

  let connection: Connection = new Connection(clusterApiUrl, "processed");
  return {
    cluster,
    clusterApiUrl,
    connection,
  };
}
