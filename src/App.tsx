import { useCallback, useEffect, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, ExternalLink } from 'lucide-react';
import WarehouseScene3D from './components/WarehouseScene3D';
import Navbar from './components/Navbar';
import BagCounterPreview from './components/BagCounterPreview';
import AnswerEvalPreview from './components/AnswerEvalPreview';
import BlogSection from './components/BlogSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import {
  EXPERIENCES,
  PROFILE,
  PROJECTS,
  SKILL_GROUPS,
} from './data/portfolioData';

export default function App() {
  const [bagCount, setBagCount] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [typedPhrase, setTypedPhrase] = useState(PROFILE.cyclingPhrases[0]);
  const [portraitFailed, setPortraitFailed] = useState(false);

  const handleBagCount = useCallback((count: number) => {
    setBagCount(count);
  }, []);

  // Scroll progress bar
  useEffect(() => {
    const updateProgress = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(maxScroll > 0 ? Math.min(100, (window.scrollY / maxScroll) * 100) : 0);
    };
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);

  // Cycling headline specialty phrase
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setTypedPhrase(PROFILE.cyclingPhrases[0]);
      return;
    }

    let wordIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timerId = 0;

    const step = () => {
      const currentWord = PROFILE.cyclingPhrases[wordIndex];
      charIndex += deleting ? -1 : 1;
      setTypedPhrase(currentWord.slice(0, charIndex));

      let delay = deleting ? 32 : 68;
      if (!deleting && charIndex === currentWord.length) {
        deleting = true;
        delay = 1450;
      } else if (deleting && charIndex === 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % PROFILE.cyclingPhrases.length;
        delay = 280;
      }
      timerId = window.setTimeout(step, delay);
    };

    timerId = window.setTimeout(step, 350);
    return () => window.clearTimeout(timerId);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#04070e] text-slate-100">
      {/* Top scroll progress indicator */}
      <div
        aria-hidden="true"
        className="fixed top-0 left-0 z-50 h-[2px] bg-gradient-to-r from-cyan-400 to-violet-500 transition-[width] duration-75"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Interactive 3D Three.js background canvas */}
      <WarehouseScene3D onBagCount={handleBagCount} />

      {/* Compact live YOLOv8 counter readout (desktop/tablet, no backdrop-filter over WebGL) */}
      <div
        aria-hidden="true"
        className="fixed bottom-4 left-4 z-30 hidden sm:flex items-center gap-3 rounded-lg border border-slate-800/90 bg-[#070d18]/92 px-3.5 py-2 shadow-lg"
      >
        <span className="font-mono tabular-nums text-xl font-bold text-cyan-400">
          {bagCount}
        </span>
        <div className="leading-tight">
          <span className="block text-xs font-semibold text-slate-200">Bags counted</span>
          <span className="block text-[11px] text-slate-400">Live 3D YOLOv8 gate</span>
        </div>
      </div>

      <Navbar />

      <main className="relative z-10">
        {/* Hero Section */}
        <section
          id="hero"
          data-scene-stop="hero"
          className="flex min-h-[calc(100vh-4rem)] items-center py-16 sm:py-24"
        >
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-wider text-cyan-400 uppercase">
                {PROFILE.title} · {PROFILE.location}
              </p>

              <h1 className="mt-3 font-display text-5xl font-bold tracking-tight text-slate-50 sm:text-6xl lg:text-7xl text-balance">
                {PROFILE.name}
              </h1>

              <p className="mt-5 text-lg leading-relaxed text-slate-200 sm:text-xl max-w-xl">
                {PROFILE.headline}
              </p>

              <p
                aria-label={`Focus areas: ${PROFILE.cyclingPhrases.join(', ')}`}
                className="mt-4 min-h-[1.75rem] font-mono text-sm text-cyan-300 sm:text-base"
              >
                <span aria-hidden="true">&gt; </span>
                <span>{typedPhrase}</span>
                <span
                  aria-hidden="true"
                  className="animate-caret ml-1 inline-block h-4 w-2 align-middle bg-cyan-400"
                />
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#projects"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-300 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-cyan-300 focus-visible:outline-offset-2"
                >
                  <span>Explore Projects</span>
                  <ArrowDownRight className="h-4 w-4" />
                </a>
                <a
                  href="#blog"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-md border border-slate-700 bg-[#070d18]/90 px-5 py-2.5 text-sm font-medium text-slate-100 hover:border-cyan-400/50 hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-cyan-400"
                >
                  <span>Read Engineering Blog</span>
                </a>
              </div>

              {/* Key metrics strip */}
              <dl className="mt-12 grid grid-cols-2 gap-6 border-t border-slate-800/80 pt-7 sm:grid-cols-4">
                <div>
                  <dt className="text-xs text-slate-400">Bag Tracking</dt>
                  <dd className="mt-1 font-mono tabular-nums text-xl font-bold text-slate-50">
                    92%+
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">AMR Reliability</dt>
                  <dd className="mt-1 font-mono tabular-nums text-xl font-bold text-slate-50">
                    98%+
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Pipeline Speed</dt>
                  <dd className="mt-1 font-mono tabular-nums text-xl font-bold text-slate-50">
                    30+ FPS
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Academic CGPA</dt>
                  <dd className="mt-1 font-mono tabular-nums text-xl font-bold text-slate-50">
                    {PROFILE.cgpa}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* Profile & Education Section */}
        <section
          id="profile"
          data-scene-stop="profile"
          aria-labelledby="profile-heading"
          className="py-20 sm:py-24"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-xl border border-slate-800/90 bg-[#070d18]/92 p-6 sm:p-10">
              <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
                <div className="lg:col-span-4">
                  <div className="mx-auto max-w-[260px] overflow-hidden rounded-lg border border-slate-700/80 bg-slate-950 lg:mx-0">
                    {portraitFailed ? (
                      <div className="flex aspect-[4/5] items-center justify-center bg-slate-900 text-sm font-medium text-slate-400">
                        {PROFILE.name}
                      </div>
                    ) : (
                      <img
                        src={PROFILE.portraitUrl}
                        alt="Portrait of Kabilan A"
                        referrerPolicy="no-referrer"
                        onError={() => setPortraitFailed(true)}
                        className="aspect-[4/5] w-full object-cover"
                      />
                    )}
                  </div>
                </div>

                <div className="lg:col-span-8">
                  <p className="text-xs font-semibold tracking-wider text-cyan-400 uppercase">
                    Profile &amp; Background
                  </p>
                  <h2
                    id="profile-heading"
                    className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl text-balance"
                  >
                    Engineering Intelligence for Physical Systems
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-slate-200">
                    {PROFILE.bioPrimary}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
                    {PROFILE.bioSecondary}
                  </p>

                  {/* Education & Extras */}
                  <div className="mt-8 grid gap-6 border-t border-slate-800/80 pt-6 sm:grid-cols-2">
                    {PROFILE.education.map((edu) => (
                      <div key={edu.credential}>
                        <p className="text-xs font-medium text-cyan-300">
                          {edu.period} · {edu.detail}
                        </p>
                        <h3 className="mt-1 font-display text-base font-semibold text-slate-100">
                          {edu.credential}
                        </h3>
                        <p className="mt-0.5 text-sm text-slate-400">{edu.institution}</p>
                      </div>
                    ))}
                  </div>

                  <p className="mt-6 border-t border-slate-800/80 pt-4 text-xs leading-relaxed text-slate-400">
                    {PROFILE.extras}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Experience Section */}
        <section
          id="experience"
          data-scene-stop="experience"
          aria-labelledby="experience-heading"
          className="py-20 sm:py-24"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-xl border border-slate-800/90 bg-[#070d18]/92 p-6 sm:p-10">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold tracking-wider text-cyan-400 uppercase">
                  Industrial Experience
                </p>
                <h2
                  id="experience-heading"
                  className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl text-balance"
                >
                  Production Deployments &amp; Robotics Internships
                </h2>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                {EXPERIENCES.map((exp) => (
                  <article
                    key={exp.id}
                    className="flex flex-col justify-between rounded-lg border border-slate-800/90 bg-slate-950/75 p-6"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <span className="font-medium text-cyan-300">{exp.company}</span>
                        <span aria-hidden="true">·</span>
                        <span>{exp.domain}</span>
                        <span aria-hidden="true">·</span>
                        <span>{exp.period}</span>
                      </div>

                      <h3 className="mt-2 font-display text-xl font-bold text-slate-50">
                        {exp.role}
                      </h3>

                      <dl className="mt-4 grid grid-cols-2 gap-4 border-y border-slate-800/80 py-3.5">
                        {exp.metrics.map((metric) => (
                          <div key={metric.label}>
                            <dt className="text-xs text-slate-400">{metric.label}</dt>
                            <dd className="mt-0.5 font-mono tabular-nums text-lg font-bold text-cyan-300">
                              {metric.value}
                            </dd>
                          </div>
                        ))}
                      </dl>

                      <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-slate-300 list-disc pl-5">
                        {exp.highlights.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Projects Section with Interactive Previews */}
        <section
          id="projects"
          data-scene-stop="projects"
          aria-labelledby="projects-heading"
          className="py-20 sm:py-24"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-xl border border-slate-800/90 bg-[#070d18]/92 p-6 sm:p-10">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold tracking-wider text-cyan-400 uppercase">
                  Selected Projects
                </p>
                <h2
                  id="projects-heading"
                  className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl text-balance"
                >
                  Interactive System Previews &amp; Benchmarks
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
                  Explore real-time simulations of both production pipelines directly in the
                  browser.
                </p>
              </div>

              <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:items-stretch">
                {PROJECTS.map((project) => (
                  <article
                    key={project.id}
                    className="flex flex-col justify-between rounded-lg border border-slate-800/90 bg-slate-950/75 p-6"
                  >
                    <div>
                      <p className="text-xs font-mono text-slate-400">{project.stack}</p>
                      <h3 className="mt-1.5 font-display text-xl font-bold text-slate-50">
                        {project.title}
                      </h3>

                      <div className="mt-4">
                        {project.previewType === 'bag-counter' ? (
                          <BagCounterPreview />
                        ) : (
                          <AnswerEvalPreview />
                        )}
                      </div>

                      <dl className="mt-5 grid grid-cols-3 gap-3 border-y border-slate-800/80 py-3.5">
                        {project.metrics.map((m) => (
                          <div key={m.label}>
                            <dt className="text-[11px] text-slate-400">{m.label}</dt>
                            <dd className="mt-0.5 font-mono tabular-nums text-sm font-bold text-cyan-300">
                              {m.value}
                            </dd>
                          </div>
                        ))}
                      </dl>

                      <p className="mt-4 text-sm leading-relaxed text-slate-300">
                        {project.summary}
                      </p>
                    </div>

                    <div className="mt-6 pt-2">
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[40px] items-center gap-2 rounded-md border border-cyan-400/50 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-400 hover:text-slate-950 transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-cyan-400"
                      >
                        <span>View Source on GitHub</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section
          id="skills"
          data-scene-stop="skills"
          aria-labelledby="skills-heading"
          className="py-20 sm:py-24"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-xl border border-slate-800/90 bg-[#070d18]/92 p-6 sm:p-10">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold tracking-wider text-cyan-400 uppercase">
                    Technical Stack
                  </p>
                  <h2
                    id="skills-heading"
                    className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl text-balance"
                  >
                    Core Capabilities &amp; Tooling
                  </h2>
                </div>
                <a
                  href="#profiles"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 hover:text-cyan-200 transition-colors whitespace-nowrap"
                >
                  <span>Explore repositories</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>

              <div className="mt-8 grid gap-6 md:grid-cols-3">
                {SKILL_GROUPS.map((group) => (
                  <div
                    key={group.category}
                    className="rounded-lg border border-slate-800/90 bg-slate-950/75 p-5"
                  >
                    <h3 className="font-display text-base font-bold text-slate-100">
                      {group.category}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-300">
                      {group.items.join(' · ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Engineering Blog Section */}
        <BlogSection />

        {/* Professional Profiles & Contact Section */}
        <ContactSection />
      </main>

      <Footer />
    </div>
  );
}
