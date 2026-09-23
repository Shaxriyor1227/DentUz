const https = require('https');

class DentUzTelegramBot {
  constructor() {
    this.token = process.env.TELEGRAM_BOT_TOKEN;
    this.adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
    this.lastOffset = 0;
    this.isRunning = false;
    this.userSessions = new Map(); // chat_id -> { step, data }
  }

  // Telegram API so'rov yuborish metodi
  async api(method, params = {}) {
    if (!this.token) return null;
    return new Promise((resolve) => {
      const payload = JSON.stringify(params);
      const options = {
        hostname: 'api.telegram.org',
        port: 443,
        path: `/bot${this.token}/${method}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            resolve(data);
          } catch {
            resolve(null);
          }
        });
      });

      req.on('error', () => resolve(null));
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
    const chatId = cb.message.chat.id;
    const data = cb.data;
    const user = cb.from;

    await this.api('answerCallbackQuery', { callback_query_id: cb.id });

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
    if (data.startsWith('chairs_')) {
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

  // Long Polling xizmati
  async startPolling() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('🤖 DentUz Telegram Bot faollashtirildi (@dentuz_bot)...');

    const poll = async () => {
      if (!this.isRunning) return;
      try {
        const res = await this.api('getUpdates', {
          offset: this.lastOffset + 1,
          timeout: 20
        });

        if (res && res.ok && Array.isArray(res.result)) {
          for (const update of res.result) {
            this.lastOffset = update.update_id;

            if (update.callback_query) {
              await this.handleCallbackQuery(update.callback_query);
            } else if (update.message) {
              const msg = update.message;
              const chatId = msg.chat.id;
              const text = msg.text || '';
              const from = msg.from || {};

              if (text.startsWith('/start')) {
                this.userSessions.delete(chatId);
                await this.sendWelcome(chatId, from.first_name);
              } else if (text.startsWith('/demo')) {
                await this.startDemoFlow(chatId);
              } else if (text.startsWith('/contact')) {
                await this.sendContact(chatId);
              } else if (text.startsWith('/help')) {
                await this.sendFeatures(chatId);
              } else {
                await this.handleUserText(chatId, text, from);
              }
            }
          }
        }
      } catch (err) {
        // Tarmoq xatosida qisqa tanaffus
      }

      if (this.isRunning) {
        setTimeout(poll, 1000);
      }
    };

    poll();
  }

  stopPolling() {
    this.isRunning = false;
  }
}

const botInstance = new DentUzTelegramBot();
module.exports = botInstance;
