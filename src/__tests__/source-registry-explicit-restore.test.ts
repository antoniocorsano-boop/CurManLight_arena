import { describe, expect, it } from 'vitest';
import restoreActionSource from '../features/documents/components/SourceRegistryRestoreAction.tsx?raw';
import restoreLibSource from '../features/documents/lib/localSourceRegistryRestore.ts?raw';
import storeSource from '../features/documents/lib/localKnowledgeStore.ts?raw';
import appViewsSource from '../features/session/components/AppViewsLayer.tsx?raw';

describe('CML-DRIVE-01 explicit restore boundary', () => {
  it('requires preview then a separate human confirmation before replacement', () => {
    expect(restoreActionSource).toContain('data-restore-mode="preview-confirm"');
    expect(restoreActionSource).toContain('La selezione del file non modifica alcun dato');
    expect(restoreActionSource).toContain('Conferma ripristino locale');
    expect(restoreActionSource).toContain('il registro locale corrente verrà sostituito');
    expect(restoreLibSource).toContain('humanConfirmed: true');
    expect(restoreLibSource).toContain('replaceLocalKnowledgeRegistryFromRestore');
    expect(storeSource).toContain("await db.sources.clear()");
    expect(storeSource).toContain("await db.governance.clear()");
    expect(appViewsSource).toContain('<SourceRegistryRestoreAction');
  });

  it('keeps restore provider-neutral and refuses authority or identity inheritance by default', () => {
    expect(restoreActionSource).toContain('Arena non legge Drive');
    expect(restoreActionSource).not.toContain('downloadFromDrive');
    expect(restoreActionSource).not.toContain('listFiles');
    expect(restoreLibSource).not.toContain('GoogleDrive');
    expect(restoreLibSource).toContain('RESTORE_GOVERNANCE_AUTHORITY_ESCALATION_BLOCKED');
    expect(restoreLibSource).toContain("verificationStatus: 'imported'");
    expect(restoreLibSource).toContain('principalRebindCount');
  });
});
