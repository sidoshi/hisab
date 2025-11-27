import { useAccountsWithBalance } from "@/db/queries";
import { toLocaleString } from "@/utils";
import { Link } from "@tanstack/react-router";
import { FC, useEffect, useRef, useState } from "react";
import { Printer } from "react-feather";
import generatePDF from "react-to-pdf";
import { invoke } from "@tauri-apps/api/core";
import { zip } from "lodash-es";
import {
  View,
  Text,
  Table,
  Loader,
  Divider,
  Card,
  Checkbox,
  FormControl,
  Button,
  ScrollArea,
} from "reshaped";
import { PDFLedger } from "./PDFLedger";

export const Ledger: FC = () => {
  const [filterZeroBalance, setFilterZeroBalance] = useState(true);
  const { data, isLoading, refetch } =
    useAccountsWithBalance(filterZeroBalance);

  const [isPrinting, setIsPrinting] = useState(false);

  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function printPDF() {
      if (targetRef.current) {
        const pdf = await generatePDF(targetRef, {
          method: "build",
        });
        const pdfBase64 = pdf.output("datauristring").split(",")[1]; // Remove data:application/pdf;base64, prefix

        // Use Tauri's custom command to save the file with a dialog
        await invoke("save_pdf_file", {
          data: pdfBase64,
          suggestedName: "ledger.pdf",
        });
      }

      setIsPrinting(false);
    }

    if (isPrinting) {
      printPDF();
    }
  }, [isPrinting, targetRef]);

  const onPrint = async () => {
    setIsPrinting(true);
  };

  useEffect(() => {
    refetch();
  }, [filterZeroBalance]);

  if (isLoading) {
    return (
      <View justify="center" align="center" height="80vh">
        <Loader />
      </View>
    );
  }

  const debitAccounts =
    data?.filter((account) => account.type === "debit") || [];
  const debitTotal = debitAccounts.reduce(
    (sum, account) => sum + account.amount,
    0
  );

  const creditAccounts =
    data?.filter((account) => account.type === "credit") || [];
  const creditTotal = creditAccounts.reduce(
    (sum, account) => sum + account.amount,
    0
  );

  const rows = zip(debitAccounts, creditAccounts);

  const balance = debitTotal + creditTotal;

  return (
    <View padding={4} paddingInline={15} gap={4}>
      {isPrinting && (
        <PDFLedger
          balance={balance}
          rows={rows}
          debitTotal={debitTotal}
          creditTotal={creditTotal}
          targetRef={targetRef}
        />
      )}
      <Card>
        <View direction="row" justify="space-between" align="center">
          <Text variant="featured-1">Ledger</Text>

          <View gap={2} direction="row" align="center">
            <Text
              variant="body-1"
              color={balance >= 0 ? "positive" : "critical"}
            >
              Balance: {balance >= 0 ? "+ " : "- "}
              {toLocaleString(balance)}
            </Text>
            <Button onClick={onPrint} size="small" icon={Printer} />
          </View>
        </View>
      </Card>

      <Divider />

      <View direction="row" align="center" justify="end" padding={2} gap={2}>
        <FormControl>
          <Checkbox
            name="filterZeroBalance"
            checked={filterZeroBalance}
            onChange={({ checked }) => {
              setFilterZeroBalance(checked);
            }}
          />
        </FormControl>
        <FormControl.Label>Filter 0 Balance Accounts</FormControl.Label>
      </View>

      <ScrollArea height="calc(100vh - 290px)">
        <Card elevated padding={0}>
          <Table>
            <Table.Row highlighted>
              <Table.Heading>Account</Table.Heading>
              <Table.Heading>Debit + જમા</Table.Heading>
              <Table.Heading>Account</Table.Heading>
              <Table.Heading>Credit - ઉધાર</Table.Heading>
            </Table.Row>

            {rows.map(([debitAccount, creditAccount], index) => (
              <Table.Row key={index}>
                {debitAccount ? (
                  <>
                    <Table.Cell>
                      <View>
                        <Link to={`/accounts/${debitAccount.id}`}>
                          <Text>{debitAccount.name}</Text>
                        </Link>
                      </View>
                    </Table.Cell>
                    <Table.Cell>
                      <Text variant="featured-3" color="positive">
                        + {toLocaleString(debitAccount.amount)}
                      </Text>
                    </Table.Cell>
                  </>
                ) : (
                  <>
                    <Table.Cell></Table.Cell>
                    <Table.Cell></Table.Cell>
                  </>
                )}

                {creditAccount ? (
                  <>
                    <Table.Cell>
                      <View>
                        <Link to={`/accounts/${creditAccount.id}`}>
                          <Text>{creditAccount.name}</Text>
                        </Link>
                      </View>
                    </Table.Cell>
                    <Table.Cell>
                      <Text variant="featured-3" color="critical">
                        - {toLocaleString(creditAccount.amount)}
                      </Text>
                    </Table.Cell>
                  </>
                ) : (
                  <>
                    <Table.Cell></Table.Cell>
                    <Table.Cell></Table.Cell>
                  </>
                )}
              </Table.Row>
            ))}

            <Table.Row>
              <Table.Cell>
                <Text weight="bold">Total</Text>
              </Table.Cell>
              <Table.Cell>
                <Text variant="featured-2" weight="bold" color="positive">
                  + {toLocaleString(debitTotal)}
                </Text>
              </Table.Cell>

              <Table.Cell>
                <Text weight="bold">Total</Text>
              </Table.Cell>
              <Table.Cell>
                <Text variant="featured-2" weight="bold" color="critical">
                  - {toLocaleString(creditTotal)}
                </Text>
              </Table.Cell>
            </Table.Row>
          </Table>
        </Card>
      </ScrollArea>
    </View>
  );
};
