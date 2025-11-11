import traverse from "@babel/traverse";
const traverseDefault =
  typeof traverse === "function" ? traverse : traverse.default;

const detectNonFunctionalStatement = (ast) => {
  const smells = [];
  traverseDefault(ast, {
    BlockStatement(path) {
      const { loc } = path.node;
      if (path.node.body.length === 0) {
        const isMissingComment = !(
          path.node.leadingComments ||
          path.node.trailingComments ||
          path.node.innerComments
        );
        if (isMissingComment) {
          smells.push({
            startLine: loc.start.line,
            endLine: loc.end.line,
          });
        }
      }
    },
  });
  return smells;
};

export default detectNonFunctionalStatement;
