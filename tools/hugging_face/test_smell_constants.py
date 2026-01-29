# Test smell names as variables
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

# Test smell definitions and refactoring guidance for JavaScript
smell_descriptions = {
    ASSERTION_ROULETTE: "Assertion Roulette occurs when a test case contains multiple assertions without explicit information about which assertion failed or what condition was violated, reducing diagnostic clarity.",
    DUPLICATE_ASSERT: "Duplate Assert occurs when a test contains multiple assertions that verify the same or semantically equivalent condition, introducing redundancy without added diagnostic value.",
    MAGIC_NUMBER: "Magic Numbicer occurs when numeric or literal values with implicit meaning are directly embedded in test code without explanatory context, obscuring test intent.",
    LAZY_TEST: "Lazy Test occurs when test cases exercise the same fixture but perform minimal or trivial verification, providing limited confidence in system correctness.",
    REDUNDANT_PRINT: "Redundant Print occurs when unnecessary logging or print statements remain in test code after debugging, adding noise and reducing clarity.",
    SUBOPTIMAL_ASSERTION: "Suboptimal Assertion occurs when tests use generic or low-level assertions (e.g., boolean checks) instead of expressive, domain-specific verifications, reducing diagnostic power.",
    CONDITIONAL_TEST_LOGIC: "Conditional Test Logic occurs when test cases contain control flow constructs (if/else, loops), making test behavior non-deterministic and obscuring intent.",
    OVERCOMMITTED_TEST: "Overcommitted Test occurs when a test contains excessive inline comments that restate code logic, adding noise and reducing readability.",
    TEST_WITHOUT_DESCRIPTION: "Test Without Description occurs when test names are vague, generic, or absent, failing to document the behavior being verified.",
    SENSITIVE_EQUALITY: "Sensitive Equality occurs when tests rely on fragile equality checks (e.g., JSON.stringify, toString) that are sensitive to irrelevant representation details rather than semantic behavior."
}

refactoring_guidance = {
    ASSERTION_ROULETTE: "Split multi-assertion tests into separate test cases, each focusing on one condition. Use descriptive test names and, if needed, custom assertion messages. In Jest, use multiple it() blocks or structured matchers to isolate assertions.",
    DUPLICATE_ASSERT: "Consolidate duplicate assertions into a single, representative check. Use helper functions or custom matchers for repeated logic. Remove redundant expect() calls and ensure each assertion is distinct and meaningful.",
    MAGIC_NUMBER: "Replace hard-coded literals with named constants or variables that explicitly convey intent. Use const declarations with descriptive names to improve readability and maintainability.",
    LAZY_TEST: "Strengthen tests with meaningful assertions that verify specific behaviors. Merge redundant tests or enrich them with domain-relevant checks. Use focused it() blocks or parameterized tests to avoid fixture reuse without value.",
    REDUNDANT_PRINT: "Remove console.log and other diagnostic output statements from finalized tests. Express verification intent through assertions only. Use custom matchers or assertion messages for better failure diagnostics.",
    SUBOPTIMAL_ASSERTION: "Replace generic assertions with explicit checks of relevant properties or outcomes. Use matchers that capture domain semantics. Avoid truthy/falsy or simple equality checks when behavior-specific assertions are available.",
    CONDITIONAL_TEST_LOGIC: "Eliminate conditional logic by splitting the test into multiple focused test cases, each verifying a single scenario. Use separate it() blocks for each condition and avoid branching inside tests.",
    OVERCOMMITTED_TEST: "Remove redundant comments. Improve test and function names to convey intent. Use beforeEach hooks and helper functions for complex setup. Reserve comments only for non-obvious rationale.",
    TEST_WITHOUT_DESCRIPTION: "Rename tests to explicitly describe the scenario, action, and expected outcome. Use descriptive strings in it() and describe() blocks. Ensure test names serve as lightweight documentation.",
    SENSITIVE_EQUALITY: "Replace serialized or full-object comparisons with assertions on specific, behaviorally relevant properties. Compare only meaningful fields and avoid dependencies on property order or formatting."
}

# You can also store them in a list of dictionaries for easier iteration
test_smells_list = [
    {
        "id": 1,
        "name": ASSERTION_ROULETTE,
        "smell_description": smell_descriptions[ASSERTION_ROULETTE],
        "refactoring_guidance": refactoring_guidance[ASSERTION_ROULETTE]
    },
    {
        "id": 2,
        "name": DUPLICATE_ASSERT,
        "smell_description": smell_descriptions[DUPLICATE_ASSERT],
        "refactoring_guidance": refactoring_guidance[DUPLICATE_ASSERT]
    },
    {
        "id": 3,
        "name": MAGIC_NUMBER,
        "smell_description": smell_descriptions[MAGIC_NUMBER],
        "refactoring_guidance": refactoring_guidance[MAGIC_NUMBER]
    },
    {
        "id": 4,
        "name": LAZY_TEST,
        "smell_description": smell_descriptions[LAZY_TEST],
        "refactoring_guidance": refactoring_guidance[LAZY_TEST]
    },
    {
        "id": 5,
        "name": REDUNDANT_PRINT,
        "smell_description": smell_descriptions[REDUNDANT_PRINT],
        "refactoring_guidance": refactoring_guidance[REDUNDANT_PRINT]
    },
    {
        "id": 6,
        "name": SUBOPTIMAL_ASSERTION,
        "smell_description": smell_descriptions[SUBOPTIMAL_ASSERTION],
        "refactoring_guidance": refactoring_guidance[SUBOPTIMAL_ASSERTION]
    },
    {
        "id": 7,
        "name": CONDITIONAL_TEST_LOGIC,
        "smell_description": smell_descriptions[CONDITIONAL_TEST_LOGIC],
        "refactoring_guidance": refactoring_guidance[CONDITIONAL_TEST_LOGIC]
    },
    {
        "id": 8,
        "name": OVERCOMMITTED_TEST,
        "smell_description": smell_descriptions[OVERCOMMITTED_TEST],
        "refactoring_guidance": refactoring_guidance[OVERCOMMITTED_TEST]
    },
    {
        "id": 9,
        "name": TEST_WITHOUT_DESCRIPTION,
        "smell_description": smell_descriptions[TEST_WITHOUT_DESCRIPTION],
        "refactoring_guidance": refactoring_guidance[TEST_WITHOUT_DESCRIPTION]
    },
    {
        "id": 10,
        "name": SENSITIVE_EQUALITY,
        "smell_description": smell_descriptions[SENSITIVE_EQUALITY],
        "refactoring_guidance": refactoring_guidance[SENSITIVE_EQUALITY]
    }
]
