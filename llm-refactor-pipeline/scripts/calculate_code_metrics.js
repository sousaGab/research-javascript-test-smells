#!/usr/bin/env node
/**
 * Code Metrics Calculator
 * 
 * Computes AST-based code complexity metrics for JavaScript/TypeScript code snippets.
 * Uses Babel parser and traverse to calculate:
 * - SLOC (logical lines of code)
 * - Cyclomatic complexity
 * - Halstead metrics (effort, bugs, difficulty, volume)
 * - Maintainability Index
 * 
 * Input: JSON via stdin with array of {id, code} objects
 * Output: JSON array with metrics or error per item
 * 
 * Usage:
 *   echo '[{"id":1,"code":"function test() {...}"}]' | node calculate_code_metrics.js
 */

const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

/**
 * Try parsing code with specific Babel plugin configuration
 */
function tryParseWithPlugins(code, plugins) {
    try {
        return {
            ast: parser.parse(code, {
                sourceType: "module",
                plugins,
                errorRecovery: true,
                allowUndeclaredExports: true,
                allowReturnOutsideFunction: true
            }),
            error: null
        };
    } catch (e) {
        // Return error object, don't throw
        return { ast: null, error: e };
    }
}

/**
 * Parse JavaScript/TypeScript code with automatic plugin detection
 */
function parseCode(code) {
    // Try TypeScript first (most common in test files)
    let result = tryParseWithPlugins(code, [
        "jsx",
        "typescript",
        "classProperties",
        "objectRestSpread",
        "optionalChaining",
        "nullishCoalescingOperator",
        "decorators-legacy",
        "dynamicImport"
    ]);
    
    if (result.ast) {
        return result;
    }
    
    // If TypeScript fails, try Flow
    result = tryParseWithPlugins(code, [
        "jsx",
        "flow",
        "classProperties",
        "objectRestSpread",
        "optionalChaining",
        "nullishCoalescingOperator",
        "decorators-legacy",
        "dynamicImport"
    ]);
    
    if (result.ast) {
        return result;
    }
    
    // Last resort: plain JavaScript
    result = tryParseWithPlugins(code, [
        "jsx",
        "classProperties",
        "objectRestSpread",
        "optionalChaining",
        "nullishCoalescingOperator",
        "dynamicImport"
    ]);
    
    return result;
}

/**
 * Check if node is a statement (for SLOC counting)
 */
function isStatementNode(node) {
    const statementTypes = new Set([
        'ExpressionStatement',
        'VariableDeclaration',
        'IfStatement',
        'ForStatement',
        'ForInStatement',
        'ForOfStatement',
        'WhileStatement',
        'DoWhileStatement',
        'SwitchStatement',
        'TryStatement',
        'ThrowStatement',
        'ReturnStatement',
        'BreakStatement',
        'ContinueStatement',
        'BlockStatement',
        'FunctionDeclaration',
        'ClassDeclaration'
    ]);
    return statementTypes.has(node.type);
}

/**
 * Check if node is a decision point (for cyclomatic complexity)
 */
function isDecisionPoint(node) {
    const decisionTypes = new Set([
        'IfStatement',
        'ForStatement',
        'ForInStatement',
        'ForOfStatement',
        'WhileStatement',
        'DoWhileStatement',
        'SwitchCase',
        'CatchClause',
        'ConditionalExpression',
        'LogicalExpression'
    ]);
    return decisionTypes.has(node.type);
}

/**
 * Collect Halstead metrics during AST traversal
 */
function collectHalsteadMetrics(node, metrics) {
    switch (node.type) {
        case 'BinaryExpression':
        case 'LogicalExpression':
        case 'UnaryExpression':
        case 'AssignmentExpression':
        case 'UpdateExpression':
            metrics.operators.add(node.operator);
            metrics.operatorCount++;
            break;
        case 'Identifier':
            // Skip identifiers that are part of declarations
            metrics.operands.add(node.name);
            metrics.operandCount++;
            break;
        case 'Literal':
        case 'StringLiteral':
        case 'NumericLiteral':
        case 'BooleanLiteral':
            if (node.value !== undefined && node.value !== null) {
                metrics.operands.add(String(node.value));
                metrics.operandCount++;
            }
            break;
        case 'CallExpression':
            metrics.operators.add('()');
            metrics.operatorCount++;
            break;
        case 'MemberExpression':
            metrics.operators.add('.');
            metrics.operatorCount++;
            break;
    }
}

