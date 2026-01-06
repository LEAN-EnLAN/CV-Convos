import requests
import os
import time

# Colors
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKGREEN = '\033[92m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

def test_frontend_alive():
    """Verifica si el servidor de Next.js está respondiendo."""
    print(f"{Colors.HEADER}🔍 Checking if Frontend is alive at {FRONTEND_URL}...{Colors.ENDC}")
    try:
        response = requests.get(FRONTEND_URL, timeout=5)
        if response.status_code == 200:
            print(f"{Colors.OKGREEN}✅ Frontend is UP!{Colors.ENDC}")
            return True
        else:
            print(f"{Colors.FAIL}❌ Frontend returned status code: {response.status_code}{Colors.ENDC}")
            return False
    except requests.exceptions.ConnectionError:
        print(f"{Colors.FAIL}❌ Could not connect to Frontend. Is it running? (npm run dev){Colors.ENDC}")
        return False

def test_static_assets():
    """Verifica que los assets críticos (CSS/Favicon) sean accesibles."""
    print(f"{Colors.HEADER}📂 Checking static assets...{Colors.ENDC}")
    assets = ["/favicon.ico"] # Next.js assets
    
    for asset in assets:
        try:
            res = requests.get(f"{FRONTEND_URL}{asset}")
            if res.status_code == 200:
                print(f"{Colors.OKGREEN}✅ Asset {asset} found.{Colors.ENDC}")
            else:
                print(f"{Colors.FAIL}❌ Asset {asset} missing (404).{Colors.ENDC}")
        except:
            pass

if __name__ == "__main__":
    print(f"{Colors.BOLD}--- FRONTEND KICKSTART TEST ---{Colors.ENDC}\n")
    if test_frontend_alive():
        test_static_assets()
        print(f"\n{Colors.OKGREEN}{Colors.BOLD}🎉 Frontend checks completed successfully!{Colors.ENDC}")
    else:
        print(f"\n{Colors.FAIL}{Colors.BOLD}🛑 Frontend check failed.{Colors.ENDC}")
