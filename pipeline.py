import os
import re
import pandas as pd

# === 1. Читаем Excel и превращаем в Telegram‑текст ===

def excel_to_telegram_text(excel_file):
    df = pd.read_excel(excel_file)

    output = ""
    current_category = None

    for _, row in df.iterrows():
        category = row["category"]
        name = row["name"]
        memory = row["memory"]
        color = row["color"]
        sim = row["sim"]
        price = row["price"]

        if category != current_category:
            output += f"📱 {category}\n"
            current_category = category

        output += f"{name} {memory} {color} {sim} - {price} BYN\n"

    return output


# === 2. Парсим Telegram‑текст в CSV ===

def parseTelegramToCSV_py(inputText):
    lines = [l.strip() for l in inputText.split("\n") if l.strip()]

    category = ""
    id = 1
    rows = []

    categoryRegex = re.compile(r"^📱\s*(.+)$", re.I)
    productRegex = re.compile(r"^(.+?)\s+(\d+(?:TB|GB)?)\s+(\w+)\s+([\w+]+)\s*-\s*(\d+)\s*BYN", re.I)

    for line in lines:
        catMatch = categoryRegex.match(line)
        if catMatch:
            category = catMatch.group(1).strip()
            continue

        prodMatch = productRegex.match(line)
        if prodMatch:
            name = prodMatch.group(1).strip()
            memory = prodMatch.group(2).strip()
            color = prodMatch.group(3).strip()
            sim = prodMatch.group(4).strip()
            price = prodMatch.group(5).strip()

            rows.append({
                "id": id,
                "category": category,
                "name": name,
                "memory": memory,
                "color": color,
                "sim": sim,
                "price": price
            })
            id += 1

    return rows


# === 3. Сохраняем результат в products.csv ===

def save_products_csv(rows, output_file="products.csv"):
    df = pd.DataFrame(rows)
    df.to_csv(output_file, index=False)
    print("✔ products.csv обновлён")


# === 4. PIPELINE ===

EXCEL_FILE = "gadgetstore_export.xlsx"

if not os.path.exists(EXCEL_FILE):
    print(f"❌ Файл {EXCEL_FILE} не найден")
    exit(1)

telegram_text = excel_to_telegram_text(EXCEL_FILE)
rows = parseTelegramToCSV_py(telegram_text)
save_products_csv(rows)

print("✔ Pipeline завершён")