/**
 * Calculate Halstead metrics from collected data
 */
function calculateHalsteadMetrics(metrics) {
    const distinctOperators = metrics.operators.size;
    const distinctOperands = metrics.operands.size;
    const totalOperators = metrics.operatorCount;
    const totalOperands = metrics.operandCount;
    
    const vocabulary = distinctOperators + distinctOperands;
    const length = totalOperators + totalOperands;
    const volume = length * Math.log2(vocabulary || 1);
    const difficulty = (distinctOperators / 2) * (totalOperands / (distinctOperands || 1));
    const effort = difficulty * volume;
    const bugs = Math.pow(volume, 2/3) / 3000;
    
    return {
        effort: isFinite(effort) ? effort : 0,
        bugs: isFinite(bugs) ? bugs : 0,
        difficulty: isFinite(difficulty) ? difficulty : 0,
        volume: isFinite(volume) ? volume : 0
    };
}

/**
 * Calculate Maintainability Index
 * Based on SEI formula: MI = 171 - 5.2*ln(V) - 0.23*ln(G) - 16.2*ln(L)
 * Where V = Halstead Volume, G = Cyclomatic Complexity, L = SLOC
 */
function calculateMaintainabilityIndex(logicalSloc, cyclomatic, halsteadVolume) {
    const normalizedVolume = Math.log(halsteadVolume || 1);
    const normalizedComplexity = Math.log(cyclomatic || 1);
    const normalizedSloc = Math.log(logicalSloc || 1);
    
    const maintainability = 171 - 5.2 * normalizedVolume - 0.23 * normalizedComplexity - 16.2 * normalizedSloc;
    
    // Clamp to 0-100 range
    return Math.max(0, Math.min(100, maintainability));
}

/**
 * Fallback analysis for unparseable code using text-based heuristics
 */
