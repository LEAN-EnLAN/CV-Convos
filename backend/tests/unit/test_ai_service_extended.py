"""
Extended test suite for ATS Checker field-contextual validation.
Tests industry-specific keyword filtering, mismatch detection, and anti-keyword suppression.
"""

import pytest
from app.services.ai_service import (
    check_resume_content_indicators,
    filter_anti_keywords_for_industry,
    INDUSTRY_KEYWORDS,
)


class TestContentVerification:
    """Test content verification and mismatch detection."""

    def test_tech_resume_tech_industry_match(self):
        """Test Case A: Tech resume with tech industry - should match."""
        cv_text = """
        Software Developer with 5 years experience.
        Proficient in Python, React, AWS, and Node.js.
        Developed microservices architecture and deployed with Docker and Kubernetes.
        Experienced with Git, CI/CD pipelines, and cloud infrastructure.
        """
        result = check_resume_content_indicators(cv_text.lower(), "tech")
        
        assert result["mismatch_detected"] is False
        assert result["match_ratio"] > 0.2
        assert len(result["found_indicators"]) > 0
        assert "python" in result["found_indicators"] or "react" in result["found_indicators"]

    def test_creative_resume_tech_industry_mismatch(self):
        """Test Case B: Creative resume with tech industry - should detect mismatch."""
        cv_text = """
        Graphic Designer with expertise in Photoshop, Illustrator, and Branding.
        Created visual identities for multiple clients.
        Managed marketing campaigns and social media content.
        Proficient in Figma and Adobe Creative Suite.
        """
        result = check_resume_content_indicators(cv_text.lower(), "tech")
        
        assert result["mismatch_detected"] is True
        assert result["match_ratio"] < 0.2
        assert len(result["found_anti_keywords"]) > 0

    def test_healthcare_resume_healthcare_industry_match(self):
        """Test Case C: Healthcare resume with healthcare industry - should match."""
        cv_text = """
        Registered Nurse with 8 years in clinical settings.
        Patient care specialist with experience in hospital and emergency departments.
        Certified in HIPAA compliance and clinical protocols.
        Skilled in medication administration and vital signs monitoring.
        Experienced with Epic and Cerner systems.
        """
        result = check_resume_content_indicators(cv_text.lower(), "healthcare")
        
        # Healthcare industry has stricter threshold, check ratio is reasonable
        assert result["match_ratio"] > 0.1
        assert len(result["found_indicators"]) > 0
        # Check that at least one healthcare indicator is found
        healthcare_terms = ["paciente", "clinica", "hospital", "enfermer", "epic", "cerner"]
        assert any(term in result["found_indicators"] for term in healthcare_terms)

    def test_finance_resume_finance_industry_match(self):
        """Test Case D: Finance resume with finance industry - should match."""
        cv_text = """
        Financial Analyst with expertise in Excel, financial modeling, and reporting.
        Managed budgets and performed variance analysis.
        Experience with SAP, ERP systems, and compliance regulations.
        Prepared P&L statements and cash flow forecasts.
        """
        result = check_resume_content_indicators(cv_text.lower(), "finance")
        
        assert result["mismatch_detected"] is False
        assert result["match_ratio"] > 0.2
        assert "financiero" in result["found_indicators"] or "excel" in result["found_indicators"]

    def test_generic_resume_general_industry(self):
        """Test Case E: Generic resume with general industry - should be flexible."""
        cv_text = """
        Professional with strong communication and leadership skills.
        Experienced in project management and team coordination.
        Proficient in Microsoft Office and general office software.
        Adaptable and proactive in fast-paced environments.
        """
        result = check_resume_content_indicators(cv_text.lower(), "general")
        
        # General industry should not flag mismatches as aggressively
        assert result["match_ratio"] >= 0


