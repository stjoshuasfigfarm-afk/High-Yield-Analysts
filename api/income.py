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
    
    params = urlencode({"period": "quarterly", "limit": 4, "token": FINANCIAL_API_KEY})
    url = f"{FINANCIAL_BASE}/financials/income-statement/{symbol.upper()}?{params}"
    req = Request(url)
    try:
        with urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
        if "financials" in data:
            quarters = [{"date": f.get("date"), "revenue": f.get("revenue"), "netIncome": f.get("netIncome")} for f in data["financials"]]
            return {"statusCode": 200, "body": json.dumps({"quarters": quarters}), "headers": {"Content-Type": "application/json"}}
        else:
            return {"statusCode": 404, "body": json.dumps({"error": "No income data"})}
    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}
