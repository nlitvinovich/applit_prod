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

# === 2. Авторизация ===
API_ID = int(os.getenv("API_ID"))
API_HASH = os.getenv("API_HASH")
CHANNEL = os.getenv("TG_CHANNEL")

client = TelegramClient("user", API_ID, API_HASH)

# === 3. Скачиваем ВСЕ сообщения ===
async def fetch_messages():
    await client.start()

    entity = await client.get_entity(CHANNEL)

    all_messages = []
    offset_id = 0

    while True:
        batch = await client.get_messages(entity, limit=100, offset_id=offset_id)
        if not batch:
            break

        all_messages.extend(batch)
        offset_id = batch[-1].id

        if len(batch) < 100:
            break

    text_messages = [m.message for m in all_messages if m.message]

    os.makedirs("admin", exist_ok=True)
    with open("admin/input.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(text_messages))

    print(f"✔ Telegram messages saved: {len(text_messages)} messages")

asyncio.run(fetch_messages())
