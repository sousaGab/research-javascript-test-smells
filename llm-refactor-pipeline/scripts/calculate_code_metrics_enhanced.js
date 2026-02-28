#!/usr/bin/env node
/**
 * Enhanced Code Metrics Calculator with Duplicate Declaration Handling
 * 
 * Improvements over original:
 * - Pre-processing to fix duplicate variable declarations
 * - Better error recovery for LLM-generated code
 * - More detailed error reporting
 */

const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

/**
 * Remove duplicate variable declarations (common LLM generation error)
 * Strategy: Keep declaration with initialization, remove empty ones
 */
function sanitizeDuplicateDeclarations(code) {
    const lines = code.split('\n');
    const declarations = new Map(); // varName -> {lineIdx, hasInit, declType}
    const linesToRemove = new Set();
    
    // Scan for duplicate declarations
    lines.forEach((line, idx) => {
        // Match var/let/const declarations
        const match = line.match(/^\s*(let|const|var)\s+(\w+)\s*(=|;)/);
        if (match) {
            const [, declType, varName, separator] = match;
            const hasInit = separator === '=';
            
            if (declarations.has(varName)) {
                const existing = declarations.get(varName);
                
                // Strategy: Keep initialized declaration, remove empty one
                if (!existing.hasInit && hasInit) {
                    // Remove first (empty) declaration, keep current (initialized)
                    linesToRemove.add(existing.lineIdx);
                } else if (existing.hasInit && !hasInit) {
                    // Remove current (empty) declaration, keep first (initialized)
                    linesToRemove.add(idx);
                } else if (!existing.hasInit && !hasInit) {
                    // Both empty, remove second one
                    linesToRemove.add(idx);
                } else {
                    // Both initialized - keep first, remove second
                    // This is a true error but we'll try to recover
                    linesToRemove.add(idx);
                }
            } else {
                declarations.set(varName, {lineIdx: idx, hasInit, declType});
            }
        }
    });
    
    // Remove problematic lines
    if (linesToRemove.size > 0) {
        const cleanedLines = lines.map((line, idx) => 
            linesToRemove.has(idx) ? '' : line
        );
        return {
            code: cleanedLines.join('\n'),
            fixed: true,
            removedLines: Array.from(linesToRemove).map(i => ({
                line: i + 1,
                content: lines[i].trim()
            }))
        };
    }
    
    return {code, fixed: false, removedLines: []};
}

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
        return { ast: null, error: e };
    }
}

/**
 * Parse JavaScript/TypeScript code with automatic plugin detection
 */
function parseCode(code) {
    // Try TypeScript first
    let result = tryParseWithPlugins(code, [
        "jsx", "typescript", "classProperties", "objectRestSpread",
        "optionalChaining", "nullishCoalescingOperator", "decorators-legacy", "dynamicImport"
    ]);
    if (result.ast) return result;
    
    // Try Flow
    result = tryParseWithPlugins(code, [
        "jsx", "flow", "classProperties", "objectRestSpread",
        "optionalChaining", "nullishCoalescingOperator", "decorators-legacy", "dynamicImport"
    ]);
    if (result.ast) return result;
    
    // Plain JavaScript
    result = tryParseWithPlugins(code, [
        "jsx", "classProperties", "objectRestSpread",
        "optionalChaining", "nullishCoalescingOperator", "dynamicImport"
    ]);
    
    return result;
}

/**
 * Check if node is a statement (for SLOC counting)
 */
function isStatementNode(node) {
    const statementTypes = new Set([
        'ExpressionStatement', 'VariableDeclaration', 'IfStatement',
        'ForStatement', 'ForInStatement', 'ForOfStatement',
        'WhileStatement', 'DoWhileStatement', 'SwitchStatement',
        'TryStatement', 'ThrowStatement', 'ReturnStatement',
        'BreakStatement', 'ContinueStatement', 'BlockStatement',
        'FunctionDeclaration', 'ClassDeclaration'
    ]);
    return statementTypes.has(node.type);
}

/**
 * Check if node is a decision point (for cyclomatic complexity)
 */
