# Contributing to NEXAI OMNI-PRIME

Thank you for your interest in contributing to NEXAI OMNI-PRIME! We welcome contributions from the community and are grateful for your support.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Guidelines](#coding-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if relevant**
- **Include your environment details** (OS, browser, Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the proposed enhancement**
- **Explain why this enhancement would be useful**
- **List any alternative solutions you've considered**

### Pull Requests

- Fill in the pull request template
- Follow the coding guidelines
- Include appropriate test coverage
- Update documentation as needed
- Ensure all tests pass

## Development Setup

### Prerequisites

- Node.js 22+
- pnpm 9+
- Cloudflare account (for deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/turkmen-coder/nexai-omni-prime.git
cd nexai-omni-prime

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
pnpm dev
```

### Project Structure

```
nexai-omni-prime/
├── src/
│   ├── components/     # UI components
│   ├── lib/           # Utility functions
│   ├── pages/         # Page components
│   └── services/      # Business logic
├── public/            # Static assets
└── tests/             # Test files
```

## Coding Guidelines

### TypeScript

- Use TypeScript for all new code
- Avoid `any` types; use proper typing
- Use interfaces for object shapes
- Export types alongside implementations

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas in multi-line objects/arrays
- Use meaningful variable and function names
- Keep functions small and focused

### Example

```typescript
// Good
interface UserProfile {
  id: string;
  name: string;
  personalityTraits: BigFiveScores;
}

const analyzePersonality = (responses: TestResponse[]): BigFiveScores => {
  // Implementation
};

// Bad
const analyze = (data: any) => {
  // Implementation
};
```

### Comments

- Write self-documenting code when possible
- Add comments for complex logic
- Use JSDoc for public APIs

```typescript
/**
 * Analyzes user responses and calculates Big Five personality scores
 * @param responses - Array of user test responses
 * @returns Calculated OCEAN scores
 */
const analyzePersonality = (responses: TestResponse[]): BigFiveScores => {
  // Implementation
};
```

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(personality): add MBTI analysis engine

- Implement 16 personality type detection
- Add Jung cognitive functions
- Integrate with existing Big Five system

Closes #123
```

```bash
fix(bart): correct risk score calculation

The previous implementation didn't account for early stops.
This fix adjusts the scoring algorithm accordingly.

Fixes #456
```

## Pull Request Process

1. **Fork the repository** and create your branch from `main`

```bash
git checkout -b feature/amazing-feature
```

2. **Make your changes** following the coding guidelines

3. **Test your changes** thoroughly

```bash
pnpm test
pnpm lint
```

4. **Commit your changes** using conventional commits

```bash
git commit -m "feat(scope): add amazing feature"
```

5. **Push to your fork**

```bash
git push origin feature/amazing-feature
```

6. **Open a Pull Request** with:
   - Clear title and description
   - Reference to related issues
   - Screenshots (if UI changes)
   - Test results

7. **Address review feedback** promptly

8. **Wait for approval** from maintainers

### PR Checklist

- [ ] Code follows the style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] PR title follows conventional commits

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Writing Tests

- Write tests for new features
- Update tests for bug fixes
- Aim for high test coverage
- Use descriptive test names

```typescript
describe('PsychoCore-X Engine', () => {
  it('should calculate accurate Big Five scores', () => {
    const responses = mockTestResponses();
    const scores = analyzePersonality(responses);
    
    expect(scores.openness).toBeGreaterThan(0);
    expect(scores.openness).toBeLessThanOrEqual(100);
  });
});
```

## Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for public APIs
- Update inline comments for complex logic
- Create examples for new features

## Community

- Be respectful and inclusive
- Help others in discussions
- Share knowledge and insights
- Provide constructive feedback

## Questions?

Feel free to:
- Open an issue for questions
- Start a discussion in GitHub Discussions
- Reach out to maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to NEXAI OMNI-PRIME! 🧠✨
