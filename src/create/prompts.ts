import inquirer from 'inquirer';
import Enquirer from 'enquirer';
const Select: any = (Enquirer as any).Select || (Enquirer as any).default?.Select;
const Input: any = (Enquirer as any).Input || (Enquirer as any).default?.Input;
import chalk from 'chalk';
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { ProjectAnswers } from './types.js';

type PromptOptions = { skipName?: boolean; askDestination?: boolean };

export async function promptProjectDetails(
  opts: PromptOptions = {}
): Promise<ProjectAnswers & { destination?: string }> {
  const questions = [
    {
      type: 'input',
      name: 'name',
      message: 'Project folder name (package name):',
      default: 'my-cli',
    },
    {
      type: 'list',
      name: 'moduleType',
      message: 'Module system:',
      choices: ['ESM', 'CommonJS'],
      default: 'ESM',
    },
    {
      type: 'list',
      name: 'packageManager',
      message: 'Package manager to use:',
      choices: ['npm', 'pnpm', 'yarn', 'bun'],
      default: 'npm',
    },
    {
      type: 'confirm',
      name: 'autoInstall',
      message: 'Automatically install dependencies after scaffold? (creates lockfile)',
      default: false,
    },
    {
      type: 'input',
      name: 'gitOwner',
      message: "Git repository owner's user id:",
      default: 'owner',
    },
    {
      type: 'input',
      name: 'gitRepo',
      message: 'Git repository name:',
      default: 'my-cli',
    },
    {
      type: 'input',
      name: 'npmPackageName',
      message: 'npm package name (scoped or unscoped):',
      default: (answers: Partial<ProjectAnswers>) => answers.name || 'my-cli',
    },
    {
      type: 'input',
      name: 'description',
      message: 'Project description:',
      default: 'A minimal TypeScript CLI',
    },
    {
      type: 'input',
      name: 'author',
      message: 'Author:',
      default: 'Anonymous',
    },
    {
      type: 'list',
      name: 'license',
      message: 'License:',
      choices: [
        'MIT',
        'Apache-2.0',
        'GPL-3.0',
        'GPL-2.0',
        'BSD-1-Clause',
        'BSD-2-Clause',
        'BSD-3-Clause',
      ],
      default: 'MIT',
    },
    {
      type: 'confirm',
      name: 'useHusky',
      message: 'Enable Husky git hooks (pre-commit / pre-push)?',
      default: true,
    },
  ];

  const totalQuestions = questions.length;
  const answers: Partial<ProjectAnswers & { destination?: string }> = {};

  console.log(''); // Blank line before prompts

  // Use Inquirer's BottomBar to render a single, updatable status line
  // so prompts and their own multi-line UIs do not cause duplicate progress lines.
  type BottomBar = { updateBottomBar: (s: string) => void; close: () => void };
  type InquirerWithUI = { ui?: { BottomBar?: new () => BottomBar } };
  const uiWith = inquirer as unknown as InquirerWithUI;
  const bottomBar: BottomBar =
    uiWith.ui && uiWith.ui.BottomBar
      ? new uiWith.ui.BottomBar()
      : { updateBottomBar: () => {}, close: () => {} };

  const updateProgress = (n: number) => {
    const progressLine = `Project Scaffolding Progress: [${n}/${totalQuestions}]`;
    try {
      bottomBar.updateBottomBar(progressLine);
    } catch (err) {
      void err;
      // fallback: write using readline
      readline.clearLine(process.stdout, 0);
      readline.cursorTo(process.stdout, 0);
      process.stdout.write(progressLine + '\n');
    }
  };

  // Compute effective total: subtract skipped name, add destination prompt if requested
  const effectiveTotal = totalQuestions - (opts.skipName ? 1 : 0) + (opts.askDestination ? 1 : 0);
  let progressCount = 0;
  updateProgress(progressCount);

  // If askDestination is requested, prompt for it first using an interactive tree navigator
  if (opts.askDestination) {
    const chooseDirectoryInteractive = async (startDir: string) => {
      let current = startDir;
      while (true) {
        // list visible directories (exclude hidden)
        let entries: string[] = [];
        try {
          entries = fs.readdirSync(current).filter((name) => {
            try {
              return !name.startsWith('.') && fs.lstatSync(path.join(current, name)).isDirectory();
            } catch {
              return false;
            }
          });
        } catch {
          entries = [];
        }

        const choices = [
          { display: `Select this directory: ${current}`, value: '__SELECT__' },
          { display: '.. (go up)', value: '__UP__' },
          ...entries.map((e) => ({ display: e + path.sep, value: e })),
        ];

        // Add a small circle at the start of each displayed choice to indicate it's selectable
        choices.forEach((c) => {
          c.display = `◯ ${c.display}`;
        });

        // Enquirer expects choice objects with `name` (unique id) and `message` (display)
        const select = new Select({
          name: 'dir',
          message: `destination: (navigate folders, Enter to choose)`,
          // Enquirer Select returns the `name` of the chosen item.
          // Use `name` as the internal id (value) and `message` for display.
          choices: choices.map((c) => ({ name: c.value, message: c.display })),
          pageSize: 15,
        });
        let val: string;
        try {
          val = await select.run();
        } catch (err) {
          // Enquirer may throw when TTY not available; surface a friendly error
          console.error(
            'Selection aborted or failed:',
            err instanceof Error ? err.message : String(err)
          );
          throw err;
        }
        if (val === '__SELECT__') {
          // Use Enquirer's Input so the default/current path is actual editable text
          while (true) {
            const input = new Input({
              message: 'destination: (edit or accept)',
              initial: current,
            });
            let proposed: string;
            try {
              proposed = (await input.run()).trim();
            } catch (err) {
              console.error('Input aborted:', err instanceof Error ? err.message : String(err));
              throw err;
            }

            const confirm = await inquirer.prompt<{ confirmSel: string }>([
              {
                type: 'list',
                name: 'confirmSel',
                message: `Create project at ${proposed}?`,
                choices: [
                  { name: 'Confirm and create here', value: 'confirm' },
                  { name: 'Re-enter destination', value: 'reenter' },
                  { name: 'Go back to folder navigation', value: 'back' },
                ],
              },
            ]);
            if (confirm.confirmSel === 'confirm') return proposed;
            if (confirm.confirmSel === 'reenter') continue;
            if (confirm.confirmSel === 'back') break; // return to navigation
          }
          continue;
        }
        if (val === '__UP__') {
          const parent = path.dirname(current);
          if (parent === current) {
            // already root
            continue;
          }
          current = parent;
          continue;
        }
        // descend into selected subdirectory
        current = path.join(current, val);
      }
    };

    // Count the destination question once and show progress before navigation
    progressCount++;
    updateProgress(progressCount);

    const dest = await chooseDirectoryInteractive(process.cwd());
    if (dest) {
      answers.destination = dest;
      console.log('→ Selected: ' + chalk.green(dest));
    }
  }

  // Build list of questions to ask (skip name if requested)
  const toAsk = opts.skipName ? questions.slice(1) : questions.slice();
  for (let i = 0; i < toAsk.length; i++) {
    const question = toAsk[i];

    // Update the single progress bottom bar just before each prompt
    progressCount++;
    updateProgress(progressCount);

    const answer = await inquirer.prompt<Record<string, unknown>>([question]);
    Object.assign(answers, answer as Record<string, unknown>);

    // Display selected value in color for clarity (above the bottom bar)
    const key = question.name as string;
    const val = answer[key] as unknown;
    if (typeof val === 'string') {
      console.log('→ Selected: ' + chalk.green(val));
    } else if (Array.isArray(val)) {
      console.log('→ Selected: ' + val.map((v) => chalk.green(v)).join(', '));
    } else if (typeof val === 'boolean') {
      console.log('→ Selected: ' + (val ? chalk.green('yes') : chalk.yellow('no')));
    }
  }

  // Finalize progress
  updateProgress(effectiveTotal);
  try {
    bottomBar.updateBottomBar(
      `Project Scaffolding Progress: [${effectiveTotal}/${effectiveTotal}] Done.`
    );
    bottomBar.close();
  } catch (err) {
    void err;
  }
  console.log(''); // Blank line after completion

  return answers as ProjectAnswers;
}
