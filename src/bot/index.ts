import { DB, Schema } from "@/db";
import { getAccountsWithBalance, getAccountWithEntries } from "@/db/queries";
import { AccountWithBalance } from "@/db/schema";
import { toLocaleString } from "@/utils";
import { Bot, InlineKeyboard, InlineQueryResultBuilder } from "grammy";

// Helper function to escape special characters for MarkdownV2
function escapeMarkdownV2(text: string): string {
  return text.replace(/[_*\[\]()~`>#+\-=|{}.!]/g, "\\$&");
}

const fuzzyMatch = (input: string, accounts: AccountWithBalance[]) => {
  const lower = input.toUpperCase();
  return accounts
    .map((acc) => ({
      account: acc,
      score: calculateScore(lower, acc.name.toUpperCase()),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
};

const calculateScore = (input: string, target: string) => {
  if (target.includes(input)) return 100;

  let score = 0;
  let lastIndex = -1;

  for (let char of input) {
    const index = target.indexOf(char, lastIndex + 1);
    if (index === -1) return 0;
    score += index === lastIndex + 1 ? 2 : 1;
    lastIndex = index;
  }

  return score;
};

// Helper function to parse inline query
function parseInlineQuery(query: string) {
  const parts = query.trim().split(/\s+/);
  if (parts.length === 0 || parts[0] === "") {
    return null;
  }

  // Check if last part is a number (amount)
  const lastPart = parts[parts.length - 1];
  const amount = parseFloat(lastPart);

  if (!isNaN(amount)) {
    // Amount is present
    const name = parts.slice(0, -1).join(" ");
    return { name, amount };
  } else {
    // No amount, just name
    const name = parts.join(" ");
    return { name, amount: null };
  }
}

function replyWithInlineStart(ctx: any, messageText: string) {
  ctx.reply(messageText, {
    reply_markup: new InlineKeyboard().switchInlineCurrent("Start", ""),
    parse_mode: "MarkdownV2",
  });
}

async function handleShowAccount(
  accountId: number,
  db: DB,
  schema: Schema
): Promise<string> {
  const account = await getAccountWithEntries(accountId, db, schema);
  if (!account) {
    return "Account not found\\.";
  }

  let message = `*Account:* ${escapeMarkdownV2(
    account.name
  )} \\(ID: ${escapeMarkdownV2(account.id.toString())}\\)`;

  message += `\n\n*Balance:* ${escapeMarkdownV2(
    toLocaleString(account.balance)
  )}`;

  message += `\n\n*Entries:*\n`;
  if (account.entries.length === 0) {
    message += "No entries found\\.";
  } else {
    account.entries.slice(0, 5).forEach((entry) => {
      message += `\\${entry.type === "credit" ? "-" : "+"}${escapeMarkdownV2(
        toLocaleString(entry.amount)
      )}\n`;
    });
  }
  return message;
}

async function handleCreateEntry(
  accountId: number,
  amount: number,
  db: DB,
  schema: Schema
): Promise<string> {
  const account = await getAccountWithEntries(accountId, db, schema);
  if (!account) {
    return "Account not found\\.";
  }

  const description = `Entry from Telegram Bot`;
  await db
    .insert(schema.entries)
    .values({
      accountId: accountId,
      amount: amount,
      description: description,
      type: amount >= 0 ? "debit" : "credit",
    })
    .returning();

  const message =
    "*Create Entry Successful*" +
    "\n" +
    `\n*Account:* ${escapeMarkdownV2(account.name)}` +
    `\n*Amount:* ${escapeMarkdownV2(amount.toString())}` +
    `\n*Description:* ${escapeMarkdownV2(description)}`;

  return message;
}

// Helper function to show help message with inline keyboard
function getHelpMessage() {
  return `*Welcome to Hisab Bot\\!* 

*Available commands:*
/start \\- Show welcome message
/ledger \\- Show ledger \\(coming soon\\)

Use the button below to start:`;
}

export const setupBot = (bot: Bot, db: DB, schema: Schema) => {
  // Handle /start command
  bot.command("start", (ctx) => {
    const helpMessage = getHelpMessage();

    replyWithInlineStart(ctx, helpMessage);
  });

  // Handle /ledger command
  bot.command("ledger", (ctx) => {
    replyWithInlineStart(ctx, "LEDGER");
  });

  // Handle other messages
  bot.on("message:text", async (ctx) => {
    const text = ctx.message.text;

    // Skip if it's a command
    if (text.startsWith("/")) {
      return;
    }

    console.log("Received message:", text);

    const lines = text.split("\n");
    if (lines.length < 2) {
      const helpMessage = getHelpMessage();
      replyWithInlineStart(ctx, helpMessage);
    }

    const messageType = lines[0].trim();
    const payload = lines[1].trim();

    try {
      switch (messageType) {
        case "SHOW_ACCOUNT": {
          const accountId = parseInt(payload);
          if (isNaN(accountId)) {
            return replyWithInlineStart(
              ctx,
              "Invalid payload. Expected account ID number."
            );
          }

          const message = await handleShowAccount(accountId, db, schema);
          console.log("Replying with message:", message);

          return replyWithInlineStart(ctx, message);
        }

        case "CREATE_ENTRY": {
          const parts = payload.split(",").map((p) => p.trim());
          if (parts.length !== 3) {
            return replyWithInlineStart(
              ctx,
              "Invalid payload\\. Expected format: <name>,<id>,<amount>"
            );
          }

          const [_, idStr, amountStr] = parts;
          const accountId = parseInt(idStr);
          const amount = parseFloat(amountStr);

          if (isNaN(accountId) || isNaN(amount)) {
            return replyWithInlineStart(
              ctx,
              "Invalid payload\\. ID must be a number and amount must be a valid number\\."
            );
          }

          const message = await handleCreateEntry(
            accountId,
            amount,
            db,
            schema
          );

          return replyWithInlineStart(ctx, message);
        }

        case "CREATE_ENTRY_WITH_ACCOUNT": {
          const parts = payload.split(",").map((p) => p.trim());
          if (parts.length !== 2) {
            return replyWithInlineStart(
              ctx,
              "Invalid payload\\. Expected format: <name>,<amount>"
            );
          }

          const [name, amountStr] = parts;
          const amount = parseFloat(amountStr);

          if (isNaN(amount)) {
            return replyWithInlineStart(
              ctx,
              "Invalid payload\\. Amount must be a valid number\\."
            );
          }

          return replyWithInlineStart(
            ctx,
            `CREATE\\_ENTRY\\_WITH\\_ACCOUNT  amount: ${escapeMarkdownV2(
              amount.toString()
            )}, name: ${escapeMarkdownV2(name)}`
          );
        }
        default: {
          const helpMessage = getHelpMessage();
          return replyWithInlineStart(
            ctx,
            "Invalid message type\\. " + helpMessage
          );
        }
      }
    } catch (error) {
      console.error("Error processing message:", error);
      const helpMessage = getHelpMessage();
      return replyWithInlineStart(ctx, "An error occurred\\. " + helpMessage);
    }
  });

  // Handle inline queries
  bot.on("inline_query", async (ctx) => {
    const query = ctx.inlineQuery.query.trim();
    console.log("Received inline query:", query);

    if (!query) {
      // Show help when query is empty
      const result = InlineQueryResultBuilder.article("help", "Help", {
        reply_markup: new InlineKeyboard(),
      }).text(
        "Type a name and optionally an amount to get started\\.\nExample: 'John Doe 100' or 'Jane Smith \\-50'"
      );

      return await ctx.answerInlineQuery([result]);
    }

    const parsed = parseInlineQuery(query);
    if (!parsed || !parsed.name) {
      return await ctx.answerInlineQuery([]);
    }

    const { name, amount } = parsed;
    const results = [];

    try {
      // Check if account exists
      const allAccounts = await getAccountsWithBalance(false, db, schema);
      const matchingAccounts = fuzzyMatch(name, allAccounts);

      if (amount === null) {
        // Only name is present
        if (matchingAccounts.length > 0) {
          // Show account

          matchingAccounts.forEach(({ account }) => {
            const result = InlineQueryResultBuilder.article(
              `show_account_${account.id}`,
              `Show Account: ${account.name}`,
              { description: `Balance: ${toLocaleString(account.amount)}` }
            ).text(`SHOW_ACCOUNT\n${account.id}`);
            results.push(result);
          });
        } else {
          // Create account with amount 0
          const result = InlineQueryResultBuilder.article(
            `create_account_${name}`,
            `Create Account: ${name}`,
            {}
          ).text(`CREATE_ENTRY_WITH_ACCOUNT\n${name},0`);
          results.push(result);
        }
      } else {
        // Name and amount are present
        if (matchingAccounts.length > 0) {
          // Create entry for existing account

          matchingAccounts.forEach(({ account }) => {
            const result = InlineQueryResultBuilder.article(
              `create_entry_${account.id}`,
              `Add ${amount > 0 ? "+" : ""}${amount} to ${account.name}`,
              {}
            ).text(`CREATE_ENTRY\n${account.name},${account.id},${amount}`);
            results.push(result);
          });
        } else {
          // Create entry with account
          const result = InlineQueryResultBuilder.article(
            `create_entry_with_account_${name}`,
            `Create ${name} with ${amount > 0 ? "+" : ""}${amount}`,
            {}
          ).text(`CREATE_ENTRY_WITH_ACCOUNT\n${name},${amount}`);
          results.push(result);
        }
      }
    } catch (error) {
      console.error("Error processing inline query:", error);
      const errorResult = InlineQueryResultBuilder.article(
        "error",
        "Error",
        {}
      ).text("An error occurred\\. Please try again\\.");
      results.push(errorResult);
    }

    await ctx.answerInlineQuery(results);
  });
};
