import json
from urllib.request import Request, urlopen

FINANCIAL_API_KEY = "afb05902415e550cb4a4cccefa62d2a1"  # Replace after rotating
FINANCIAL_BASE = "https://api.financialdata.net/v3"

def handler(request):
    query = {k: v[0] for k, v in request.get_query().items()} if request.get_query() else {}
    symbol = query.get("symbol")
    if not symbol:
        return {"statusCode": 400, "body": json.dumps({"error": "Missing symbol"})}
    
    url = f"{FINANCIAL_BASE}/company/profile/{symbol.upper()}?token={FINANCIAL_API_KEY}"
    try:
        with urlopen(Request(url), timeout=10) as resp:
            data = json.loads(resp.read().decode())
        result = {
            "name": data.get("companyName") or data.get("name"),
            "sector": data.get("sector"),
            "employees": data.get("employees") or data.get("fullTimeEmployees"),
            "marketCap": data.get("marketCap") or data.get("market_cap"),
        }
        return {"statusCode": 200, "body": json.dumps(result), "headers": {"Content-Type": "application/json"}}
    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}
