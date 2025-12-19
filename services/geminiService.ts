
import { GoogleGenAI, Type } from "@google/genai";
import { RepoAnalysisResult } from "../types";
import { LocalFinding } from "./scannerService";

export const geminiService = {
  async analyzeWithContext(repoName: string, localFindings: LocalFinding[]): Promise<RepoAnalysisResult> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Construct context from local findings
    const contextStr = localFindings.map(f => `
      File: ${f.fileName}
      Heuristic Suggestion: ${f.detectedPattern}
      Confidence: ${f.confidence}
      Reason: ${f.reason}
      Code Snippet:
      ${f.codeSnippet}
    `).join('\n---\n');

    const prompt = `
      You are a senior Software Architect. I have performed a local heuristic scan on the GitHub repository "${repoName}".
      The following areas were identified as potentially needing Design Patterns based on actual code signatures.
      
      YOUR TASK:
      1. Validate these findings.
      2. For each valid finding, provide a detailed "Before" and "After" code transformation.
      3. List architectural benefits and potential drawbacks (complexity overhead).
      
      Local Scan Context:
      ${contextStr}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are an elite developer. Your responses MUST be in JSON format. Provide high-quality refactoring examples that follow SOLID principles. Ensure the 'codeBefore' snippet accurately represents the mess found in the context, and 'codeAfter' shows a clean pattern implementation.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            repositoryName: { type: Type.STRING },
            summary: { type: Type.STRING },
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  patternName: { type: Type.STRING },
                  targetFile: { type: Type.STRING },
                  reasoning: { type: Type.STRING },
                  codeBefore: { type: Type.STRING },
                  codeAfter: { type: Type.STRING },
                  benefits: { type: Type.ARRAY, items: { type: Type.STRING } },
                  drawbacks: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["patternName", "targetFile", "reasoning", "codeBefore", "codeAfter", "benefits", "drawbacks"]
              }
            }
          },
          required: ["repositoryName", "summary", "suggestions"]
        }
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    return JSON.parse(text) as RepoAnalysisResult;
  }
};
