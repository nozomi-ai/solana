/* eslint-disable react/jsx-key */
/* eslint-disable @next/next/no-img-element */
import { TOKEN_LIST_URL, useJupiter } from "@jup-ag/react-hook";
import Modal, { ModalProps } from "react-bootstrap/Modal";
import { useEffect, useState, useMemo } from "react";
import { fetch } from "cross-fetch";
import { TokenInfo } from "@solana/spl-token-registry";
import { useWallet } from "@solana/wallet-adapter-react";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import SlippageModal from "./jupiter-swap/SlippageModal";
import TokenSearchModal from "./jupiter-swap/TokenSearchModal";
import AggregatorSearchModal, { Aggregator } from "./jupiter-swap/AggregatorSearchModal";
import { Cluster, clusterUrl, useCluster } from "src/providers/cluster";

export interface Token {
	chainId: number;
	address: string;
	symbol: string;
	name: string;
	decimals: number;
	logoURI: string;
	tags: string[];
}

const aggregators: Array<Aggregator> = [
	{
		name: "Jupiter Finance",
		logo: "/img/logos-aggregator/jupiter.svg"
	}
];

const slippageOptions: Array<number> = [0.1, 0.5, 1.0];

type UseJupiterProps = Parameters<typeof useJupiter>[0];

