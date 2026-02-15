# This file defines a comprehensive catalog of JavaScript test smells
# derived from the academic catalog:
#
# The structure is designed to support LLM-driven refactoring using
# Chain-of-Thought (CoT) prompting, while keeping reasoning implicit.
#
# Each smell includes:
# - name
# - definition (what the smell is)
# - consequences (contextual, optional for prompts)
# - detection (informational / tooling-oriented)
# - example (smelly JavaScript test)
# - refactored_example (clean version)
# - refactoring_strategies (prompt-oriented operational guidance)


ANONYMOUS_TEST = "Anonymous Test"
CONDITIONAL_TEST_LOGIC = "Conditional Test Logic"
DUPLICATE_ASSERT = "Duplicate Assert"
EXCEPTION_HANDLING = "Exception Handling"
MAGIC_NUMBER = "Magic Number"
OVERCOMMENTED_TEST = "Overcommented Test"
SLEEPY_TEST = "Sleepy Test"
SUBOPTIMAL_ASSERTION = "Suboptimal Assertion"
UNKNOWN_TEST = "Unknown Test"
VERBOSE_TEST = "Verbose Test"


TEST_SMELL_CATALOG = {
    ANONYMOUS_TEST: {
        "definition": (
            "Occurs when a test case is assigned a vague or generic name that fails "
            "to clearly describe the behavior under test, its conditions, or the "
            "expected outcome, making the test intent unclear."
        ),
        "consequences": (
            "Reduces readability and maintainability by weakening tests as executable "
            "documentation and forcing developers to inspect implementation details "
            "to infer intent."
        ),
        "detection": (
            "Identified by analyzing test names for low semantic content, overly generic "
            "phrases, or insufficient descriptive information in it(), test(), or describe() blocks."
        ),
        "examples": [
            {
                "smelly":"""
                    it('should handle date', () => {
                        const event = new Event({ start: '2026-02-12' });
                        const formatted = event.formatDate();
                        expect(formatted).toBe('February 12, 2026');
                    });
                    """,
                "refactored": """
                    it('formats ISO date string to month day, year format', () => {
                        const event = new Event({ start: '2026-02-12' });
                        const formatted = event.formatDate();
                        expect(formatted).toBe('February 12, 2026');
                    });
                    """,
            },
            {
                "smelly": """
                    test('should work', () => {
                        const result = sum(2, 3);
                        expect(result).toBe(5);
                    });
                    """,
                "refactored": """
                    test('returns the correct sum when adding two positive numbers', () => {
                        const result = sum(2, 3);
                        expect(result).toBe(5);
                    });
                    """
            }
        ],
        "refactoring_strategies": [
            "Rename tests to explicitly describe scenario, action, and expected outcome",
            "Ensure test names act as lightweight executable documentation",
            "Avoid generic verbs such as 'handle', 'work', or 'process' without context"
        ]
    },

    CONDITIONAL_TEST_LOGIC: {
        "definition": (
            "Occurs when a test case contains control-flow constructs such as conditionals "
            "or loops, causing the test to assert different outcomes depending on runtime conditions "
            "instead of expressing a single deterministic expectation."
        ),
        "consequences": (
            "Obscures test intent, reduces diagnosability, and increases maintenance effort due "
            "to multiple behavioral paths hidden within a single test."
        ),
        "detection": (
            "Detected by identifying if/else statements, switch blocks, or loops inside test bodies."
        ),
        "examples": [ 
            {
            "smelly": """
                it('should process user status correctly', () => {
                    const status = getUserStatus(user);
                    if (status === 'active') {
                        expect(user.isEnabled).toBe(true);
                    } else {
                        expect(user.isEnabled).toBe(false);
                    }
                });
            """,
            "refactored": """
                it('enables user when status is active', () => {
                    const user = createUserWithStatus('active');
                    expect(user.isEnabled).toBe(true);
                });

                it('disables user when status is inactive', () => {
                    const user = createUserWithStatus('inactive');
                    expect(user.isEnabled).toBe(false);
                });
            """
            },
            {
            "smelly": """
                test('handles user status', () => {
                    const user = getUser();
                    if (user.isActive) {
                        expect(user.role).toBe('member');
                    }
                });
            """,
            "refactored": """
                test('assigns member role to active users', () => {
                    const user = { isActive: true, role: 'member' };
                    expect(user.role).toBe('member');
                });
            """
            },
        ],
        "refactoring_strategies": [
            "Remove branching logic from tests",
            "Split conditional scenarios into separate focused test cases",
            "Ensure each test asserts a single fixed outcome"
        ]
    },
    DUPLICATE_ASSERT: {
        "definition": (
            "Occurs when a test contains multiple assertions that verify the same or "
            "semantically equivalent condition, introducing redundancy without improving fault detection."
        ),
        "consequences": (
            "Increases test size and maintenance cost while reducing readability and diagnosability."
        ),
        "detection": (
            "Detected by identifying repeated or semantically equivalent assertions within the same test."
        ),
        "examples": [ 
            {
            "smelly": """
                it('validates user name', () => {
                    expect(user.name).toBe('John');
                    expect(user.name).toEqual('John');
                });
            """,
            "refactored": """
                it('validates user name', () => {
                    expect(user.name).toBe('John');
                });
            """
            },
            {
            "smelly": """
                test('validates response status', () => {
                    expect(response.status).toBe(200);
                    expect(response.status).toBe(200);
                });
            """,
            "refactored": """
                test('returns HTTP 200 status', () => {
                    expect(response.status).toBe(200);
                });
            """
            },
        ],
        "refactoring_strategies": [
            "Remove redundant assertions",
            "Keep a single representative assertion per condition",
            "Extract shared checks into helper functions when reused across tests"
        ]
    },

    MAGIC_NUMBER: {
        "definition": (
            "Occurs when literal values with implicit meaning are embedded directly in test code, "
            "obscuring intent and making tests harder to understand or maintain."
        ),
        "consequences": (
            "Reduces readability and increases the risk of errors when expected values change."
        ),
        "detection": (
            "Detected by identifying hard-coded numeric or string literals used in assertions or setup."
        ),
        "examples": [ 
            {
            "smelly": """
                it('calculates discount', () => {
                expect(calculateDiscount(200)).toBe(20);
            });
            """,
            "refactored": """
                const ORIGINAL_PRICE = 200;
                const EXPECTED_DISCOUNT = 20;

                it('calculates discount', () => {
                    expect(calculateDiscount(ORIGINAL_PRICE)).toBe(EXPECTED_DISCOUNT);
                });
            """
            },
            {
            "smelly": """
                test('applies discount', () => {
                    expect(applyDiscount(100)).toBe(90);
                });
            """,
            "refactored": """
                const DISCOUNTED_PRICE = 90;

                test('applies 10 percent discount', () => {
                    expect(applyDiscount(100)).toBe(DISCOUNTED_PRICE);
                });
            """
            },
        ],
        "refactoring_strategies": [
            "Replace magic literals with named constants",
            "Use descriptive variable names to convey intent",
            "Avoid unexplained numeric values in assertions"
        ]
    },

    OVERCOMMENTED_TEST: {
        "definition": (
            "Occurs when a test contains excessive comments that restate obvious code behavior, "
            "adding noise instead of meaningful explanation."
        ),
        "consequences": (
            "Increases cognitive load and risks comment-code divergence as tests evolve."
        ),
        "detection": (
            "Detected by disproportionate comment density relative to assertions and logic."
        ),
        "examples": [ 
            {
            "smelly": """
                it('adds two numbers', () => {
                    // create calculator
                    const calc = new Calculator();
                    // define numbers
                    const a = 5;
                    const b = 10;
                    // perform addition
                    const result = calc.add(a, b);
                    // check result
                    expect(result).toBe(15);
                });
            """,
            "refactored": """
                it('adds two numbers', () => {
                    const calc = new Calculator();
                    const result = calc.add(5, 10);
                    expect(result).toBe(15);
                });
            """
            },
            {
            "smelly": """
                test('creates user', () => {
                    // create a user
                    const user = createUser();
                    // user should exist
                    expect(user).toBeDefined();
                });
            """,
            "refactored": """
                test('creates a new user successfully', () => {
                    const user = createUser();
                    expect(user).toBeDefined();
                });
            """
            },
        ],
        "refactoring_strategies": [
            "Remove redundant comments",
            "Rely on expressive naming and structure",
            "Reserve comments only for non-obvious rationale"
        ]
    },

    SLEEPY_TEST: {
        "definition": (
            "Occurs when a test relies on fixed time delays to wait for asynchronous behavior, "
            "making tests slow and non-deterministic."
        ),
        "consequences": (
            "Introduces flakiness and unnecessarily increases test execution time."
        ),
        "detection": (
            "Detected by identifying explicit sleep calls or setTimeout-based delays in tests."
        ),
        "example": """
        it('sends notification', async () => {
          user.updateProfile({ name: 'John' });
          await new Promise(r => setTimeout(r, 2000));
          expect(notification.sent).toHaveBeenCalled();
        });
        """,
        "refactored_example": """
        it('sends notification', async () => {
          const promise = waitForNotification();
          user.updateProfile({ name: 'John' });
          await promise;
          expect(notification.sent).toHaveBeenCalled();
        });
        """,
        "refactoring_strategies": [
            "Eliminate fixed delays",
            "Synchronize on events or promises",
            "Use fake timers when appropriate"
        ]
    },

    SUBOPTIMAL_ASSERTION: {
        "definition": (
            "Occurs when tests use generic or low-level assertions instead of expressive, "
            "domain-relevant checks, reducing diagnostic power."
        ),
        "consequences": (
            "Leads to vague failure messages and weaker behavioral specifications."
        ),
        "detection": (
            "Detected by identifying overly generic assertions such as truthy/falsy checks or broad equality comparisons."
        ),
        "example": """
        it('validates order', () => {
          expect(order.isValid()).toBe(true);
        });
        """,
        "refactored_example": """
        it('validates order with items and payment', () => {
          expect(order.items.length).toBeGreaterThan(0);
          expect(order.paymentStatus).toBe('PAID');
        });
        """,
        "refactoring_strategies": [
            "Replace generic assertions with behavior-specific checks",
            "Assert on relevant properties and outcomes",
            "Prefer expressive matchers"
        ]
    },

    UNKNOWN_TEST: {
        "definition": (
            "Occurs when a test contains no assertions, passing regardless of system behavior as long as no exception is thrown."
        ),
        "consequences": (
            "Provides false confidence and fails to validate system correctness."
        ),
        "detection": (
            "Detected by identifying test cases without any assertion statements."
        ),
        "example": """
        it('updates user profile', async () => {
          await user.updateProfile({ name: 'John' });
        });
        """,
        "refactored_example": """
        it('updates user profile', async () => {
          await user.updateProfile({ name: 'John' });
          const updated = await User.findById(user.id);
          expect(updated.name).toBe('John');
        });
        """,
        "refactoring_strategies": [
            "Introduce explicit assertions",
            "Verify observable state or side effects",
            "Ensure the test validates intended behavior"
        ]
    },

    VERBOSE_TEST: {
        "definition": (
            "Occurs when a test method contains an excessive number of statements relative to a single testing objective, "
            "aggregating multiple responsibilities and obscuring intent."
        ),
        "consequences": (
            "Reduces readability, maintainability, and fault localization effectiveness."
        ),
        "detection": (
            "Detected using size-based metrics such as line count or number of statements in test functions."
        ),
        "example": """
        it('processes order', async () => {
          // long setup, execution, and assertions
        });
        """,
        "refactored_example": """
        it('calculates order subtotal', () => {
          expect(order.subtotal).toBe(1359.97);
        });
        """,
        "refactoring_strategies": [
            "Decompose large tests into smaller focused ones",
            "Apply Extract Method to setup and assertions",
            "Ensure each test validates a single behavior"
        ]
    }
}


