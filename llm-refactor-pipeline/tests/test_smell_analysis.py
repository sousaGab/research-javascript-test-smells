"""
Unit tests for smell_analysis module.

Tests smell name normalization, CSV loading, comparison logic, and reporting.
"""

import pytest
import pandas as pd
from pathlib import Path
import json
import tempfile

from llm_refactor.modules.smell_analysis.analyzer import (
    normalize_smell_name,
    smell_names_match,
    SmellAnalyzer
)
from llm_refactor.modules.smell_analysis.report_generator import (
    save_analysis_json,
    format_analysis_summary
)


class TestSmellNameNormalization:
    """Test smell name normalization functionality."""
    
    def test_normalize_smell_name_lowercase(self):
        """Test conversion to lowercase."""
        assert normalize_smell_name("DuplicateAssert") == "duplicateassert"
        assert normalize_smell_name("DUPLICATE ASSERT") == "duplicateassert"
    
    def test_normalize_smell_name_remove_spaces(self):
        """Test removal of spaces."""
        assert normalize_smell_name("Duplicate Assert") == "duplicateassert"
        assert normalize_smell_name("Magic Number") == "magicnumber"
    
    def test_normalize_smell_name_remove_underscores(self):
        """Test removal of underscores."""
        assert normalize_smell_name("duplicate_assert") == "duplicateassert"
        assert normalize_smell_name("magic_number") == "magicnumber"
    
    def test_normalize_smell_name_remove_hyphens(self):
        """Test removal of hyphens."""
        assert normalize_smell_name("duplicate-assert") == "duplicateassert"
        assert normalize_smell_name("DUPLICATE-ASSERT") == "duplicateassert"
    
    def test_normalize_smell_name_remove_special_chars(self):
        """Test removal of special characters."""
        assert normalize_smell_name("Magic Number!") == "magicnumber"
        assert normalize_smell_name("Test@Smell#123") == "testsmell123"
    
    def test_normalize_smell_name_combined(self):
        """Test normalization with multiple variations."""
        variations = [
            "Duplicate Assert",
            "duplicate_assert",
            "DuplicateAssert",
            "DUPLICATE-ASSERT",
            "duplicate assert",
            "Duplicate_Assert"
        ]
        
        normalized = [normalize_smell_name(v) for v in variations]
        
        # All should normalize to the same value
        assert all(n == "duplicateassert" for n in normalized)
    
    def test_normalize_smell_name_empty(self):
        """Test normalization of empty string."""
        assert normalize_smell_name("") == ""
        assert normalize_smell_name("   ") == ""
    
    def test_smell_names_match(self):
        """Test smell name matching."""
        assert smell_names_match("Duplicate Assert", "duplicate_assert") is True
        assert smell_names_match("MagicNumber", "Magic Number") is True
        assert smell_names_match("DuplicateAssert", "duplicate-assert") is True
        assert smell_names_match("DuplicateAssert", "MagicNumber") is False


