import json
from urllib.request import Request, urlopen
from urllib.parse import urlencode

FINANCIAL_API_KEY = "afb05902415e550cb4a4cccefa62d2a1"
FINANCIAL_BASE = "https://api.financialdata.net/v3"

def handler(request):
    query = request.get_query() or {}
    symbol = query.get("symbol", [None])[0]
    if not symbol:
        return {"statusCode": 400, "body": json.dumps({"error": "Missing symbol"})}
    
    params = urlencode({"limit": 1, "token": FINANCIAL_API_KEY})
    url = f"{FINANCIAL_BASE}/financials/balance-sheet/{symbol.upper()}?{params}"
    req = Request(url)
    try:
        with urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
        if "financials" in data and data["financials"]:
            bs = data["financials"][0]
            result = {
                "totalAssets": bs.get("totalAssets"),
                "totalDebt": bs.get("totalDebt"),
                "cashAndCashEquivalents": bs.get("cashAndCashEquivalents"),
                "totalEquity": bs.get("totalEquity"),
            }
            return {"statusCode": 200, "body": json.dumps(result), "headers": {"Content-Type": "application/json"}}
        else:
            return {"statusCode": 404, "body": json.dumps({"error": "No balance sheet"})}
    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}
