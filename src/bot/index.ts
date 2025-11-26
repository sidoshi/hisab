import { Bot, InlineKeyboard, InlineQueryResultBuilder } from "grammy";

export const setupBot = (bot: Bot) => {
  bot.on("message", (ctx) => {
    ctx.reply("Hi ssthere!", {
      reply_markup: new InlineKeyboard().switchInlineCurrent(
        "Try inline",
        "entry"
      ),
    });
  });

  // Return empty result list for other queries.
  bot.on("inline_query", async (ctx) => {
    console.log("Received * inline query:", ctx.inlineQuery.query);

    const result = InlineQueryResultBuilder.article(
      "id:grammy-website",
      "grammY",
      {
        reply_markup: new InlineKeyboard().url(
          "grammY website",
          "https://grammy.dev/"
        ),
      }
    ).text(
      `<b>grammY</b> is the best way to create your own Telegram bots.
They even have a pretty website! 👇`,
      { parse_mode: "HTML" }
    );

    // Answer the inline query.
    await ctx.answerInlineQuery(
      [result] // answer with result list
    );
  });
};