class TestSmellAnalyzer:
    """Test SmellAnalyzer class."""
    
    @pytest.fixture
    def sample_csv_data(self):
        """Create sample smell CSV data."""
        return pd.DataFrame([
            {
                'file': '/test/file1.spec.js',
                'type': 'DuplicateAssert',
                'line': "{'startLine': 10, 'endLine': 20}",
                'method': 'it("test 1", () => {...})',
                'methodStart': 10,
                'methodEnd': 20,
                'source': 'snuts'
            },
            {
                'file': '/test/file1.spec.js',
                'type': 'DuplicateAssert',
                'line': "{'startLine': 30, 'endLine': 40}",
                'method': 'it("test 2", () => {...})',
                'methodStart': 30,
                'methodEnd': 40,
                'source': 'snuts'
            },
            {
                'file': '/test/file2.spec.js',
                'type': 'Magic Number',
                'line': "{'startLine': 50, 'endLine': 60}",
                'method': 'it("test 3", () => {...})',
                'methodStart': 50,
                'methodEnd': 60,
                'source': 'steel'
            }
        ])
    
    @pytest.fixture
    def temp_csv_file(self, sample_csv_data):
        """Create temporary CSV file."""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
            sample_csv_data.to_csv(f, index=False)
            temp_path = Path(f.name)
        
        yield temp_path
        
        # Cleanup
        if temp_path.exists():
            temp_path.unlink()
    
    def test_load_smell_csv_success(self, temp_csv_file):
        """Test successful CSV loading."""
        analyzer = SmellAnalyzer()
        df = analyzer.load_smell_csv(temp_csv_file)
        
        assert df is not None
        assert 'normalized_type' in df.columns
        assert len(df) == 3
    
    def test_load_smell_csv_nonexistent(self):
        """Test loading non-existent CSV."""
        analyzer = SmellAnalyzer()
        df = analyzer.load_smell_csv(Path('/nonexistent/file.csv'))
        
        assert df is None
    
    def test_count_by_type(self, sample_csv_data):
        """Test counting smells by type."""
        analyzer = SmellAnalyzer()
        
        # Add normalized column
        sample_csv_data['normalized_type'] = sample_csv_data['type'].apply(normalize_smell_name)
        
        counts = analyzer.count_by_type(sample_csv_data, use_normalized=True)
        
        assert counts['duplicateassert'] == 2
        assert counts['magicnumber'] == 1
    
    def test_count_by_file_and_type(self, sample_csv_data):
        """Test counting smells by file and type."""
        analyzer = SmellAnalyzer()
        
        # Add normalized column
        sample_csv_data['normalized_type'] = sample_csv_data['type'].apply(normalize_smell_name)
        
        counts = analyzer.count_by_file_and_type(sample_csv_data, use_normalized=True)
        
        assert counts[('/test/file1.spec.js', 'duplicateassert')] == 2
        assert counts[('/test/file2.spec.js', 'magicnumber')] == 1
    
    def test_compare_repositories_target_removed(self):
        """Test comparison when target smell is removed."""
        analyzer = SmellAnalyzer()
        
        # Baseline: 3 DuplicateAssert
        baseline = pd.DataFrame([
            {'file': '/test/file.js', 'type': 'DuplicateAssert', 'line': '{"startLine": 10}', 
             'method': 'test1', 'methodStart': 10, 'methodEnd': 20, 'source': 'snuts'},
            {'file': '/test/file.js', 'type': 'DuplicateAssert', 'line': '{"startLine": 30}',
             'method': 'test2', 'methodStart': 30, 'methodEnd': 40, 'source': 'snuts'},
            {'file': '/test/file.js', 'type': 'DuplicateAssert', 'line': '{"startLine": 50}',
             'method': 'test3', 'methodStart': 50, 'methodEnd': 60, 'source': 'snuts'},
        ])
        baseline['normalized_type'] = baseline['type'].apply(normalize_smell_name)
        
        # Refactored: 1 DuplicateAssert (2 removed)
        refactored = pd.DataFrame([
            {'file': '/test/file.js', 'type': 'Duplicate Assert', 'line': '{"startLine": 10}',
             'method': 'test1', 'methodStart': 10, 'methodEnd': 20, 'source': 'snuts'},
        ])
        refactored['normalized_type'] = refactored['type'].apply(normalize_smell_name)
        
        result = analyzer.compare_repositories(
            baseline_df=baseline,
            refactored_df=refactored,
            target_file='/test/file.js',
            target_smell='DuplicateAssert'
        )
        
        assert result['summary']['target_smell_removed'] is True
        assert result['target_smell_analysis']['original_count_in_file'] == 3
        assert result['target_smell_analysis']['refactored_count_in_file'] == 1
        assert result['target_smell_analysis']['reduction_count'] == 2
    
    def test_compare_repositories_new_smells_introduced(self):
        """Test comparison when new smells are introduced."""
        analyzer = SmellAnalyzer()
        
        # Baseline: 2 DuplicateAssert
        baseline = pd.DataFrame([
            {'file': '/test/file.js', 'type': 'DuplicateAssert', 'line': '{"startLine": 10}',
             'method': 'test1', 'methodStart': 10, 'methodEnd': 20, 'source': 'snuts'},
            {'file': '/test/file.js', 'type': 'DuplicateAssert', 'line': '{"startLine": 30}',
             'method': 'test2', 'methodStart': 30, 'methodEnd': 40, 'source': 'snuts'},
        ])
        baseline['normalized_type'] = baseline['type'].apply(normalize_smell_name)
        
        # Refactored: 1 DuplicateAssert + 2 MagicNumber (new smell introduced)
        refactored = pd.DataFrame([
            {'file': '/test/file.js', 'type': 'DuplicateAssert', 'line': '{"startLine": 10}',
             'method': 'test1', 'methodStart': 10, 'methodEnd': 20, 'source': 'snuts'},
            {'file': '/test/file.js', 'type': 'Magic Number', 'line': '{"startLine": 30}',
             'method': 'test2', 'methodStart': 30, 'methodEnd': 40, 'source': 'steel'},
            {'file': '/test/file.js', 'type': 'MagicNumber', 'line': '{"startLine': 50}',
             'method': 'test3', 'methodStart': 50, 'methodEnd': 60, 'source': 'steel'},
        ])
        refactored['normalized_type'] = refactored['type'].apply(normalize_smell_name)
        
        result = analyzer.compare_repositories(
            baseline_df=baseline,
            refactored_df=refactored,
            target_file='/test/file.js',
            target_smell='DuplicateAssert'
        )
        
        assert result['summary']['target_smell_removed'] is True
        assert result['summary']['introduced_new_smells'] is True
        
        # Check that MagicNumber was introduced
        increased = result['repository_wide_changes']['smells_increased']
        assert len(increased) == 1
        assert increased[0]['type_normalized'] == 'magicnumber'
        assert increased[0]['diff'] == 2
    
    def test_compare_repositories_with_name_variants(self):
        """Test that name variants are properly matched."""
        analyzer = SmellAnalyzer()
        
        # Baseline: "DuplicateAssert"
        baseline = pd.DataFrame([
            {'file': '/test/file.js', 'type': 'DuplicateAssert', 'line': '{"startLine": 10}',
             'method': 'test1', 'methodStart': 10, 'methodEnd': 20, 'source': 'snuts'},
        ])
        baseline['normalized_type'] = baseline['type'].apply(normalize_smell_name)
        
        # Refactored: "Duplicate Assert" (with space)
        refactored = pd.DataFrame([
            {'file': '/test/file.js', 'type': 'Duplicate Assert', 'line': '{"startLine": 10}',
             'method': 'test1', 'methodStart': 10, 'methodEnd': 20, 'source': 'snuts'},
        ])
        refactored['normalized_type'] = refactored['type'].apply(normalize_smell_name)
        
        result = analyzer.compare_repositories(
            baseline_df=baseline,
            refactored_df=refactored,
            target_file='/test/file.js',
            target_smell='duplicate_assert'  # Another variant
        )
        
        # Should recognize as the same smell (not removed, count stayed same)
        assert result['target_smell_analysis']['original_count_in_file'] == 1
        assert result['target_smell_analysis']['refactored_count_in_file'] == 1
        assert result['target_smell_analysis']['removed'] is False
        
        # Verify normalization info includes variants
        variants = result['normalization_info']['target_smell_variants_found']
        assert 'DuplicateAssert' in variants or 'Duplicate Assert' in variants


