# bricklayer

🧱 Interactive TypeScript CLI project scaffolder

Quickly generate a well-structured TypeScript CLI project with best practices built-in.

## Features

✨ **Interactive Setup** - Guided prompts for project configuration
📦 **Latest Packages** - Automatically fetches the latest npm package versions
🎨 **Optional Tools** - Choose Prettier and ESLint during setup
🪝 **Git Hooks** - Pre-configured Husky hooks with lint-staged
🏗️ **Clean Structure** - Role-separated files and commands
⚡ **Multiple Package Managers** - Support for pnpm, npm, yarn, and bun

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
brick create

# If you want to specify the project's root folder yourself (we generally recommend using this option):
# Use the arrow keys (up and down) and the Enter key to navigate to the project's root folder.
brick create -d

# You can also specify a project folder directly by entering a relative path after the `-d` option.
brick create -d ~/Documents/dev/CLI/my-test-project
```

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
├── .gitignore
├── .prettierrc
├── .prettierignore
├── .editorconfig
├── .npmignore
├── eslint.config.js
├── package.json
├── tsconfig.json
└── README.md
```

## Development

```bash
# Clone the repository
git clone https://github.com/tukuyomil032/bricklayer.git
cd bricklayer

# Install dependencies
pnpm install

# Build
pnpm run build

# Test locally
node dist/index.js create
```

## Scripts

- `pnpm run build` - Build the TypeScript project
- `pnpm run dev` - Run in development mode
- `pnpm run lint` - Lint the code
- `pnpm run format` - Format the code with Prettier

## Requirements

- Node.js >= 18.0.0

## License

MIT
