import os
import base64
import asyncio
from telethon import TelegramClient

# === 1. Восстанавливаем session-файл из GitHub Secrets ===
session_data = os.getenv("SESSION_B64")
if not session_data:
    raise Exception("❌ SESSION_B64 secret is missing")

with open("user.session", "wb") as f:
    f.write(base64.b64decode(session_data))

# === 2. Авторизация как пользователь ===
API_ID = int(os.getenv("API_ID"))
API_HASH = os.getenv("API_HASH")

client = TelegramClient("user", API_ID, API_HASH)

# === 3. Скачиваем сообщения ===
async def fetch_messages():
    await client.start()
    messages = await client.get_messages("gadgetstore", limit=500)
    text = "\n".join([m.message for m in messages if m.message])

    os.makedirs("admin", exist_ok=True)
    with open("admin/input.txt", "w", encoding="utf-8") as f:
        f.write(text)

    print("✔ Telegram messages saved to admin/input.txt")

asyncio.run(fetch_messages())
