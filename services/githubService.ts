
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
      const repoInfoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
      if (!repoInfoResponse.ok) throw new Error('Repository not found');
      const repoInfo = await repoInfoResponse.json();
      const defaultBranch = repoInfo.default_branch || 'main';

      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`
      );
      if (!response.ok) throw new Error('Failed to fetch repository structure');
      
      const data = await response.json();
      return data.tree
        .filter((file: any) => 
          file.type === 'blob' && 
          /\.(ts|tsx|js|jsx|py|java|cs|go|php|rb|cpp|c)$/.test(file.path) &&
          !file.path.includes('node_modules') &&
          !file.path.includes('dist')
        )
        .slice(0, 50); 
    } catch (error) {
      console.error('Error fetching from GitHub:', error);
      throw error;
    }
  },

  async getFileContent(owner: string, repo: string, path: string): Promise<string> {
    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`);
      if (!response.ok) return '';
      const data = await response.json();
      // GitHub returns base64 content
      return atob(data.content.replace(/\n/g, ''));
    } catch {
      return '';
    }
  }
};
