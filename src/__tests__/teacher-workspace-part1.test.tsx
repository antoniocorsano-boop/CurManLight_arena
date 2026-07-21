import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAppWorkflowState } from '../features/session/hooks/useAppWorkflowState';
import type { GraphNode } from '../lib/architectureGraph';

const mockNodes: GraphNode[] = [{ id: 'app', label: 'App', level: 0 }];

describe('Teacher Workspace Part 1 — wizardStep persistence', () => {
 beforeEach(() => {
  localStorage.clear();
 });

 it('uses default step 1 when key is absent', () => {
  const { result } = renderHook(() => useAppWorkflowState({ initialNodes: mockNodes }));
  expect(result.current.wizardStep).toBe(1);
 });

 it('restores a valid step from localStorage', () => {
  localStorage.setItem('curman_wizardStep', '3');
  const { result } = renderHook(() => useAppWorkflowState({ initialNodes: mockNodes }));
  expect(result.current.wizardStep).toBe(3);
 });

 it('restores step 1', () => {
  localStorage.setItem('curman_wizardStep', '1');
  const { result } = renderHook(() => useAppWorkflowState({ initialNodes: mockNodes }));
  expect(result.current.wizardStep).toBe(1);
 });

 it('restores step 5', () => {
  localStorage.setItem('curman_wizardStep', '5');
  const { result } = renderHook(() => useAppWorkflowState({ initialNodes: mockNodes }));
  expect(result.current.wizardStep).toBe(5);
 });

 it('falls back to step 1 for negative value', () => {
  localStorage.setItem('curman_wizardStep', '-1');
  const { result } = renderHook(() => useAppWorkflowState({ initialNodes: mockNodes }));
  expect(result.current.wizardStep).toBe(1);
 });

 it('falls back to step 1 for value above maximum', () => {
  localStorage.setItem('curman_wizardStep', '6');
  const { result } = renderHook(() => useAppWorkflowState({ initialNodes: mockNodes }));
  expect(result.current.wizardStep).toBe(1);
 });

 it('falls back to step 1 for non-numeric value', () => {
  localStorage.setItem('curman_wizardStep', 'abc');
  const { result } = renderHook(() => useAppWorkflowState({ initialNodes: mockNodes }));
  expect(result.current.wizardStep).toBe(1);
 });

 it('persists step on advance', () => {
  const { result } = renderHook(() => useAppWorkflowState({ initialNodes: mockNodes }));
  act(() => result.current.setWizardStep(2));
  expect(localStorage.getItem('curman_wizardStep')).toBe('2');
 });

 it('persists step on go back', () => {
  localStorage.setItem('curman_wizardStep', '4');
  const { result } = renderHook(() => useAppWorkflowState({ initialNodes: mockNodes }));
  act(() => result.current.setWizardStep(3));
  expect(localStorage.getItem('curman_wizardStep')).toBe('3');
 });

 it('survives simulated reload', () => {
  const { result, unmount } = renderHook(() => useAppWorkflowState({ initialNodes: mockNodes }));
  act(() => result.current.setWizardStep(3));
  unmount();

  const { result: result2 } = renderHook(() => useAppWorkflowState({ initialNodes: mockNodes }));
  expect(result2.current.wizardStep).toBe(3);
 });

 it('resets to default when key is removed (nuclear reset)', () => {
  localStorage.setItem('curman_wizardStep', '4');
  const { result } = renderHook(() => useAppWorkflowState({ initialNodes: mockNodes }));
  expect(result.current.wizardStep).toBe(4);

  localStorage.clear();
  const { result: result2 } = renderHook(() => useAppWorkflowState({ initialNodes: mockNodes }));
  expect(result2.current.wizardStep).toBe(1);
 });

 it('does not affect other persisted fields', () => {
  localStorage.setItem('curman_progettazioneMode', 'wizard');
  localStorage.setItem('curman_targetClass', '3');
  localStorage.setItem('curman_targetSection', 'B');

  const { result } = renderHook(() => useAppWorkflowState({ initialNodes: mockNodes }));
  expect(result.current.progettazioneMode).toBe('wizard');
  expect(result.current.targetClass).toBe('3');
  expect(result.current.targetSection).toBe('B');
 });

 it('handles empty string value', () => {
  localStorage.setItem('curman_wizardStep', '');
  const { result } = renderHook(() => useAppWorkflowState({ initialNodes: mockNodes }));
  expect(result.current.wizardStep).toBe(1);
 });

 it('handles float value by rounding', () => {
  localStorage.setItem('curman_wizardStep', '3.7');
  const { result } = renderHook(() => useAppWorkflowState({ initialNodes: mockNodes }));
  expect(result.current.wizardStep).toBe(4);
 });
});
