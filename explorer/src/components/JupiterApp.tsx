import React, { FC, ReactNode } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { JupiterProvider } from '@jup-ag/react-hook';
import { clusterApiUrl, Connection } from "@solana/web3.js";
import { Cluster, clusterUrl, useCluster } from 'src/providers/cluster';
require('@solana/wallet-adapter-react-ui/styles.css');

export const JupiterApp: FC<{ children: ReactNode }> = ({ children }) => {
    const { cluster, customUrl } = useCluster();
    const currentClusterUrl = clusterUrl(cluster, customUrl);
    var url = "";
    if (cluster === Cluster.MainnetBeta) {
        url = clusterApiUrl("mainnet-beta");
    } else if (cluster === Cluster.Testnet) { 
        url = clusterApiUrl("testnet");
    } else {
        url = clusterApiUrl("devnet");
    }

    const connection = new Connection(url);
    const wallet = useWallet();
    return (
      <JupiterProvider
        cluster="mainnet-beta"
        connection={connection}
        userPublicKey={wallet.publicKey || undefined}
      >
        {children}
      </JupiterProvider>
    );
};
