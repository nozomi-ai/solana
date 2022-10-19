import React from "react";
import { Account } from "src/providers/accounts";
import { SolBalance } from "src/components/common/SolBalance";
import { TableCardBody } from "src/components/common/TableCardBody";
import { Address } from "src/components/common/Address";
import { addressLabel } from "src/utils/tx";
import { useCluster } from "src/providers/cluster";
import { useTokenRegistry } from "src/providers/mints/token-registry";

export function UnknownAccountCard({ account }: { account: Account }) {
  const { details, lamports } = account;
  const { cluster } = useCluster();
  const { tokenRegistry } = useTokenRegistry();
  if (lamports === undefined) return null;

  const label = addressLabel(account.pubkey.toBase58(), cluster, tokenRegistry);
  return (
    <div className="card">
      <div className="card-header align-items-center">
        <h3 className="card-header-title">Overview</h3>
      </div>

      <TableCardBody>
        <tr>
          <td>Address</td>
          <td className="text-lg-end">
            <Address pubkey={account.pubkey} alignRight raw />
          </td>
        </tr>
        {label && (
          <tr>
            <td>Address Label</td>
            <td className="text-lg-end">{label}</td>
          </tr>
        )}
        <tr>
          <td>Balance (SOL)</td>
          <td className="text-lg-end">
            <SolBalance lamports={lamports} />
          </td>
        </tr>

        {details?.space !== undefined && (
          <tr>
            <td>Allocated Data Size</td>
            <td className="text-lg-end">{details.space} byte(s)</td>
          </tr>
        )}

        {details && (
          <tr>
            <td>Assigned Program Id</td>
            <td className="text-lg-end">
              <Address pubkey={details.owner} alignRight link />
            </td>
          </tr>
        )}

        {details && (
          <tr>
            <td>Executable</td>
            <td className="text-lg-end">{details.executable ? "Yes" : "No"}</td>
          </tr>
        )}
      </TableCardBody>
    </div>
  );
}
