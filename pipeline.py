from telethon import TelegramClient
import os
import asyncio

API_ID = int(os.getenv("API_ID"))
API_HASH = os.getenv("API_HASH")

client = TelegramClient("session", API_ID, API_HASH)

async def fetch_messages():
    await client.start()
    messages = await client.get_messages("gadgetstore", limit=500)
    text = "\n".join([m.message for m in messages if m.message])

    os.makedirs("admin", exist_ok=True)
    with open("admin/input.txt", "w", encoding="utf-8") as f:
        f.write(text)

    print("✔ Telegram messages saved to admin/input.txt")

asyncio.run(fetch_messages())
