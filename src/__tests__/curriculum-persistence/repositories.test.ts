import { describe, expect, it } from 'vitest';
import {
  MemoryCurriculumPersistenceBackend,
  createCurriculumRepositories,
} from '../../domain/curriculum/persistence';
import { link, node, prepared, segment, version, NOW } from './fixtures';

describe('CML-630E2 typed repositories', () => {
  it('round-trips and deterministically lists versions', async () => {
    const backend = new MemoryCurriculumPersistenceBackend();
    const repositories = createCurriculumRepositories(backend);
    await repositories.versions.save(version({ id: 'z' }));
    await repositories.versions.save(version({ id: 'a', versionNumber: '2' }));
    expect((await repositories.versions.list()).map(item => item.id)).toEqual(['a', 'z']);
    expect(await repositories.versions.getById('z')).toMatchObject({ title: 'Curricolo' });
  });

  it('round-trips segments and nodes through scoped queries', async () => {
    const { repositories } = await prepared();
    expect((await repositories.segments.listByVersion('version-1')).map(item => item.id))
      .toEqual(['segment-1']);
    expect((await repositories.nodes.listBySegment('segment-1')).map(item => item.id))
      .toEqual(['node-1', 'node-2']);
    expect((await repositories.nodes.listByVersion('version-1')).length).toBe(2);
  });

  it('round-trips links and lists either endpoint', async () => {
    const { repositories } = await prepared();
    await repositories.links.save(link());
    expect((await repositories.links.listByNode('node-2')).map(item => item.id)).toEqual(['link-1']);
    expect((await repositories.links.listByVersion('version-1')).length).toBe(1);
  });

  it('rejects invalid domain values before writing', async () => {
    const backend = new MemoryCurriculumPersistenceBackend();
    const repositories = createCurriculumRepositories(backend);
    await expect(repositories.versions.save(version({ title: '' })))
      .rejects.toMatchObject({ code: 'DOMAIN_VALIDATION_FAILED' });
    expect(await repositories.versions.list()).toEqual([]);
  });

  it.each([
    ['segment', async () => {
      const backend = new MemoryCurriculumPersistenceBackend();
      await createCurriculumRepositories(backend).segments.save(segment());
    }],
    ['node', async () => {
      const backend = new MemoryCurriculumPersistenceBackend();
      await createCurriculumRepositories(backend).nodes.save(node());
    }],
    ['link', async () => {
      const backend = new MemoryCurriculumPersistenceBackend();
      await createCurriculumRepositories(backend).links.save(link());
    }],
  ])('rejects missing references for %s writes', async (_kind, action) => {
    await expect(action()).rejects.toMatchObject({ code: 'REFERENCE_NOT_FOUND' });
  });

  it('rejects duplicate logical links', async () => {
    const { repositories } = await prepared();
    await repositories.links.save(link());
    await expect(repositories.links.save(link({ id: 'link-2' })))
      .rejects.toMatchObject({ code: 'DUPLICATE_RECORD' });
  });

  it('protects version, segment and node deletion when referenced', async () => {
    const { repositories } = await prepared();
    await repositories.links.save(link());
    await expect(repositories.versions.delete('version-1'))
      .rejects.toMatchObject({ code: 'DELETE_RESTRICTED' });
    await expect(repositories.segments.delete('segment-1'))
      .rejects.toMatchObject({ code: 'DELETE_RESTRICTED' });
    await expect(repositories.nodes.delete('node-1'))
      .rejects.toMatchObject({ code: 'DELETE_RESTRICTED' });
  });

  it('rolls back a transaction without partial writes', async () => {
    const backend = new MemoryCurriculumPersistenceBackend();
    await expect(backend.transaction(async () => {
      await backend.putVersion(version());
      throw new Error('abort');
    })).rejects.toThrow('abort');
    expect(await backend.listVersions()).toEqual([]);
  });
});

describe('CML-630E2 approved-version immutability', () => {
  it('allows draft updates but rejects approved version updates', async () => {
    const backend = new MemoryCurriculumPersistenceBackend();
    const repositories = createCurriculumRepositories(backend);
    await repositories.versions.save(version());
    await repositories.versions.save(version({ title: 'Aggiornato' }));
    await backend.putVersion(version({ status: 'approved', approvedAt: NOW }));
    await expect(repositories.versions.save(version({
      status: 'approved', approvedAt: NOW, title: 'No',
    }))).rejects.toMatchObject({ code: 'IMMUTABLE_VERSION' });
  });

  it.each([
    ['segment', async (backend: MemoryCurriculumPersistenceBackend) =>
      createCurriculumRepositories(backend).segments.save(segment())],
    ['node', async (backend: MemoryCurriculumPersistenceBackend) =>
      createCurriculumRepositories(backend).nodes.save(node())],
    ['link', async (backend: MemoryCurriculumPersistenceBackend) =>
      createCurriculumRepositories(backend).links.save(link())],
  ])('rejects %s mutation under an approved version', async (_kind, action) => {
    const backend = new MemoryCurriculumPersistenceBackend();
    await backend.putVersion(version({ status: 'approved', approvedAt: NOW }));
    await expect(action(backend)).rejects.toMatchObject({ code: 'IMMUTABLE_VERSION' });
  });
});
