const https = require('https');

const sendTelegramMessage = async (text, customChatId = null) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  let chatId = customChatId || process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!token) {
    console.warn('TELEGRAM_BOT_TOKEN sozlanmagan');
    return false;
  }

  // Agar chatId belgilanmagan bo'lsa, getUpdates orqali botga yozgan oxirgi odamni topadi
  if (!chatId) {
    try {
      chatId = await new Promise((resolve) => {
        https.get(`https://api.telegram.org/bot${token}/getUpdates`, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              const json = JSON.parse(data);
              if (json.ok && json.result && json.result.length > 0) {
                const lastMsg = json.result[json.result.length - 1];
                const id = lastMsg.message?.chat?.id || lastMsg.my_chat_member?.chat?.id;
                resolve(id);
              } else {
                resolve(null);
              }
            } catch {
              resolve(null);
            }
          });
        }).on('error', () => resolve(null));
      });
    } catch (e) {
      console.warn('Telegram updates olishda xato:', e.message);
    }
  }

  if (!chatId) {
    console.warn('Telegram Chat ID topilmadi. Iltimos @dentuz_bot ga /start bosing yoki TELEGRAM_ADMIN_CHAT_ID ni sozlang.');
    return false;
  }

  return new Promise((resolve) => {
    const payload = JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML'
    });

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${token}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(responseBody);
          resolve(json.ok);
        } catch {
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.error('Telegram xabar yuborishda xato:', err.message);
      resolve(false);
    });

    req.write(payload);
    req.end();
  });
};

module.exports = { sendTelegramMessage };
