import { Command } from 'commander';
import chalk from 'chalk';

export function sampleCommand(): Command {
  const cmd = new Command('sample');
  cmd.description('A sample subcommand demonstrating project structure separation');

  cmd.action(() => {
    console.log(chalk.yellow('Running sample command...'));
    console.log('This demonstrates a separated command file and a simple action.');
  });

  return cmd;
}
