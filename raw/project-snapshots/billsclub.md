# Project Snapshot: BillsClub

**Source:** ~/Desktop/Vibes/BillsClub/
**Date:** 2026-04-06
**Type:** Personal portfolio / landing site

## Stack
- Next.js 16.1.6 (App Router)
- React 19.2.3
- TypeScript 5
- Tailwind CSS 4
- Framer Motion 12.34.3 (animations)
- react-icons 5.5.0
- Resend 6.9.2 (transactional email)
- Zod 4.3.6 (validation)
- Deployed to Vercel (.vercel/ directory present)

## Architecture
```
src/
  app/
    api/contact/route.ts      # Contact form API (sends email via Resend)
    Privacy/page.tsx           # Privacy policy page
    ToS/page.tsx               # Terms of service page
    page.tsx                   # Main landing page
    layout.tsx, globals.css
  components/
    layout/                    # Header, Footer
    sections/                  # Hero, About, Experience, Education, Skills, Projects, Contact
    ui/                        # AnimatedSection, ProjectCard, SectionHeading, TimelineItem
  data/                        # education.ts, experience.ts, projects.ts, skills.ts
  emails/                      # ContactNotification.tsx (Resend email template)
  hooks/                       # useScrollSpy.ts
  lib/                         # resend.ts, validators.ts
public/                        # bill.png (headshot)
```

Legal docs present: `Bill_Warren_Resume_2026.docx`, privacy policy, ToS.

## Patterns Observed
- Data-driven sections -- content lives in `src/data/` as typed arrays, components render them
- Scroll spy hook for active nav highlighting
- AnimatedSection wrapper component (likely Framer Motion intersection observer pattern)
- Contact form with server-side email via Resend + Zod validation
- Clean section-based single-page architecture with separate legal routes
- No database -- purely static content + contact form API

## Lessons / Decisions
- Chose Resend over alternatives for email delivery -- React-based email templates (ContactNotification.tsx)
- Data separated from components allows easy resume/portfolio updates without touching UI code
- Framer Motion for scroll-triggered animations rather than CSS-only approach
- Privacy policy and Terms of Service built in from the start (suggests intent for production use)
