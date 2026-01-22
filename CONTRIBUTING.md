# Contributing to Water Pump Dashboard

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd water-pump-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up Supabase**
   - Create a Supabase project
   - Run migrations: `supabase/migrations/*.sql`
   - Update `.env` with your Supabase credentials

5. **Start development server**
   ```bash
   npm run dev
   ```

## Code Standards

### TypeScript
- Use strict TypeScript settings
- Avoid `any` types - use proper types or `unknown`
- Use branded types for IDs when appropriate
- Add JSDoc comments for public functions

### Code Style
- Follow ESLint rules
- Use Prettier for formatting
- Run `npm run format` before committing
- Import order: builtin → external → internal → relative

### Testing
- Write tests for new features
- Maintain 80%+ test coverage
- Use descriptive test names
- Test both success and error cases

## Git Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write code following the standards
   - Add tests
   - Update documentation

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```
   - Use conventional commit messages
   - Pre-commit hooks will run linting and formatting

4. **Push and create PR**
   ```bash
   git push -u origin feature/your-feature-name
   ```

## Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Example: `feat: add pump status monitoring`

## Pull Request Process

1. Ensure all tests pass: `npm test`
2. Ensure linting passes: `npm run lint`
3. Ensure formatting is correct: `npm run format:check`
4. Update documentation if needed
5. Create a PR with a clear description
6. Request review from maintainers

## Testing

### Unit Tests
```bash
npm test
```

### Test Coverage
```bash
npm run test:coverage
```

### E2E Tests
```bash
npm run test:e2e
```

## Security

- Never commit secrets or API keys
- Sanitize all user inputs
- Follow security best practices
- Report security issues privately

## Questions?

Feel free to open an issue for questions or discussions.