function analyzeCodeFallback(code, parseError) {
    // Count logical SLOC (non-empty, non-comment lines)
    const lines = code.split('\n');
    let logicalSloc = 0;
    let inMultiLineComment = false;
    
    for (const line of lines) {
        const trimmed = line.trim();
        
        // Handle multi-line comments
        if (trimmed.includes('/*')) inMultiLineComment = true;
        if (inMultiLineComment) {
            if (trimmed.includes('*/')) inMultiLineComment = false;
            continue;
        }
        
        // Skip empty lines and single-line comments
        if (trimmed && !trimmed.startsWith('//')) {
            logicalSloc++;
        }
    }
    
    // Approximate cyclomatic complexity by counting decision keywords
    const decisionKeywords = [
        /\bif\s*\(/g,
        /\belse\s+if\s*\(/g,
        /\bfor\s*\(/g,
        /\bwhile\s*\(/g,
        /\bdo\s*\{/g,
        /\bswitch\s*\(/g,
        /\bcase\s+/g,
        /\bcatch\s*\(/g,
        /\?[^:]*:/g,  // Ternary operators
        /&&/g,
        /\|\|/g
    ];
    
    let cyclomaticApprox = 1; // Base complexity
    for (const pattern of decisionKeywords) {
        const matches = code.match(pattern);
        if (matches) {
            cyclomaticApprox += matches.length;
        }
    }
    
    const cyclomaticDensity = logicalSloc > 0
        ? (cyclomaticApprox / logicalSloc) * 100
        : 0;
    
    // Return metrics with warning that they're approximate
    const errorMsg = parseError.loc 
        ? `Parse error at line ${parseError.loc.line}: ${parseError.message}` 
        : `Parse error: ${parseError.message}`;
    
    return {
        error: `${errorMsg} [FALLBACK: metrics are approximate]`,
        sloc_logical: logicalSloc,
        cyclomatic_complexity: cyclomaticApprox,
        cyclomatic_density: parseFloat(cyclomaticDensity.toFixed(2)),
        halstead_effort: null,  // Cannot compute without AST
        halstead_bugs: null,
        halstead_difficulty: null,
        halstead_volume: null,
        maintainability_index: null  // Cannot compute without Halstead
    };
}

/**
 * Analyze code and compute all metrics
 */
function analyzeCode(code) {
    try {
        // Parse code
        const parseResult = parseCode(code);
        
        if (!parseResult.ast) {
            // Use fallback analysis for unparseable code
            return analyzeCodeFallback(code, parseResult.error);
        }
        
        // Initialize metrics collection
        const metrics = {
            logicalSloc: 0,
            cyclomatic: 1, // Base complexity is 1
            operators: new Set(),
            operands: new Set(),
            operatorCount: 0,
            operandCount: 0
        };
        
        // Traverse AST and collect metrics
        traverse(parseResult.ast, {
            enter(path) {
                const node = path.node;
                
                // Count logical SLOC
                if (isStatementNode(node)) {
                    metrics.logicalSloc++;
                }
                
                // Count decision points for cyclomatic complexity
                if (isDecisionPoint(node)) {
                    metrics.cyclomatic++;
                }
                
                // Collect Halstead metrics
                collectHalsteadMetrics(node, metrics);
            }
        });
        
        // Calculate derived metrics
        const halstead = calculateHalsteadMetrics(metrics);
        const cyclomaticDensity = metrics.logicalSloc > 0
            ? (metrics.cyclomatic / metrics.logicalSloc) * 100
            : 0;
        const maintainability = calculateMaintainabilityIndex(
            metrics.logicalSloc,
            metrics.cyclomatic,
            halstead.volume
        );
        
        return {
            error: null,
            sloc_logical: metrics.logicalSloc,
            cyclomatic_complexity: metrics.cyclomatic,
            cyclomatic_density: parseFloat(cyclomaticDensity.toFixed(2)),
            halstead_effort: parseFloat(halstead.effort.toFixed(2)),
            halstead_bugs: parseFloat(halstead.bugs.toFixed(4)),
            halstead_difficulty: parseFloat(halstead.difficulty.toFixed(2)),
            halstead_volume: parseFloat(halstead.volume.toFixed(2)),
            maintainability_index: parseFloat(maintainability.toFixed(2))
        };
    } catch (error) {
        // If anything goes wrong, use fallback analysis
        return analyzeCodeFallback(code, error);
    }
}

/**
 * Main entry point - process stdin JSON
 */
async function main() {
    let inputData = '';
    
    process.stdin.setEncoding('utf8');
    
    process.stdin.on('data', (chunk) => {
        inputData += chunk;
    });
    
    process.stdin.on('end', () => {
        try {
            const items = JSON.parse(inputData);
            
            if (!Array.isArray(items)) {
                console.error(JSON.stringify({ 
                    error: 'Input must be a JSON array of {id, code} objects' 
                }));
                process.exit(1);
            }
            
            // Process each item (wrap in try-catch to isolate failures)
            const results = items.map(item => {
                try {
                    if (!item.code) {
                        return {
                            id: item.id,
                            error: 'Missing code field',
                            sloc_logical: null,
                            cyclomatic_complexity: null,
                            cyclomatic_density: null,
                            halstead_effort: null,
                            halstead_bugs: null,
                            halstead_difficulty: null,
                            halstead_volume: null,
                            maintainability_index: null
                        };
                    }
                    
                    const metrics = analyzeCode(item.code);
                    return {
                        id: item.id,
                        ...metrics
                    };
                } catch (error) {
                    // Isolate individual item failures - don't stop the batch
                    return {
                        id: item.id,
                        error: `Failed to analyze code: ${error.message}`,
                        sloc_logical: null,
                        cyclomatic_complexity: null,
                        cyclomatic_density: null,
                        halstead_effort: null,
                        halstead_bugs: null,
                        halstead_difficulty: null,
                        halstead_volume: null,
                        maintainability_index: null
                    };
                }
            });
            
            // Output results as JSON
            console.log(JSON.stringify(results, null, 2));
            
        } catch (error) {
            console.error(JSON.stringify({ 
                error: `Failed to process input: ${error.message}` 
            }));
            process.exit(1);
        }
    });
}

// Run main
main().catch(error => {
    console.error(JSON.stringify({ 
        error: `Unexpected error: ${error.message}` 
    }));
    process.exit(1);
});
