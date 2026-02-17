"""Utility functions for code refactoring."""

import re


def clean_code_fences(code: str) -> str:
    """Remove markdown code fences from LLM output.
    
    LLM outputs often wrap code in markdown fences like:
    ```javascript
    <code here>
    ```
    
    This function removes those fences and returns clean code.
    
    Args:
        code: Code potentially wrapped in ```language ... ```
        
    Returns:
        Clean code without markdown fences
        
    Examples:
        >>> clean_code_fences("```javascript\\nconst x = 1;\\n```")
        'const x = 1;'
        
        >>> clean_code_fences("```js\\nconsole.log('test');\\n```")
        "console.log('test');"
        
        >>> clean_code_fences("const y = 2;")
        'const y = 2;'
    """
    # Remove opening fence (```javascript, ```js, ```python, etc.)
    code = re.sub(r'^\s*```\w*\s*\n?', '', code, flags=re.MULTILINE)
    
    # Remove closing fence (```)
    code = re.sub(r'\n?\s*```\s*$', '', code, flags=re.MULTILINE)
    
    return code.strip()
