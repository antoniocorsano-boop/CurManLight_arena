import type { CurricoloRepositories } from '../../types/curricolo';
import {
  createCurricoloVerticaleReleaseV1,
  type CurricoloVerticaleAuthorityV1,
  type CurricoloVerticalePerimeterV1,
  type CurricoloVerticaleReleaseV1,
} from './curricoloVerticaleReleaseV1';

export interface ExportCurricoloVerticaleFromRepositoriesV1Input {
  repositories: CurricoloRepositories;
  versionId: string;
  institutionId: string;
  schoolYearRef: string;
  perimeter: CurricoloVerticalePerimeterV1;
  authority: CurricoloVerticaleAuthorityV1;
  issuedAt?: string;
}

export async function exportCurricoloVerticaleFromRepositoriesV1(
  input: ExportCurricoloVerticaleFromRepositoriesV1Input,
): Promise<CurricoloVerticaleReleaseV1> {
  const version = await input.repositories.versions.getById(input.versionId);
  if (!version) {
    throw new Error(`Curricolo version '${input.versionId}' was not found`);
  }

  const [segments, nodes, verticalLinks] = await Promise.all([
    input.repositories.segments.listByVersion(input.versionId),
    input.repositories.nodes.listByVersion(input.versionId),
    input.repositories.links.listByVersion(input.versionId),
  ]);

  return createCurricoloVerticaleReleaseV1({
    institutionId: input.institutionId,
    schoolYearRef: input.schoolYearRef,
    version,
    segments,
    nodes,
    verticalLinks,
    perimeter: input.perimeter,
    authority: input.authority,
    issuedAt: input.issuedAt,
  });
}
