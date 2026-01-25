import { ProjectAnswers } from './types.js';
import LICENSE_TEXTS from './licenses.js';

// Embedded templates (inlined so builds include templates without copying files)
const staticTemplates = {
  gitignore: [
    '# Dependencies',
    'node_modules/',
    'bun.lockb',
    '',
    '# Build output',
    'dist/',
    '',
    '# Environment files',
    '.env',
    '.env.local',
    '.env.*.local',
    '',
    '# macOS',
    '.DS_Store',
    '.AppleDouble',
    '.LSOverride',
    '',
    '# IDE',
    '.vscode/',
    '.idea/',
    '*.swp',
    '*.swo',
    '*~',
    '',
    '# Logs',
    'logs/',
    '*.log',
    'npm-debug.log*',
    'yarn-debug.log*',
    'yarn-error.log*',
    '',
    '# Temporary files',
    '*.tmp',
    '.temp/',
    'temp/',
    '',
    '# Linter and formatter cache',
    '.eslintcache',
    '.prettier-cache',
    '',
    '# Husky',
    '.husky/_',
  ],
  prettierignore: [
    '# Dependencies',
    'node_modules',
    '',
    '# Build output',
    'dist',
    '',
    '# Lock files',
    'bun.lockb',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    '',
    '# Logs',
    '*.log',
    '',
    '# Coverage',
    'coverage',
  ],
  npmignore: [
    '# Source files',
    'src/',
    'tsconfig.json',
    'eslint.config.js',
    '.prettierrc',
    '.prettierignore',
    '.editorconfig',
    '',
    '# Tests and development',
    '*.test.ts',
    '*.spec.ts',
    'coverage/',
    '.nyc_output/',
    '',
    '# Git and CI',
    '.git/',
    '.github/',
    '.gitignore',
    '.husky/',
    '',
    '# IDE',
    '.vscode/',
    '.idea/',
    '*.swp',
    '*.swo',
    '*~',
    '',
    '# Logs',
    'logs/',
    '*.log',
    'npm-debug.log*',
    'yarn-debug.log*',
    'yarn-error.log*',
    '',
    '# Lock files',
    'bun.lock',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    '',
    '# macOS',
    '.DS_Store',
    '.AppleDouble',
    '.LSOverride',
    '',
    '# Temporary files',
    '*.tmp',
    '.temp/',
    'temp/',
    '',
    '# Development',
    'README.dev.md',
    'CONTRIBUTING.md',
    '',
    '# Documentation',
    'docs/',
    '',
    '# Zip files',
    '*.zip',
  ],
  editorconfig: [
    '# EditorConfig is awesome: https://EditorConfig.org',
    '',
    'root = true',
    '',
    '[*]',
    'charset = utf-8',
    'end_of_line = lf',
    'insert_final_newline = true',
    'trim_trailing_whitespace = true',
    'indent_style = space',
    'indent_size = 2',
    '',
    '[*.{js,ts}]',
    'indent_style = space',
    'indent_size = 2',
    '',
    '[*.{json,yml,yaml}]',
    'indent_style = space',
    'indent_size = 2',
    '',
    '[*.md]',
    'trim_trailing_whitespace = false',
    'max_line_length = off',
    '',
  ],
} as const;

const hooksTemplates = {
  'pre-commit': ['#!/bin/sh', '. "$(dirname "$0")/_/husky.sh"', '', 'pnpm run lint-staged'],
  'pre-push': [
    '#!/bin/sh',
    '. "$(dirname "$0")/_/husky.sh"',
    '',
    'pnpm run lint && pnpm run format:check',
  ],
} as const;

