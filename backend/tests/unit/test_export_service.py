from app.services import export_service


def test_resolve_hex_color_oklch():
    assert export_service._resolve_hex_color("oklch(0.55 0.18 155)", "#000000") == "#10b981"
    assert export_service._resolve_hex_color("#abc", "#000000") == "#aabbcc"
    assert export_service._resolve_hex_color("color-raro", "#111111") == "#111111"


def test_get_section_label_uses_config_title():
    cv_data = {
        "config": {
            "sections": {
                "summary": {"title": "Perfil Ejecutivo"}
            }
        }
    }
    assert export_service._get_section_label(cv_data, "summary") == "Perfil Ejecutivo"


def test_resolve_pdf_fonts_mapping():
    cv_data = {
        "config": {
            "fonts": {
                "heading": '"Fira Code"',
                "body": '"Playfair Display"',
            }
        }
    }
    fonts = export_service._resolve_pdf_fonts(cv_data, "professional")
    assert fonts["heading"] == "Courier-Bold"
    assert fonts["body"] == "Times-Roman"
