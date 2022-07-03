import React, { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, useConnection, useWallet, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { GlowWalletAdapter, LedgerWalletAdapter, PhantomWalletAdapter, SlopeWalletAdapter, SolflareWalletAdapter, SolletWalletAdapter, TorusWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { JupiterProvider } from '@jup-ag/react-hook';
require('@solana/wallet-adapter-react-ui/styles.css');


const JupiterApp = ({ children }) => {
    const { connection } = useConnection();
    const wallet = useWallet();
    
    return (
      <JupiterProvider
        cluster="devnet"
        connection={connection}
        userPublicKey={wallet.publicKey || undefined}
      >
        {children}
      </JupiterProvider>
    );
};
export const Context: FC<{ children: ReactNode }> = ({ children }) => {
    const network = WalletAdapterNetwork.Devnet;

    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new GlowWalletAdapter(),
            new SlopeWalletAdapter(),
            new SolflareWalletAdapter({ network }),
            new TorusWalletAdapter(),
            new LedgerWalletAdapter(),
            new SolletWalletAdapter()
        ],
        [network]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    <JupiterApp>
                       {children}
                    </JupiterApp>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}

export default Context;