---
name: contributing
description: Guidelines for contributing to the Governance project, including how to report issues, submit changes, and follow coding standards.
metadata:
  copyright: Copyright Daniel Grenemark 2026
  version: "0.0.1"
---

# Contributing to Governance

Thank you for your interest in contributing to this project! This document provides guidelines and information for contributors.

## How to Report Issues

If you find a bug or have a feature request, please open an issue on GitHub:

1. Check existing issues to avoid duplicates
2. Use a clear and descriptive title
3. Provide as much relevant information as possible
4. For bugs, include steps to reproduce the issue

## How to Submit Changes

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/governance.git
   cd governance
   ```
3. Add the upstream repository as a remote:
   ```bash
   git remote add upstream https://github.com/desek/governance.git
   ```

### Create a Branch

Create a new branch for your changes:

```bash
git checkout -b your-branch-name
```

### Make Your Changes

1. Make your changes in the new branch
2. Follow the existing code style and conventions
3. Test your changes thoroughly

### Commit Your Changes

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification for all commit messages.

**Format:**
```text
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Common types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

**Example:**
```text
feat(automation): toggle light when front door is unlocked
```

### Submit a Pull Request

1. Push your branch to your fork:
   ```bash
   git push origin your-branch-name
   ```
2. Open a pull request on GitHub
3. Ensure the PR title follows the Conventional Commits format (it will become the commit message after squash merge)
4. Provide a clear description of your changes
5. Link any related issues

## Branch Protection and Merge Strategy

- Force pushes are **blocked** on protected branches
- Direct commits to `main` are **prohibited** — all changes must go through a pull request
- Pull requests use **squash merge only** to maintain a linear commit history
- Merge commits are not allowed

## License of Contributions

By contributing to this project, you agree that your contributions will be licensed under the [Apache License, Version 2.0](LICENSE).

## Getting Help

If you have questions or need assistance:

1. Check the existing documentation
2. Search existing issues for similar questions
3. Open a new issue with your question

Thank you for contributing!