function isDecisionPoint(node) {
    const decisionTypes = new Set([
        'IfStatement', 'ForStatement', 'ForInStatement', 'ForOfStatement',
        'WhileStatement', 'DoWhileStatement', 'SwitchCase', 'CatchClause',
        'ConditionalExpression', 'LogicalExpression'
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
 */
function calculateMaintainabilityIndex(logicalSloc, cyclomatic, halsteadVolume) {
    const normalizedVolume = Math.log(halsteadVolume || 1);
    const normalizedComplexity = Math.log(cyclomatic || 1);
    const normalizedSloc = Math.log(logicalSloc || 1);
    
    const maintainability = 171 - 5.2 * normalizedVolume - 0.23 * normalizedComplexity - 16.2 * normalizedSloc;
    
    return Math.max(0, Math.min(100, maintainability));
}

/**
 * Fallback analysis for unparseable code
 */
function analyzeCodeFallback(code, parseError) {
    const lines = code.split('\n');
    let logicalSloc = 0;
    let inMultiLineComment = false;
    
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.includes('/*')) inMultiLineComment = true;
        if (inMultiLineComment) {
            if (trimmed.includes('*/')) inMultiLineComment = false;
            continue;
        }
        if (trimmed && !trimmed.startsWith('//')) {
            logicalSloc++;
        }
    }
    
    // Approximate cyclomatic complexity
    const decisionKeywords = [
        /\bif\s*\(/g, /\belse\s+if\s*\(/g, /\bfor\s*\(/g, /\bwhile\s*\(/g,
        /\bdo\s*\{/g, /\bswitch\s*\(/g, /\bcase\s+/g, /\bcatch\s*\(/g,
        /\?[^:]*:/g, /&&/g, /\|\|/g
    ];
    
    let cyclomaticApprox = 1;
    for (const pattern of decisionKeywords) {
        const matches = code.match(pattern);
        if (matches) cyclomaticApprox += matches.length;
    }
    
    const cyclomaticDensity = logicalSloc > 0 ? (cyclomaticApprox / logicalSloc) * 100 : 0;
    
    const errorMsg = parseError.loc 
        ? `Parse error at line ${parseError.loc.line}: ${parseError.message}` 
        : `Parse error: ${parseError.message}`;
    
    return {
        error: `${errorMsg} [FALLBACK: metrics are approximate]`,
        sloc_logical: logicalSloc,
        cyclomatic_complexity: cyclomaticApprox,
        cyclomatic_density: parseFloat(cyclomaticDensity.toFixed(2)),
        halstead_effort: null,
        halstead_bugs: null,
        halstead_difficulty: null,
        halstead_volume: null,
        maintainability_index: null
    };
}

/**
 * Analyze code and compute all metrics
 */
function analyzeCode(code) {
    try {
        // ENHANCEMENT: Pre-process to fix duplicate declarations
        const sanitized = sanitizeDuplicateDeclarations(code);
        const codeToAnalyze = sanitized.code;
        
        // Parse code
        const parseResult = parseCode(codeToAnalyze);
        
        if (!parseResult.ast) {
            // Fallback analysis
            const fallback = analyzeCodeFallback(codeToAnalyze, parseResult.error);
            
            // Add sanitization info to error message
            if (sanitized.fixed) {
                fallback.error = fallback.error.replace('[FALLBACK', 
                    `[AUTO-FIXED ${sanitized.removedLines.length} duplicate declaration(s)] [FALLBACK`);
            }
            
            return fallback;
        }
        
        // Initialize metrics
        const metrics = {
            logicalSloc: 0,
            cyclomatic: 1,
            operators: new Set(),
            operands: new Set(),
            operatorCount: 0,
            operandCount: 0
        };
        
        // Traverse AST
        traverse(parseResult.ast, {
            enter(path) {
                const node = path.node;
                if (isStatementNode(node)) metrics.logicalSloc++;
                if (isDecisionPoint(node)) metrics.cyclomatic++;
                collectHalsteadMetrics(node, metrics);
            }
        });
        
        // Calculate derived metrics
        const halstead = calculateHalsteadMetrics(metrics);
        const cyclomaticDensity = metrics.logicalSloc > 0
            ? (metrics.cyclomatic / metrics.logicalSloc) * 100
            : 0;
        const maintainability = calculateMaintainabilityIndex(
            metrics.logicalSloc, metrics.cyclomatic, halstead.volume
        );
        
        const result = {
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
        
        // Add note if code was auto-fixed
        if (sanitized.fixed) {
            result.warning = `Auto-fixed ${sanitized.removedLines.length} duplicate declaration(s)`;
            result.fixed_lines = sanitized.removedLines;
        }
        
        return result;
        
    } catch (error) {
        return analyzeCodeFallback(code, error);
    }
}

/**
 * Main entry point
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
            
            console.log(JSON.stringify(results, null, 2));
            
        } catch (error) {
            console.error(JSON.stringify({ 
                error: `Failed to process input: ${error.message}` 
            }));
            process.exit(1);
        }
    });
}

main().catch(error => {
    console.error(JSON.stringify({ 
        error: `Unexpected error: ${error.message}` 
    }));
    process.exit(1);
});
