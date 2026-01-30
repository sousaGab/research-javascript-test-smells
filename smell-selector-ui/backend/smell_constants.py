"""
Test Smell Constants for JavaScript Test Smell Research.

This module provides:
- Canonical test smell names
- Detection tool names
- Smell descriptions and refactoring guidance
- Complete smell catalog from detection results

Based on test_smell_constants.py from tools/hugging_face/
"""

# =============================================================================
# DETECTION TOOLS
# =============================================================================

TOOL_SNUTSJS = "SNUTSJS"
TOOL_STEEL = "Steel"

DETECTION_TOOLS = [TOOL_SNUTSJS, TOOL_STEEL]


# =============================================================================
# PRIMARY RESEARCH SMELLS (From test_smell_constants.py)
# =============================================================================

# These are the 10 main smells used in refactoring experiments
ASSERTION_ROULETTE = "Assertion Roulette"
DUPLICATE_ASSERT = "Duplicate Assert"
MAGIC_NUMBER = "Magic Number"
LAZY_TEST = "Lazy Test"
REDUNDANT_PRINT = "Redundant Print"
SUBOPTIMAL_ASSERTION = "Suboptimal Assertion"
CONDITIONAL_TEST_LOGIC = "Conditional Test Logic"
OVERCOMMITTED_TEST = "Overcommitted Test"
TEST_WITHOUT_DESCRIPTION = "Test Without Description"
SENSITIVE_EQUALITY = "Sensitive Equality"

PRIMARY_SMELLS = [
    ASSERTION_ROULETTE,
    DUPLICATE_ASSERT,
    MAGIC_NUMBER,
    LAZY_TEST,
    REDUNDANT_PRINT,
    SUBOPTIMAL_ASSERTION,
    CONDITIONAL_TEST_LOGIC,
    OVERCOMMITTED_TEST,
    TEST_WITHOUT_DESCRIPTION,
    SENSITIVE_EQUALITY,
]


# =============================================================================
# ALL DETECTED SMELLS (From actual detection results)
# =============================================================================

# Steel and SNUTSJS detect these additional smells
ANONYMOUS_TEST = "AnonymousTest"
COMMENTS_ONLY_TEST = "CommentsOnlyTest"
EAGER_TEST = "Eager Test"
EXCEPTION_HANDLING = "Exception Handling"
GENERAL_FIXTURE = "GeneralFixture"
GLOBAL_VARIABLE = "Global Variable"
IDENTICAL_TEST_DESCRIPTION = "IdenticalTestDescription"
IGNORED_TEST = "Ignored Test"
MYSTERY_GUEST = "Mystery Guest"
NON_FUNCTIONAL_STATEMENT = "NonFunctionalStatement"
OVERCOMMENTED_TEST = "OvercommentedTest"
REDUNDANT_ASSERTION = "Redundant Assertion"
SLEEPY_TEST = "Sleepy Test"
SUBOPTIMAL_ASSERT = "SubOptimalAssert"
TRANSCRIPTING_TEST = "TranscriptingTest"
UNKNOWN_TEST = "Unknown Test"
VERBOSE_STATEMENT = "VerboseStatement"

# All smells detected by tools (including aliases and variations)
ALL_DETECTED_SMELLS = [
    # Primary research smells
    ASSERTION_ROULETTE,
    DUPLICATE_ASSERT,
    MAGIC_NUMBER,
    LAZY_TEST,
    REDUNDANT_PRINT,
    SUBOPTIMAL_ASSERTION,
    CONDITIONAL_TEST_LOGIC,
    OVERCOMMITTED_TEST,
    TEST_WITHOUT_DESCRIPTION,
    SENSITIVE_EQUALITY,

    # Additional detected smells
    ANONYMOUS_TEST,
    COMMENTS_ONLY_TEST,
    "ConditionalTestLogic",  # Variation
    EAGER_TEST,
    EXCEPTION_HANDLING,
    GENERAL_FIXTURE,
    GLOBAL_VARIABLE,
    IDENTICAL_TEST_DESCRIPTION,
    IGNORED_TEST,
    MYSTERY_GUEST,
    NON_FUNCTIONAL_STATEMENT,
    OVERCOMMENTED_TEST,
    REDUNDANT_ASSERTION,
    SLEEPY_TEST,
    SUBOPTIMAL_ASSERT,
    TRANSCRIPTING_TEST,
    UNKNOWN_TEST,
    VERBOSE_STATEMENT,
]


# =============================================================================
# SMELL DESCRIPTIONS (Primary Research Smells)
# =============================================================================

