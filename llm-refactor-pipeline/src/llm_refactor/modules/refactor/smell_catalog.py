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
    EXCEPTION_HANDLING: {
        "definition": (
            "The Exception Handling test smell occurs when a test method uses manual exception handling constructs "
            "such as try/catch blocks or explicit throw statements to verify that a production method throws an exception, "
            "instead of using the testing framework's built‑in assertions for exception verification."
        ),
        "consequences": (
            "Manual exception handling introduces unnecessary complexity, obscures test intent, and couples the test logic "
            "with control‑flow mechanisms. This reduces readability and maintainability, and can lead to false positives "
            "if the throw statement is reached unexpectedly."
        ),
        "detection": (
            "Detection identifies the presence of try/catch blocks or throw statements within test functions. "
            "In JavaScript, this includes TryStatement and ThrowStatement nodes in the abstract syntax tree of test methods."
        ),
        "examples": [
            {
                "smelly": """
                    it('should reject invalid email format', async () => {
                        const user = new User();
                        try {
                            await user.setEmail('not-an-email');
                            throw new Error('Expected validation error');
                        } catch (error) {
                            expect(error.message).toContain('Invalid email format');
                        }
                    });
                """,
                "refactored": """
                    it('should reject invalid email format', async () => {
                        const user = new User();
                        await expect(user.setEmail('not-an-email')).rejects.toThrow('Invalid email format');
                    });
                """
            },
            {
                "smelly": """
                    it('should throw error for division by zero', () => {
                        const calculator = new Calculator();
                        try {
                            calculator.divide(10, 0);
                            throw new Error('Expected division by zero error');
                        } catch (error) {
                            expect(error.message).toBe('Cannot divide by zero');
                        }
                    });
                """,
                "refactored": """
                    it('should throw error for division by zero', () => {
                        const calculator = new Calculator();
                        expect(() => calculator.divide(10, 0)).toThrow('Cannot divide by zero');
                    });
                """
            }
        ],
        "refactoring_strategies": [
            "Replace manual try/catch and throw constructs with framework‑specific declarative assertions.",
            "In Jest, use rejects.toThrow for promises and toThrow for synchronous functions.",
            "In JUnit, use assertThrows; in pytest, use pytest.raises."
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
        "examples": [
            {
            "smelly": """
                it('sends notification', async () => {
                  user.updateProfile({ name: 'John' });
                  await new Promise(r => setTimeout(r, 2000));
                  expect(notification.sent).toHaveBeenCalled();
                });
            """,
            "refactored": """
                it('sends notification', async () => {
                  const promise = waitForNotification();
                  user.updateProfile({ name: 'John' });
                  await promise;
                  expect(notification.sent).toHaveBeenCalled();
                });
            """
            },
            {
            "smelly": """
                test('updates user status after async job', async () => {
                    startBackgroundJob();
                
                    // waits blindly for the job to finish
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    
                    const user = getUserById(1);
                    expect(user.status).toBe('updated');
                });
            """,
            "refactored": """
                test('updates user status after async job completion', async () => {
                    await startBackgroundJobAndWait();
                
                    const user = getUserById(1);
                    expect(user.status).toBe('updated');
                });
            """
            },
        ],
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
        "examples": [
            {
            "smelly": """
                it('validates order', () => {
                    expect(order.isValid()).toBe(true);
                });
            """,
            "refactored": """
                it('validates order with items and payment', () => {
                    expect(order.items.length).toBeGreaterThan(0);
                    expect(order.paymentStatus).toBe('PAID');
                });
            """
            },
            {
            "smelly": """
                test('user is valid', () => {
                  const user = getUser();
                  expect(user).toBeTruthy();
                });
            """,
            "refactored": """
                test('user has a valid id', () => {
                  const user = getUser();
                  expect(user.id).toBeDefined();
                });
            """
            },
        ],
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
        "examples": [
            {
            "smelly": """
                it('updates user profile', async () => {
                    await user.updateProfile({ name: 'John' });
                }); 
            """,
            "refactored": """
                it('updates user profile', async () => {
                    await user.updateProfile({ name: 'John' });
                    const updated = await User.findById(user.id);
                    expect(updated.name).toBe('John');
                });
            """
            },
            {
            "smelly": """
                test('test1', () => {
                    const total = calculateTotal([10, 20]);
                    expect(total).toBe(30);
                });
            """,
            "refactored": """
                test('calculates total price for a list of item values', () => {
                    const total = calculateTotal([10, 20]);
                    expect(total).toBe(30);
                });
            """
            },
        ],
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
        "examples": [
            {
            "smelly": """
                it('should process order correctly', async () => {
                    // Setup - multiple objects and configurations
                    const product1 = new Product('P001', 'Laptop', 1299.99);
                    const product2 = new Product('P002', 'Mouse', 29.99);
                    const customer = new Customer('C001', 'john@example.com');
                    const address = new Address('123 Main St', 'New York', '10001');
                    const payment = new Payment('credit_card', '4242424242424242');
                    
                    // Action - multiple operations
                    const order = new Order('ORD-001', customer, address);
                    order.addItem(product1, 1);
                    order.addItem(product2, 2);
                    order.applyDiscount('SUMMER2026', 0.1);
                    await order.calculateTax('NY');
                    await order.processPayment(payment);
                    await inventory.reserve(order);
                    await notification.send(order, customer);
                    
                    // Assertions - multiple verifications
                    expect(order.subtotal).toBe(1359.97);
                    expect(order.discount).toBe(135.99);
                    expect(order.tax).toBe(97.58);
                    expect(order.total).toBe(1321.56);
                    expect(order.status).toBe('PAID');
                    expect(inventory.isReserved(product1.id)).toBe(true);
                    expect(inventory.isReserved(product2.id)).toBe(true);
                    expect(notification.sent).toHaveBeenCalledWith(
                    customer.email,
                    'order_confirmation'
                    );
                });
            """,
            "refactored": """
                describe('Order processing', () => {
                    let product1, product2, customer, address;
                    
                    beforeEach(() => {
                        product1 = new Product('P001', 'Laptop', 1299.99);
                        product2 = new Product('P002', 'Mouse', 29.99);
                        customer = new Customer('C001', 'john@example.com');
                        address = new Address('123 Main St', 'New York', '10001');
                    });
                    
                    it('calculates subtotal correctly for multiple items', () => {
                        const order = new Order('ORD-001', customer, address);
                        order.addItem(product1, 1);
                        order.addItem(product2, 2);
                        
                        expect(order.subtotal).toBe(1359.97);
                    });
                    
                    it('applies percentage discount to subtotal', () => {
                        const order = new Order('ORD-001', customer, address);
                        order.addItem(product1, 1);
                        order.addItem(product2, 2);
                        order.applyDiscount('SUMMER2026', 0.1);
                        
                        expect(order.discount).toBe(135.99);
                        expect(order.total).toBe(1321.56);
                    });
                    
                    it('calculates tax based on jurisdiction', async () => {
                        const order = new Order('ORD-001', customer, address);
                        order.addItem(product1, 1);
                        order.addItem(product2, 2);
                        
                        await order.calculateTax('NY');
                        
                        expect(order.tax).toBeCloseTo(97.58, 2);
                    });
                    
                    it('reserves inventory items after successful payment', async () => {
                        const order = new Order('ORD-001', customer, address);
                        order.addItem(product1, 1);
                        order.addItem(product2, 2);
                        
                        await order.processPayment(new Payment('credit_card'));
                        
                        expect(inventory.isReserved(product1.id)).toBe(true);
                        expect(inventory.isReserved(product2.id)).toBe(true);
                    });
                });
            """
            },
            {
            "smelly": """
                it('should register a new user successfully', async () => {
                    // Setup test data
                    const userData = {
                        email: 'test@example.com',
                        password: 'SecurePass123',
                        name: 'John Doe',
                        age: 30
                    };
                        
                    // Step 1: Validate input
                    const validationResult = validateUserInput(userData);
                    expect(validationResult.isValid).toBe(true);
                    expect(validationResult.errors).toHaveLength(0);
                    
                    // Step 2: Hash password
                    const hashedPassword = await bcrypt.hash(userData.password, 10);
                    expect(hashedPassword).not.toBe(userData.password);
                    
                    // Step 3: Save user to database
                    const user = await User.create({ ...userData, password: hashedPassword });
                    expect(user.id).toBeDefined();
                    expect(user.email).toBe(userData.email);
                    expect(user.createdAt).toBeInstanceOf(Date);
                    
                    // Step 4: Send welcome email
                    const emailSent = await emailService.sendWelcomeEmail(user.email, user.name);
                    expect(emailSent).toBe(true);
                    
                    // Step 5: Log registration event
                    const log = await logger.getLastEntry();
                    expect(log.type).toBe('USER_REGISTRATION');
                    expect(log.userId).toBe(user.id);
                });
            """,
            "refactored": """
                describe('User registration', () => {
                    const validUserData = {
                        email: 'test@example.com',
                        password: 'SecurePass123',
                        name: 'John Doe',
                        age: 30
                    };

                    it('validates correct user input', () => {
                        const validationResult = validateUserInput(validUserData);
                        expect(validationResult.isValid).toBe(true);
                        expect(validationResult.errors).toHaveLength(0);
                    });

                    it('hashes the password before storing', async () => {
                        const hashedPassword = await bcrypt.hash(validUserData.password, 10);
                        expect(hashedPassword).not.toBe(validUserData.password);
                        // Additional verification that bcrypt was called correctly can be done via spies
                    });

                    it('creates a user record in the database', async () => {
                        // Mock dependencies if needed (e.g., bcrypt) to isolate database logic
                        const user = await User.create(validUserData);
                        expect(user.id).toBeDefined();
                        expect(user.email).toBe(validUserData.email);
                        expect(user.createdAt).toBeInstanceOf(Date);
                    });

                    it('sends a welcome email after successful registration', async () => {
                        const user = await User.create(validUserData);
                        const emailSent = await emailService.sendWelcomeEmail(user.email, user.name);
                        expect(emailSent).toBe(true);
                    });

                    it('logs the registration event', async () => {
                        const user = await User.create(validUserData);
                        // Ensure logger is cleared before test or use a spy
                        const log = await logger.getLastEntry();
                        expect(log.type).toBe('USER_REGISTRATION');
                        expect(log.userId).toBe(user.id);
                    });
                });
            """
            },
        ],
        "refactoring_strategies": [
            "Decompose large tests into smaller focused ones",
            "Apply Extract Method to setup and assertions",
            "Ensure each test validates a single behavior"
        ]
    }
}