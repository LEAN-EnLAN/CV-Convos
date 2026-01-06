"""
CV-ConVos API Integration Tests
================================
Valida endpoints de la API y la funcionalidad de IA.

Ejecución:
    python3 scripts/tests/test_api.py

Requisitos:
    - Backend corriendo en http://localhost:8000
    - pip install requests
"""

import requests
import json
import os
from typing import Dict, Any, List

# --- CONFIGURATION ---
BASE_URL = os.getenv("API_URL", "http://localhost:8000/api")

# Colores para output
class Colors:
    HEADER = '\033[95m'
    OKGREEN = '\033[92m'
    FAIL = '\033[91m'
    WARNING = '\033[93m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

# CV de prueba completo
TEST_CV_DATA = {
    "personalInfo": {
        "fullName": "Juan Pérez García",
        "email": "juan.perez@example.com",
        "phone": "+54 11 1234-5678",
        "location": "Buenos Aires, Argentina",
        "linkedin": "linkedin.com/in/juanperez",
        "github": "github.com/juanperez",
        "summary": "Desarrollador Full Stack con 5 años de experiencia en Python y React. Lideré equipos de 8 personas."
    },
    "experience": [
        {
            "id": "exp-1",
            "company": "Tech Corp Argentina",
            "position": "Senior Developer",
            "startDate": "01/2020",
            "endDate": "Present",
            "current": True,
            "location": "Buenos Aires",
            "description": "Liderazgo de equipos y desarrollo de microservicios. Aumenté la productividad del equipo en un 40%."
        },
        {
            "id": "exp-2",
            "company": "StartupXYZ",
            "position": "Junior Developer",
            "startDate": "06/2018",
            "endDate": "12/2019",
            "current": False,
            "location": "Córdoba",
            "description": "Desarrollo frontend con React y Vue.js."
        }
    ],
    "education": [
        {
            "id": "edu-1",
            "institution": "Universidad de Buenos Aires",
            "degree": "Licenciatura",
            "fieldOfStudy": "Ciencias de la Computación",
            "startDate": "2014",
            "endDate": "2018",
            "location": "Buenos Aires"
        }
    ],
    "skills": [
        {"id": "sk-1", "name": "Python", "level": "Expert", "category": "Hard Skills"},
        {"id": "sk-2", "name": "React", "level": "Advanced", "category": "Hard Skills"},
        {"id": "sk-3", "name": "Liderazgo", "level": "Advanced", "category": "Soft Skills"}
    ],
    "projects": [],
    "languages": [
        {"id": "lang-1", "language": "Español", "fluency": "Native"},
        {"id": "lang-2", "language": "Inglés", "fluency": "Fluent"}
    ],
    "certifications": [],
    "interests": []
}

# CV mínimo para edge cases
MINIMAL_CV_DATA = {
    "personalInfo": {"fullName": "Test", "email": "", "phone": "", "location": "", "summary": ""},
    "experience": [],
    "education": [],
    "skills": [],
    "projects": [],
    "languages": [],
    "certifications": [],
    "interests": []
}


def print_result(success: bool, message: str):
    """Helper para imprimir resultados de test."""
    if success:
        print(f"{Colors.OKGREEN}✅ {message}{Colors.ENDC}")
    else:
        print(f"{Colors.FAIL}❌ {message}{Colors.ENDC}")


