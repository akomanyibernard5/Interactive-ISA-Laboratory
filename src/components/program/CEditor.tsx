/**
 * CEditor — A textarea-based C code editor with:
 *   - Line numbers (left gutter)
 *   - Lightweight syntax highlighting (overlay div, pointer-events: none)
 *   - Error indicators via Cloudscape Alert
 *
 * Architecture:
 *   [container]
 *     [gutter]    → numbered lines, scroll-synced
 *     [scroll-area]
 *       [highlight-layer]  → contenteditable=false, pointer-events:none
 *       [textarea]         → transparent bg, captures all input
 *
 * The highlight layer and the textarea share identical font, padding,
 * line-height, and scroll position so tokens appear directly under the
 * text the user typed.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import Alert from '@cloudscape-design/components/alert';
import type { EditorError } from '../../types';

// ─── Types ──────────────────────────────────────────────────────────────────

interface CEditorProps {
  value: string;
  onChange: (value: string) => void;
  errors?: EditorError[];
  readOnly?: boolean;
  height?: string;
}

// ─── Tokens / syntax highlighting ───────────────────────────────────────────

const C_KEYWORDS = new Set([
  'int', 'if', 'else', 'while', 'for', 'return',
  'void', 'char', 'float', 'double', 'long', 'short',
]);

type TokenKind = 'keyword' | 'number' | 'comment' | 'string' | 'default';

interface Token {
  kind: TokenKind;
  text: string;
}

/** Tokenise a single line into coloured spans. */
function tokeniseLine(line: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const len = line.length;

  while (i < len) {
    // — line comment
    if (line[i] === '/' && line[i + 1] === '/') {
      tokens.push({ kind: 'comment', text: line.slice(i) });
      break;
    }

    // — string literal
    if (line[i] === '"') {
      let j = i + 1;
      while (j < len && !(line[j] === '"' && line[j - 1] !== '\\')) j++;
      tokens.push({ kind: 'string', text: line.slice(i, j + 1) });
      i = j + 1;
      continue;
    }

    // — character literal
    if (line[i] === "'") {
      let j = i + 1;
      while (j < len && !(line[j] === "'" && line[j - 1] !== '\\')) j++;
      tokens.push({ kind: 'string', text: line.slice(i, j + 1) });
      i = j + 1;
      continue;
    }

    // — number literal (integer / float)
    if (/[0-9]/.test(line[i])) {
      let j = i + 1;
      while (j < len && /[0-9a-fA-FxX_.]/.test(line[j])) j++;
      tokens.push({ kind: 'number', text: line.slice(i, j) });
      i = j;
      continue;
    }

    // — identifier / keyword
    if (/[a-zA-Z_]/.test(line[i])) {
      let j = i + 1;
      while (j < len && /[a-zA-Z0-9_]/.test(line[j])) j++;
      const word = line.slice(i, j);
      tokens.push({ kind: C_KEYWORDS.has(word) ? 'keyword' : 'default', text: word });
      i = j;
      continue;
    }

    // — anything else (operators, punctuation, whitespace)
    tokens.push({ kind: 'default', text: line[i] });
    i++;
  }

  return tokens;
}

const TOKEN_COLORS: Record<TokenKind, string | undefined> = {
  keyword: '#0972d3',   // Cloudscape blue
  number:  '#b26900',   // Cloudscape amber
  comment: '#6c7787',   // Cloudscape slate grey
  string:  '#1a7f37',   // muted green
  default: undefined,
};

/** Convert tokenised line into an HTML string for the highlight overlay. */
function lineToHtml(line: string): string {
  if (line === '') return ' '; // preserve empty lines (height)
  const tokens = tokeniseLine(line);
  return tokens
    .map(({ kind, text }) => {
      const color = TOKEN_COLORS[kind];
      const safe = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return color
        ? `<span style="color:${color}">${safe}</span>`
        : safe;
    })
    .join('');
}

/** Build the full innerHTML for the highlight overlay. */
function buildHighlightHtml(source: string): string {
  return source
    .split('\n')
    .map((line) => `<div style="height:1.6em">${lineToHtml(line)}</div>`)
    .join('');
}

