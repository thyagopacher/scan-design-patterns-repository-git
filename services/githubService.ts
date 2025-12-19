
import { GithubFile } from '../types';

export const githubService = {
  parseUrl(url: string) {
    const regex = /github\.com\/([^/]+)\/([^/]+)/;
    const match = url.match(regex);
    if (!match) return null;
    return { owner: match[1], repo: match[2].replace('.git', '') };
  },

  async getRepoStructure(owner: string, repo: string): Promise<GithubFile[]> {
    try {
      // Get the default branch first
      const repoInfoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
      if (!repoInfoResponse.ok) throw new Error('Repository not found');
      const repoInfo = await repoInfoResponse.json();
      const defaultBranch = repoInfo.default_branch || 'main';

      // Get recursive tree
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`
      );
      if (!response.ok) throw new Error('Failed to fetch repository structure');
      
      const data = await response.json();
      // Filter for code files only and limit to avoid payload overflow
      return data.tree
        .filter((file: any) => 
          file.type === 'blob' && 
          /\.(ts|tsx|js|jsx|py|java|cs|go|php|rb|cpp|c)$/.test(file.path)
        )
        .slice(0, 100); // Limit to 100 files for context
    } catch (error) {
      console.error('Error fetching from GitHub:', error);
      throw error;
    }
  }
};
