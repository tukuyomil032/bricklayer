export interface ProjectAnswers {
  name: string;
  moduleType: 'ESM' | 'CommonJS';
  packageManager: 'pnpm' | 'npm' | 'yarn' | 'bun';
  gitOwner: string;
  gitRepo: string;
  npmPackageName: string;
  description: string;
  author: string;
  license: string;
  useHusky: boolean;
  autoInstall?: boolean;
}
