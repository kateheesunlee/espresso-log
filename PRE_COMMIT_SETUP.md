# Pre-Commit Automation Setup

This project uses automated pre-commit hooks to ensure code quality and consistency.

## 🚀 What Happens Before Each Commit

1. **Linting**: ESLint runs on staged TypeScript/JavaScript files
2. **Formatting**: Prettier formats staged files
3. **Type Checking**: TypeScript compiler checks for type errors
4. **Commit Message Linting**: Validates commit message format

## 📋 Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes
- `build`: Build system changes
- `revert`: Reverting changes

### Examples:

```bash
feat: add user authentication
fix: resolve memory leak in image processing
docs: update API documentation
style: format code with prettier
refactor: extract common utilities
test: add unit tests for user service
chore: update dependencies
```

## 🛠️ Available Commands

```bash
# Make a commit with guided prompts
npm run commit

# Run linting on all files
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format all files
npm run format

# Check TypeScript types
npm run type-check

# Run pre-commit checks manually
npm run pre-commit
```

## ⚠️ What Happens If Checks Fail

If any pre-commit check fails:

1. The commit will be **blocked**
2. You'll see error messages explaining what failed
3. Fix the issues and try committing again
4. The commit will only succeed when all checks pass

## 🔧 Bypassing Pre-Commit Hooks (Not Recommended)

In emergency situations, you can bypass hooks with:

```bash
git commit --no-verify -m "emergency fix"
```

**Warning**: This should only be used in true emergencies and the issues should be fixed immediately after.

## 📁 Files Modified by Pre-Commit

The following files may be automatically modified during commit:

- `*.js`, `*.jsx`, `*.ts`, `*.tsx` - ESLint fixes and Prettier formatting
- `*.json`, `*.md`, `*.yml`, `*.yaml` - Prettier formatting

## 🎯 Benefits

- **Consistent Code Style**: All code follows the same formatting rules
- **Early Error Detection**: Catch issues before they reach the repository
- **Better Commit History**: Structured commit messages for better project history
- **Team Collaboration**: Everyone follows the same standards
- **Reduced Code Review Time**: Less time spent on formatting issues

## 🚨 Troubleshooting

### Common Issues:

1. **"Command not found" errors**: Run `npm install` to ensure all dependencies are installed
2. **Permission errors**: Make sure the `.husky` directory has proper permissions
3. **TypeScript errors**: Fix type issues before committing
4. **ESLint errors**: Run `npm run lint:fix` to auto-fix many issues

### Reset Husky (if needed):

```bash
rm -rf .husky
npx husky init
```
