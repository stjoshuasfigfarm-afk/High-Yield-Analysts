import json
from urllib.request import Request, urlopen

FINANCIAL_API_KEY = "afb05902415e550cb4a4cccefa62d2a1"
FINANCIAL_BASE = "https://api.financialdata.net/v3"

def handler(request):
    query = request.get_query() or {}
    symbol = query.get("symbol", [None])[0]
    if not symbol:
        return {"statusCode": 400, "body": json.dumps({"error": "Missing symbol"})}
    
    url = f"{FINANCIAL_BASE}/company/profile/{symbol.upper()}?token={FINANCIAL_API_KEY}"
    req = Request(url)
    try:
        with urlopen(req, timeout=10) as resp:
            profile = json.loads(resp.read().decode())
        result = {
            "name": profile.get("companyName") or profile.get("name"),
            "sector": profile.get("sector"),
            "employees": profile.get("employees") or profile.get("fullTimeEmployees"),
            "marketCap": profile.get("marketCap") or profile.get("market_cap"),
        }
        return {"statusCode": 200, "body": json.dumps(result), "headers": {"Content-Type": "application/json"}}
    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}
