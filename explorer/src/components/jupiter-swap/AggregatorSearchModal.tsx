export interface Aggregator {
	name: string;
	logo: string;
}

export default function AggregatorSearchModal({
  aggregatorOptions,
  setAggregator,
  aggregatorSearch,
  onAggregatorSearchChange,
  setShowAggregatorSearch
}: {
  aggregatorOptions: Array<Aggregator>;
  setAggregator: Function;
  aggregatorSearch: string;
  onAggregatorSearchChange: Function;
  setShowAggregatorSearch: Function;
}) {
  return (
    <div className="card aggregator-card">
      <div className="card-header d-flex justify-content-between">
        <div className="d-flex align-items-center">
          <span className="fe fe-search me-3"></span>
          <input className="form-control me-1"
            value={aggregatorSearch}
            onChange={(e) => onAggregatorSearchChange(e.target.value)}></input>
        </div>
        <div>
          <span
            className="fe fe-x slippage-close"
            onClick={() => setShowAggregatorSearch(false)}></span>
        </div>
      </div>

      <div className="card-body aggregator-search-body">
        {aggregatorOptions.length ? aggregatorOptions.map((aggregator, idx) => {
          return (
            <div className="w-100 d-flex align-items-center p-3 aggregator-option"
              key={idx}
              onClick={() => {
                setAggregator(aggregator);
                setShowAggregatorSearch(false);
              }}>
              <img className="aggregator-logo me-3" src={aggregator.logo} alt={aggregator.name}
                width="25"></img>
              <div><span>{aggregator.name}</span></div>
            </div>
          )
        }) : (
          <div className="w-100 text-center py-3">
            <span>No result found</span>
          </div>)}
        <div style={{ height: "15px", borderTop: "1px solid #282d2b" }}></div>
      </div>
    </div>
  )
}