smell_descriptions = {
    ASSERTION_ROULETTE: (
        "Assertion Roulette occurs when a test case contains multiple assertions "
        "without explicit information about which assertion failed or what condition "
        "was violated, reducing diagnostic clarity."
    ),
    DUPLICATE_ASSERT: (
        "Duplicate Assert occurs when a test contains multiple assertions that verify "
        "the same or semantically equivalent condition, introducing redundancy without "
        "added diagnostic value."
    ),
    MAGIC_NUMBER: (
        "Magic Number occurs when numeric or literal values with implicit meaning are "
        "directly embedded in test code without explanatory context, obscuring test intent."
    ),
    LAZY_TEST: (
        "Lazy Test occurs when test cases exercise the same fixture but perform minimal "
        "or trivial verification, providing limited confidence in system correctness."
    ),
    REDUNDANT_PRINT: (
        "Redundant Print occurs when unnecessary logging or print statements remain in "
        "test code after debugging, adding noise and reducing clarity."
    ),
    SUBOPTIMAL_ASSERTION: (
        "Suboptimal Assertion occurs when tests use generic or low-level assertions "
        "(e.g., boolean checks) instead of expressive, domain-specific verifications, "
        "reducing diagnostic power."
    ),
    CONDITIONAL_TEST_LOGIC: (
        "Conditional Test Logic occurs when test cases contain control flow constructs "
        "(if/else, loops), making test behavior non-deterministic and obscuring intent."
    ),
    OVERCOMMITTED_TEST: (
        "Overcommitted Test occurs when a test contains excessive inline comments that "
        "restate code logic, adding noise and reducing readability."
    ),
    TEST_WITHOUT_DESCRIPTION: (
        "Test Without Description occurs when test names are vague, generic, or absent, "
        "failing to document the behavior being verified."
    ),
    SENSITIVE_EQUALITY: (
        "Sensitive Equality occurs when tests rely on fragile equality checks "
        "(e.g., JSON.stringify, toString) that are sensitive to irrelevant representation "
        "details rather than semantic behavior."
    ),
}


# =============================================================================
# REFACTORING GUIDANCE (Primary Research Smells)
# =============================================================================

refactoring_guidance = {
    ASSERTION_ROULETTE: (
        "Split multi-assertion tests into separate test cases, each focusing on one condition. "
        "Use descriptive test names and, if needed, custom assertion messages. In Jest, use "
        "multiple it() blocks or structured matchers to isolate assertions."
    ),
    DUPLICATE_ASSERT: (
        "Consolidate duplicate assertions into a single, representative check. Use helper "
        "functions or custom matchers for repeated logic. Remove redundant expect() calls "
        "and ensure each assertion is distinct and meaningful."
    ),
    MAGIC_NUMBER: (
        "Replace hard-coded literals with named constants or variables that explicitly convey "
        "intent. Use const declarations with descriptive names to improve readability and "
        "maintainability."
    ),
    LAZY_TEST: (
        "Strengthen tests with meaningful assertions that verify specific behaviors. Merge "
        "redundant tests or enrich them with domain-relevant checks. Use focused it() blocks "
        "or parameterized tests to avoid fixture reuse without value."
    ),
    REDUNDANT_PRINT: (
        "Remove console.log and other diagnostic output statements from finalized tests. "
        "Express verification intent through assertions only. Use custom matchers or assertion "
        "messages for better failure diagnostics."
    ),
    SUBOPTIMAL_ASSERTION: (
        "Replace generic assertions with explicit checks of relevant properties or outcomes. "
        "Use matchers that capture domain semantics. Avoid truthy/falsy or simple equality "
        "checks when behavior-specific assertions are available."
    ),
    CONDITIONAL_TEST_LOGIC: (
        "Eliminate conditional logic by splitting the test into multiple focused test cases, "
        "each verifying a single scenario. Use separate it() blocks for each condition and "
        "avoid branching inside tests."
    ),
    OVERCOMMITTED_TEST: (
        "Remove redundant comments. Improve test and function names to convey intent. Use "
        "beforeEach hooks and helper functions for complex setup. Reserve comments only for "
        "non-obvious rationale."
    ),
    TEST_WITHOUT_DESCRIPTION: (
        "Rename tests to explicitly describe the scenario, action, and expected outcome. "
        "Use descriptive strings in it() and describe() blocks. Ensure test names serve as "
        "lightweight documentation."
    ),
    SENSITIVE_EQUALITY: (
        "Replace serialized or full-object comparisons with assertions on specific, behaviorally "
        "relevant properties. Compare only meaningful fields and avoid dependencies on property "
        "order or formatting."
    ),
}


# =============================================================================
# STRUCTURED SMELL CATALOG
# =============================================================================

