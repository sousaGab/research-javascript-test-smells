import { useMemo } from 'react';
import './CodeViewer.css';

export function CodeViewer({ lineNumbers, codeSnippet }) {
  const { startLine, endLine, lines } = useMemo(() => {
    // Parse line numbers from JSON
    let start = 1;
    let end = 1;

    if (lineNumbers) {
      try {
        const parsed = JSON.parse(lineNumbers);
        if (parsed.startLine !== undefined) {
          start = parsed.startLine;
        }
        if (parsed.endLine !== undefined) {
          end = parsed.endLine;
        }
      } catch (e) {
        console.error('Failed to parse line numbers:', e);
      }
    }

    // Split code snippet into lines
    const codeLines = codeSnippet ? codeSnippet.split('\n') : [];

    // Create array of line objects with line number and content
    const linesWithNumbers = codeLines.map((content, index) => ({
      lineNumber: start + index,
      content: content || ' ', // Use space for empty lines to maintain structure
    }));

    return {
      startLine: start,
      endLine: end,
      lines: linesWithNumbers,
    };
  }, [lineNumbers, codeSnippet]);

  if (!codeSnippet || lines.length === 0) {
    return (
      <div className="code-viewer-empty">
        <p>No code snippet available</p>
      </div>
    );
  }

  return (
    <div className="code-viewer">
      <div className="code-viewer-header">
        <h3>Code Snippet</h3>
        <span className="code-viewer-range">
          Lines {startLine}-{Math.max(endLine, startLine + lines.length - 1)}
        </span>
      </div>
      <div className="code-viewer-content">
        <div className="code-viewer-lines">
          {lines.map((line) => (
            <div key={line.lineNumber} className="code-line">
              <span className="line-number">{line.lineNumber}</span>
              <span className="line-content">{line.content}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
