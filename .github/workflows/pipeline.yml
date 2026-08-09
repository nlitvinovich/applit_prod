name: Auto Update Products

on:
  schedule:
    - cron: "0 * * * *"   # запуск каждый час
  workflow_dispatch:       # возможность ручного запуска

jobs:
  run-pipeline:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repo
        uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: "3.11"

      - name: Install dependencies
        run: |
          pip install -r requirements.txt

      - name: Run pipeline
        env:
          API_ID: ${{ secrets.API_ID }}
          API_HASH: ${{ secrets.API_HASH }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          python pipeline.py

      - name: Auto commit changes
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "Auto-update products.csv"
          file_pattern: products.csv
