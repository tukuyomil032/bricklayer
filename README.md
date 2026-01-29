# bricklayer

🧱 Interactive TypeScript CLI project scaffolder

Quickly generate a well-structured TypeScript CLI project with best practices built-in.

## Features

- ✨ **Interactive Setup** - Guided prompts for project configuration
- 📦 **Latest Packages** - Automatically fetches the latest npm package versions
- 🎨 **Optional Tools** - Choose Prettier and ESLint during setup
- 🪝 **Git Hooks** - Pre-configured Husky hooks with lint-staged
- 🏗️ **Clean Structure** - Role-separated files and commands
- ⚡ **Multiple Package Managers** - Support for pnpm, npm, yarn, and bun

## Prerequisites

- Node.js 18+
- npm, pnpm, yarn, bun

## Installation

```bash
npm install -g @tukuyomil032/bricklayer

# or
pnpm add -g @tukuyomil032/bricklayer

# or
yarn global add @tukuyomil032/bricklayer

# or
bun add -g @tukuyomil032/bricklayer
```

## Usage

```bash
# When treating the current directory during command execution as the project's root folder:
$ brick create

# To view the help screen:
$ brick -h

# If you want to specify the project's root folder yourself (we generally recommend using this option):
# Use the arrow keys (up and down) and the Enter key to navigate to the project's root folder.
$ brick create -d

# You can also specify a project folder directly by entering a relative path after the `-d` option.
$ brick create -d ~/Documents/dev/CLI/my-test-project
```

## Available Options

- `-h --help` - display help for command
- `-V --version` - output the version number
- `-d --destination` - Specify the project creation directory
  - This option can be used either to manually select the directory path where the project will be created, or to specify a relative path by entering it directly after “-d”.

Follow the interactive prompts to configure your project:

- Project name
- Module system (ESM / CommonJS)
- Package manager
- Automatically install dependencies(create lockfile)
- Git repository details
- Optional tools (Prettier, ESLint)
- husky(pre-commit, pre-push)

## Generated Project Structure

```
your-cli/
├── src/
│   ├── commands/
│   │   └── hello.ts
│   └── index.ts
├── .husky/ #options
│   ├── pre-commit
│   └── pre-push
├── .editorconfig
├── .gitignore
├── .npmignore
├── .npmrc
├── .prettierignore
├── .prettierrc
├── eslint.config.js
├── package.json
├── README.md
└── tsconfig.json
```

## Development

```bash
# Clone the repository
git clone https://github.com/tukuyomil032/bricklayer.git
cd bricklayer

# Install dependencies
npm install

# Build
npm run build

# Test locally
node dist/index.js create
```

## Scripts

- `npm run build` - Build the TypeScript project
- `npm run dev` - Run in development mode
- `npm run lint` - Lint the code
- `npm run format` - Format the code with Prettier

## Requirements

- Node.js >= 18.0.0

## License

MIT
