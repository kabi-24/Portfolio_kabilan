import { ArrowUpRight, Github, Linkedin, Mail, Twitter } from 'lucide-react';
import { PROFILE, SOCIAL_PROFILES } from '../data/portfolioData';

function SocialIcon({ id }: { id: 'linkedin' | 'github' | 'twitter' | 'email' }) {
  if (id === 'linkedin') return <Linkedin className="h-4 w-4" />;
  if (id === 'github') return <Github className="h-4 w-4" />;
  if (id === 'twitter') return <Twitter className="h-4 w-4" />;
  return <Mail className="h-4 w-4" />;
}

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-slate-800/80 bg-[#04070e]/95">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-base font-bold text-slate-100">{PROFILE.name}</p>
            <p className="mt-1 text-sm text-slate-400">
              {PROFILE.title} · {PROFILE.location}
            </p>
          </div>

          <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-300">
            <a href="#profile" className="hover:text-cyan-300 transition-colors whitespace-nowrap">
              Profile
            </a>
            <a href="#experience" className="hover:text-cyan-300 transition-colors whitespace-nowrap">
              Experience
            </a>
            <a href="#projects" className="hover:text-cyan-300 transition-colors whitespace-nowrap">
              Projects
            </a>
            <a href="#blog" className="hover:text-cyan-300 transition-colors whitespace-nowrap">
              Blog
            </a>
            <a href="#profiles" className="hover:text-cyan-300 transition-colors whitespace-nowrap">
              Profiles
            </a>
            <a href="#contact" className="hover:text-cyan-300 transition-colors whitespace-nowrap">
              Contact
            </a>
          </nav>

          <div aria-label="Social media profiles" className="flex flex-wrap items-center gap-2.5">
            {SOCIAL_PROFILES.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noopener noreferrer' : undefined}
                aria-label={`${item.platform} (${item.handle})`}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-md border border-slate-800 bg-slate-900/70 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-cyan-400/50 hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-cyan-400"
              >
                <SocialIcon id={item.id} />
                <span>{item.platform}</span>
                {item.external && <ArrowUpRight className="h-3 w-3 text-slate-400" />}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-slate-800/70 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 {PROFILE.name}. Built for computer vision, robotics, and applied ML engineering.</p>
          <p className="font-mono">{PROFILE.email}</p>
        </div>
      </div>
    </footer>
  );
}