def check_health() -> bool:
    """Verifica que el backend esté arriba."""
    print(f"{Colors.HEADER}🔍 Verificando health del backend...{Colors.ENDC}")
    try:
        response = requests.get(f"{BASE_URL.replace('/api', '')}/health", timeout=5)
        if response.status_code == 200:
            print_result(True, "Backend is healthy")
            return True
        else:
            print_result(False, f"Backend health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print_result(False, "Backend no está corriendo. Inicialo con: cd backend && make dev")
        return False


def test_optimize_cv_shrink() -> bool:
    """Prueba optimización con target=shrink."""
    print(f"\n{Colors.HEADER}🧪 Test: /optimize-cv (shrink){Colors.ENDC}")
    try:
        response = requests.post(
            f"{BASE_URL}/optimize-cv?target=shrink", 
            json=TEST_CV_DATA,
            timeout=30
        )
        if response.status_code == 200:
            result = response.json()
            # Verificar que la estructura se mantiene
            if "personalInfo" in result and "experience" in result:
                print_result(True, "Optimización shrink exitosa - estructura JSON válida")
                return True
            else:
                print_result(False, "Respuesta no tiene estructura esperada")
                return False
        else:
            print_result(False, f"Status {response.status_code}: {response.text[:100]}")
            return False
    except Exception as e:
        print_result(False, f"Error: {e}")
        return False


def test_optimize_cv_improve() -> bool:
    """Prueba optimización con target=improve."""
    print(f"\n{Colors.HEADER}🧪 Test: /optimize-cv (improve){Colors.ENDC}")
    try:
        response = requests.post(
            f"{BASE_URL}/optimize-cv?target=improve", 
            json=TEST_CV_DATA,
            timeout=30
        )
        if response.status_code == 200:
            print_result(True, "Optimización improve exitosa")
            return True
        else:
            print_result(False, f"Status {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Error: {e}")
        return False


def test_critique_cv() -> bool:
    """Prueba el endpoint de crítica."""
    print(f"\n{Colors.HEADER}🧪 Test: /critique-cv{Colors.ENDC}")
    try:
        response = requests.post(f"{BASE_URL}/critique-cv", json=TEST_CV_DATA, timeout=30)
        if response.status_code == 200:
            result = response.json()
            # Verificar estructura de critique
            if "critique" in result and isinstance(result["critique"], list):
                num_suggestions = len(result["critique"])
                print_result(True, f"Critique exitoso - {num_suggestions} sugerencias")
                # Verificar campos requeridos en sugerencias
                if num_suggestions > 0:
                    first = result["critique"][0]
                    required = ["target_field", "suggested_text", "title"]
                    missing = [f for f in required if f not in first]
                    if missing:
                        print(f"  {Colors.WARNING}⚠️  Campos faltantes en sugerencia: {missing}{Colors.ENDC}")
                return True
            else:
                print_result(False, "Respuesta no tiene estructura 'critique' esperada")
                return False
        else:
            print_result(False, f"Status {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Error: {e}")
        return False


def test_language_preservation() -> bool:
    """Verifica que la IA mantiene el idioma original (español)."""
    print(f"\n{Colors.HEADER}🧪 Test: Preservación de idioma español{Colors.ENDC}")
    try:
        response = requests.post(
            f"{BASE_URL}/optimize-cv?target=shrink", 
            json=TEST_CV_DATA,
            timeout=30
        )
        if response.status_code == 200:
            result_str = json.dumps(response.json(), ensure_ascii=False).lower()
            # Verificar que contenga palabras en español
            spanish_indicators = ["experiencia", "desarrollador", "liderazgo", "años", "equipo"]
            found = [word for word in spanish_indicators if word in result_str]
            
            if len(found) >= 2:
                print_result(True, f"Idioma español preservado (encontradas: {found[:3]})")
                return True
            else:
                print_result(False, "El contenido parece haber sido traducido al inglés")
                return False
        else:
            print_result(False, f"Request falló: {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Error: {e}")
        return False


def test_empty_cv_handling() -> bool:
    """Verifica manejo de CV con datos mínimos."""
    print(f"\n{Colors.HEADER}🧪 Test: Manejo de CV mínimo{Colors.ENDC}")
    try:
        response = requests.post(
            f"{BASE_URL}/optimize-cv?target=shrink", 
            json=MINIMAL_CV_DATA,
            timeout=30
        )
        # Debe manejar gracefully (200 o error controlado)
        if response.status_code in [200, 400]:
            print_result(True, f"CV mínimo manejado correctamente (status {response.status_code})")
            return True
        else:
            print_result(False, f"Respuesta inesperada: {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Error: {e}")
        return False


def run_all_tests() -> Dict[str, bool]:
    """Ejecuta todos los tests y retorna resultados."""
    results = {}
    
    tests = [
        ("Health Check", check_health),
        ("Optimize CV (shrink)", test_optimize_cv_shrink),
        ("Optimize CV (improve)", test_optimize_cv_improve),
        ("Critique CV", test_critique_cv),
        ("Language Preservation", test_language_preservation),
        ("Empty CV Handling", test_empty_cv_handling),
    ]
    
    for name, test_fn in tests:
        try:
            results[name] = test_fn()
        except Exception as e:
            print_result(False, f"{name} crashed: {e}")
            results[name] = False
    
    return results


if __name__ == "__main__":
    print(f"{Colors.BOLD}{'='*50}{Colors.ENDC}")
    print(f"{Colors.BOLD}   CV-ConVos API Integration Tests{Colors.ENDC}")
    print(f"{Colors.BOLD}{'='*50}{Colors.ENDC}\n")
    
    results = run_all_tests()
    
    # Summary
    print(f"\n{Colors.BOLD}{'='*50}{Colors.ENDC}")
    print(f"{Colors.BOLD}   RESUMEN{Colors.ENDC}")
    print(f"{Colors.BOLD}{'='*50}{Colors.ENDC}")
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for name, success in results.items():
        status = f"{Colors.OKGREEN}PASS{Colors.ENDC}" if success else f"{Colors.FAIL}FAIL{Colors.ENDC}"
        print(f"  {name}: {status}")
    
    print(f"\n  Total: {passed}/{total} tests pasados")
    
    if passed == total:
        print(f"\n{Colors.OKGREEN}{Colors.BOLD}🎉 ¡Todos los tests pasaron!{Colors.ENDC}")
        exit(0)
    else:
        print(f"\n{Colors.WARNING}{Colors.BOLD}⚠️  Algunos tests fallaron.{Colors.ENDC}")
        exit(1)

