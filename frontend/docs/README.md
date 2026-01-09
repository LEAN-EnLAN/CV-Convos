# Documentation Index

This directory contains comprehensive documentation for the CV-ConVos Frontend.

## 📚 Documentation

### Core Documentation

1. **[ARCHITECTURE.md](ARCHITECTURE.md)**
   - Project architecture and patterns
   - File organization
   - Design system overview
   - Performance optimizations
   - Security considerations

2. **[TECH_STACK.md](TECH_STACK.md)**
   - Technology stack details
   - Frameworks and libraries
   - Dependencies and versions
   - Installation and setup

3. **[DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)**
   - Sentinel Design System
   - Color system (OKLCH)
   - Typography system
   - Spacing and layout
   - Component styling guidelines
   - Accessibility standards

4. **[COMPONENTS.md](COMPONENTS.md)**
   - Component architecture
   - Core components (Builder, Editor, Templates)
   - Feature components
   - Custom hooks
   - UI patterns and examples
   - Template system guide

5. **[CODE_CONVENTIONS.md](CODE_CONVENTIONS.md)**
   - TypeScript best practices
   - React patterns
   - Naming conventions
   - Import organization
   - Styling guidelines
   - Testing patterns
   - Code review checklist

6. **[DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)**
   - Getting started
   - Common tasks
   - Working with Convex
   - Debugging tips
   - Performance optimization
   - Deployment guide
   - Best practices

## 🚀 Quick Start

### For New Developers

1. Start with [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) for setup
2. Read [ARCHITECTURE.md](ARCHITECTURE.md) to understand the project
3. Review [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) for styling guidelines
4. Check [CODE_CONVENTIONS.md](CODE_CONVENTIONS.md) for coding standards

### For Feature Development

1. Read [COMPONENTS.md](COMPONENTS.md) for component patterns
2. Check [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) for consistent styling
3. Follow [CODE_CONVENTIONS.md](CODE_CONVENTIONS.md) for standards
4. Reference existing code for patterns

### For AI/LLM Assistance

These docs are designed to help LLMs understand and work with the codebase:

- **Architecture**: `ARCHITECTURE.md` explains the overall structure
- **Types**: `src/types/cv.ts` contains all TypeScript interfaces
- **Components**: `COMPONENTS.md` describes component patterns
- **Styling**: `DESIGN_SYSTEM.md` provides design tokens and guidelines
- **Conventions**: `CODE_CONVENTIONS.md` ensures consistency

## 📋 Key Concepts

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + Shadcn UI
- **Backend**: Convex
- **Testing**: Vitest

### Design System
- **Name**: Sentinel Design System
- **Colors**: OKLCH color space
- **Themes**: Light/Dark mode support
- **Typography**: Google Fonts (Inter, Playfair Display, etc.)
- **Spacing**: Consistent spacing scale
- **Components**: Radix UI primitives + Tailwind

### Architecture Patterns
- **Component-based**: Reusable, modular components
- **Server/Client split**: Next.js App Router
- **State management**: React hooks + custom hooks
- **Type-safe**: TypeScript strict mode

## 🔗 Related Resources

- [Main README](../README.md)
- [CONTRIBUTING.md](../CONTRIBUTING.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn UI Documentation](https://ui.shadcn.com)
- [Convex Documentation](https://docs.convex.dev)

## 📝 Documentation Standards

When adding or updating documentation:

1. **Keep it current**: Update docs when code changes
2. **Be specific**: Include code examples and exact paths
3. **Link related docs**: Cross-reference where relevant
4. **Use clear language**: Avoid jargon when possible
5. **Include examples**: Show, don't just tell

## 🤝 Contributing to Documentation

To improve documentation:

1. Make changes to the relevant markdown file
2. Update the table of contents if adding sections
3. Test any code examples
4. Update this index if adding new docs

---

**Last Updated**: January 2026