---

### Suboptimal Assertion — Additional Example

**Smelly Example:**
```javascript
test('user is valid', () => {
  const user = getUser();
  expect(user).toBeTruthy();
});
```

**Refactored Example:**
```javascript
test('user has a valid id', () => {
  const user = getUser();
  expect(user.id).toBeDefined();
});
```

---

### Verbose Test — Additional Example

**Smelly Example:**
```javascript
test('processes order', () => {
  const order = createOrder();
  expect(order.items.length).toBeGreaterThan(0);
  expect(order.total).toBeGreaterThan(0);
  expect(order.status).toBe('processed');
});
```

**Refactored Example:**
```javascript
test('marks order as processed', () => {
  const order = createOrder();
  expect(order.status).toBe('processed');
});
```

---

### Sensitive Equality — Additional Example

**Smelly Example:**
```javascript
test('matches user object', () => {
  expect(JSON.stringify(user)).toBe(JSON.stringify(expectedUser));
});
```

**Refactored Example:**
```javascript
test('matches relevant user fields', () => {
  expect(user.id).toBe(expectedUser.id);
  expect(user.email).toBe(expectedUser.email);
});
```

---

### Redundant Print — Additional Example

**Smelly Example:**
```javascript
test('calculates total', () => {
  console.log(total);
  expect(total).toBe(42);
});
```

**Refactored Example:**
```javascript
test('calculates total correctly', () => {
  expect(total).toBe(42);
});
```

---

### Lazy Test — Additional Example

**Smelly Example:**
```javascript
test('runs without crashing', () => {
  initialize();
});
```

**Refactored Example:**
```javascript
test('initializes system state correctly', () => {
  const state = initialize();
  expect(state.isReady).toBe(true);
});
```
