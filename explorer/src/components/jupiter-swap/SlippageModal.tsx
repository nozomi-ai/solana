export default function SlippageModal({
  slippageOptions,
  setShowSlippageSettings,
  onClickSlippageOptionBtn,
  selectSlippage,
  setSelectSlippage,
  inputSlippage,
  setInputSlippage,
  saveSlippageSettings
}: {
  slippageOptions: Array<number>;
  setShowSlippageSettings: Function;
  onClickSlippageOptionBtn: Function;
  selectSlippage: number | null;
  setSelectSlippage: Function;
  inputSlippage: string;
  setInputSlippage: Function;
  saveSlippageSettings: Function;
}) {
  return (
    <div className="card slippage-card">
      <div>
        <span
          className="fe fe-x slippage-close"
          onClick={() => setShowSlippageSettings(false)}>
        </span>
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
                    "w-100 py-3 rounded-3 slippage-btn" +
                    (selectSlippage && selectSlippage === option ? " selected" : "") +
                    (idx === slippageOptions.length - 1 ? "" : " me-2")
                  }
                  onClick={() => onClickSlippageOptionBtn(idx)}>
                  <span className="opacity-text">{option}%</span>
                </button>
              );
            })}
          </div>
          <div className="custom-slippage d-flex justify-content-between align-items-center mb-3 rounded-3 px-3 py-1">
            <div className="custom-text opacity-text">Custom Slippage</div>
            <div className="input-box d-flex align-items-center">
              <input
                type="number"
                placeholder="0.00"
                className="form-control text-end me-1"
                value={inputSlippage}
                onChange={(e) => {
                  setSelectSlippage(null);
                  setInputSlippage(e.target.value);
                }}></input>
              <div className="opacity-text">%</div>
            </div>
          </div>
          <button
            className="w-100 py-3 rounded-3 save-btn"
            onClick={() => saveSlippageSettings()}>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}