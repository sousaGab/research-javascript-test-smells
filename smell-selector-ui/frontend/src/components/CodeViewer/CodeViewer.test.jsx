import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CodeViewer } from './CodeViewer';

describe('CodeViewer Component', () => {
  describe('Line Numbers from snippet_start_line', () => {
    it('should display line numbers starting from snippetStartLine', () => {
      const codeSnippet = `test('should work', () => {
  expect(1 + 1).toBe(2);
  expect(true).toBe(true);
});`;

      const { container } = render(
        <CodeViewer
          lineNumbers='{"startLine":52,"endLine":55}'
          codeSnippet={codeSnippet}
          snippetStartLine={45}
          snippetEndLine={60}
        />
      );

      // Check that line numbers start from 45
      const lineNumbers = container.querySelectorAll('.line-number');

      expect(lineNumbers[0].textContent).toBe('45');
      expect(lineNumbers[1].textContent).toBe('46');
      expect(lineNumbers[2].textContent).toBe('47');
      expect(lineNumbers[3].textContent).toBe('48');
    });

    it('should show correct range in header', () => {
      const codeSnippet = `test('foo', () => {});`;

      render(
        <CodeViewer
          lineNumbers='{"startLine":52,"endLine":55}'
          codeSnippet={codeSnippet}
          snippetStartLine={45}
          snippetEndLine={48}
        />
      );

      // Header should show the correct range
      expect(screen.getByText(/Lines 45-48/)).toBeInTheDocument();
    });

    it('should fallback to line_numbers if snippetStartLine not provided', () => {
      const codeSnippet = `test('fallback', () => {});`;

      const { container } = render(
        <CodeViewer
          lineNumbers='{"startLine":100,"endLine":105}'
          codeSnippet={codeSnippet}
          snippetStartLine={null}
          snippetEndLine={null}
        />
      );

      // Should use startLine from line_numbers (100)
      const lineNumbers = container.querySelectorAll('.line-number');
      expect(lineNumbers[0].textContent).toBe('100');
    });

    it('should start from 1 if no line information provided', () => {
      const codeSnippet = `test('default', () => {});`;

      const { container } = render(
        <CodeViewer
          lineNumbers={null}
          codeSnippet={codeSnippet}
          snippetStartLine={null}
          snippetEndLine={null}
        />
      );

      // Should default to line 1
      const lineNumbers = container.querySelectorAll('.line-number');
      expect(lineNumbers[0].textContent).toBe('1');
    });

    it('should render multiline code with correct line numbers', () => {
      const codeSnippet = `describe('Suite', () => {
  beforeEach(() => {
    console.log('setup');
  });

  test('test 1', () => {
    expect(1).toBe(1);
  });

  test('test 2', () => {
    expect(2).toBe(2);
  });
});`;

      const { container } = render(
        <CodeViewer
          lineNumbers='{"startLine":25,"endLine":30}'
          codeSnippet={codeSnippet}
          snippetStartLine={20}
          snippetEndLine={32}
        />
      );

      const lineNumbers = container.querySelectorAll('.line-number');

      // Should have 13 lines (12 lines of code + trailing newline creates extra line sometimes)
      expect(lineNumbers.length).toBeGreaterThanOrEqual(12);

      // First line should be 20
      expect(lineNumbers[0].textContent).toBe('20');

      // Last line should be 20 + (lineNumbers.length - 1)
      const lastLineNumber = 20 + (lineNumbers.length - 1);
      expect(lineNumbers[lineNumbers.length - 1].textContent).toBe(String(lastLineNumber));
    });
  });

  describe('Empty or Invalid Code', () => {
    it('should show empty message when no code snippet', () => {
      render(
        <CodeViewer
          lineNumbers='{"startLine":10,"endLine":20}'
          codeSnippet={null}
          snippetStartLine={10}
          snippetEndLine={20}
        />
      );

      expect(screen.getByText('No code snippet available')).toBeInTheDocument();
    });

    it('should show empty message when empty string', () => {
      render(
        <CodeViewer
          lineNumbers='{"startLine":10,"endLine":20}'
          codeSnippet=""
          snippetStartLine={10}
          snippetEndLine={20}
        />
      );

      expect(screen.getByText('No code snippet available')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single line code', () => {
      const { container } = render(
        <CodeViewer
          lineNumbers='{"startLine":100,"endLine":100}'
          codeSnippet="const x = 42;"
          snippetStartLine={100}
          snippetEndLine={100}
        />
      );

      const lineNumbers = container.querySelectorAll('.line-number');
      expect(lineNumbers.length).toBe(1);
      expect(lineNumbers[0].textContent).toBe('100');
    });

    it('should handle large line numbers', () => {
      const { container } = render(
        <CodeViewer
          lineNumbers='{"startLine":1500,"endLine":1520}'
          codeSnippet="test('large line number', () => {});"
          snippetStartLine={1500}
          snippetEndLine={1520}
        />
      );

      const lineNumbers = container.querySelectorAll('.line-number');
      expect(lineNumbers[0].textContent).toBe('1500');
    });
  });
});