test_smells_catalog = [
    {
        "id": 1,
        "name": ASSERTION_ROULETTE,
        "description": smell_descriptions[ASSERTION_ROULETTE],
        "refactoring_guidance": refactoring_guidance[ASSERTION_ROULETTE],
        "severity": "high",
    },
    {
        "id": 2,
        "name": DUPLICATE_ASSERT,
        "description": smell_descriptions[DUPLICATE_ASSERT],
        "refactoring_guidance": refactoring_guidance[DUPLICATE_ASSERT],
        "severity": "medium",
    },
    {
        "id": 3,
        "name": MAGIC_NUMBER,
        "description": smell_descriptions[MAGIC_NUMBER],
        "refactoring_guidance": refactoring_guidance[MAGIC_NUMBER],
        "severity": "low",
    },
    {
        "id": 4,
        "name": LAZY_TEST,
        "description": smell_descriptions[LAZY_TEST],
        "refactoring_guidance": refactoring_guidance[LAZY_TEST],
        "severity": "high",
    },
    {
        "id": 5,
        "name": REDUNDANT_PRINT,
        "description": smell_descriptions[REDUNDANT_PRINT],
        "refactoring_guidance": refactoring_guidance[REDUNDANT_PRINT],
        "severity": "low",
    },
    {
        "id": 6,
        "name": SUBOPTIMAL_ASSERTION,
        "description": smell_descriptions[SUBOPTIMAL_ASSERTION],
        "refactoring_guidance": refactoring_guidance[SUBOPTIMAL_ASSERTION],
        "severity": "medium",
    },
    {
        "id": 7,
        "name": CONDITIONAL_TEST_LOGIC,
        "description": smell_descriptions[CONDITIONAL_TEST_LOGIC],
        "refactoring_guidance": refactoring_guidance[CONDITIONAL_TEST_LOGIC],
        "severity": "high",
    },
    {
        "id": 8,
        "name": OVERCOMMITTED_TEST,
        "description": smell_descriptions[OVERCOMMITTED_TEST],
        "refactoring_guidance": refactoring_guidance[OVERCOMMITTED_TEST],
        "severity": "low",
    },
    {
        "id": 9,
        "name": TEST_WITHOUT_DESCRIPTION,
        "description": smell_descriptions[TEST_WITHOUT_DESCRIPTION],
        "refactoring_guidance": refactoring_guidance[TEST_WITHOUT_DESCRIPTION],
        "severity": "medium",
    },
    {
        "id": 10,
        "name": SENSITIVE_EQUALITY,
        "description": smell_descriptions[SENSITIVE_EQUALITY],
        "refactoring_guidance": refactoring_guidance[SENSITIVE_EQUALITY],
        "severity": "medium",
    },
]


# =============================================================================
# SMELL MAPPINGS AND ALIASES
# =============================================================================

# Map detected smell names to canonical names (for normalization)
SMELL_NAME_MAPPING = {
    # Canonical names (identity mapping)
    ASSERTION_ROULETTE: ASSERTION_ROULETTE,
    DUPLICATE_ASSERT: DUPLICATE_ASSERT,
    MAGIC_NUMBER: MAGIC_NUMBER,
    LAZY_TEST: LAZY_TEST,
    REDUNDANT_PRINT: REDUNDANT_PRINT,
    SUBOPTIMAL_ASSERTION: SUBOPTIMAL_ASSERTION,
    CONDITIONAL_TEST_LOGIC: CONDITIONAL_TEST_LOGIC,
    OVERCOMMITTED_TEST: OVERCOMMITTED_TEST,
    TEST_WITHOUT_DESCRIPTION: TEST_WITHOUT_DESCRIPTION,
    SENSITIVE_EQUALITY: SENSITIVE_EQUALITY,

    # Aliases and variations
    "ConditionalTestLogic": CONDITIONAL_TEST_LOGIC,
    "SubOptimalAssert": SUBOPTIMAL_ASSERTION,
    "OvercommentedTest": OVERCOMMITTED_TEST,
}


def normalize_smell_name(smell_name: str) -> str:
    """
    Normalize a detected smell name to canonical form.

    Args:
        smell_name: Raw smell name from detection tool

    Returns:
        Canonical smell name, or original if no mapping exists

    Examples:
        >>> normalize_smell_name("ConditionalTestLogic")
        "Conditional Test Logic"
        >>> normalize_smell_name("SubOptimalAssert")
        "Suboptimal Assertion"
    """
    return SMELL_NAME_MAPPING.get(smell_name, smell_name)


def get_smell_info(smell_name: str) -> dict:
    """
    Get description and refactoring guidance for a smell.

    Args:
        smell_name: Canonical smell name

    Returns:
        Dictionary with 'description' and 'refactoring_guidance' keys,
        or empty dict if smell not found

    Examples:
        >>> info = get_smell_info(MAGIC_NUMBER)
        >>> print(info['description'])
        'Magic Number occurs when...'
    """
    if smell_name in smell_descriptions:
        return {
            "description": smell_descriptions[smell_name],
            "refactoring_guidance": refactoring_guidance[smell_name],
        }
    return {}


def is_primary_research_smell(smell_name: str) -> bool:
    """
    Check if smell is one of the 10 primary research smells.

    Args:
        smell_name: Smell name to check

    Returns:
        True if primary research smell, False otherwise
    """
    normalized = normalize_smell_name(smell_name)
    return normalized in PRIMARY_SMELLS
