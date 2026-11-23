import { useMemo, useState } from 'react';
import { EVAL_SAMPLES } from '../data/portfolioData';

const STOP_WORDS = new Set(
  'a an the is are was were of to in on and or it its be by for with as at that this so can when which how do does has have'.split(
    ' '
  )
);

function stemWord(word: string): string {
  return word.replace(/(ing|ed|s)$/, '');
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z ]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !STOP_WORDS.has(w))
    .map(stemWord);
}

function buildVector(tokens: string[]): Record<string, number> {
  const vec: Record<string, number> = {};
  for (const token of tokens) {
    vec[token] = (vec[token] || 0) + 1;
  }
  return vec;
}

function cosineSimilarity(a: Record<string, number>, b: Record<string, number>): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (const key in a) {
    normA += a[key] * a[key];
    if (b[key]) dot += a[key] * b[key];
  }
  for (const key in b) {
    normB += b[key] * b[key];
  }
  return dot / Math.sqrt(normA * normB || 1);
}

function HighlightedTokens({ text, matchVec }: { text: string; matchVec: Record<string, number> }) {
  const segments = text.split(/(\s+)/);
  return (
    <>
      {segments.map((part, idx) => {
        const cleaned = part.toLowerCase().replace(/[^a-z]/g, '');
        const isMatch = Boolean(cleaned && !STOP_WORDS.has(cleaned) && matchVec[stemWord(cleaned)]);
        if (!isMatch) return <span key={idx}>{part}</span>;
        return (
          <mark
            key={idx}
            className="rounded-sm bg-cyan-400/20 px-0.5 text-cyan-200 font-medium"
          >
            {part}
          </mark>
        );
      })}
    </>
  );
}

export default function AnswerEvalPreview() {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [customMode, setCustomMode] = useState(false);
  const [customText, setCustomText] = useState(EVAL_SAMPLES.answers[0].text);

  const activeAnswer = customMode
    ? customText
    : EVAL_SAMPLES.answers[selectedIdx]?.text ?? '';

  const { keyVec, ansVec, similarity, scoreOutOfTen } = useMemo(() => {
    const kVec = buildVector(tokenize(EVAL_SAMPLES.modelKey));
    const aVec = buildVector(tokenize(activeAnswer));
    const sim = cosineSimilarity(kVec, aVec);
    const marks = Math.min(10, Math.round((sim / 0.75) * 100) / 10);
    return { keyVec: kVec, ansVec: aVec, similarity: sim, scoreOutOfTen: marks };
  }, [activeAnswer]);

  return (
    <div className="rounded-lg border border-slate-800 bg-[#050a14] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3 mb-3">
        <span className="text-xs text-slate-400">Interactive grading evaluator</span>
        <div
          role="group"
          aria-label="Sample student answers"
          className="inline-flex items-center gap-1 rounded-md bg-slate-900/90 p-1 border border-slate-800"
        >
          {EVAL_SAMPLES.answers.map((sample, idx) => {
            const active = !customMode && selectedIdx === idx;
            return (
              <button
                key={sample.label}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setCustomMode(false);
                  setSelectedIdx(idx);
                }}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-cyan-400 ${
                  active
                    ? 'bg-cyan-400 text-slate-950 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {sample.label}
              </button>
            );
          })}
          <button
            type="button"
            aria-pressed={customMode}
            onClick={() => setCustomMode(true)}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-cyan-400 ${
              customMode
                ? 'bg-cyan-400 text-slate-950 font-semibold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Test Input
          </button>
        </div>
      </div>

      <div className="space-y-2.5 text-xs leading-relaxed text-slate-300">
        <p>
          <span className="font-semibold text-slate-100">Model key: </span>
          <HighlightedTokens text={EVAL_SAMPLES.modelKey} matchVec={ansVec} />
        </p>

        {customMode ? (
          <div>
            <label
              htmlFor="custom-eval-answer"
              className="block font-semibold text-slate-100 mb-1"
            >
              Student answer (editable):
            </label>
            <textarea
              id="custom-eval-answer"
              rows={3}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Type a student response about overfitting..."
              className="w-full rounded-md border border-slate-700 bg-slate-900/80 px-2.5 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
            />
          </div>
        ) : (
          <p>
            <span className="font-semibold text-slate-100">Student answer: </span>
            <HighlightedTokens text={activeAnswer} matchVec={keyVec} />
          </p>
        )}
      </div>

      <div className="mt-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-[width] duration-300"
            style={{ width: `${Math.min(100, scoreOutOfTen * 10)}%` }}
          />
        </div>
        <div className="mt-2.5 flex items-baseline justify-between gap-2">
          <div className="font-mono tabular-nums text-sm text-slate-300">
            <span className="text-xl font-bold text-cyan-400">{scoreOutOfTen.toFixed(1)}</span>
            <span className="text-slate-400"> / 10</span>
          </div>
          <span className="font-mono tabular-nums text-xs text-slate-400">
            cosine similarity {similarity.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
