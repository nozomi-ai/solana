import { Token } from "../JupiterSwapModal";

export default function TokenSearchModal({
  tokenLoading,
	tokens,
	setShowTokenSearch,
	setTokenValues,
	onTokenSearchChange,
  tokenSearch
}: {
  tokenLoading: boolean;
	tokens: Array<Token>;
	setShowTokenSearch: Function;
	setTokenValues: Function;
	onTokenSearchChange: Function;
  tokenSearch: string;
}) {
  return (
    <div className="card token-search-card">
      <div className="card-header d-flex justify-content-between">
        <div className="d-flex align-items-center token-input-box">
          <span className="fe fe-search me-3"></span>
          <input className="form-control me-1"
            placeholder="Search by token or paste address"
            value={tokenSearch}
            onChange={(e) => onTokenSearchChange(e.target.value)}></input>
        </div>
        <div>
          <span
            className="fe fe-x slippage-close"
            onClick={() => setShowTokenSearch(false)}></span>
        </div>
      </div>

      <div className="token-search-body col">
        {tokenLoading ? (
          <div className="p-5 text-center w-100">
            <span>Loading...</span>
          </div>
        ) : (tokens.length > 0 ? tokens.map(token => {
          return (
            <button
              className="p-4 d-flex align-items-center token-container w-100"
              key={token.address}
              onClick={() => setTokenValues(token)}
            >
              <div className="me-3">
                <img
                  className="token-logo rounded-circle"
                  src={token.logoURI}
                  alt={token.symbol}></img>
              </div>
              <div className="d-flex flex-column align-items-start">
                <div className="token-symbol">{token.symbol}</div>
                <div className="token-name opacity-text">{token.name}</div>
              </div>
            </button>
          )
        }) : <div className="w-100 text-center py-3">No tokens found</div>)}
      </div>
    </div>
  )
}