export function JupiterSwapModal(props: ModalProps) {
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

	const [allTokens, setAllTokens] = useState<Token[]>([]);
	const [tokens, setTokens] = useState<Token[]>([]);
	const [tokenMap, setTokenMap] = useState<Map<string, TokenInfo>>(new Map());
	const [inputToken, setInputToken] = useState<Token>({
		chainId: 0,
		address: '',
		symbol: '',
		name: '',
		decimals: 3,
		logoURI: '',
		tags: [''],
	});
	const [outputToken, setOutputToken] = useState<Token>({
		chainId: 0,
		address: '',
		symbol: '',
		name: '',
		decimals: 3,
		logoURI: '',
		tags: [''],
	});
	const [tokenSearchType, setTokenSearchType] = useState<string>("");
	const [exchangeAmount, setExchangeAmount] = useState<number>(1);
	const [displayRoutes, setDisplayRoutes] = useState<any[]>([]);
	const [additionalRoutes, setAdditionalRoutes] = useState<any[]>([]);
	const [tokenLoading, setTokenLoading] = useState<boolean>(false);

	const [balance, setBalance] = useState(0);
	const [recieveTokenBalance, setRecieveTokenBalance] = useState(0);
	const [inputMint, setInputMint] = useState<PublicKey | undefined>(undefined);
	const [outputMint, setOutputMint] = useState<PublicKey | undefined>(undefined);
	const [showTokenSearch, setShowTokenSearch] = useState<boolean>(false);
	const [tokenSearch, setTokenSearch] = useState("");

	const [formValue, setFormValue] = useState<UseJupiterProps>({
		amount: 1 * 10 ** 6,
		inputMint: inputMint ? new PublicKey(inputMint) : undefined,
		outputMint: outputMint ? new PublicKey(outputMint) : undefined,
		slippage: 0.1,
	});
	const [inputBalance, setInputBalance] = useState(0);

	const [showSlippageSettings, setShowSlippageSettings] =
		useState<boolean>(false);
	const [selectSlippage, setSelectSlippage] = useState<number | null>(null);
	const [inputSlippage, setInputSlippage] = useState("");

	const [showAggregatorSearch, setShowAggregatorSearch] =
		useState<boolean>(false);
	const [aggregator, setAggregator] = useState<Aggregator | null>(null);
	const [aggregatorOptions, setAggregatorOptions] = useState<Array<Aggregator>>(aggregators);
	const [aggregatorSearch, setAggregatorSearch] = useState("");

	const [showMore, setShowMore] = useState(false);

	const setWalletBalance = async (tokenAddress: string, type: string) => {
		if (wallet?.publicKey) {
			try {
				const info = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, {
					mint: new PublicKey(tokenAddress),
				},
				);
				const balance = info.value[0].account.data.parsed.info.tokenAmount.uiAmount;
				if (type === "pay") {
					setBalance(balance);
					if ((balance) - 0.00001 > 0) {
						setInputBalance(balance - 0.00001);
					} else {
						setInputBalance(0);
					}
				} else if (type === "receive") {
					setRecieveTokenBalance(balance);
				}
			} catch (error) {
				console.log(error);
			}
		}
	}

	useEffect(() => {
		setTokenLoading(true);
		fetch(TOKEN_LIST_URL["mainnet-beta"])
			.then((response) => {
				response.json().then((tokens) => {
					setAllTokens(tokens);
					setTokens(tokens);
				});
			}).catch((error) => {
				console.error(error);
			}).finally(() => {
				setTokenLoading(false);
			});
	}, []);


	const [inputTokenInfo, outputTokenInfo] = useMemo(() => {
		return [
			tokenMap.get(formValue.inputMint?.toBase58() || ""),
			tokenMap.get(formValue.outputMint?.toBase58() || ""),
		];
	}, [formValue.inputMint?.toBase58(), formValue.outputMint?.toBase58()]);

	const amountInDecimal = useMemo(() => {
		return formValue.amount * 10 ** (inputTokenInfo?.decimals || 1);
	}, [inputTokenInfo, formValue.amount]);

	const setTokenValues = async (token: any, type?: string) => {
		if (tokenSearchType === 'pay' || type === 'pay') {
			setWalletBalance(token.address, "pay");
			setFormValue((prevValue) => {
				return {
					...prevValue,
					inputMint: new PublicKey(token.address),
				};
			});

			let publicKey = wallet.publicKey || new PublicKey(token.address);
			const info = await connection.getParsedTokenAccountsByOwner(publicKey, {
				mint: new PublicKey(token.address),
			});
			const balance = info.value[0].account.data.parsed.info.tokenAmount.uiAmount;
			let inputBalance = 0;
			if ((balance) - 0.00001 > 0) {
				inputBalance = (balance - 0.00001);
			}
			setExchangeAmount(parseFloat((inputBalance * (10 ** token?.decimals)).toString()) || 1);
			setInputMint(new PublicKey(token.address));
			setInputToken(token);
		} else if (tokenSearchType === 'receive' || type === 'receive') {
			setFormValue((prevValue) => {
				return {
					...prevValue,
					outputMint: new PublicKey(token.address),
				};
			});
			setWalletBalance(token.address, "receive");
			setOutputMint(new PublicKey(token.address));
			setOutputToken(token);
		}
		setShowTokenSearch(false);
	};

	const onTokenSearchChange = (value: string) => {
		setTokenSearch(value);
	}

	useEffect(() => {
		const options = allTokens.filter((token) => {
			const searchLower = tokenSearch.toLowerCase();
			return (
				token.name.toLowerCase().includes(searchLower) ||
				token.symbol.toLowerCase().includes(searchLower) ||
				token.address.toLowerCase() === searchLower
			);
		})
		setTokens(options);
	}, [tokenSearch, allTokens]);

	const onAggregatorSearchChange = (value: string) => {
		setAggregatorSearch(value);
	}

	useEffect(() => {
		const options = aggregators.filter((aggregator) => {
			const searchLower = aggregatorSearch.toLowerCase();
			return aggregator.name.toLowerCase().includes(searchLower);
		})
		setAggregatorOptions(options);
	}, [aggregatorSearch]);

	const onClickSlippageOptionBtn = (selectedIdx: number) => {
		setSelectSlippage(slippageOptions[selectedIdx]);
	};

	const saveSlippageSettings = () => {
		if (selectSlippage || inputSlippage.length) {
			setFormValue((prevValue) => {
				return {
					...prevValue,
					slippage: selectSlippage ?? Number(inputSlippage),
				};
			});
			setShowSlippageSettings(false);
		}
	};

	const jupiter = useJupiter({
		amount: exchangeAmount,
		inputMint,
		outputMint,
		slippage: 1,
		debounceTime: 250,
	});
	const {
		allTokenMints,
		routeMap,
		exchange,
		refresh,
		lastRefreshTimestamp,
		loading,
		routes,
		error,
	} = jupiter;
	useEffect(() => {
		if (routes) {
			setDisplayRoutes(routes?.slice(0, 2));
			setAdditionalRoutes(routes?.slice(2, routes.length));
		}
	}, [routes]);
	const setTokenSearchValues = (type: any) => {
		setTokenSearchType(type);
		setShowTokenSearch(true)
	}
	const getTokenSymbol = (tokenAddress: String) => {
		let symbol = null
		for (let i = 0; i < allTokens.length; i++) {
			if (allTokens[i].address === tokenAddress) {
				symbol = allTokens[i].symbol
				break;
			}
		}
		return symbol;
	}
	const fetchSwapPath = (route: any) => {
		const path: any[] = [];
		route.marketInfos.forEach((item: any) => {
			if (path.length === 0) {
				const tokenSymbol = getTokenSymbol(item.inputMint.toBase58());
				path.push(tokenSymbol);
			}
			if (path.length > 0 && path[path.length - 1] !== getTokenSymbol(item.inputMint.toBase58())) {
				path.push(getTokenSymbol(item.inputMint.toBase58()));
			}
			path.push(getTokenSymbol(item.outputMint.toBase58()));
		});
		return path;
	}
	const swapUserInputTokens = () => {
		const swapInputToken = inputToken;
		const swapOutputToken = outputToken;
		setTokenValues(swapOutputToken, "pay");
		setTokenValues(swapInputToken, "receive");
	}

	const onClickSwapBestRoute = async () => {
		if (routes && wallet.signAllTransactions && wallet.signTransaction) {
			const bestRoute = routes[0];
			await exchange({
				wallet: {
					sendTransaction: wallet?.sendTransaction,
					publicKey: wallet?.publicKey,
					signAllTransactions: wallet.signAllTransactions,
					signTransaction: wallet.signTransaction,
				},
				routeInfo: bestRoute,
				onTransaction: async (txid: any) => {
					await connection.confirmTransaction(txid);
					return await connection.getTransaction(txid, {
						commitment: "confirmed",
					});
				},
			});
			setInputBalance(0);
			setRecieveTokenBalance(0);
			setExchangeAmount(0);
			setInputToken({
				chainId: 0,
				address: '',
				symbol: '',
				name: '',
				decimals: 3,
				logoURI: '',
				tags: [''],
			});
			setOutputToken({
				chainId: 0,
				address: '',
				symbol: '',
				name: '',
				decimals: 3,
				logoURI: '',
				tags: [''],
			});
			setDisplayRoutes([]);
			setBalance(0);
		}
	}
	return (
		<Modal {...props} centered>
			<Modal.Body>
				<div className="jupiter-modal">
					<div className="d-flex mb-3">
						{aggregator ? (
							<div className="d-flex justify-content-between align-items-center p-3 me-4 w-100 selected-aggregator rounded-3"
								onClick={() => setShowAggregatorSearch(true)}>
								<div className="w-100 d-flex align-items-center">
									<img className="me-3" src={aggregator.logo} alt={aggregator.name} width="25"></img>
									<div><span>{aggregator.name}</span></div>
								</div>
								<div>
									<span className="fe fe-align-justify" style={{ fontSize: "16px" }}></span>
								</div>
							</div>
						) : (
							<div
								className="d-flex justify-content-between align-items-center p-3 me-4 w-100"
								onClick={() => setShowAggregatorSearch(true)}>
								<input className="form-control" placeholder="Select Aggregator"></input>
								<div className="border-left">
									<span className="fe fe-search ps-3"></span>
								</div>
							</div>)}
						<button
							className="d-flex align-items-center slippage-setting-btn p-3 rounded-3 opacity-text"
							onClick={() => setShowSlippageSettings(true)}>
							<div className="fe fe-sliders me-2"></div>
							<div>{formValue.slippage}%</div>
						</button>
					</div>

					{showAggregatorSearch ? (
						<AggregatorSearchModal
							aggregatorOptions={aggregatorOptions}
							setAggregator={setAggregator}
							aggregatorSearch={aggregatorSearch}
							onAggregatorSearchChange={onAggregatorSearchChange}
							setShowAggregatorSearch={setShowAggregatorSearch}
						/>
					) : null}

					{showSlippageSettings ? (
						<SlippageModal
							slippageOptions={slippageOptions}
							setShowSlippageSettings={setShowSlippageSettings}
							onClickSlippageOptionBtn={onClickSlippageOptionBtn}
							selectSlippage={selectSlippage}
							setSelectSlippage={setSelectSlippage}
							inputSlippage={inputSlippage}
							setInputSlippage={setInputSlippage}
							saveSlippageSettings={saveSlippageSettings}
						/>
					) : null}

					{showTokenSearch ? (
						<TokenSearchModal
							tokenLoading={tokenLoading}
							tokens={tokens}
							setShowTokenSearch={setShowTokenSearch}
							setTokenValues={setTokenValues}
							onTokenSearchChange={onTokenSearchChange}
							tokenSearch={tokenSearch}
						/>
					) : null}

					<div className="card main-card p-4">
						<div className="you-pay">
							<div className="d-flex justify-content-between mb-3">
								<div className="">
									<span>You pay</span>
								</div>
								<div className="fs-7 d-flex">
									<div className="fs-7 d-flex justify-content-center align-items-center"> Balance: {balance}</div>
									<div className="input-balance-reset-button" onClick={() => {
										if ((inputBalance / 2) > 0.00001) {
											setExchangeAmount(parseFloat(((inputBalance / 2) * (10 ** inputToken?.decimals)).toString()) || 1);
											setInputBalance(parseFloat((inputBalance / 2).toString()))
										}
									}}>HALF</div>
									<div className="input-balance-reset-button" onClick={() => {
										setExchangeAmount(parseFloat(((balance - 0.00001) * (10 ** inputToken?.decimals)).toString()) || 1);
										setInputBalance(parseFloat((balance - 0.00001).toString()))
									}
									}>MAX</div>
								</div>
							</div>
							<div className="d-flex flex-column">
								<div className="d-flex justify-content-between mb-2 rounded-3 p-4 token-search-btn-container">
									<button
										className="d-flex align-items-center"
										onClick={() => setTokenSearchValues("pay")}>
										<div className="me-2 selected-token">
											{inputToken?.logoURI && (
												<img src={inputToken?.logoURI} alt="input-token"
													style={{ width: "30px", height: "30px", borderRadius: "50%" }}></img>
											)}
											{inputToken?.symbol ? (` ${inputToken?.symbol}`) : "Select Token"}
											{/* {formValue.inputMint?.toBase58()} */}
										</div>
										<div className="fe fe-chevron-down opacity-text"></div>
									</button>
									<div
										className="d-flex align-items-center w-100 justify-content-end">
										{inputBalance}
									</div>

								</div>
								<div className="d-flex align-items-center ms-4">
									<div className="fe fe-alert-circle me-2"></div>
									<div className="fs-7">
										We recommend having at least 0.05 SOL for any transaction
									</div>
								</div>
							</div>
						</div>

						<div className="switch mx-auto mt-4 mb-4">
							<button className="rounded-circle d-flex justify-content-center align-items-center"
								disabled={!inputToken?.address || !outputToken?.address}
								onClick={() => swapUserInputTokens()}>
								<div className="fe fe-minimize-2"></div>
							</button>
						</div>

						<div className="you-receive">
							<div className="d-flex justify-content-between mb-3">
								<div className="">
									<span>You receive</span>
								</div>
								<div className="fs-7">Balance: {recieveTokenBalance}</div>
							</div>
							<div className="d-flex flex-column">
								<div className="d-flex justify-content-between mb-2 rounded-3 p-4 token-search-btn-container">
									<button
										className="d-flex align-items-center"
										onClick={() => setTokenSearchValues("receive")}>
										<div className="me-2 selected-token">
											{outputToken?.logoURI && (
												<img src={outputToken?.logoURI} alt="input-token"
													style={{ width: "30px", height: "30px", borderRadius: "50%" }}></img>
											)}
											{outputToken?.symbol ? (` ${outputToken?.symbol}`) : "Select Token"}

										</div>
										<div className="fe fe-chevron-down opacity-text"></div>
									</button>
								</div>
							</div>
						</div>

						{inputMint && outputMint && aggregator ?
							(loading ?
								(<div className="w-100 text-center mt-4 p-2">
									<span>Loading routes...</span>
								</div>) :
								(displayRoutes.length ? (
									<div className="d-flex flex-column">
										<div className="d-flex justify-content-center align-items-center mb-4 mt-4">
											<div style={{ color: "#909593" }}>{routes?.length} routes found!</div>
										</div>
										{showMore ? (<div className="routes-container">
											{routes?.map((route, index) => {
												return (
													<div className="route-container d-flex justify-content-between align-items-center px-3 rounded-3 mt-2">
														<div className="d-flex flex-column ps-2">
															<div className="mb-1 fs-5">{route?.marketInfos[0]?.amm?.label} x {route?.marketInfos[1]?.amm?.label}</div>
															<div className="opacity-text fs-5 d-flex">
																{fetchSwapPath(route).map((pathName, index) => {
																	return <div>{pathName} {index !== route?.marketInfos.length && '→ '} </div>
																})}
															</div>
														</div>
														<div className="fs-3">{route?.outAmount / LAMPORTS_PER_SOL}</div>
													</div>
												);
											})}
										</div>
										) : (
											<div>
												{displayRoutes?.map((route, index) => {
													return (
														<div className="route-container d-flex justify-content-between align-items-center px-3 rounded-3 mt-2">
															<div className="d-flex flex-column ps-2">
																<div className="mb-1 fs-5">{route?.marketInfos[0]?.amm?.label} x {route?.marketInfos[1]?.amm?.label}</div>
																<div className="opacity-text fs-5 d-flex">
																	{fetchSwapPath(route).map((pathName, index) => {
																		return <div>{pathName} {index !== route?.marketInfos.length && '→ '} </div>
																	})}
																</div>
															</div>
															<div className="fs-3">{route?.outAmount / LAMPORTS_PER_SOL}</div>
														</div>
													);
												})}

											</div>
										)}
										<div className="d-flex justify-content-between mt-3 text-right">
											{additionalRoutes.length ? (<button className="d-flex align-items-center more-btn opacity-text" data-bs-toggle="collapse" data-bs-target="#moreRoutes" aria-expanded="false" aria-controls="moreRoutes"
												onClick={() => setShowMore(prevValue => !prevValue)}>
												<div className={`chevron ${showMore ? "rotate" : ""}`}>
													<span className="fe fe-chevron-down"></span>
												</div>
												{showMore ? <span className="ms-3 fs-5">Show less</span> : <span className="ms-3 fs-5">More</span>}
											</button>) : (<div></div>)}
											<div className="opacity-text fs-5 d-flex justify-content-end align-items-center" style={{ minWidth: "70%", width: "auto" }}>from {routes && routes[routes.length - 1]?.outAmount / LAMPORTS_PER_SOL} to {routes && routes[0]?.outAmount / LAMPORTS_PER_SOL}</div>
										</div>
									</div>
								) : (
									<div className="d-flex justify-content-center align-items-center mb-4 mt-4">
										<div style={{ color: "#909593" }}>0 routes found</div>
									</div>
								))) : null}

					</div>
				</div>
				<button className="w-100 mt-3 rounded-3 py-3 border-gradient">
					<div className="w-100 border-gradient-div"></div>
					<div className="w-100 d-flex justify-content-center align-items-center border-gradient-text" onClick={() => onClickSwapBestRoute()}>Swap</div>
				</button>
			</Modal.Body>
		</Modal>
	);
}
