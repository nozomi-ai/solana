import React, { FC, ReactNode } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { JupiterProvider } from '@jup-ag/react-hook';
import { Connection } from "@solana/web3.js";
require('@solana/wallet-adapter-react-ui/styles.css');

export const JupiterApp: FC<{ children: ReactNode }> = ({ children }) => {
    const url = "https://ssc-dao.genesysgo.net/";
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
