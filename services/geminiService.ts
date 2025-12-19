
import { GoogleGenAI, Type } from "@google/genai";
import { RepoAnalysisResult, GithubFile } from "../types";

export const geminiService = {
  async analyzeRepo(repoName: string, files: GithubFile[]): Promise<RepoAnalysisResult> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const fileListStr = files.map(f => f.path).join('\n');

    const prompt = `
      Analyze the following file structure of the GitHub repository "${repoName}". 
      Identify areas where common Design Patterns (Creational, Structural, or Behavioral) should be applied to improve the architecture.
      
      Since you only have the file names, use your deep knowledge of common software architectures (e.g., MVC, Clean Architecture, Hooks pattern in React, Service Layer in Node/Spring) to infer where improvements are needed based on file naming conventions and directory structures.
      
      Files:
      ${fileListStr}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a senior software architect with 20+ years of experience in Design Patterns. Your goal is to find architectural flaws in repositories and suggest patterns like Factory, Strategy, Observer, Decorator, etc. Provide high-quality code snippets in the relevant language.",
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
                  targetFile: { type: Type.STRING, description: "The file or module where the pattern should be applied" },
                  reasoning: { type: Type.STRING },
                  codeBefore: { type: Type.STRING, description: "A snippet showing the problematic code structure" },
                  codeAfter: { type: Type.STRING, description: "A snippet showing how it looks after applying the pattern" },
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
