const fs = require('fs');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;

function findParentTestMethod(filePath, targetLine) {
  try {
    if (!fs.existsSync(filePath)) {
      return { error: `File not found: ${filePath}` };
    }

    const code = fs.readFileSync(filePath, 'utf-8');
    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['flow', 'jsx'],
    });

    let result = { method: 'Unknown' };

    traverse(ast, {
      CallExpression(path) {
        const { node } = path;

        if (
          node.callee.type === 'Identifier' &&
          ['it', 'test', 'describe', 'beforeEach', 'afterEach', 'beforeAll', 'afterAll', 'xit', 'fit'].includes(node.callee.name)
        ) {
          const startLine = node.loc.start.line;
          const endLine = node.loc.end.line;

          if (startLine <= targetLine && targetLine <= endLine) {
            const startPos = node.start;
            const endPos = node.end;
            const methodCode = code.substring(startPos, endPos);

            result = {
              method: methodCode,
              start: startLine,
              end: endLine
            };
          }
        }

        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.type === 'Identifier' &&
          ['it', 'test', 'describe'].includes(node.callee.object.name) &&
          ['only', 'skip'].includes(node.callee.property.name)
        ) {
          const startLine = node.loc.start.line;
          const endLine = node.loc.end.line;

          if (startLine <= targetLine && targetLine <= endLine) {
            const startPos = node.start;
            const endPos = node.end;
            const methodCode = code.substring(startPos, endPos);

            result = {
              method: methodCode,
              start: startLine,
              end: endLine
            };
          }
        }
      },
    });

    return result;
  } catch (error) {
    return { error: `Failed to parse file: ${error.message}` };
  }
}

async function processRows(rows, repositoriesPath) {
  const results = [];

  for (const row of rows) {
    const { filePath, line, repoName } = row;
    const fullPath = `${repositoriesPath}/${repoName}${filePath}`;

    try {
      const result = findParentTestMethod(fullPath, line);
      results.push({
        method: result.method || result.error || 'Unknown',
        error: result.error || null
      });
    } catch (error) {
      results.push({
        method: 'Error',
        error: error.message
      });
    }
  }

  return results;
}

async function main() {
  let inputData = '';

  process.stdin.setEncoding('utf8');

  process.stdin.on('data', (chunk) => {
    inputData += chunk;
  });

  process.stdin.on('end', async () => {
    try {
      const data = JSON.parse(inputData);
      const { rows, repositoriesPath } = data;

      const results = await processRows(rows, repositoriesPath);

      console.log(JSON.stringify(results));
    } catch (error) {
      console.error(JSON.stringify({ error: error.message }));
      process.exit(1);
    }
  });
}

main();
