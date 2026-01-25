import { exec as execCb, spawn } from 'child_process';
import { promisify } from 'util';
import ora from 'ora';
import cliProgress from 'cli-progress';

const exec = promisify(execCb);

const INSTALL_COMMANDS: Record<string, string> = {
  npm: 'npm install',
  pnpm: 'pnpm install',
  yarn: 'yarn install',
  bun: 'bun install',
};

async function isCommandAvailable(cmd: string): Promise<boolean> {
  try {
    await exec(`command -v ${cmd}`);
    return true;
  } catch {
    return false;
  }
}

export async function installDependencies(
  targetDir: string,
  packageManager: string
): Promise<void> {
  const mgr = packageManager || 'pnpm';
  const installCmd = INSTALL_COMMANDS[mgr] || 'pnpm install';
  const spinner = ora(`Running ${installCmd}...`);

  const bin = mgr;

  if (!(await isCommandAvailable(bin))) {
    spinner.fail(`${bin} not found on PATH.`);

    // Try sensible fallback order
    const fallbacks = ['pnpm', 'npm'];
    let usedFallback: string | null = null;
    for (const f of fallbacks) {
      if (await isCommandAvailable(f)) {
        usedFallback = f;
        break;
      }
    }

    if (usedFallback) {
      const fallbackCmd = `${usedFallback} install`;
      const fallbackSpinner = ora(`Attempting fallback: ${fallbackCmd}`);
      try {
        // use spawn to stream and show progress
        await runCommandWithProgress(fallbackCmd, targetDir);
        fallbackSpinner.succeed('Dependencies installed (fallback)');
        return;
      } catch (e) {
        fallbackSpinner.fail('Fallback install failed — please run manually');
        console.error(e);
        return;
      }
    } else {
      console.error(
        `Package manager '${bin}' not found. Please install it or run 'npm install' in ${targetDir} manually.`
      );
      return;
    }
  }

  try {
    await runCommandWithProgress(installCmd, targetDir);
    spinner.succeed('Dependencies installed');
  } catch (e) {
    spinner.fail('Dependency installation failed — please run manually');
    console.error(e);
  }
}

function runCommandWithProgress(command: string, cwd: string): Promise<void> {
  const parts = command.split(' ').filter(Boolean);

  return new Promise((resolve, reject) => {
    const bar = new cliProgress.SingleBar(
      {
        format: 'Installing dependencies |{bar}| {percentage}%',
        hideCursor: true,
        barsize: 40,
      },
      cliProgress.Presets.shades_classic
    );

    bar.start(100, 0);

    // Progress state
    let progress = 0;
    let lastRenderedFloor = 0;
    const start = Date.now();

    // Interval drives internal progress target; we only redraw when integer percent changes
    let lastOutputAt = 0;
    const tickInterval = 150; // ms
    const maxHold = 95; // hold at 95% until process completes

    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      // Ease-out target that slowly approaches maxHold
      const target = maxHold * (1 - Math.exp(-elapsed / 6000));
      // Advance progress a bit toward target, ensuring monotonic increase
      // If we've recently seen installer output, move faster
      const sinceOutput = lastOutputAt ? Date.now() - lastOutputAt : Infinity;
      const speedMultiplier = sinceOutput < 1000 ? 2.0 : 1.0;
      progress = Math.min(target, progress + 0.6 * speedMultiplier);
      const floor = Math.floor(progress);
      if (floor > lastRenderedFloor) {
        lastRenderedFloor = floor;
        try {
          bar.update(floor);
        } catch {}
      }
    }, tickInterval);

    const child = spawn(parts[0], parts.slice(1), { cwd, stdio: ['ignore', 'pipe', 'pipe'] });

    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];
    const onOutput = () => {
      lastOutputAt = Date.now();
      // Aggressively advance progress toward maxHold on real installer output
      const remaining = maxHold - progress;
      if (remaining <= 0) return;
      // Add a chunk that's a fraction of the remaining, clamped
      const advance = Math.min(remaining, Math.max(4, Math.round(remaining * 0.18)));
      progress = progress + advance;
      const floor = Math.floor(progress);
      if (floor > lastRenderedFloor) {
        lastRenderedFloor = floor;
        try {
          bar.update(floor);
        } catch {}
      }
    };

    if (child.stdout)
      child.stdout.on('data', (c) => {
        stdoutChunks.push(Buffer.from(c));
        onOutput();
      });
    if (child.stderr)
      child.stderr.on('data', (c) => {
        stderrChunks.push(Buffer.from(c));
        onOutput();
      });

    child.on('error', (err) => {
      clearInterval(timer);
      try {
        bar.stop();
      } catch {}
      reject(err);
    });

    child.on('close', (code) => {
      clearInterval(timer);

      // Smoothly ramp to 100% to avoid a sudden jump
      const finishInterval = 40; // ms
      const finishTimer = setInterval(() => {
        const remaining = 100 - progress;
        if (remaining <= 0.5) {
          try {
            bar.update(100);
            bar.stop();
          } catch {}
          clearInterval(finishTimer);
          if (code === 0) return resolve();
          const out = Buffer.concat(stdoutChunks).toString('utf8');
          const errOut = Buffer.concat(stderrChunks).toString('utf8');
          const e = new Error(`Command exited with code ${code}\n${errOut || out}`);
          return reject(e);
        }
        // advance by a fraction of remaining to create ease-out
        progress = progress + Math.max(1, Math.round(remaining * 0.18));
        const floor = Math.floor(progress);
        if (floor > lastRenderedFloor) {
          lastRenderedFloor = floor;
          try {
            bar.update(floor);
          } catch {}
        }
      }, finishInterval);
    });
  });
}