// license texts are provided from src/create/licenses.ts
export function generatePackageJson(answers: ProjectAnswers, versions?: Record<string, string>) {
  const devDeps: Record<string, string> = {
    typescript: versions?.['typescript'] || '^5.7.2',
    'ts-node': versions?.['ts-node'] || '^10.9.1',
    '@types/node': versions?.['@types/node'] || '^22.10.5',
    'lint-staged': versions?.['lint-staged'] || '^15.2.11',
  };
  // Include ESLint and Prettier by default in generated projects
  devDeps['eslint'] = versions?.['eslint'] || '^9.39.2';
  devDeps['eslint-config-prettier'] = versions?.['eslint-config-prettier'] || '^10.1.8';
  devDeps['eslint-plugin-prettier'] = versions?.['eslint-plugin-prettier'] || '^5.5.4';
  devDeps['@typescript-eslint/parser'] = versions?.['@typescript-eslint/parser'] || '^8.52.0';
  devDeps['@typescript-eslint/eslint-plugin'] =
    versions?.['@typescript-eslint/eslint-plugin'] || '^8.52.0';
  devDeps['prettier'] = versions?.['prettier'] || '^3.7.4';

  // Husky should only be added when requested (useHusky)
  if ((answers as ProjectAnswers).useHusky) {
    devDeps['husky'] = versions?.['husky'] || '^9.1.7';
  }

  const deps: Record<string, string> = {
    commander: versions?.['commander'] || '^11.1.0',
    inquirer: versions?.['inquirer'] || '^9.0.0',
    chalk: versions?.['chalk'] || '^5.3.0',
    ora: versions?.['ora'] || '^8.1.1',
    yargs: versions?.['yargs'] || '^18.0.0',
  };

  const mgr = (answers.packageManager || 'pnpm') as string;
  const pkgManagerVersions: Record<string, string> = {
    pnpm: versions?.['pnpm'] || '10.27.0',
    npm: versions?.['npm'] || '9.8.1',
    yarn: versions?.['yarn'] || '1.22.22',
    bun: versions?.['bun'] || '1.3.6',
  };
  function exactVersion(v?: string) {
    if (!v) return v;
    const m = v.match(/\d+\.\d+\.\d+/);
    return m ? m[0] : v.replace(/^[^\d]*/, '');
  }
  function buildCmdForManager(m: string) {
    if (m === 'yarn') return 'yarn build';
    if (m === 'bun') return 'bun run build';
    return `${m} run build`;
  }

  const prepareScript = (answers as ProjectAnswers).useHusky
    ? `husky install && ${buildCmdForManager(mgr)}`
    : buildCmdForManager(mgr);

  return {
    name: answers.npmPackageName || answers.name,
    private: false,
    version: '0.0.0',
    description: answers.description || '',
    type: answers.moduleType === 'ESM' ? 'module' : 'commonjs',
    main: './dist/index.js',
    module: './dist/index.js',
    bin: {
      [answers.name]: './dist/index.js',
    },
    files: ['dist', 'README.md'],
    scripts: Object.assign(
      {
        build: 'tsc -p tsconfig.json && chmod +x dist/index.js',
        prepare: prepareScript,
        prepublishOnly: buildCmdForManager(mgr),
        dev: 'ts-node --esm src/index.ts',
        start: 'node dist/index.js',
        typecheck: 'tsc --noEmit',
        lint: 'eslint "src/**/*.ts"',
        'lint:fix': 'eslint "src/**/*.ts" --fix',
        format: 'prettier --write "src/**/*.ts"',
        'format:check': 'prettier --check "src/**/*.ts"',
      },
      (answers as ProjectAnswers).useHusky ? {} : {}
    ),
    keywords: ['cli', 'scaffold', 'typescript', 'generator'],
    author: answers.author,
    license: answers.license,
    repository: {
      type: 'git',
      url: `git+https://github.com/${answers.gitOwner}/${answers.gitRepo}.git`,
    },
    bugs: {
      url: `https://github.com/${answers.gitOwner}/${answers.gitRepo}/issues`,
    },
    homepage: `https://github.com/${answers.gitOwner}/${answers.gitRepo}#readme`,
    dependencies: deps,
    devDependencies: devDeps,
    'lint-staged': {
      '*.ts': ['eslint --fix', 'prettier --write'],
    },
    packageManager: `${mgr}@${exactVersion(pkgManagerVersions[mgr] || '10.27.0')}`,
  };
}

export function generateTsConfig(answers: ProjectAnswers) {
  return {
    compilerOptions: {
      target: 'ES2020',
      module: answers.moduleType === 'ESM' ? 'ESNext' : 'CommonJS',
      lib: ['ES2020'],
      outDir: './dist',
      rootDir: './src',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
      moduleResolution: 'bundler',
    },
    include: ['src/**/*'],
    exclude: ['node_modules'],
  };
}

