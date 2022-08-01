import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { clusterPath } from "src/utils/url";
import { ClusterStatusButton } from "src/components/ClusterStatusButton";
import { NavLink } from "src/components/NavLink";
import { WalletDisconnectButton, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { JupiterSwapModal } from './JupiterSwapModal';

export function Navbar() {
  const router = useRouter();
  const [showSidebar, setShowSidebar] = React.useState(false);

  // TODO: use `collapsing` to animate collapsible navbar
  const [collapse, setCollapse] = React.useState(false);

  const { connected } = useWallet();

  const [showJupiterModal, setShowJupiterModal] = React.useState(false);

  return (
    <nav className="navbar navbar-expand-md navbar-light">
      <div className="container">
        <Link href={clusterPath("/", router.asPath)} passHref>
          <a>
            <div className="d-flex">
              <Image src="/img/logos-solana/dark-explorer-logo.svg" width={250} height={21.48} alt="Solana Explorer" />
            </div>
          </a>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setCollapse((value) => !value)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className={`collapse navbar-collapse ms-auto me-4 ${collapse ? "show" : ""
            }`}
        >
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <NavLink activeClassName="active" href={clusterPath("/", router.asPath)}>
                <span className="nav-link">
                  Cluster Stats
                </span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink activeClassName="active" href={clusterPath("/supply", router.asPath)}>
                <span className="nav-link">
                  Supply
                </span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink activeClassName="active" href={clusterPath("/tx/inspector", router.asPath)}>
                <span className="nav-link">
                  Inspector
                </span>
              </NavLink>
            </li>
          </ul>
        </div>

        <div className="nav-item-right">
          <button className={connected ? 'button-hidden' : 'button'}><span className="fe fe-zap"></span>Connect Wallet</button>
          <WalletMultiButton className={connected ? 'user-address btn btn-primary' : 'connect-btn'} />
        </div>

        <div className="nav-item-right">
          {connected ? (
            <span className="fe fe-globe btn btn-primary globe" onClick={() => setShowSidebar(true)}></span>
          ) : null}

          {showSidebar ? (
            <div className="sidenav">
              <div className="sidenav-header">
                <span className="fe fe-x close" onClick={() => setShowSidebar(false)}></span>
              </div>
              <div className="sidenav-body">
                <div className="sidenav-item">
                  <button>
                    <span className="fe fe-user"></span>Account
                  </button>
                </div>
                <div className="sidenav-item">
                  <button onClick={() => setShowJupiterModal(true)}><span className="fe fe-repeat"></span>Swap Tokens</button>
                </div>
                <hr />
                <div className="sidenav-item-disconnect">
                  <button><span className="fe fe-zap-off"></span>Disconnect</button>
                  <WalletDisconnectButton className="disconnect-btn" onClick={() => setShowSidebar(false)} />
                </div>
              </div>
            </div>)
            : null}

          <JupiterSwapModal dialogClassName="jupiter-modal-container" show={showJupiterModal} onHide={() => setShowJupiterModal(false)}></JupiterSwapModal>

        </div>

        <div className="d-none d-md-block">
          <ClusterStatusButton />
        </div>

      </div>
    </nav>
  );
}