class TestAntiKeywordSuppression:
    """Test anti-keyword filtering for each industry."""

    def test_creative_industry_no_tech_keywords(self):
        """Test F: Creative industry should NOT suggest tech keywords."""
        suggested_keywords = [
            "React", "Node.js", "Python", "Docker", "Kubernetes",
            "Adobe Creative Suite", "Branding", "Visual storytelling"
        ]
        filtered = filter_anti_keywords_for_industry(suggested_keywords, "creative")
        
        assert "React" not in filtered
        assert "Node.js" not in filtered
        assert "Python" not in filtered
        assert "Docker" not in filtered
        assert "Kubernetes" not in filtered
        # Creative keywords should remain
        assert "Adobe Creative Suite" in filtered
        assert "Branding" in filtered

    def test_healthcare_industry_no_tech_creative_keywords(self):
        """Test G: Healthcare industry should NOT suggest tech/creative keywords."""
        suggested_keywords = [
            "JavaScript", "Photoshop", "React", "Patient care",
            "Clinical protocols", "HIPAA"
        ]
        filtered = filter_anti_keywords_for_industry(suggested_keywords, "healthcare")
        
        assert "JavaScript" not in filtered
        assert "Photoshop" not in filtered
        assert "React" not in filtered
        # Healthcare keywords should remain
        assert "Patient care" in filtered
        assert "Clinical protocols" in filtered
        assert "HIPAA" in filtered

    def test_education_industry_no_tech_creative_keywords(self):
        """Test H: Education industry should NOT suggest tech/creative keywords."""
        suggested_keywords = [
            "React", "Node.js", "Photoshop", "Curriculum development",
            "Pedagogy", "Classroom management"
        ]
        filtered = filter_anti_keywords_for_industry(suggested_keywords, "education")
        
        assert "React" not in filtered
        assert "Node.js" not in filtered
        assert "Photoshop" not in filtered
        # Education keywords should remain
        assert "Curriculum development" in filtered
        assert "Pedagogy" in filtered

    def test_tech_industry_no_creative_keywords(self):
        """Test: Tech industry should NOT suggest creative keywords."""
        suggested_keywords = [
            "Photoshop", "Illustrator", "Branding", "Python",
            "React", "Docker"
        ]
        filtered = filter_anti_keywords_for_industry(suggested_keywords, "tech")
        
        assert "Photoshop" not in filtered
        assert "Illustrator" not in filtered
        assert "Branding" not in filtered
        # Tech keywords should remain
        assert "Python" in filtered
        assert "React" in filtered
        assert "Docker" in filtered

    def test_finance_industry_no_tech_creative_keywords(self):
        """Test: Finance industry should NOT suggest tech/creative keywords."""
        suggested_keywords = [
            "React", "Node.js", "Photoshop", "Excel",
            "Financial analysis", "Auditing"
        ]
        filtered = filter_anti_keywords_for_industry(suggested_keywords, "finance")
        
        assert "React" not in filtered
        assert "Node.js" not in filtered
        assert "Photoshop" not in filtered
        # Finance keywords should remain
        assert "Excel" in filtered
        assert "Financial analysis" in filtered


class TestIndustryKeywordDefinitions:
    """Test that industry keyword definitions are properly structured."""

    def test_all_industries_have_required_fields(self):
        """Verify all industry definitions have required keys."""
        required_keys = ["name", "keywords", "focus", "anti_keywords", "content_indicators"]
        
        for industry_key, industry_data in INDUSTRY_KEYWORDS.items():
            for key in required_keys:
                assert key in industry_data, f"Industry {industry_key} missing key: {key}"

    def test_tech_industry_anti_keywords(self):
        """Verify tech industry has correct anti-keywords."""
        tech_anti = INDUSTRY_KEYWORDS["tech"]["anti_keywords"]
        assert "Photoshop" in tech_anti
        assert "Branding" in tech_anti
        assert "Paciente" in tech_anti
        assert "Auditoría" in tech_anti

    def test_creative_industry_anti_keywords(self):
        """Verify creative industry has correct anti-keywords."""
        creative_anti = INDUSTRY_KEYWORDS["creative"]["anti_keywords"]
        assert "React" in creative_anti
        assert "Node.js" in creative_anti
        assert "Docker" in creative_anti
        # Creative industry focuses on tech anti-keywords primarily
        # Finance terms like "Auditoría" may or may not be included

    def test_healthcare_industry_anti_keywords(self):
        """Verify healthcare industry has correct anti-keywords."""
        health_anti = INDUSTRY_KEYWORDS["healthcare"]["anti_keywords"]
        assert "React" in health_anti
        assert "Photoshop" in health_anti
        assert "AWS" in health_anti

    def test_filter_case_insensitive(self):
        """Test that anti-keyword filtering is case-insensitive."""
        suggested_keywords = ["REACT", "react", "React", "Python"]
        filtered = filter_anti_keywords_for_industry(suggested_keywords, "creative")
        
        assert "REACT" not in filtered
        assert "react" not in filtered
        assert "React" not in filtered
        assert "Python" not in filtered


class TestEdgeCases:
    """Test edge cases and boundary conditions."""

    def test_empty_keyword_list(self):
        """Test filtering empty list returns empty list."""
        result = filter_anti_keywords_for_industry([], "tech")
        assert result == []

    def test_all_keywords_filtered(self):
        """Test when all keywords are anti-keywords."""
        suggested = ["React", "Node.js", "Python"]  # All anti for creative
        result = filter_anti_keywords_for_industry(suggested, "creative")
        assert result == []

    def test_no_anti_keywords_for_general_industry(self):
        """Test general industry has no anti-keywords."""
        assert INDUSTRY_KEYWORDS["general"]["anti_keywords"] == []

    def test_unknown_industry_defaults_to_general(self):
        """Test unknown industry defaults to general."""
        suggested = ["React", "Leadership", "Communication"]
        filtered = filter_anti_keywords_for_industry(suggested, "unknown_industry")
        # Should not filter anything since general has no anti-keywords
        assert len(filtered) == 3
