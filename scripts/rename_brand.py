import os
import glob

replacements = [
    ('Valto AI Research Assistant', 'WALLETX AI Research Assistant'),
    ('Valto Featherless Assistant', 'WALLETX AI Assistant'),
    ('Valto Quantitative Intelligence', 'WALLETX Quantitative Intelligence'),
    ('https://valto.local', 'https://walletx.local'),
    ('Valto Strategy', 'WALLETX Strategy'),
    ('Valto automatically', 'WALLETX automatically'),
    ('Valto Overfitting', 'WALLETX Overfitting'),
    ('Valto System & Quantitative', 'WALLETX System & Quantitative'),
    ('valto_trade_blotter', 'walletx_trade_blotter'),
    ('Hello! I am Valto', 'Hello! I am WALLETX'),
    ('Grounded on Valto Calculations', 'Grounded on WALLETX Calculations'),
    ('Valto is an', 'WALLETX is an'),
    ('QuantX', 'WalletX'),
    ('QUANTX', 'WALLETX'),
    ('quantx', 'walletx'),
]

patterns = ['src/**/*.ts', 'src/**/*.tsx', 'index.html', 'package.json']
files = []
for p in patterns:
    files += glob.glob(p, recursive=True)

updated = 0
for path in files:
    try:
        with open(path, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
        new = content
        for old, new_val in replacements:
            new = new.replace(old, new_val)
        if new != content:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new)
            print(f"Updated: {path}")
            updated += 1
    except Exception as e:
        print(f"Error on {path}: {e}")

print(f"\nTotal files updated: {updated}")
