/* eslint-disable react/jsx-key */
/* eslint-disable @next/next/no-img-element */
import { TOKEN_LIST_URL, useJupiter, JupiterProvider } from "@jup-ag/react-hook";
import Modal, { ModalProps } from "react-bootstrap/Modal";
import { useEffect, useState, useMemo } from "react";
import { fetch } from "cross-fetch";
import { TokenInfo } from "@solana/spl-token-registry";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { Connection } from "@solana/web3.js";

export interface Token {
	chainId: number; // 101,
	address: string; // "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
	symbol: string; // "USDC",
	name: string; // "Wrapped USDC",
	decimals: number; // 6,
	logoURI: string; // "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/BXXkv6z8ykpG1yuvUDPgh732wzVHB69RnB9YgSYh3itW/logo.png",
	tags: string[]; // [ "stablecoin" ]
}

interface SlippageOption {
	value: number;
	isSelected: boolean;
}

type UseJupiterProps = Parameters<typeof useJupiter>[0];

export function JupiterSwapModal(props: ModalProps) {
	const [tokens, setTokens] = useState<Token[]>([]);
	const [tokenMap, setTokenMap] = useState<Map<string, TokenInfo>>(new Map());
	const [inputToken, setInputToken] = useState<any>({});
	const [outputToken, setOutputToken] = useState<any>({});
	const [tokenSearchType, setTokenSearchType] = useState<string>("");
	const [exchangeAmount, setExchangeAmount] = useState<number>(1);
	const [displayRoutes, setDisplayRoutes] = useState<any[]>([]);
	const [additionalRoutes, setAdditionalRoutes] = useState<any[]>([]);
	const url = "https://ssc-dao.genesysgo.net/";
    const connection = new Connection(url);
    const wallet = useWallet();
    const [balance, setBalance] = useState(0);
    const setWalletBalance = async () => { 
		if (wallet?.publicKey) {
			try {
				const balance = await connection.getBalance(wallet.publicKey);
				setBalance(balance / LAMPORTS_PER_SOL);
				setInputBalance(balance / LAMPORTS_PER_SOL - 0.05);
			} catch (error) {
				console.log(error);
			}
        }
    }
	useEffect(() => {
		// Fetch token list from Jupiter API
		fetch(TOKEN_LIST_URL["mainnet-beta"])
			.then((response) => {
				console.log("deb");
				response.json().then((tokens) => [
					setTokens(tokens),
				])
			}).catch((error) => {
				console.error(error);
			});
	}, []);
	console.log("hello");
	console.log(tokens);
	console.log(tokens[0]?.logoURI);
	const [inputMint,setInputMint] = useState<PublicKey>(
		new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")
	);
	const [outputMint,setOutputMint] = useState<PublicKey>(
		new PublicKey("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB")
	);

	const [formValue, setFormValue] = useState<UseJupiterProps>({
		amount: 1 * 10 ** 6, // unit in lamports (Decimals)
		inputMint: new PublicKey(inputMint),
		outputMint: new PublicKey(outputMint),
		slippage: 0.1,
	});
    const [inputBalance, setInputBalance] = useState(0);
	const [inputTokenInfo, outputTokenInfo] = useMemo(() => {
		return [
			tokenMap.get(formValue.inputMint?.toBase58() || ""),
			tokenMap.get(formValue.outputMint?.toBase58() || ""),
		];
	}, [formValue.inputMint?.toBase58(), formValue.outputMint?.toBase58()]);

	const amountInDecimal = useMemo(() => {
		return formValue.amount * 10 ** (inputTokenInfo?.decimals || 1);
	}, [inputTokenInfo, formValue.amount]);

	// const {
	// 	routeMap,
	// 	allTokenMints,
	// 	routes,
	// 	loading,
	// 	exchange,
	// 	error,
	// 	refresh,
	// 	lastRefreshTimestamp,
	// } = useJupiter({
	// 	...formValue,
	// 	amount: amountInDecimal,
	// });

	// token search modal
	const [showTokenSearch, setShowTokenSearch] = useState<boolean>(false);
	
	const setTokenValues = (token: any,type?: string) => {
		if (tokenSearchType === 'pay' || type === 'pay') { 
			console.log("set input token");
			console.log(token);
			setFormValue((prevValue) => {
				return {
					...prevValue,
					inputMint: new PublicKey(token.address),
				};
			});
			// const tokenExchangeAmount = tokens.find(item => item.address === token.address);
			// if (tokenExchangeAmount) {
				setExchangeAmount(parseInt((inputBalance * (10 ** token?.decimals)).toString()) || 1);
			// }
			setInputMint(new PublicKey(token.address));
			setInputToken(token);
		} else if(tokenSearchType === 'receive' || type === 'receive') {
			setFormValue((prevValue) => {
				return {
					...prevValue,
					outputMint: new PublicKey(token.address),
				};
			});
			setOutputMint(new PublicKey(token.address));
			setOutputToken(token);
		}
		setShowTokenSearch(false);
	};

	// aggregator search modal
	const [showAggregatorSearch, setShowAggregatorSearch] =
		useState<boolean>(false);

	// slippage settings modal
	const [showSlippageSettings, setShowSlippageSettings] =
		useState<boolean>(false);
	const [selectSlippage, setSelectSlippage] = useState<number | null>(null);
	const slippageOptionsInit: Array<SlippageOption> = [
		{
			value: 0.1,
			isSelected: false,
		},
		{
			value: 0.5,
			isSelected: false,
		},
		{
			value: 1.0,
			isSelected: false,
		},
	];
	const [slippageOptions, setSlippageOptions] =
		useState<Array<SlippageOption>>(slippageOptionsInit);
	const [inputSlippage, setInputSlippage] = useState("");

	const onClickSlippageOptionBtn = (selectedIdx: number) => {
		setSelectSlippage(slippageOptions[selectedIdx].value);
		slippageOptions.forEach((option, idx) => {
			if (idx === selectedIdx) {
				option.isSelected = true;
			} else {
				option.isSelected = false;
			}
		});
		setSlippageOptions(slippageOptions);
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

	const [showMore, setShowMore] = useState(false);
    const jupiter = useJupiter({
		amount: exchangeAmount, // raw input amount of tokens
		inputMint,
		outputMint,
		slippage: 1, // 1% slippage
		debounceTime: 250, // debounce ms time before refresh
	})
	console.log(inputMint);
	console.log(outputMint);
	const {
		allTokenMints, // all the token mints that is possible to be input
		routeMap, // routeMap, same as the one in @jup-ag/core
		exchange, // exchange 
		refresh, // function to refresh rates
		lastRefreshTimestamp, // timestamp when the data was last returned
		loading, // loading states
		routes, // all the routes from inputMint to outputMint
		error,
	} = jupiter;
	// console.log(allTokenMints);
	useEffect(() => {
		if (routes) {
			setDisplayRoutes(routes?.slice(0, 2));
			setAdditionalRoutes(routes?.slice(2,routes.length));
		}
		setWalletBalance();
	},[routes]);
	console.log(routes);
	console.log(routeMap);
	console.log("hello");
	const setTokenSearchValues = (type:any) => {
		setTokenSearchType(type);
		setShowTokenSearch(true)
	}
	const getTokenSymbol = (tokenAddress: String) => {
		let symbol = null
		for (let i = 0; i < tokens.length; i++) { 
			if (tokens[i].address === tokenAddress) {
				symbol = tokens[i].symbol
				break;
			}
		}
		return symbol;
	}
	const fetchSwapPath = (route:any) => {
		const path: any[] = [];
		route.marketInfos.forEach((item: any) => { 
			if (path.length === 0) {
				path.push(getTokenSymbol(item.inputMint.toBase58()));
			} 
			if (path.length > 0 && path[path.length - 1] !== getTokenSymbol(item.inputMint.toBase58())) { 
				path.push(getTokenSymbol(item.inputMint.toBase58()));
				
			}
			path.push(getTokenSymbol(item.outputMint.toBase58()));
		});
		// console.log(path);
		return path;
	}
	const swapUserInputTokens = () => {
		const swapInputToken = inputToken;
		const swapOutputToken = outputToken;
		setTokenValues(swapOutputToken,"pay");
		setTokenValues(swapInputToken,"receive");
	}

	const onClickSwapBestRoute = async () => {
		if (routes &&  wallet.signAllTransactions && wallet.signTransaction) {
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
					console.log("sending transaction");
					await connection.confirmTransaction(txid);
					console.log("confirmed transaction");
					return await connection.getTransaction(txid, {
						commitment: "confirmed",
					});
				},
			});
		}
	}
	return (
		<Modal {...props} centered>
			<Modal.Body>
				<div className="jupiter-modal">
					<div className="d-flex mb-3">
						<div
							className="d-flex justify-content-between align-items-center p-3 me-4 w-100"
							onClick={() => setShowAggregatorSearch(true)}>
							<input className="form-control" placeholder="Select Aggregator"></input>
							<div className="border-left">
								<span className="fe fe-search ps-3"></span>
							</div>
						</div>
						<button
							className="d-flex align-items-center slippage-setting-btn p-3 rounded-3 opacity-text"
							onClick={() => setShowSlippageSettings(true)}>
							<div className="fe fe-sliders me-2"></div>
							<div>{formValue.slippage}%</div>
						</button>
					</div>

					{showAggregatorSearch ? (
						<div className="card aggregator-card">
							<div className="card-header d-flex justify-content-between">
								<div className="d-flex align-items-center token-input-box">
									<span className="fe fe-search me-3"></span>
									<input className="form-control me-1" placeholder=""></input>
								</div>
								<div>
									<span
										className="fe fe-x slippage-close"
										onClick={() => setShowAggregatorSearch(false)}></span>
								</div>
							</div>

							<div className="card-body">
							</div>
						</div>
					) : null}

					{showSlippageSettings ? (
						<div className="card slippage-card">
							<div>
								<span
									className="fe fe-x slippage-close"
									onClick={() => setShowSlippageSettings(false)}></span>
							</div>
							<div className="card-header">
								<h4 className="card-header-title">Slippage Settings</h4>
							</div>
							<div className="card-body">
								<div className="d-flex flex-column">
									<div className="d-flex mb-3">
										{slippageOptions.map((option, idx) => {
											return (
												<button
													key={idx}
													className={
														"w-100 py-3 rounded-3 slippage-btn " +
														(option.isSelected ? "selected" : "") +
														(idx === slippageOptions.length - 1 ? "" : " me-2")
													}
													onClick={() => onClickSlippageOptionBtn(idx)}>
													<span className="opacity-text">{option.value}%</span>
												</button>
											);
										})}
									</div>
									<div className="custom-slippage d-flex justify-content-between align-items-center mb-3 rounded-3 px-3 py-1">
										<div className="custom-text opacity-text">
											Custom Slippage
										</div>
										<div className="input-box d-flex align-items-center">
											<input
												type="number"
												placeholder="0.00"
												className="form-control text-end me-1"
												onChange={(e) => {
													slippageOptions.forEach((option, idx) => {
														option.isSelected = false;
													});
													setSelectSlippage(null);
													setInputSlippage(e.target.value);
												}}></input>
											<div className="opacity-text">%</div>
										</div>
									</div>
									<button
										className="w-100 py-3 rounded-3 save-btn"
										onClick={saveSlippageSettings}>
										Save Settings
									</button>
								</div>
							</div>
						</div>
					) : null}

					{showTokenSearch ? (
						<div className="card token-search-card">
							<div className="card-header d-flex justify-content-between">
								<div className="d-flex align-items-center token-input-box">
									<span className="fe fe-search me-3"></span>
									<input className="form-control me-1" placeholder="Search by token or paste address"></input>
								</div>
								<div>
									<span
										className="fe fe-x slippage-close"
										onClick={() => setShowTokenSearch(false)}></span>
								</div>
							</div>

							<div className="card-body token-search-body d-flex flex-wrap">
								{tokens.map(token => {
									return (
										<button
											className="rounded-3 p-3 d-flex token-container me-3"
											key={token.address}
											onClick={() => setTokenValues(token)}
											>
											<div className="me-3">
												<img
													className="token-logo rounded-circle"
													src={token.logoURI}></img>
											</div>
											<div className="token-symbol">{token.symbol}</div>
										</button>
									)
								})}
							</div>
						</div>
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
										setExchangeAmount(parseInt(((inputBalance/2) * (10 ** inputToken?.decimals)).toString()) || 1);
										setInputBalance(parseInt((inputBalance/2 - 0.05).toString()))
									}}>HALF</div>
									<div className="input-balance-reset-button" onClick={() => {
										setExchangeAmount(parseInt(((balance) * (10 ** inputToken?.decimals)).toString()) || 1);
										setInputBalance(parseInt((balance - 0.05).toString()))
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
											  style={{width: "30px", height: "30px", borderRadius:"50%"}}></img>
											)}
												{inputToken?.symbol ? (` ${inputToken?.symbol}`): "Select Token"}
											{/* {formValue.inputMint?.toBase58()} */}
										</div>
										<div className="fe fe-chevron-down opacity-text"></div>
									</button>
									<div 
 										className="d-flex align-items-center w-100 justify-content-end">
										{inputBalance}
									</div>
									
									{/* <div className="text-right" style={{backgroundColor: "red"}}>
										<input className="form-control"></input>
									</div> */}
								</div>
								<div className="d-flex align-items-center ms-4">
									<div className="fe fe-alert-circle me-2"></div>
									<div className="fs-7">
										We recommend having at least 0.05 SOL for any transaction
									</div>
								</div>
							</div>
						</div>

						<div className="switch mx-auto mt-4 mb-4" onClick={()=>swapUserInputTokens()}>
							<button className="rounded-circle d-flex justify-content-center align-items-center">
								<div className="fe fe-minimize-2"></div>
							</button>
						</div>

						<div className="you-receive">
							<div className="d-flex justify-content-between mb-3">
								<div className="">
									<span>You receive</span>
								</div>
								<div className="fs-7">Balance: 0</div>
							</div>
							<div className="d-flex flex-column">
								<div className="d-flex justify-content-between mb-2 rounded-3 p-4 token-search-btn-container">
									<button
										className="d-flex align-items-center"
										onClick={() => setTokenSearchValues("receive")}>
										{/* <div><img src={}></img></div> */}
										<div className="me-2 selected-token">
										   {outputToken?.logoURI && (
                                              <img src={outputToken?.logoURI} alt="input-token"
											  style={{width: "30px", height: "30px", borderRadius:"50%"}}></img>
											)}
											{outputToken?.symbol ? (` ${outputToken?.symbol}`): "Select Token"}
                                            
										</div>
										<div className="fe fe-chevron-down opacity-text"></div>
									</button>
									{/* <div className="text-right">
										<input className="form-control"></input>
									</div> */}
								</div>
							</div>
						</div>

						<div className="d-flex flex-column">
							<div className="d-flex justify-content-center align-items-center mb-4 mt-4">
							  <div style={{color: "#909593"}}>{routes?.length} routes found!</div>
							</div>
							{showMore ? (<div className="routes-container">
								{routes?.map((route, index) => {
									return (
                                <div className="route-container d-flex justify-content-between align-items-center px-3 rounded-3 mt-2">
									<div className="d-flex flex-column ps-2">
											<div className="mb-1 fs-5">{route?.marketInfos[0]?.amm?.label} x {route?.marketInfos[1]?.amm?.label}</div>
										<div className="opacity-text fs-5 d-flex">
											{fetchSwapPath(route).map((pathName,index) => { 
												return <div>{pathName} {index !== route?.marketInfos.length && '→ '} </div>
											})}
										</div>
									</div>
											<div className="fs-3">{route?.outAmount/LAMPORTS_PER_SOL}</div>
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
											{fetchSwapPath(route).map((pathName,index) => { 
												return <div>{pathName} {index !== route?.marketInfos.length && '→ '} </div>
											})}
										</div>
									</div>
									<div className="fs-3">{route?.outAmount/LAMPORTS_PER_SOL}</div>
								</div>
									);
								 })}
								
							</div>
								)}
							<div className="d-flex justify-content-between mt-3">
								<button className="d-flex align-items-center more-btn opacity-text" data-bs-toggle="collapse" data-bs-target="#moreRoutes" aria-expanded="false" aria-controls="moreRoutes"
												onClick={() => setShowMore(prevValue => !prevValue)}>
									<div className={`chevron ${showMore ? "rotate" : ""}`}>
										<span className="fe fe-chevron-down"></span>
									</div>
									{showMore ? <span className="ms-3 fs-5">Show less</span> : <span className="ms-3 fs-5">More</span>}
									
								</button>
								<div className="opacity-text fs-5 d-flex justify-content-end align-items-center" style={{minWidth:"70%",width:"auto"}}>from {routes && routes[routes.length - 1]?.outAmount/LAMPORTS_PER_SOL} to {routes && routes[0]?.outAmount/LAMPORTS_PER_SOL}</div>	
							</div>
							<div className="collapse" id="moreRoutes">
								{/* <div className="card card-body">
									Some placeholder content for the collapse component. This panel is hidden by default but revealed when the user activates the relevant trigger.
								</div> */}
							</div>


						</div>
					</div>
				</div>
				<button className="w-100 mt-3 rounded-3 py-3 border-gradient">
					<div className="w-100 border-gradient-div"></div>
					<div className="w-100 d-flex justify-content-center align-items-center border-gradient-text" onClick={()=> onClickSwapBestRoute()}>Swap</div>
				</button>
			</Modal.Body>
			</Modal>
	);
}
