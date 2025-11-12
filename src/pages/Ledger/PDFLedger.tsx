import { Account } from "@/db/schema";
import { toLocaleFormattedDate, toLocaleString } from "@/utils";
import { FC, RefObject } from "react";

type LedgerEntry = Account & {
  amount: number;
  type: "debit" | "credit";
};

type PDFLedgerProps = {
  balance: number;
  rows: Array<[LedgerEntry | undefined, LedgerEntry | undefined]>;
  debitTotal: number;
  creditTotal: number;
  targetRef: RefObject<HTMLDivElement | null>;
};

export const PDFLedger: FC<PDFLedgerProps> = ({
  balance,
  rows,
  debitTotal,
  creditTotal,
  targetRef,
}) => {
  // Split rows into chunks that fit on a page (approximately 25-30 rows per page)
  const ROWS_PER_PAGE = 20;
  const pageChunks: Array<typeof rows> = [];

  for (let i = 0; i < rows.length; i += ROWS_PER_PAGE) {
    pageChunks.push(rows.slice(i, i + ROWS_PER_PAGE));
  }

  const renderTableHeader = () => (
    <thead>
      <tr style={{ backgroundColor: "#f5f5f5" }}>
        <th
          style={{
            border: "1px solid #ddd",
            padding: "14px 10px",
            textAlign: "left",
            fontWeight: "bold",
            width: "25%",
            color: "#000",
          }}
        >
          Account
        </th>
        <th
          style={{
            border: "1px solid #ddd",
            padding: "14px 10px",
            textAlign: "right",
            fontWeight: "bold",
            width: "25%",
            color: "#000",
          }}
        >
          Debit
        </th>
        <th
          style={{
            border: "1px solid #ddd",
            padding: "14px 10px",
            textAlign: "left",
            fontWeight: "bold",
            width: "25%",
            color: "#000",
          }}
        >
          Account
        </th>
        <th
          style={{
            border: "1px solid #ddd",
            padding: "14px 10px",
            textAlign: "right",
            fontWeight: "bold",
            width: "25%",
            color: "#000",
          }}
        >
          Credit
        </th>
      </tr>
    </thead>
  );

  const renderTableRows = (pageRows: typeof rows) => (
    <tbody>
      {pageRows.map(([debitAccount, creditAccount], index) => (
        <tr
          key={index}
          style={{
            backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9",
          }}
        >
          <td
            style={{
              border: "1px solid #ddd",
              padding: "12px 10px",
              color: "#000",
            }}
          >
            {debitAccount?.name || ""}
          </td>
          <td
            style={{
              border: "1px solid #ddd",
              padding: "12px 10px",
              textAlign: "right",
              color: "#000",
            }}
          >
            {debitAccount ? `+ ${toLocaleString(debitAccount.amount)}` : ""}
          </td>
          <td
            style={{
              border: "1px solid #ddd",
              padding: "12px 10px",
              color: "#000",
            }}
          >
            {creditAccount?.name || ""}
          </td>
          <td
            style={{
              border: "1px solid #ddd",
              padding: "12px 10px",
              textAlign: "right",
              color: "#000",
            }}
          >
            {creditAccount
              ? `- ${toLocaleString(Math.abs(creditAccount.amount))}`
              : ""}
          </td>
        </tr>
      ))}
    </tbody>
  );

  const renderTotalsTable = () => (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "16px",
      }}
    >
      {renderTableHeader()}
      <tbody>
        <tr
          style={{
            backgroundColor: "#f0f0f0",
            fontWeight: "bold",
            borderTop: "2px solid #333",
          }}
        >
          <td
            style={{
              border: "1px solid #ddd",
              padding: "14px 10px",
              fontWeight: "bold",
              color: "#000",
            }}
          >
            Total
          </td>
          <td
            style={{
              border: "1px solid #ddd",
              padding: "14px 10px",
              textAlign: "right",
              color: "#000",
              fontWeight: "bold",
            }}
          >
            + {toLocaleString(debitTotal)}
          </td>
          <td
            style={{
              border: "1px solid #ddd",
              padding: "14px 10px",
              fontWeight: "bold",
              color: "#000",
            }}
          >
            Total
          </td>
          <td
            style={{
              border: "1px solid #ddd",
              padding: "14px 10px",
              textAlign: "right",
              color: "#000",
              fontWeight: "bold",
            }}
          >
            - {toLocaleString(Math.abs(creditTotal))}
          </td>
        </tr>
      </tbody>
    </table>
  );

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "210mm", // A4 width
        minHeight: "297mm", // A4 height
        zIndex: -9999,
        opacity: 0, // Invisible but still rendered
        pointerEvents: "none", // Doesn't interfere with clicks
      }}
    >
      <div className="pdf-container" ref={targetRef}>
        <div
          style={{
            fontFamily: "Arial, sans-serif",
            maxWidth: "800px",
            margin: "0 auto",
            backgroundColor: "#fff",
            color: "#000",
          }}
        >
          {pageChunks.map((pageRows, pageIndex) => (
            <div
              key={pageIndex}
              style={{
                padding: "20px",
                height: "297mm",
                pageBreakBefore: pageIndex > 0 ? "always" : "auto",
              }}
            >
              {/* Repeat header on subsequent pages */}
              <div
                className="no-page-break"
                style={{
                  textAlign: "center",
                  marginBottom: "30px",
                  borderBottom: "2px solid #333",
                  paddingBottom: "15px",
                }}
              >
                <h1
                  style={{
                    margin: "0 0 10px 0",
                    fontSize: "32px",
                    color: "#000",
                  }}
                >
                  Ledger
                </h1>
                <p
                  style={{
                    margin: "0",
                    fontSize: "20px",
                    color: "#000",
                    fontWeight: "bold",
                  }}
                >
                  Balance: {balance >= 0 ? "+ " : "- "}
                  {toLocaleString(Math.abs(balance))}
                </p>
                <p
                  style={{
                    margin: "5px 0 0 0",
                    fontSize: "14px",
                    color: "#333",
                  }}
                >
                  Generated on {toLocaleFormattedDate(new Date().toISOString())}
                </p>
              </div>

              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "16px",
                }}
              >
                {renderTableHeader()}
                {renderTableRows(pageRows)}
              </table>
            </div>
          ))}

          {/* Totals table on the last page */}
          <div style={{ padding: "20px" }}>{renderTotalsTable()}</div>
        </div>
      </div>
    </div>
  );
};
