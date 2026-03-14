#!/usr/bin/env python3
"""Script manual para verificar si la API de Groq funciona."""

import os

from dotenv import load_dotenv
from groq import Groq


def main() -> int:
    load_dotenv(override=True)

    api_key = os.getenv("GROQ_API_KEY")
    masked_key = f"{api_key[:6]}...{api_key[-4:]}" if api_key else "NONE"
    print(f"API Key encontrada: {masked_key}")

    if not api_key or api_key == "placeholder_key":
        print("❌ API Key no está configurada correctamente")
        return 1

    try:
        client = Groq(api_key=api_key)
        print("✅ Cliente de Groq creado exitosamente")

        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "user", "content": "Say 'test successful' in JSON format"}
            ],
            temperature=0,
            response_format={"type": "json_object"},
        )

        print("✅ Respuesta de Groq:")
        print(completion.choices[0].message.content)
        print("\n🎉 Todo funciona correctamente!")
        return 0
    except Exception as exc:
        print(f"❌ Error: {exc}")
        import traceback

        traceback.print_exc()
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
