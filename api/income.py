import json
from urllib.request import Request, urlopen
from urllib.parse import urlencode

FINANCIAL_API_KEY = "YOUR_NEW_API_KEY"
FINANCIAL_BASE = "https://api.financialdata.net/v3"

def handler(request):
    query = {k: v[0] for k, v in request.get_query().items()} if request.get_query() else {}
    symbol = query.get("symbol")
    if not symbol:
        return {"statusCode": 400, "body": json.dumps({"error": "Missing symbol"})}
    
    params = urlencode({"period": "quarterly", "limit": 4, "token": FINANCIAL_API_KEY})
    url = f"{FINANCIAL_BASE}/financials/income-statement/{symbol.upper()}?{params}"
    try:
        with urlopen(Request(url), timeout=10) as resp:
            data = json.loads(resp.read().decode())
        if "financials" in data:
            quarters = [{"date": f.get("date"), "revenue": f.get("revenue"), "netIncome": f.get("netIncome")} for f in data["financials"]]
            return {"statusCode": 200, "body": json.dumps({"quarters": quarters}), "headers": {"Content-Type": "application/json"}}
        return {"statusCode": 404, "body": json.dumps({"error": "No income data"})}
    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}
