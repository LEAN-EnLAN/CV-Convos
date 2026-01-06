import json
import os
import sys

# Color coding for output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def test_json_structure(data):
    """Valida que el JSON del CV tenga la estructura mínima requerida."""
    required_keys = ["personalInfo", "experience", "skills"]
    print(f"{Colors.OKCYAN}Testing JSON Structure...{Colors.ENDC}")
    
    missing = [key for key in required_keys if key not in data]
    if not missing:
        print(f"{Colors.OKGREEN}✅ Structure Valid{Colors.ENDC}")
        return True
    else:
        print(f"{Colors.FAIL}❌ Missing keys: {', '.join(missing)}{Colors.ENDC}")
        return False

def test_cv_logic_rules(data):
    """Valida reglas lógicas del negocio para el CV."""
    print(f"{Colors.OKCYAN}Testing Business Logic Rules...{Colors.ENDC}")
    errors = []
    
    # 1. Al menos un Skill
    if not data.get("skills") or len(data["skills"]) == 0:
        errors.append("At least one skill is required")
        
    # 2. Fechas de experiencia
    for exp in data.get("experience", []):
        if not exp.get("startDate"):
            errors.append(f"Experience at {exp.get('company', 'Unknown')} missing startDate")
            
    if not errors:
        print(f"{Colors.OKGREEN}✅ Logic Rules Passed{Colors.ENDC}")
        return True
    else:
        for err in errors:
            print(f"{Colors.FAIL}❌ Business Rule: {err}{Colors.ENDC}")
        return False

def run_all_builder_tests(cv_file_path=None):
    """Ejecuta todos los tests de lógica del Builder."""
    print(f"{Colors.BOLD}{Colors.HEADER}--- BUILDER LOGIC TESTS ---{Colors.ENDC}")
    
    # Datos de ejemplo si no se provee un archivo
    if cv_file_path and os.path.exists(cv_file_path):
        with open(cv_file_path, 'r') as f:
            data = json.load(f)
    else:
        # Mock data
        data = {
            "personalInfo": {"fullName": "Test User"},
            "experience": [{"company": "Test Co", "startDate": "2020-01"}],
            "skills": [{"name": "Python"}]
        }
        print(f"{Colors.WARNING}Using Mock Data for testing{Colors.ENDC}")

    s1 = test_json_structure(data)
    s2 = test_cv_logic_rules(data)
    
    if s1 and s2:
        print(f"\n{Colors.OKGREEN}{Colors.BOLD}🎉 ALL BUILDER TESTS PASSED!{Colors.ENDC}")
        return True
    else:
        print(f"\n{Colors.FAIL}{Colors.BOLD}⚠️ BUILDER TESTS FAILED!{Colors.ENDC}")
        return False

if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else None
    run_all_builder_tests(path)
