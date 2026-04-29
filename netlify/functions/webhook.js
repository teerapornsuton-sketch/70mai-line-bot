const line = require("@line/bot-sdk");

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};

const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
});

// 🏪 สาขา
const branches = [
  {
    name: "สาขากาญจนาภิเษก",
    address: "(ในปั๊มบางจาก) อยู่ติดกับศูนย์ โชว์รูมรถยนต์ไฟฟ้า BYD",
    lat: 13.77545886937493,
    lng: 100.40940004974607,
    phone: "0987778654",
    image: "https://res.cloudinary.com/duusfncu9/image/upload/f_auto,q_auto/กาญจนา_utcjjr"
  },
  {
    name: "สาขารามอินทรา",
    address: "ปั๊ม Caltex รามอินทรา กม 14",
    lat: 13.812128881362883,
    lng: 100.70946108465445,
    phone: "0932750706",
    image: "https://res.cloudinary.com/duusfncu9/image/upload/v1777278740/รามอินทรา_iykhlr.jpg"
  },
  {
    name: "สาขาท่าพระ",
    address: "หน้า ซอย รัชดาภิเษก(ท่าพระ) 8 จุดสังเกต เลยเดอะมอลล์ท่าพระมา 450 เมตร",
    lat: 13.709936960669902,
    lng: 100.47997390256795,
    phone: "0934815081",
    image: "https://res.cloudinary.com/duusfncu9/image/upload/v1777278866/Hashtag_ท่าพระ_wqdsic.jpg"
  },
  {
    name: "สาขาชลบุรี",
    address: "48/24 หมู่ 1 ต.ห้วยกะปิ อ.เมืองชลบุรี จ.ชลบุรี 20000",
    lat: 13.330720875239878,
    lng: 100.96827634232723,
    phone: "0905398444",
    image: "https://res.cloudinary.com/duusfncu9/image/upload/v1777278634/ชลบุรี_qwlnlo.jpg"
  }
];

// ⭐ Netlify Handler
exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);

    await Promise.all(body.events.map(handleEvent));

    return {
      statusCode: 200,
      body: "OK"
    };

  } catch (err) {
    console.error(err);
    return {
      statusCode: 200,
      body: "Error"
    };
  }
};

async function handleEvent(event) {
  if (!event.replyToken) return;
  if (event.type !== "message") return;

  // 📍 LOCATION
  if (event.message.type === "location") {

    const userLat = event.message.latitude;
    const userLng = event.message.longitude;

    const withDistance = branches.map(b => {
      const distance = getDistance(userLat, userLng, b.lat, b.lng);
      return { ...b, distance };
    });

    withDistance.sort((a, b) => a.distance - b.distance);
    const nearest = withDistance[0];

    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [{
        type: "flex",
        altText: "สาขาใกล้คุณ",
        contents: {
          type: "carousel",
          contents: withDistance.map(b => ({
            type: "bubble",
            hero: {
              type: "image",
              url: b.image,
              size: "full",
              aspectRatio: "20:13",
              aspectMode: "cover"
            },
            header: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: b.name,
                  weight: "bold",
                  size: "md",
                  color: b.name === nearest.name ? "#FF5A00" : "#111111"
                },
                {
                  type: "text",
                  text: b.name === nearest.name ? "📍 ใกล้ที่สุด" : " ",
                  size: "sm",
                  color: "#FF5A00"
                }
              ]
            },
            body: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: b.address,
                  size: "sm",
                  wrap: true
                },
                {
                  type: "text",
                  text: `🚗 ${b.distance.toFixed(2)} กม.`,
                  size: "sm"
                }
              ]
            },
            footer: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "button",
                  style: "primary",
                  color: "#FF5A00",
                  action: {
                    type: "uri",
                    label: "🧭 นำทาง",
                    uri: `https://www.google.com/maps?q=${b.lat},${b.lng}`
                  }
                },
                {
                  type: "button",
                  style: "secondary",
                  action: {
                    type: "uri",
                    label: "📞 โทร",
                    uri: `tel:${b.phone}`
                  }
                }
              ]
            }
          }))
        }
      }]
    });
  }

  // 🧠 TEXT
  if (event.message.type === "text") {

    if (event.message.text === "สาขา") {
      return client.replyMessage({
        replyToken: event.replyToken,
        messages: [{
          type: "text",
          text: "📍 กดปุ่มเพื่อดูสาขาใกล้คุณ",
          quickReply: {
            items: [{
              type: "action",
              action: {
                type: "location",
                label: "📍 ดูสาขาใกล้ฉัน"
              }
            }]
          }
        }]
      });
    }

    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [{
        type: "text",
        text: "พิมพ์ 'สาขา' หรือส่งโลเคชั่นมาได้เลย 📍"
      }]
    });
  }
}

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}