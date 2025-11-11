import traverse from "@babel/traverse";
import astService from "../../services/ast.service.js";
const traverseDefault =
  typeof traverse === "function" ? traverse : traverse.default;

const countComments = (node) => {
  const commentsSet = new Set(); // Use a set to avoid duplicates

  traverseDefault(node, {
    noScope: true, // Prevents creation of new scope
    enter(path) {
      if (path.node.leadingComments) {
        path.node.leadingComments.forEach((comment) => {
          commentsSet.add(comment.value.trim());
        });
      }
      if (path.node.trailingComments) {
        path.node.trailingComments.forEach((comment) => {
          commentsSet.add(comment.value.trim());
        });
      }
      if (path.node.innerComments) {
        path.node.innerComments.forEach((comment) => {
          commentsSet.add(comment.value.trim());
        });
      }
    },
  });
  return commentsSet.size; // Return the size of the set
};

const hasManyComments = (node, threshold) => {
  return countComments(node) > threshold;
};

const detectOvercommentedTest = (ast) => {
  const overcommentedTestSmells = [];
  traverseDefault(ast, {
    CallExpression(path) {
      const { arguments: args, loc } = path.node;
      if (args.length >= 2) {
        if (
          astService.isTestCase(path.node) &&
          astService.isFunction(args[1]) &&
          hasManyComments(args[1], 5) // Check if the test function has more than 5 comments
        ) {
          overcommentedTestSmells.push({
            startLine: loc.start.line,
            endLine: loc.end.line,
          });
        }
      }
    },
  });
  return overcommentedTestSmells;
};

export default detectOvercommentedTest;
