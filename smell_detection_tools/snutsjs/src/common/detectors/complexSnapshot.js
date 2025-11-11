import traverse from "@babel/traverse";
const traverseDefault =
  typeof traverse === "function" ? traverse : traverse.default;

const MAX_LINES_IN_SNAPSHOT = 50;

const isComplexSnapshot = ({ loc } = { loc: {} }) =>
  loc?.end?.line - loc?.start?.line > MAX_LINES_IN_SNAPSHOT;
const isExternalSnapshot = ({ expression }) =>
  expression.type === "AssignmentExpression" &&
  expression.left.type === "MemberExpression" &&
  expression.left.property.type === "TemplateLiteral";

const isInlineSnapshot = ({ expression }) =>
  expression?.callee?.property?.name === "toMatchInlineSnapshot";

const traverseAst = (ast) => {
  const complexSnapshots = [];
  traverseDefault(ast, {
    ExpressionStatement: ({ node }) => {
      if (isExternalSnapshot(node)) {
        if (isComplexSnapshot(node?.expression?.right?.quasis?.[0])) {
          complexSnapshots.push({
            startLine: node.loc.start.line,
            endLine: node.loc.end.line,
          });
        }
      } else if (isInlineSnapshot(node)) {
        if (isComplexSnapshot(node.expression.arguments[0]?.quasis?.[0])) {
          complexSnapshots.push({
            startLine: node.loc.start.line,
            endLine: node.loc.end.line,
          });
        }
      }
    },
  });
  return complexSnapshots;
};

const detectComplexSnapshots = (ast, additionalFilesAst = []) => {
  let results = [];
  const complexSnapshotsInTest = traverseAst(ast);
  const complexSnapshotsInAdditionalFiles = additionalFilesAst
    .map(traverseAst)
    .filter((smellsList) => smellsList.length > 0);
  results = results.concat(
    ...complexSnapshotsInTest,
    ...complexSnapshotsInAdditionalFiles
  );
  return results;
};

export default detectComplexSnapshots;
