import React from "react";
import { SignatureProps } from "pages/TransactionDetailsPage";
import { useTransactionDetails } from "providers/transactions";
import { ProgramLogsCardBody } from "components/ProgramLogsCardBody";
import { parseProgramLogs, parseRawProgramLogs } from "utils/program-logs";
import { useCluster } from "providers/cluster";
import { TableCardBody } from "components/common/TableCardBody";

export function ProgramLogSection({ signature }: SignatureProps) {
  const [showRaw, setShowRaw] = React.useState(false);
  const { cluster, url } = useCluster();
  const details = useTransactionDetails(signature);

  const transactionWithMeta = details?.data?.transactionWithMeta;
  if (!transactionWithMeta) return null;
  const message = transactionWithMeta.transaction.message;

  const logMessages = transactionWithMeta.meta?.logMessages || null;
  const err = transactionWithMeta.meta?.err || null;
  let prettyLogs = null;
  let rawLogs = null;
  if (logMessages !== null) {
    rawLogs = parseRawProgramLogs(logMessages);
    prettyLogs = parseProgramLogs(logMessages, err, cluster);
  }

  const toggleRaw = () => {
    setShowRaw(!showRaw);
  };

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h3 className="card-header-title">Program Instruction Logs</h3>

          <button
            className={`btn btn-sm d-flex ${
              showRaw ? "btn-black active" : "btn-white"
            }`}
            data-toggle="buttons"
            onClick={toggleRaw}
          >
            <span className="fe fe-code me-1"></span>
            Raw
          </button>
          
        </div>
        
        {showRaw && (
          <TableCardBody>
            <tr>
              <td>
                {rawLogs?.map((log, key) => {
                  return (
                    <div className="d-flex align-items-start flex-column font-monospace font-size-sm">
                      <span key={key}>
                        <span className={`text-${log.style}`}>{log.text}</span>
                      </span>
                    </div>
                  );
                })}
              </td>
            </tr>
          </TableCardBody>
        )}

        {!showRaw && 
          (prettyLogs !== null ? (
            <ProgramLogsCardBody
              message={message}
              logs={prettyLogs}
              cluster={cluster}
              url={url}
            />
          ) : (
            <div className="card-body">
              Logs not supported for this transaction
            </div>
          ))
        }
      </div>
    </>
  );
}
