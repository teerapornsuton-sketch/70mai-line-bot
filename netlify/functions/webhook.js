const line = require("@line/bot-sdk");

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: config.channelAccessToken,
});

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);

    for (const ev of body.events) {
      if (ev.type !== "message") continue;

      await client.replyMessage({
        replyToken: ev.replyToken,
        messages: [
          {
            type: "text",
            text: "Netlify ทำงานแล้ว ✅",
          },
        ],
      });
    }

    return { statusCode: 200, body: "OK" };

  } catch (err) {
    console.log(err);
    return { statusCode: 200, body: "error" };
  }
};