export function generateIndexTs(answers: ProjectAnswers) {
  return `#!/usr/bin/env node
import { Command } from 'commander';
import { helloCommand } from './commands/hello.js';

const program = new Command();
program.name('${answers.name}').version('0.0.0').description('${answers.description}');
program.addCommand(helloCommand());
program.parse(process.argv);
`;
}

export function generateHelloCommandTs() {
  return `import { Command } from 'commander';
import chalk from 'chalk';

export function helloCommand(): Command {
  const cmd = new Command('hello');
  cmd.description('Say hello and demonstrate separated command files');
  cmd.action(() => {
    console.log(chalk.green('Hello from your scaffolded CLI!'));
  });
  return cmd;
}
`;
}

export function generateReadme(answers: ProjectAnswers) {
  return `# ${answers.name}

${answers.description}
`;
}

export function generateGitignore() {
  return Array.isArray(staticTemplates.gitignore)
    ? staticTemplates.gitignore.join('\n')
    : staticTemplates.gitignore;
}

export function generatePreCommitHook() {
  const hook = hooksTemplates['pre-commit'];
  return Array.isArray(hook) ? hook.join('\n') : hook;
}

export function generatePrePushHook() {
  const hook = hooksTemplates['pre-push'];
  return Array.isArray(hook) ? hook.join('\n') : hook;
}

export function generatePrettierConfig() {
  return `{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
`;
}

export function generatePrettierIgnore() {
  return Array.isArray(staticTemplates.prettierignore)
    ? staticTemplates.prettierignore.join('\n')
    : staticTemplates.prettierignore;
}

export function generateNpmIgnore() {
  return Array.isArray(staticTemplates.npmignore)
    ? staticTemplates.npmignore.join('\n')
    : staticTemplates.npmignore;
}

export function generateNpmrc() {
  return `auto-install-peers=true
node-linker=hoisted
`;
}

export function generateEditorConfig() {
  return Array.isArray(staticTemplates.editorconfig)
    ? staticTemplates.editorconfig.join('\n')
    : staticTemplates.editorconfig;
}

export function generateEslintConfig() {
  return `import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import json from '@eslint/json';
import { defineConfig } from 'eslint/config';

export default defineConfig({
  ignores: ['dist/'],
  overrides: [
    {
      files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
      plugins: { js },
      extends: ['js/recommended'],
      languageOptions: { globals: globals.node },
    },
    Object.assign({ files: ['**/*.{ts,mts,cts}'] }, tseslint.configs.recommended),
    {
      files: ['**/*.json'],
      plugins: { json },
      language: 'json/json',
      extends: ['json/recommended'],
    },
  ],
});
`;
}

export async function generateLicenseText(
  license: string,
  author: string,
  year: number
): Promise<string> {
  // Try reading per-license text files (more readable than JSON storage)
  const keyMap: Record<string, string> = {
    MIT: 'MIT',
    'Apache-2.0': 'Apache-2.0',
    'GPL-3.0': 'GPL-3.0',
    'GPL-2.0': 'GPL-2.0',
    'BSD-1-Clause': 'BSD-1-Clause',
    'BSD-2-Clause': 'BSD-2-Clause',
    'BSD-3-Clause': 'BSD-3-Clause',
  };

  const key = keyMap[license] || 'MIT';
  const textTemplate = (LICENSE_TEXTS && LICENSE_TEXTS[key]) || '';
  if (!textTemplate) return `MIT License\n\nCopyright (c) ${year} ${author}`;

  // Common placeholder patterns to replace in license text files.
  // Support multiple variants users may paste: [year], <YEAR>, {{year}}, {yyyy}, etc.
  const yearRegex = /\[year\]|\{yyyy\}|<year>|\{\{year\}\}|\[YEAR\]|<YEAR>|\{YEAR\}/gi;
  const fullnameRegex =
    /\[fullname\]|\{name of copyright owner\}|<name>|<fullname>|\{\{fullname\}\}|\[name\]|\{name\}|<FULLNAME>|<NAME>/gi;
  const nameRegex = /\[name\]|\{name\}/gi;

  return textTemplate
    .replace(yearRegex, String(year))
    .replace(fullnameRegex, author)
    .replace(nameRegex, author);
}

// Note: .eslintignore generation removed in favor of eslint.config.js ignores
