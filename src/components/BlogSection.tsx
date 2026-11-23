import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Check,
  Copy,
  LayoutGrid,
  Linkedin,
  List,
  Search,
  Share2,
  Twitter,
  X,
} from 'lucide-react';
import {
  BLOG_CATEGORIES,
  BLOG_POSTS,
  type BlogCategory,
  type BlogPost,
} from '../data/blogData';

function ResilientImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center bg-gradient-to-br from-slate-900 via-[#0b182c] to-slate-950 p-6 text-center ${className ?? ''}`}
      >
        <span className="font-display text-sm font-semibold text-cyan-300/80">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

function ArticleReaderModal({
  post,
  onClose,
}: {
  post: BlogPost;
  onClose: () => void;
}) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [readProgress, setReadProgress] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const maxScroll = el.scrollHeight - el.clientHeight;
    setReadProgress(maxScroll > 0 ? Math.min(100, (el.scrollTop / maxScroll) * 100) : 100);
  };

  const articleUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/#blog-${post.slug}`
      : `https://kabilan-portfolio.dev/#blog-${post.slug}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(articleUrl);
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      setCopiedLink(false);
    }
  };

  const linkedInShareHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    articleUrl
  )}`;
  const twitterShareHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `${post.title} — by Kabilan A`
  )}&url=${encodeURIComponent(articleUrl)}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="article-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-slate-700/80 bg-[#070d18] shadow-2xl">
        {/* Reading progress indicator */}
        <div className="h-1 w-full bg-slate-900">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-[width] duration-150"
            style={{ width: `${readProgress}%` }}
          />
        </div>

        {/* Modal header */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-800 px-5 py-3.5 sm:px-8">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="font-medium text-cyan-300">{post.category}</span>
            <span aria-hidden="true">·</span>
            <span>{post.publishedAt}</span>
            <span aria-hidden="true">·</span>
            <span>{post.readTime}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close article"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-700 text-slate-300 hover:border-cyan-400/50 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-cyan-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable readable article body */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="overflow-y-auto px-5 py-6 sm:px-8 sm:py-8"
        >
          <article className="mx-auto max-w-[68ch]">
            <h2
              id="article-modal-title"
              className="font-display text-2xl font-bold leading-tight text-slate-50 sm:text-3xl text-balance"
            >
              {post.title}
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              Written by <span className="font-medium text-slate-200">Kabilan A</span> · AI &amp;
              Robotics Engineer
            </p>

            <div className="mt-6 overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
              <ResilientImage
                src={post.featuredImage}
                alt={post.featuredAlt}
                className="aspect-video w-full object-cover"
              />
            </div>

            <p className="mt-6 text-base leading-relaxed text-slate-200 font-medium">
              {post.excerpt}
            </p>

            {/* Key engineering takeaways */}
            <div className="mt-6 rounded-lg border border-slate-800 bg-slate-900/50 p-5">
              <h3 className="font-display text-sm font-semibold text-cyan-300">
                Key Engineering Takeaways
              </h3>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-300 list-disc pl-5">
                {post.keyTakeaways.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>

            {/* Main article sections */}
            <div className="mt-8 space-y-8">
              {post.sections.map((section) => (
                <section key={section.heading} className="space-y-3.5">
                  <h3 className="font-display text-xl font-bold text-slate-100">
                    {section.heading}
                  </h3>
                  {section.paragraphs.map((paragraph, idx) => (
                    <p
                      key={idx}
                      className="text-[15.5px] leading-[1.7] text-slate-300"
                    >
                      {paragraph}
                    </p>
                  ))}
                  {section.codeSnippet && (
                    <figure className="mt-4 overflow-hidden rounded-lg border border-slate-800 bg-[#04070e]">
                      <figcaption className="flex items-center justify-between border-b border-slate-800 px-4 py-2 text-xs text-slate-400">
                        <span>{section.codeSnippet.caption}</span>
                        <span className="font-mono text-cyan-300">
                          {section.codeSnippet.language}
                        </span>
                      </figcaption>
                      <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-slate-200 font-mono">
                        <code>{section.codeSnippet.code}</code>
                      </pre>
                    </figure>
                  )}
                </section>
              ))}
            </div>

            {/* Social sharing & next action footer */}
            <div className="mt-10 border-t border-slate-800 pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                    <Share2 className="h-4 w-4 text-cyan-400" />
                    <span>Share this engineering note</span>
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Found this architecture useful? Share it or reach out to discuss implementation details.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={linkedInShareHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-cyan-400/50 hover:text-cyan-300 transition-colors whitespace-nowrap"
                  >
                    <Linkedin className="h-3.5 w-3.5" />
                    <span>LinkedIn</span>
                  </a>
                  <a
                    href={twitterShareHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-cyan-400/50 hover:text-cyan-300 transition-colors whitespace-nowrap"
                  >
                    <Twitter className="h-3.5 w-3.5" />
                    <span>X / Twitter</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-cyan-400/50 hover:text-cyan-300 transition-colors whitespace-nowrap"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Link Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                <p className="text-sm text-slate-300">
                  Want to collaborate on computer vision or AMR deployments?
                </p>
                <a
                  href="#contact"
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 rounded-md bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-300 transition-colors whitespace-nowrap"
                >
                  <span>Start a Conversation</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

export default function BlogSection() {
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activePost, setActivePost] = useState<BlogPost | null>(null);

  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return BLOG_POSTS.filter((post) => {
      const matchesCategory =
        selectedCategory === 'All' || post.category === selectedCategory;
      const matchesQuery =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.category.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <section
      id="blog"
      data-scene-stop="blog"
      aria-labelledby="blog-heading"
      className="relative z-10 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-slate-800/90 bg-[#070d18]/92 p-6 sm:p-10">
          {/* Section header */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-wider text-cyan-400 uppercase">
                Engineering Blog
              </p>
              <h2
                id="blog-heading"
                className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl text-balance"
              >
                Field Notes on Vision, Robotics &amp; Applied NLP
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
                Technical breakdowns from warehouse deployments, ROS navigation trials, and
                production ML pipelines.
              </p>
            </div>

            {/* View mode switcher (Grid / List) */}
            <div className="flex items-center gap-3 self-start lg:self-end">
              <div
                role="group"
                aria-label="Blog layout view"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950/80 p-1"
              >
                <button
                  type="button"
                  aria-pressed={viewMode === 'grid'}
                  onClick={() => setViewMode('grid')}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-cyan-400 ${
                    viewMode === 'grid'
                      ? 'bg-cyan-400 text-slate-950 font-semibold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span>Grid</span>
                </button>
                <button
                  type="button"
                  aria-pressed={viewMode === 'list'}
                  onClick={() => setViewMode('list')}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-cyan-400 ${
                    viewMode === 'list'
                      ? 'bg-cyan-400 text-slate-950 font-semibold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <List className="h-3.5 w-3.5" />
                  <span>List</span>
                </button>
              </div>
            </div>
          </div>

          {/* Filter & Search Toolbar */}
          <div className="mt-8 flex flex-col gap-4 border-y border-slate-800/80 py-4 md:flex-row md:items-center md:justify-between">
            <div
              role="group"
              aria-label="Filter articles by topic"
              className="flex flex-wrap items-center gap-1.5"
            >
              {BLOG_CATEGORIES.map((category) => {
                const active = selectedCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSelectedCategory(category)}
                    className={`min-h-[38px] rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-cyan-400 ${
                      active
                        ? 'bg-cyan-400/15 text-cyan-300 border border-cyan-400/40 font-semibold'
                        : 'text-slate-300 border border-transparent hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full md:w-64">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                aria-label="Search blog articles"
                className="h-10 w-full rounded-md border border-slate-800 bg-slate-950/90 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Empty state */}
          {filteredPosts.length === 0 ? (
            <div className="mt-8 rounded-lg border border-slate-800 bg-slate-900/40 px-6 py-12 text-center">
              <p className="text-sm font-medium text-slate-200">
                No articles match your current filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="mt-3 rounded-md border border-slate-700 px-3.5 py-2 text-xs font-medium text-cyan-300 hover:border-cyan-400/60 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className="group flex flex-col overflow-hidden rounded-lg border border-slate-800/90 bg-slate-950/75 transition-colors hover:border-cyan-400/40"
                >
                  <button
                    type="button"
                    onClick={() => setActivePost(post)}
                    className="block w-full overflow-hidden border-b border-slate-800/80 text-left focus-visible:outline-2 focus-visible:outline-cyan-400"
                  >
                    <ResilientImage
                      src={post.featuredImage}
                      alt={post.featuredAlt}
                      className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </button>

                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span className="font-medium text-cyan-300">{post.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{post.publishedAt}</span>
                      <span aria-hidden="true">·</span>
                      <span>{post.readTime}</span>
                    </div>

                    <h3 className="mt-3 font-display text-xl font-bold leading-snug text-slate-100 group-hover:text-cyan-300 transition-colors text-balance">
                      <button
                        type="button"
                        onClick={() => setActivePost(post)}
                        className="text-left focus-visible:outline-2 focus-visible:outline-cyan-400 rounded"
                      >
                        {post.title}
                      </button>
                    </h3>

                    <p className="mt-2.5 flex-1 text-sm leading-relaxed text-slate-300">
                      {post.excerpt}
                    </p>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-800/70 pt-4">
                      <button
                        type="button"
                        onClick={() => setActivePost(post)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 hover:text-cyan-200 transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-cyan-400 rounded"
                      >
                        <span>Read Article</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-xs text-slate-500">Kabilan A</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="mt-8 divide-y divide-slate-800/80 rounded-lg border border-slate-800/90 bg-slate-950/75">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className="group flex flex-col gap-5 p-5 sm:flex-row sm:items-stretch sm:p-6 transition-colors hover:bg-slate-900/40"
                >
                  <button
                    type="button"
                    onClick={() => setActivePost(post)}
                    className="shrink-0 overflow-hidden rounded-md border border-slate-800 sm:w-60 focus-visible:outline-2 focus-visible:outline-cyan-400"
                  >
                    <ResilientImage
                      src={post.featuredImage}
                      alt={post.featuredAlt}
                      className="aspect-video w-full object-cover sm:h-full transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </button>

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <span className="font-medium text-cyan-300">{post.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{post.publishedAt}</span>
                        <span aria-hidden="true">·</span>
                        <span>{post.readTime}</span>
                      </div>

                      <h3 className="mt-2 font-display text-xl font-bold leading-snug text-slate-100 group-hover:text-cyan-300 transition-colors text-balance">
                        <button
                          type="button"
                          onClick={() => setActivePost(post)}
                          className="text-left focus-visible:outline-2 focus-visible:outline-cyan-400 rounded"
                        >
                          {post.title}
                        </button>
                      </h3>

                      <p className="mt-2 text-sm leading-relaxed text-slate-300">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => setActivePost(post)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 hover:text-cyan-200 transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-cyan-400 rounded"
                      >
                        <span>Read Article</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      {activePost && (
        <ArticleReaderModal post={activePost} onClose={() => setActivePost(null)} />
      )}
    </section>
  );
}
