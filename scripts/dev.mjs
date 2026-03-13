import { spawn } from 'node:child_process';

const processes = [
  {
    name: 'api',
    command: 'npm',
    args: ['--prefix', 'backend', 'run', 'start:dev'],
  },
  {
    name: 'ui',
    command: 'npm',
    args: ['--prefix', 'frontend', 'run', 'start'],
  },
];

const children = [];

function writePrefixed(stream, name, chunk) {
  const lines = chunk.toString().split(/\r?\n/);

  for (const line of lines) {
    if (!line) {
      continue;
    }

    stream.write(`[${name}] ${line}\n`);
  }
}

function stopChildren(exitCode = 0) {
  for (const child of children) {
    if (!child.killed) {
      child.kill();
    }
  }

  process.exit(exitCode);
}

for (const processConfig of processes) {
  const child = spawn(processConfig.command, processConfig.args, {
    shell: true,
    stdio: ['inherit', 'pipe', 'pipe'],
  });

  child.stdout.on('data', (chunk) => writePrefixed(process.stdout, processConfig.name, chunk));
  child.stderr.on('data', (chunk) => writePrefixed(process.stderr, processConfig.name, chunk));

  child.on('exit', (code) => {
    if (code && code !== 0) {
      stopChildren(code);
    }
  });

  child.on('error', () => {
    stopChildren(1);
  });

  children.push(child);
}

process.on('SIGINT', () => stopChildren(0));
process.on('SIGTERM', () => stopChildren(0));