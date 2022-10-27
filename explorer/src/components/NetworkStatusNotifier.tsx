import { useCluster } from "providers/cluster";
import { useState, useEffect } from "react";
import { makeRPCCall } from "utils/makeRPCCall";

const PING_PERIOD_IN_MS: number = 3000;

const container = {
  display: "flex",
  width: "100%",
  justifyContent: "center",
  backgroundColor: "rgba(8, 230, 189, 0.941)",
  color: "black",
  fontWeight: "bold" as "bold",
};
function NetworkStatusNotifier() {
  const healthyStatus = "ok";
  const [currentStatus, setCurrentState] = useState<string>(healthyStatus);
  const [hasDownTime, setHasDownTime] = useState<boolean>(false);

  const { url, name } = useCluster();

  useEffect(() => {
    let timer = setInterval(async () => {
      const statusDesc: string = await makeRPCCall(
        url,
        "getHealth",
        "Status Not Available."
      );
      if (statusDesc === currentStatus) {
        setHasDownTime(statusDesc !== healthyStatus);
        setCurrentState(statusDesc);
      }
    }, PING_PERIOD_IN_MS);

    return () => {
      clearTimeout(timer);
    };
  });

  return (
    <div style={container}>
      {hasDownTime && (
        <div>
          {name} cluster may be down. Downtime Detail: {currentStatus}
        </div>
      )}
    </div>
  );
}

export default NetworkStatusNotifier;
