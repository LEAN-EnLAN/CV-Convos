#!/usr/bin/env python3
"""Test script para verificar si la API de Groq funciona"""
import os
from dotenv import load_dotenv
from groq import Groq

# Cargar .env
load_dotenv(override=True)

api_key = os.getenv("GROQ_API_KEY")
print(f"API Key encontrada: {api_key[:6]}...{api_key[-4:] if api_key else 'NONE'}")

if not api_key or api_key == "placeholder_key":
    print("❌ API Key no está configurada correctamente")
    exit(1)

try:
    client = Groq(api_key=api_key)
    print("✅ Cliente de Groq creado exitosamente")
    
    # Test simple
    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "user", "content": "Say 'test successful' in JSON format"}
        ],
        temperature=0,
        response_format={"type": "json_object"}
    )
    
    print("✅ Respuesta de Groq:")
    print(completion.choices[0].message.content)
    print("\n🎉 Todo funciona correctamente!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