class TestReportGenerator:
    """Test report generation functionality."""
    
    @pytest.fixture
    def sample_analysis(self):
        """Create sample analysis results."""
        return {
            'target_smell_analysis': {
                'smell_type_original': 'Duplicate Assert',
                'smell_type_normalized': 'duplicateassert',
                'target_file': '/test/file.spec.js',
                'original_count_in_file': 5,
                'refactored_count_in_file': 2,
                'removed': True,
                'reduction_count': 3
            },
            'repository_wide_changes': {
                'smells_reduced': [
                    {'type': 'Duplicate Assert', 'type_normalized': 'duplicateassert', 
                     'before': 10, 'after': 5, 'diff': -5}
                ],
                'smells_increased': [
                    {'type': 'Magic Number', 'type_normalized': 'magicnumber',
                     'before': 3, 'after': 6, 'diff': 3}
                ]
            },
            'summary': {
                'target_smell_removed': True,
                'introduced_new_smells': True,
                'total_smell_count_before': 50,
                'total_smell_count_after': 48,
                'net_change': -2,
                'types_reduced': 1,
                'types_increased': 1
            },
            'normalization_info': {
                'note': 'Smell names normalized for comparison',
                'target_smell_variants_found': ['Duplicate Assert', 'DuplicateAssert']
            }
        }
    
    def test_save_analysis_json_success(self, sample_analysis):
        """Test successful JSON saving."""
        with tempfile.TemporaryDirectory() as tmpdir:
            output_path = Path(tmpdir) / "analysis.json"
            
            success = save_analysis_json(
                analysis_data=sample_analysis,
                output_path=output_path,
                experiment_metadata={'experiment_id': 1}
            )
            
            assert success is True
            assert output_path.exists()
            
            # Verify JSON content
            with open(output_path) as f:
                data = json.load(f)
            
            assert 'metadata' in data
            assert data['metadata']['experiment_id'] == 1
            assert 'target_smell_analysis' in data
            assert data['summary']['target_smell_removed'] is True
    
    def test_format_analysis_summary(self, sample_analysis):
        """Test formatting analysis as text summary."""
        summary = format_analysis_summary(sample_analysis)
        
        assert "TARGET SMELL ANALYSIS:" in summary
        assert "Duplicate Assert" in summary
        assert "REPOSITORY-WIDE IMPACT:" in summary
        assert "Total smells before: 50" in summary
        assert "Total smells after: 48" in summary


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
