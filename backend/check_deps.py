import importlib
import sys

modules = [
    'fastapi', 'uvicorn', 'motor', 'pymongo', 'dotenv', 
    'pydantic', 'resend', 'httpx', 'pdfplumber', 'stripe'
]

print(f"Python version: {sys.version}")
for module in modules:
    try:
        importlib.import_module(module)
        print(f"✅ {module} is installed")
    except ImportError:
        print(f"❌ {module} is MISSING")
