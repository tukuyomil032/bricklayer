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
npm install -g bricklayer
# or
pnpm add -g bricklayer
# or
yarn global add bricklayer
```

## Usage

```bash
bricklayer create
```

Follow the interactive prompts to configure your project:

- Project name
- Module system (ESM / CommonJS)
- Package manager
- Git repository details
- Optional tools (Prettier, ESLint)

## Generated Project Structure

```
your-cli/
├── src/
│   ├── commands/
│   │   └── hello.ts
│   └── index.ts
├── .husky/
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
