#!/usr/bin/env python3
import json
import os
import urllib.error
import urllib.parse
import urllib.request
from http.server import SimpleHTTPRequestHandler, HTTPServer

# ---------- Configuration ----------
PORT = 4242
FINANCIAL_API_KEY = "afb05902415e550cb4a4cccefa62d2a1"
FINANCIAL_BASE = "https://api.financialdata.net/v3"
ITICK_API_KEY = "d4c2fcc1f4d44ac0940afed75d8dec5de3d1be6d554d4747981e869c732f42d7"          # <-- Replace with your iTick key
ITICK_BASE = "https://api.itick.org/v1"

# ---------- Helper: fetch JSON from URL ----------
def fetch_json(url, headers=None):
    req = urllib.request.Request(url, headers=headers or {})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        print(f"Fetch error for {url}: {e}")
        return None

# ---------- FinancialData.net calls ----------
def financialdata_get(endpoint, params=None):
    if params is None:
        params = {}
    params["token"] = FINANCIAL_API_KEY
    query = urllib.parse.urlencode(params)
    url = f"{FINANCIAL_BASE}/{endpoint}?{query}"
    return fetch_json(url)

# ---------- iTick quote ----------
def itick_quote(symbol):
    if ITICK_API_KEY == "d4c2fcc1f4d44ac0940afed75d8dec5de3d1be6d554d4747981e869c732f42d7":
        return None   # no valid key
    url = f"{ITICK_BASE}/stock/quote?symbol={symbol}&apikey={ITICK_API_KEY}"
    return fetch_json(url)

# ---------- Priority quote (FinancialData.net -> iTick) ----------
def get_quote_priority(symbol):
    # 1. Try FinancialData.net
    data = financialdata_get(f"quote/{symbol}")
    if data and "price" in data:
        return {
            "price": data.get("price"),
            "change": data.get("change"),
            "changePercent": data.get("changePercent"),
            "source": "financialdata"
        }
    # 2. Fallback to iTick
    itick = itick_quote(symbol)
    if itick and "c" in itick:   # typical iTick field for last price
        return {
            "price": itick.get("c"),
            "change": itick.get("d"),
            "changePercent": itick.get("dp"),
            "source": "itick"
        }
    return None

# ---------- HTTP request handler ----------
class ProxyHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        # Parse path and query
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        # ---- API routes ----
        if path.startswith("/api/quote/priority"):
            symbols = query.get("symbol", [])
            if not symbols:
                self.send_json_error(400, "Missing symbol")
                return
            symbol = symbols[0].upper()
            quote = get_quote_priority(symbol)
            if quote:
                self.send_json(quote)
            else:
                self.send_json_error(404, f"No quote for {symbol}")

        elif path.startswith("/api/company/financialdata"):
            symbols = query.get("symbol", [])
            if not symbols:
                self.send_json_error(400, "Missing symbol")
                return
            symbol = symbols[0].upper()
            profile = financialdata_get(f"company/profile/{symbol}")
            if profile:
                # flatten needed fields
                result = {
                    "name": profile.get("companyName"),
                    "sector": profile.get("sector"),
                    "industry": profile.get("industry"),
                    "employees": profile.get("employees"),
                    "marketCap": profile.get("marketCap"),
                    "ceo": profile.get("ceo"),
                    "website": profile.get("website"),
                }
                self.send_json(result)
            else:
                self.send_json_error(404, f"No profile for {symbol}")

        elif path.startswith("/api/financials/income"):
            symbols = query.get("symbol", [])
            if not symbols:
                self.send_json_error(400, "Missing symbol")
                return
            symbol = symbols[0].upper()
            # quarterly income statement, last 4 quarters
            income = financialdata_get(f"financials/income-statement/{symbol}",
                                       {"period": "quarterly", "limit": 4})
            if income and "financials" in income:
                quarters = []
                for fin in income["financials"]:
                    quarters.append({
                        "date": fin.get("date"),
                        "revenue": fin.get("revenue"),
                        "netIncome": fin.get("netIncome")
                    })
                self.send_json({"quarters": quarters})
            else:
                self.send_json_error(404, f"No income data for {symbol}")

        elif path.startswith("/api/financials/balance"):
            symbols = query.get("symbol", [])
            if not symbols:
                self.send_json_error(400, "Missing symbol")
                return
            symbol = symbols[0].upper()
            balance = financialdata_get(f"financials/balance-sheet/{symbol}",
                                        {"limit": 1})   # most recent
            if balance and "financials" in balance and len(balance["financials"]) > 0:
                bs = balance["financials"][0]
                result = {
                    "totalAssets": bs.get("totalAssets"),
                    "totalLiabilities": bs.get("totalLiabilities"),
                    "totalDebt": bs.get("totalDebt"),
                    "cashAndCashEquivalents": bs.get("cashAndCashEquivalents"),
                    "totalEquity": bs.get("totalEquity")
                }
                self.send_json(result)
            else:
                self.send_json_error(404, f"No balance sheet for {symbol}")

        # ---- Static files ----
        else:
            # Map root to index.html
            if self.path == "/":
                self.path = "/index.html"
            # Serve files from current directory
            return SimpleHTTPRequestHandler.do_GET(self)

    # ----- Helper response methods -----
    def send_json(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def send_json_error(self, code, message):
        self.send_json({"error": message}, code)

    def log_message(self, format, *args):
        # Optional: quiet logging
        print(f"{self.address_string()} - {format % args}")

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    server = HTTPServer(("localhost", PORT), ProxyHandler)
    print(f"✅ HY Analysts Terminal running at http://localhost:{PORT}")
    print("   Press Ctrl+C to stop")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")
