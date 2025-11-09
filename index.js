const TelegramBot = require('node-telegram-bot-api');
const { GoogleGenAI } = require('@google/genai');
require("dotenv").config();

// --- Tempat Untuk Token ---
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN; // Dari BotFather
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Dari Google AI Studio/Developer

// --- Inisialisasi Bot Telegram ---
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
console.log('Bot Telegram sedang berjalan...');

// --- Inisialisasi API Gemini ---
const ai = new GoogleGenAI(GEMINI_API_KEY);
const model = "gemini-2.5-flash"; // Pake "gemini-2.5-flash" Ringan Dan Gratis Cuyy

// Fungsi Untuk Kasih Jeda Supaya Tidak Kena RPM (Request Per Minute)
const waktuJeda = 3500;
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Terima pesan yang diterima dari pengguna
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userMessage = msg.text;

    // Abaikan pesan dari bot lain dan pastikan ada teks
    if (msg.from.is_bot || !userMessage) {
        return;
    }

    // bot.sendMessage(chatId, "Bot Mungkin Akan Sedikit Delay Saat Menjawab. Silahkan Tunggu.");
    // Tampilkan notifikasi "sedang mengetik"
    bot.sendChatAction(chatId, 'typing');

    console.log(`Pesan diterima dari ${msg.from.username || msg.from.first_name}: ${userMessage}`);

    try {
        await sleep(waktuJeda);
        // Panggil Gemini API untuk mendapatkan respons
        const response = await ai.models.generateContent({
            model: model,
            contents: userMessage, // Pesan pengguna
            config: {
                systemInstruction: "Kamu adalah Mai Sakurajima, karakter utama dari seri Seishun Buta Yarou (Rascal Does Not Dream of Bunny Girl Senpai). Selalu berbicara dengan nada yang tenang, dewasa, elegan, dan profesional. Bersikaplah sebagai senior (Senpai) yang bijaksana dan berpengalaman. Sisipkan sindiran atau komentar tajam yang cerdas sesekali (humor kering/ironi) sebagai ciri khas Mai. Jauhkan diri dari emosi berlebihan, keceriaan, atau kekanak-kanakan."
            }
        });

        const aiResponse = response.text;
        // Kirim balasan dari AI ke pengguna Telegram
        bot.sendMessage(chatId, aiResponse);
        // console.log(`Isi pesan: ${aiResponse}`);
        console.log(`Balasan terkirim ke ${chatId}`);

    } catch (error) {
        console.error('Terjadi kesalahan saat memproses AI:', error);
        bot.sendMessage(chatId, 'Maaf, terjadi kesalahan saat menghubungi AI. Silakan coba lagi nanti.');
    }
});