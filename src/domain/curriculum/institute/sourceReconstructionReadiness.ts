export const INSTITUTE_CURRICULUM_SOURCE_RECONSTRUCTION_V3 = {
  schemaVersion: 'arena-institute-curriculum-source-reconstruction-v3',
  sourceFile: 'CURRICOLO VERTICALE .docx',
  sourceSha256: '187bc12a771a29331c0d6638abe9e74788a2554af2735e3b9f43321d8f2ae57b',
  sourcePages: 89,
  auditPr: 182,
  auditHead: 'f4fe11a43c73d9ded562c773d2cb56eebb511ad9',
  authority: 'LOCAL_WORKING',
  semanticStatus: 'UNASSESSED',
  extraction: {
    tables: 37,
    semanticAnchorCells: 675,
    curriculumPresentations: 32,
    curriculumSemanticBlocks: 554,
    derivedSourceItems: 741,
    canonicalTargetOrderIdentities: 27,
  },
  presentationStatus: {
    sourceReadyForSemanticReview: 27,
    blockedSourceDefect: 3,
    blockedHeaderRepair: 1,
    reviewRequiredIdentityLabel: 1,
  },
  automaticCanonicalPromotion: false,
  automaticNationalAttribution: false,
  humanSemanticReviewComplete: false,
} as const;

export function countInstituteSourceReviewBlockers(): number {
  const status = INSTITUTE_CURRICULUM_SOURCE_RECONSTRUCTION_V3.presentationStatus;
  return status.blockedSourceDefect + status.blockedHeaderRepair + status.reviewRequiredIdentityLabel;
}
