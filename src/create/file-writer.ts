import fs from 'fs/promises';
import path from 'path';
import cliProgress from 'cli-progress';
import { ProjectAnswers } from './types.js';
import * as templates from './templates.js';

export async function writeProjectFiles(
  targetDir: string,
  answers: ProjectAnswers,
  versions?: Record<string, string>
) {
  const progressBar = new cliProgress.SingleBar({
    format: 'Creating files |{bar}| {percentage}% | {value}/{total} files',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
  });

  const tasks = [
    'package.json',
    'tsconfig.json',
    'src/index.ts',
    'src/commands/hello.ts',
    'README.md',
    '.gitignore',
    // husky hooks are optional and added conditionally below
    '.prettierignore',
    '.npmignore',
    '.editorconfig',
    'LICENSE',
  ];
  // Always include ESLint and Prettier config files by default
  tasks.push('.prettierrc');
  tasks.push('eslint.config.js');

  // Add .npmrc when using pnpm
  const shouldAddNpmrc = answers.packageManager === 'pnpm';
  if (shouldAddNpmrc) tasks.push('.npmrc');

  // Add husky hooks entries only if requested
  if (answers.useHusky) {
    tasks.unshift('.husky/pre-push');
    tasks.unshift('.husky/pre-commit');
  }

  progressBar.start(tasks.length, 0);

  let completed = 0;

  // Create directory structure
  await fs.mkdir(targetDir, { recursive: true });
  await fs.mkdir(path.join(targetDir, 'src', 'commands'), { recursive: true });
  if (answers.useHusky) {
    await fs.mkdir(path.join(targetDir, '.husky'), { recursive: true });
  }

  // Write package.json
  const pkg = templates.generatePackageJson(answers, versions);
  await fs.writeFile(path.join(targetDir, 'package.json'), JSON.stringify(pkg, null, 2));
  progressBar.update(++completed);

  // Write tsconfig.json
  const tsconfig = templates.generateTsConfig(answers);
  await fs.writeFile(path.join(targetDir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));
  progressBar.update(++completed);

  // Write source files
  await fs.writeFile(path.join(targetDir, 'src', 'index.ts'), templates.generateIndexTs(answers));
  progressBar.update(++completed);

  await fs.writeFile(
    path.join(targetDir, 'src', 'commands', 'hello.ts'),
    templates.generateHelloCommandTs()
  );
  progressBar.update(++completed);

  // Write README
  await fs.writeFile(path.join(targetDir, 'README.md'), templates.generateReadme(answers));
  progressBar.update(++completed);

  // Write .gitignore
  await fs.writeFile(path.join(targetDir, '.gitignore'), templates.generateGitignore());
  progressBar.update(++completed);

  // Write Husky hooks (only if requested)
  if (answers.useHusky) {
    await fs.writeFile(
      path.join(targetDir, '.husky', 'pre-commit'),
      templates.generatePreCommitHook()
    );
    progressBar.update(++completed);

    await fs.writeFile(path.join(targetDir, '.husky', 'pre-push'), templates.generatePrePushHook());
    progressBar.update(++completed);
  }

  // Always add .prettierignore
  await fs.writeFile(path.join(targetDir, '.prettierignore'), templates.generatePrettierIgnore());
  progressBar.update(++completed);

  // Always add .npmignore
  await fs.writeFile(path.join(targetDir, '.npmignore'), templates.generateNpmIgnore());
  progressBar.update(++completed);

  // Conditionally add .npmrc for pnpm
  if (shouldAddNpmrc) {
    await fs.writeFile(path.join(targetDir, '.npmrc'), templates.generateNpmrc());
    progressBar.update(++completed);
  }

  // Always add .editorconfig
  await fs.writeFile(path.join(targetDir, '.editorconfig'), templates.generateEditorConfig());
  progressBar.update(++completed);

  // Write LICENSE
  const licenseText = await templates.generateLicenseText(
    answers.license,
    answers.author,
    new Date().getFullYear()
  );
  await fs.writeFile(path.join(targetDir, 'LICENSE'), licenseText);
  progressBar.update(++completed);

  // Write Prettier and ESLint configs (default included)
  await fs.writeFile(path.join(targetDir, '.prettierrc'), templates.generatePrettierConfig());
  progressBar.update(++completed);

  await fs.writeFile(path.join(targetDir, 'eslint.config.js'), templates.generateEslintConfig());
  progressBar.update(++completed);

  progressBar.stop();
  console.log('');
}
