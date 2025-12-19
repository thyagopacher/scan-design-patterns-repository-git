
export interface LocalFinding {
  fileName: string;
  detectedPattern: string;
  confidence: 'High' | 'Medium' | 'Low';
  reason: string;
  codeSnippet: string;
}

export const scannerService = {
  analyzeCodeLocally(fileName: string, code: string): LocalFinding[] {
    const findings: LocalFinding[] = [];

    // 1. Strategy Pattern / State Pattern Identification
    // Heuristic: Large switch statements or multiple if-else chains handling logic branching
    const switchMatches = (code.match(/switch\s*\(/g) || []).length;
    const longIfElse = (code.match(/else\s+if/g) || []).length > 3;
    if (switchMatches >= 1 || longIfElse) {
      findings.push({
        fileName,
        detectedPattern: 'Strategy / State Pattern',
        confidence: switchMatches > 1 ? 'High' : 'Medium',
        reason: 'Detected complex conditional branching that could be encapsulated into strategy objects to avoid "Switch/Case" smell.',
        codeSnippet: code.substring(0, 500) + '...'
      });
    }

    // 2. Observer Pattern / Pub-Sub Identification
    // Heuristic: Manual listener arrays or event emitter-like structures
    if (code.includes('listeners = []') || code.includes('.push(callback)') || (code.includes('subscribe') && code.includes('notify'))) {
      findings.push({
        fileName,
        detectedPattern: 'Observer Pattern',
        confidence: 'High',
        reason: 'Detected manual subscription and notification logic. Could benefit from a standardized Observer or Event Bus implementation.',
        codeSnippet: code.substring(code.indexOf('subscribe'), code.indexOf('subscribe') + 300) || code.substring(0, 300)
      });
    }

    // 3. Singleton Pattern Identification
    // Heuristic: static instance or private constructor logic
    if (code.includes('static instance') || (code.includes('private constructor') && code.includes('getInstance'))) {
      findings.push({
        fileName,
        detectedPattern: 'Singleton Pattern',
        confidence: 'High',
        reason: 'Detected hardcoded Singleton structure. Consider if Dependency Injection would be more testable.',
        codeSnippet: code.substring(0, 400)
      });
    }

    // 4. Factory / Builder Identification
    // Heuristic: Multiple 'new' calls for related types in one method
    const newCount = (code.match(/new\s+[A-Z]/g) || []).length;
    if (newCount > 3 && !fileName.toLowerCase().includes('test')) {
      findings.push({
        fileName,
        detectedPattern: 'Factory / Builder Pattern',
        confidence: 'Medium',
        reason: 'Detected high density of direct object instantiations. A Factory could centralize this creation logic.',
        codeSnippet: code.substring(0, 500)
      });
    }

    // 5. Decorator / Wrapper
    // Heuristic: Passing an object of same type into constructor
    if (code.match(/constructor\s*\(.*(wrapper|wrapped|inner).*\)/i)) {
      findings.push({
        fileName,
        detectedPattern: 'Decorator Pattern',
        confidence: 'Low',
        reason: 'Code structure suggests a wrapping mechanism typical of Decorators.',
        codeSnippet: code.substring(0, 300)
      });
    }

    return findings;
  }
};
