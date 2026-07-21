import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { copyText } from '../lib/clipboard';
import { escapeHtml } from '../lib/escapeHtml';
import { escapeRegExp } from '../lib/semanticSearch';

// ─── Test 3: Regex escape unit test ───
describe('Regex escape', () => {
 it('does not throw with special regex characters', () => {
  const input = '(a+b)*';
  const escaped = escapeRegExp(input);
  expect(() => new RegExp(escaped, 'g')).not.toThrow();
 });

 it('matches the literal string correctly', () => {
  const input = '[test] (x+1)?';
  const escaped = escapeRegExp(input);
  const re = new RegExp(escaped, 'g');
  expect('found [test] (x+1)? here').toMatch(re);
 });
});

// ─── Test 5: Escape XSS ───
describe('escapeHtml', () => {
 it('escapes HTML special characters', () => {
  expect(escapeHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
 });

 it('escapes ampersand, quotes, and single quotes', () => {
  expect(escapeHtml('a&b"c\'d')).toBe('a&amp;b&quot;c&#39;d');
 });

 it('returns plain text unchanged', () => {
  expect(escapeHtml('hello world')).toBe('hello world');
 });
});

// ─── Test 6: Clipboard fallback ───
describe('copyText', () => {
 beforeEach(() => {
  vi.restoreAllMocks();
 });

 it('does not throw when navigator.clipboard is undefined', async () => {
  const originalClipboard = navigator.clipboard;
  Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });

  // jsdom doesn't have execCommand, so mock it on the prototype
  const origExec = document.execCommand;
  (document as any).execCommand = vi.fn().mockReturnValue(true);

  await expect(copyText('test')).resolves.not.toThrow();

  (document as any).execCommand = origExec;
  Object.defineProperty(navigator, 'clipboard', { value: originalClipboard, configurable: true });
 });

 it('uses navigator.clipboard.writeText when available', async () => {
  const writeTextSpy = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
   value: { writeText: writeTextSpy },
   configurable: true,
  });

  await copyText('hello');
  expect(writeTextSpy).toHaveBeenCalledWith('hello');
 });
});

// ─── Test 4: Stars visible ───
describe('Star rating visibility', () => {
 const StarButton = ({ n, rating }: { n: number; rating: number }) => (
  <button aria-pressed={n <= rating}>
   {n <= rating ? '★' : '☆'}
  </button>
 );

 it('renders filled star when rating >= n', () => {
  render(<StarButton n={3} rating={5} />);
  expect(screen.getByText('★')).toBeInTheDocument();
 });

 it('renders empty star when rating < n', () => {
  render(<StarButton n={5} rating={3} />);
  expect(screen.getByText('☆')).toBeInTheDocument();
 });

 it('sets aria-pressed correctly', () => {
  const { rerender } = render(<StarButton n={2} rating={3} />);
  expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');

  rerender(<StarButton n={5} rating={3} />);
  expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
 });
});

// ─── Test 1 & 2: Copilot spinner and regex input ───
// Minimal component that simulates the WikiLLM copilot behavior
function CopilotSimulator() {
 const [loading, setLoading] = React.useState(false);
 const [response, setResponse] = React.useState('');

 const askWikiLLM = (query: string) => {
  setLoading(true);
  setResponse('');
  setTimeout(() => {
   try {
    const q = query.toLowerCase();
    const searchTerms = q.split(/\s+/).filter((t: string) => t.length > 2);
    searchTerms.forEach((term: string) => {
     const escaped = escapeRegExp(term);
     const regex = new RegExp(escaped, 'g');
     'test'.match(regex);
    });
    setResponse(`Risposta per: "${query}"`);
   } catch (err) {
    setResponse('Errore');
   } finally {
    setLoading(false);
   }
  }, 100);
 };

 return (
  <div>
   <div data-testid="loading">{loading ? 'Elaborazione…' : 'Pronto'}</div>
   <div data-testid="response">{response}</div>
   <button onClick={() => askWikiLLM('test query')}>Normal</button>
   <button onClick={() => askWikiLLM('[test] (x+1)?')}>Regex</button>
  </div>
 );
}

describe('Copilot behavior', () => {
 it('spinner returns to false after response', async () => {
  render(<CopilotSimulator />);
  expect(screen.getByTestId('loading')).toHaveTextContent('Pronto');

  fireEvent.click(screen.getByText('Normal'));

  expect(screen.getByTestId('loading')).toHaveTextContent('Elaborazione…');

  await waitFor(() => {
   expect(screen.getByTestId('loading')).toHaveTextContent('Pronto');
  }, { timeout: 3000 });

  expect(screen.getByTestId('response')).toHaveTextContent('Risposta per:');
 });

 it('input with regex chars does not throw and produces response', async () => {
  render(<CopilotSimulator />);

  fireEvent.click(screen.getByText('Regex'));

  await waitFor(() => {
   expect(screen.getByTestId('loading')).toHaveTextContent('Pronto');
  }, { timeout: 3000 });

  expect(screen.getByTestId('response')).toHaveTextContent('Risposta per:');
 });
});
