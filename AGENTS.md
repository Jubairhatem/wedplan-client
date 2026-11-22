<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


# WedPlan Client Agent Execution Notes

This file contains quick guidance for agents working specifically inside `wedplan-client`.

## Tech Stack & Architecture
- Next.js 15+ App Router, TypeScript
- Tailwind CSS v4, Lucide React
- ShadCN UI components (in `components/ui/`)
- Better Auth (MongoDB adapter, client in `lib/auth-client.ts`, server in `lib/auth.ts`)
- Framer Motion for UI animations
- Sonner for toasts (`<Toaster />` mounted in `app/layout.tsx`)
- Playfair Display (headings) + Inter (body)

## Completed Commits
- `0aad68f` `chore: bootstrap Next.js project with TypeScript, Tailwind and ShadCN` (C-1)
- `573896b` `style: configure wedding theme tokens, fonts and global styles` (C-2)

## Next Client Commits
- **C-3**: `feat(auth): configure Better Auth with email/password, Google OAuth and custom user fields`
- **C-4**: `feat(auth): build sign-up page with role selection, password rules and ImgBB avatar upload`
- **C-5**: `feat(auth): build sign-in page with credential and Google login and role-based redirect`
- **C-6**: `feat(auth): add route protection middleware and JWT retrieval helper for API calls`

Refer to `../plan.md` and `../AGENTS.md` for full cross-project context.
