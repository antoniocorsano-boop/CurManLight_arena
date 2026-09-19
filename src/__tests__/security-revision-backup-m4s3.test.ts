import { describe, expect, it } from 'vitest';
import sessionAutoSaveRaw from '../features/workspace/hooks/useSessionAutoSave.ts?raw';
import workspaceSyncRaw from '../features/workspace/hooks/useWorkspaceSyncHandlers.ts?raw';

function objectLiteralAfter(source: string, marker: string): string {
  const start = source.indexOf(marker);
  if (start < 0) return '';
  const open = source.indexOf('{', start);
  if (open < 0) return '';
  let depth = 0;
  for (let index = open; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(open, index + 1);
    }
  }
  return '';
}

describe('M4-S3 revision backup security regression', () => {
  it('emergency backup preserves revisionArchive without persisting workspace credentials', () => {
    expect(sessionAutoSaveRaw).toContain('revisionArchive: state.revisionArchive');
    const payload = objectLiteralAfter(sessionAutoSaveRaw, 'toEmergencyBackupPayload');
    expect(payload).toContain('revisionArchive: state.revisionArchive');
    expect(payload).not.toContain('workspaceAccessToken');
    expect(payload).not.toContain('workspaceClientId');
    expect(payload).not.toContain('Authorization');
  });

  it('workspace backup payloads include revisionArchive but exclude OAuth credentials', () => {
    const firstBackup = objectLiteralAfter(workspaceSyncRaw, 'const stateToBackup =');
    expect(firstBackup).toContain('revisionArchive');
    expect(firstBackup).not.toContain('workspaceAccessToken');
    expect(firstBackup).not.toContain('workspaceClientId');
    expect(firstBackup).not.toContain('Authorization');
  });

  it('local fallback backup also preserves revisionArchive without credential fields', () => {
    const fallbackMatch = workspaceSyncRaw.match(/JSON\.stringify\(\{ localCurriculum, savedUda, decisions, customTexts, institutionalArchive, revisionArchive \}/);
    expect(fallbackMatch).not.toBeNull();
  });
});