// ─── Shared style constants ──────────────────────────────────────────────────

const FONT_FAMILY =
  "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, 'Courier New', monospace";
const FONT_SIZE   = '13px';
const LINE_HEIGHT = '1.6em';
const PADDING     = '8px 10px';

// ─── Component ───────────────────────────────────────────────────────────────

export default function CEditor({
  value,
  onChange,
  errors = [],
  readOnly = false,
  height = '400px',
}: CEditorProps) {
  const textareaRef  = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const gutterRef    = useRef<HTMLDivElement>(null);
  const scrollRef    = useRef<HTMLDivElement>(null);

  // Track scroll offset for gutter sync
  const [, forceUpdate] = useState(0);

  // ── Line numbers ────────────────────────────────────────────────────────────
  const lines = value.split('\n');
  const lineCount = lines.length;

  // ── Highlight layer ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (highlightRef.current) {
      highlightRef.current.innerHTML = buildHighlightHtml(value);
    }
  }, [value]);

  // ── Scroll synchronisation ──────────────────────────────────────────────────
  const syncScroll = useCallback(() => {
    const ta = textareaRef.current;
    const hl = highlightRef.current;
    const gt = gutterRef.current;
    if (!ta || !hl || !gt) return;

    hl.scrollTop  = ta.scrollTop;
    hl.scrollLeft = ta.scrollLeft;
    gt.scrollTop  = ta.scrollTop;
  }, []);

  // ── Tab key support ─────────────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const ta = e.currentTarget;
        const start = ta.selectionStart;
        const end   = ta.selectionEnd;
        const next  = value.slice(0, start) + '  ' + value.slice(end);
        onChange(next);
        // Restore caret after state update
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = start + 2;
        });
      }
    },
    [value, onChange],
  );

  // Force a re-render whenever the textarea fires a scroll so the gutter
  // line-highlight can be kept in sync (gutterRef.scrollTop set above).
  const handleScroll = useCallback(() => {
    syncScroll();
    forceUpdate((n) => n + 1);
  }, [syncScroll]);

  // ── Line error set for gutter highlighting ──────────────────────────────────
  const errorLines = new Set(errors.map((e) => e.line));

  // ── Gutter width (scales with line count) ──────────────────────────────────
  const gutterWidth = lineCount >= 1000 ? '44px' : lineCount >= 100 ? '36px' : '28px';

  // ── Styles ──────────────────────────────────────────────────────────────────

  const containerStyle: React.CSSProperties = {
    border: '1px solid #d5dbdb',
    borderRadius: '8px',
    overflow: 'hidden',
    background: '#ffffff',
    fontFamily: FONT_FAMILY,
    fontSize: FONT_SIZE,
    lineHeight: LINE_HEIGHT,
    display: 'flex',
    flexDirection: 'column',
  };

  const editorRowStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    height,
    overflow: 'hidden',
  };

  // Gutter: a non-scrolling-width div that scrolls vertically with the textarea
  const gutterStyle: React.CSSProperties = {
    width: gutterWidth,
    minWidth: gutterWidth,
    overflowY: 'hidden',
    overflowX: 'hidden',
    background: '#f0f2f3',
    borderRight: '1px solid #d5dbdb',
    userSelect: 'none',
    flexShrink: 0,
    paddingTop: '8px',
    paddingBottom: '8px',
    boxSizing: 'border-box',
  };

  const gutterInnerStyle: React.CSSProperties = {
    position: 'relative',
    top: -(textareaRef.current?.scrollTop ?? 0),
  };

  const gutterLineStyle = (lineNum: number): React.CSSProperties => ({
    height: LINE_HEIGHT,
    lineHeight: LINE_HEIGHT,
    textAlign: 'right',
    paddingRight: '6px',
    paddingLeft: '4px',
    fontSize: FONT_SIZE,
    fontFamily: FONT_FAMILY,
    color: errorLines.has(lineNum) ? '#d91515' : '#8c9ba5',
    fontWeight: errorLines.has(lineNum) ? 600 : 400,
    whiteSpace: 'nowrap',
  });

  // The scroll area holds both the highlight layer and the textarea
  const scrollAreaStyle: React.CSSProperties = {
    position: 'relative',
    flex: 1,
    overflow: 'hidden',
  };

  const sharedTextStyle: React.CSSProperties = {
    fontFamily: FONT_FAMILY,
    fontSize: FONT_SIZE,
    lineHeight: LINE_HEIGHT,
    padding: PADDING,
    margin: 0,
    border: 'none',
    outline: 'none',
    whiteSpace: 'pre',
    wordWrap: 'normal' as const,
    overflowWrap: 'normal' as const,
    tabSize: 2,
    boxSizing: 'border-box' as const,
    width: '100%',
    height: '100%',
  };

  const highlightLayerStyle: React.CSSProperties = {
    ...sharedTextStyle,
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
    background: '#ffffff',
    color: '#0d1117',
    zIndex: 0,
  };

  const textareaStyle: React.CSSProperties = {
    ...sharedTextStyle,
    position: 'absolute',
    inset: 0,
    background: 'transparent',
    color: 'transparent',
    caretColor: '#0d1117',
    resize: 'none',
    overflow: 'auto',
    zIndex: 1,
    cursor: readOnly ? 'default' : 'text',
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div>
      <div style={containerStyle}>
        {/* Header bar */}
        <div
          style={{
            background: '#f0f2f3',
            borderBottom: '1px solid #d5dbdb',
            padding: '4px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            userSelect: 'none',
          }}
        >
          <span
            style={{
              width: '10px', height: '10px', borderRadius: '50%',
              background: '#ff5f57', display: 'inline-block',
            }}
          />
          <span
            style={{
              width: '10px', height: '10px', borderRadius: '50%',
              background: '#ffbd2e', display: 'inline-block',
            }}
          />
          <span
            style={{
              width: '10px', height: '10px', borderRadius: '50%',
              background: '#28c940', display: 'inline-block',
            }}
          />
          <span
            style={{
              marginLeft: '8px',
              fontSize: '11px',
              color: '#6c7787',
              fontFamily: FONT_FAMILY,
            }}
          >
            main.c
          </span>
          {readOnly && (
            <span
              style={{
                marginLeft: 'auto',
                fontSize: '11px',
                color: '#6c7787',
                background: '#dde1e3',
                borderRadius: '4px',
                padding: '1px 6px',
                fontFamily: 'inherit',
              }}
            >
              read-only
            </span>
          )}
        </div>

        {/* Editor row: gutter + scroll area */}
        <div style={editorRowStyle} ref={scrollRef}>
          {/* Gutter */}
          <div ref={gutterRef} style={gutterStyle}>
            <div style={gutterInnerStyle}>
              {lines.map((_, idx) => (
                <div key={idx} style={gutterLineStyle(idx + 1)}>
                  {idx + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Scroll area */}
          <div style={scrollAreaStyle}>
            {/* Syntax highlight overlay */}
            <div
              ref={highlightRef}
              contentEditable={false}
              aria-hidden="true"
              style={highlightLayerStyle}
            />

            {/* Actual textarea — transparent, on top */}
            <textarea
              ref={textareaRef}
              value={value}
              readOnly={readOnly}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              autoComplete="off"
              aria-label="C source code editor"
              style={textareaStyle}
              onChange={(e) => onChange(e.target.value)}
              onScroll={handleScroll}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
      </div>

      {/* Error alerts */}
      {errors.length > 0 && (
        <div style={{ marginTop: '8px' }}>
          <Alert
            type="error"
            header="Compilation errors"
          >
            <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px' }}>
              {errors.map((err, i) => (
                <li key={i}>
                  <strong>Line {err.line}{err.column > 0 ? `:${err.column}` : ''}</strong>
                  {' — '}
                  {err.message}
                </li>
              ))}
            </ul>
          </Alert>
        </div>
      )}
    </div>
  );
}
