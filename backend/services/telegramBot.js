require('dotenv').config();
const https = require('https');

class DentUzTelegramBot {
  constructor() {
    this.token = process.env.TELEGRAM_BOT_TOKEN;
    this.adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
    this.lastOffset = 0;
    this.isRunning = false;
    this.userSessions = new Map(); // chat_id -> { step, data }
  }

  // Telegram API so'rov yuborish metodi (IPv4 + timeout himoyasi bilan)
  async api(method, params = {}, timeoutMs = 30000) {
    const token = this.token || process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return null;

    return new Promise((resolve) => {
      const payload = JSON.stringify(params);
      const options = {
        hostname: 'api.telegram.org',
        port: 443,
        path: `/bot${token}/${method}`,
        method: 'POST',
        family: 4, // IPv4 afzal ko'riladi (Windows / ISP kechikishlarini oldini oladi)
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      };

      let timer = null;
      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          if (timer) clearTimeout(timer);
          try {
            const data = JSON.parse(body);
            resolve(data);
          } catch {
            resolve(null);
          }
        });
      });

      timer = setTimeout(() => {
        try {
          req.destroy(new Error('Telegram API timeout'));
        } catch {}
        resolve(null);
      }, timeoutMs);

      req.on('error', (err) => {
        if (timer) clearTimeout(timer);
        resolve(null);
      });

      req.write(payload);
      req.end();
    });
  }

  // Asosiy menyu klaviaturasi (Inline Buttons)
  getMainKeyboard() {
    return {
      inline_keyboard: [
        [
          { text: '🚀 Bepul Demo so\'rash', callback_data: 'action_demo' },
          { text: '💼 Tariflar va Narxlar', callback_data: 'action_pricing' }
        ],
        [
          { text: '✨ Tizim Imkoniyatlari', callback_data: 'action_features' },
          { text: '📞 Bog\'lanish', callback_data: 'action_contact' }
        ],
        [
          { text: '🌐 DentUz Rasmiy Veb-Sayti', url: 'https://dentuz.uz' }
        ]
      ]
    };
  }

  // Start xabari
  async sendWelcome(chatId, firstName = 'Hurmatli shifokor') {
    const text = 
`🦷 <b>Assalomu alaykum, ${firstName}!</b>

<b>DentUz — Stomatologiya klinikalarini boshqarish bo‘yicha 2027-yil darajasidagi eng zamonaviy aqlli ekotizimga xush kelibsiz!</b>

Tizimimiz klinikalarga qanday yordam beradi:
🔹 <b>Elektron Odontogramma:</b> 32 ta tishning barcha yuzalarini 3D/interaktiv belgilash
🔹 <b>Avtomatlashtirilgan Jadval:</b> Qabullarni boshqarish va SMS/Telegram eslatmalar
🔹 <b>Moliya va Billing:</b> Payme, Click, Uzcard, Humo va kassa cheklarini 1 soniyada chiqarish
🔹 <b>Multi-Tenant Xavfsizlik:</b> Barcha bemorlar va daromadlar faqat sizning klinikangizga tegishli

<i>Quyidagi menyudan kerakli bo‘limni tanlang:</i>`;

    return this.api('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      reply_markup: this.getMainKeyboard()
    });
  }

  // Tariflar ma'lumoti
  async sendPricing(chatId) {
    const text = 
`💼 <b>DentUz — Rasmiy Obuna Tariflari:</b>

1️⃣ <b>STARTER (Kichik kabinetlar uchun)</b>
• 1-2 ta kreslo
• Bemorlar kartasi va to'liq tarix
• Baza va odontogramma
💰 <b>Narxi:</b> 350,000 so'm / oy

2️⃣ <b>PRO (Rivojlanayotgan klinikalar — Eng ommabop ⭐)</b>
• 3-6 ta kreslo
• SMS/Telegram eslatmalar
• Kassa va fiskal chek chop etish
• Xodimlar va shifokorlar hisoboti
💰 <b>Narxi:</b> 750,000 so'm / oy

3️⃣ <b>ENTERPRISE (Ko'p tarmoqli va tarmoq klinikalar)</b>
• Cheksiz kreslolar va filiallar
• Alohida server va shaxsiy integratsiyalar
• 24/7 VIP muhandislik yordami
💰 <b>Narxi:</b> Shartnoma asosida

🎁 <i>Har qanday tarifni 14 kun bepul sinab ko'rish imkoniyati mavjud!</i>`;

    const keyboard = {
      inline_keyboard: [
        [{ text: '📝 Demo so\'rov qoldirish', callback_data: 'action_demo' }],
        [{ text: '◀️ Asosiy menyu', callback_data: 'action_menu' }]
      ]
    };

    return this.api('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  }

  // Tizim imkoniyatlari
  async sendFeatures(chatId) {
    const text = 
`✨ <b>DentUz tizimi imkoniyatlari:</b>

📋 <b>Bemorlar bazasi:</b>
• 10,000+ bemorlar virtualizatsiyasi
• Tashxislar, rentgen va fayllar arxivi
• Excel va PDF hisobotlarni 1 tugmada yuklash

🦷 <b>Interaktiv Odontogramma:</b>
• FDI tizimi bo'yicha har bir tishning 5 ta yuzasi
• Karies, plomba, implant, toj va vinir belgilari
• Muolajalar tarixi dinamikasi

💳 <b>Moliya va To'lovlar:</b>
• Barcha to'lov turlari (Payme, Click, Karta, Naqd)
• 80mm/58mm termal kassa cheklari
• Rasmiy A4 hisob-faktura chop etish`;

    const keyboard = {
      inline_keyboard: [
        [{ text: '🚀 Sinab ko\'rish (Demo)', callback_data: 'action_demo' }],
        [{ text: '◀️ Orqaga', callback_data: 'action_menu' }]
      ]
    };

    return this.api('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  }

  // Aloqa ma'lumotlari
  async sendContact(chatId) {
    const text = 
`📞 <b>DentUz Aloqa Markazi:</b>

🏢 <b>Bosh ofis:</b> Toshkent sh., Amir Temur shox ko'chasi 15-uy
☎️ <b>Telefon:</b> +998 (71) 200-88-44
📲 <b>Mobil / Telegram:</b> @DentUz_Support
🌐 <b>Rasmiy sayt:</b> dentuz.uz
⏰ <b>Ish vaqti:</b> Dushanba - Shanba, 09:00 - 19:00

<i>Mutaxassislarimiz har qanday savolingizga javob berishdan mamnun!</i>`;

    const keyboard = {
      inline_keyboard: [
        [{ text: '✍️ Murojaat qoldirish', callback_data: 'action_demo' }],
        [{ text: '◀️ Orqaga', callback_data: 'action_menu' }]
      ]
    };

    return this.api('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  }

  // Demo arizasi bosqichi boshlanishi
  async startDemoFlow(chatId) {
    this.userSessions.set(chatId, { step: 'ASK_CLINIC_NAME', data: {} });

    const text = 
`🚀 <b>DentUz platformasini bepul sinab ko‘rish uchun ariza:</b>

Iltimos, <b>klinikangiz nomini</b> yozib yuboring:
<i>(Masalan: "Grand Dental" yoki "Shifo Dent")</i>`;

    const keyboard = {
      inline_keyboard: [
        [{ text: '❌ Bekor qilish', callback_data: 'action_cancel' }]
      ]
    };

    return this.api('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  }

  // Foydalanuvchi matn yozganda (Step-by-step flow)
  async handleUserText(chatId, text, user) {
    const session = this.userSessions.get(chatId);
    if (!session) {
      return this.sendWelcome(chatId, user.first_name);
    }

    if (session.step === 'ASK_CLINIC_NAME') {
      session.data.clinicName = text.trim();
      session.step = 'ASK_PHONE';

      return this.api('sendMessage', {
        chat_id: chatId,
        text: `👍 Ajoyib! Endi bog'lanish uchun <b>telefon raqamingizni</b> kiriting:\n<i>(Masalan: +998 90 123 45 67)</i>`,
        parse_mode: 'HTML'
      });
    }

    if (session.step === 'ASK_PHONE') {
      session.data.phone = text.trim();
      session.step = 'ASK_CHAIRS';

      const keyboard = {
        inline_keyboard: [
          [
            { text: '1 ta', callback_data: 'chairs_1' },
            { text: '2-3 ta', callback_data: 'chairs_2_3' }
          ],
          [
            { text: '4-6 ta', callback_data: 'chairs_4_6' },
            { text: '7+ ta', callback_data: 'chairs_7_plus' }
          ]
        ]
      };

      return this.api('sendMessage', {
        chat_id: chatId,
        text: `🪑 Klinikangizda nechta <b>stomatologik kreslo</b> mavjud?`,
        parse_mode: 'HTML',
        reply_markup: keyboard
      });
    }

    if (session.step === 'ASK_CHAIRS') {
      session.data.chairs = text.trim();
      await this.finishApplication(chatId, user);
    }
  }

  // Arizani yakunlash va adminga yuborish
  async finishApplication(chatId, user) {
    const session = this.userSessions.get(chatId);
    if (!session) return;

    const { clinicName, phone, chairs } = session.data;
    this.userSessions.delete(chatId);

    // 1. Foydalanuvchiga tasdiq xabari
    const userSuccessText = 
`✅ <b>Arizangiz muvaffaqiyatli qabul qilindi!</b>

🏥 <b>Klinika:</b> ${clinicName}
📞 <b>Telefon:</b> ${phone}
🪑 <b>Kreslolar:</b> ${chairs || '1-3 ta'}

Tez orada DentUz yetakchi mutaxassisi siz bilan bog'lanib, bepul sinov kabinetini taqdim etadi! Rahmat.`;

    await this.api('sendMessage', {
      chat_id: chatId,
      text: userSuccessText,
      parse_mode: 'HTML',
      reply_markup: this.getMainKeyboard()
    });

    // 2. Adminga xabar yuborish
    const adminId = this.adminChatId || '6641510142';
    const now = new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' });
    const adminAlertText = 
`⚡️ <b>YANGI TELEGRAM BOT ARIZASI!</b>

🏥 <b>Klinika nomi:</b> ${clinicName}
👤 <b>Foydalanuvchi:</b> ${user.first_name} ${user.last_name || ''} (@${user.username || 'noma\'lum'})
📞 <b>Telefon:</b> <a href="tel:${phone}">${phone}</a>
🪑 <b>Kreslolar soni:</b> ${chairs || '1-3 ta'}
⏰ <b>Vaqt:</b> ${now}
🆔 <b>Chat ID:</b> <code>${chatId}</code>`;

    await this.api('sendMessage', {
      chat_id: adminId,
      text: adminAlertText,
      parse_mode: 'HTML'
    });
  }

  // Callback tugmachalarini boshqarish
  async handleCallbackQuery(cb) {
    if (!cb) return;
    const chatId = cb.message?.chat?.id || cb.from?.id;
    const data = cb.data;
    const user = cb.from || {};

    if (cb.id) {
      await this.api('answerCallbackQuery', { callback_query_id: cb.id });
    }

    if (!chatId) return;

    if (data === 'action_menu') {
      return this.sendWelcome(chatId, user.first_name);
    }
    if (data === 'action_demo') {
      return this.startDemoFlow(chatId);
    }
    if (data === 'action_pricing') {
      return this.sendPricing(chatId);
    }
    if (data === 'action_features') {
      return this.sendFeatures(chatId);
    }
    if (data === 'action_contact') {
      return this.sendContact(chatId);
    }
    if (data === 'action_cancel') {
      this.userSessions.delete(chatId);
      return this.sendWelcome(chatId, user.first_name);
    }
    if (data && data.startsWith('chairs_')) {
      const chairsMap = {
        chairs_1: '1 ta',
        chairs_2_3: '2-3 ta',
        chairs_4_6: '4-6 ta',
        chairs_7_plus: '7+ ta'
      };
      const session = this.userSessions.get(chatId);
      if (session) {
        session.data.chairs = chairsMap[data] || '2-3 ta';
        await this.finishApplication(chatId, user);
      }
    }
  }

  // Xabarlarni xavfsiz boshqarish
  async handleMessage(msg) {
    if (!msg || !msg.chat) return;
    const chatId = msg.chat.id;
    const from = msg.from || {};
    const text = (msg.text || '').trim();

    if (text.startsWith('/start')) {
      this.userSessions.delete(chatId);
      return this.sendWelcome(chatId, from.first_name);
    }
    if (text.startsWith('/demo')) {
      return this.startDemoFlow(chatId);
    }
    if (text.startsWith('/pricing') || text.startsWith('/tarif')) {
      return this.sendPricing(chatId);
    }
    if (text.startsWith('/contact') || text.startsWith('/aloqa')) {
      return this.sendContact(chatId);
    }
    if (text.startsWith('/help') || text.startsWith('/yordam')) {
      return this.sendFeatures(chatId);
    }

    // Telefon raqami kontakt shaklida yuborilgan bo'lsa
    if (msg.contact && msg.contact.phone_number) {
      return this.handleUserText(chatId, msg.contact.phone_number, from);
    }

    // Matnli xabar
    if (text) {
      return this.handleUserText(chatId, text, from);
    }

    // Har qanday boshqa format (rasm, stiker, ovozli xabar)
    const session = this.userSessions.get(chatId);
    if (!session) {
      return this.sendWelcome(chatId, from.first_name);
    }
  }

  // Long Polling xizmati
  async startPolling() {
    if (this.isRunning) return;
    this.token = this.token || process.env.TELEGRAM_BOT_TOKEN;
    this.adminChatId = this.adminChatId || process.env.TELEGRAM_ADMIN_CHAT_ID;

    if (!this.token) {
      console.warn('⚠️ DentUz Telegram Bot: TELEGRAM_BOT_TOKEN sozlanmagan, bot ishga tushmadi.');
      return;
    }

    this.isRunning = true;
    console.log('🤖 DentUz Telegram Bot faollashtirildi (@dentuz_bot)...');

    let consecutiveErrors = 0;

    const poll = async () => {
      if (!this.isRunning) return;

      let nextDelay = 1000;

      try {
        // 20s Telegram long-polling, 28s network socket timeout
        const res = await this.api('getUpdates', {
          offset: this.lastOffset + 1,
          timeout: 20
        }, 28000);

        if (res && res.ok && Array.isArray(res.result)) {
          consecutiveErrors = 0;
          for (const update of res.result) {
            this.lastOffset = update.update_id;

            try {
              if (update.callback_query) {
                await this.handleCallbackQuery(update.callback_query);
              } else if (update.message) {
                await this.handleMessage(update.message);
              }
            } catch (updateErr) {
              console.error('Telegram bot update xatosi:', updateErr.message);
            }
          }
        } else if (res && !res.ok) {
          consecutiveErrors++;
          console.warn(`Telegram API bildirishnomasi [${res.error_code}]: ${res.description}`);

          if (res.error_code === 409) {
            // Parallel getUpdates ishlamoqda, 5 soniya kutish
            nextDelay = 5000;
          } else if (res.error_code === 429) {
            // Telegram rate limit
            const retryAfter = (res.parameters && res.parameters.retry_after) || 10;
            nextDelay = retryAfter * 1000;
          } else {
            nextDelay = Math.min(30000, 2000 * Math.pow(1.5, consecutiveErrors));
          }
        } else {
          // Tarmoq uzilishi yoki timeout (null)
          consecutiveErrors++;
          if (consecutiveErrors > 3) {
            nextDelay = Math.min(15000, 1000 * consecutiveErrors);
          }
        }
      } catch (err) {
        consecutiveErrors++;
        console.warn('Telegram bot polling tarmoq xatosi:', err.message);
        nextDelay = Math.min(15000, 2000 * consecutiveErrors);
      }

      if (this.isRunning) {
        setTimeout(poll, nextDelay);
      }
    };

    poll();
  }

  stopPolling() {
    this.isRunning = false;
    console.log('🛑 DentUz Telegram Bot to\'xtatildi.');
  }
}

const botInstance = new DentUzTelegramBot();
module.exports = botInstance;
