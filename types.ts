
export interface DesignPatternSuggestion {
  patternName: string;
  targetFile: string;
  reasoning: string;
  codeBefore: string;
  codeAfter: string;
  benefits: string[];
  drawbacks: string[];
}

export interface RepoAnalysisResult {
  repositoryName: string;
  summary: string;
  suggestions: DesignPatternSuggestion[];
}

export interface GithubFile {
  path: string;
  type: 'blob' | 'tree';
  size?: number;
}
