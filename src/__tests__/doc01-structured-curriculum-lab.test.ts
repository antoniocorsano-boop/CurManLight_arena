import {describe,expect,it} from 'vitest';
import {materializeFixture} from './fixtures/curricoloVerticaleMasterFixture';
import {buildStructuredLabPacket,inspectMaterializationAuthority,labDigest,validateStructuredLabPacket} from './fixtures/registroStructuredCurriculumLab';
import type {CurricoloNode} from '../types/curricolo';

type Basis=Parameters<typeof buildStructuredLabPacket>[0];
const fixture=(grade:1|2|3=1)=>{
 const time='2026-11-19T00:00:00.000Z';
 const version:Basis['version']={id:'demo-version',institutionId:'demo-school',title:'Versione esclusivamente dimostrativa',versionNumber:'demo-master-version',status:'approved',createdAt:time,updatedAt:time,approvedAt:time};
 const kindList:CurricoloNode['type'][]=['core-theme','competence','milestone','objective','knowledge','skill','evidence'];
 const nodes=kindList.map((type,i):CurricoloNode=>({id:'demo-node-'+i,versionId:version.id,segmentId:'demo-segment',type,title:'Testo fittizio '+type,workStatus:'approved',createdAt:time,updatedAt:time}));
 const text=nodes.map(n=>n.title).join('\n');
 const regime=grade===1?'IN2025':'IN2012';
 const segment:Basis['segment']={id:'demo-segment',versionId:version.id,schoolLevel:'secondaria',subjectOrFieldId:'tecnologia',scope:{type:'grade',grade:String(grade)},frameworkApplicability:{framework:regime,resolutionStatus:'resolved',resolutionReason:'Esempio sintetico'},workStatus:'effective',content:{traguardi:[],obiettivi:[],evidenze:[],conoscenze:[],abilita:[],competenze:[],nucleiFondanti:[],proposals:[]},createdAt:time,updatedAt:time};
 const parentContext:Basis['parentContext']={contract:'ARENA_REGISTRO_PLANNING_CONTEXT_V1',contractVersion:1,sourceProduct:'ARENA',targetProduct:'REGISTRO_DOCENTE',importMode:'PREVIEW_ONLY',acceptanceRequired:true,automaticWriteAllowed:false,instituteName:'demo-school',schoolYear:'2026/2027',sourceSchoolYear:'2026/2027',schoolOrder:'secondaria',subjectCode:'tecnologia',gradeLevel:grade,cohortRef:'demo-cohort-'+grade,cohortRefKind:'DERIVED_APPLICABILITY_KEY',normativeRegime:regime==='IN2025'?'Regime 2025':'Regime 2012',applicabilityStatus:grade===1?'APPLICABLE':'TRANSITIONAL',authorityState:'APPROVED',vigencyStatus:'VIGENTE',authorityReceiptRef:'demo-receipt',masterId:'demo-master',masterVersion:version.versionNumber,structuralFingerprint:{scope:'MASTER',algorithm:'fnv1a',version:1,hash:'1234abcd'},provenance:{repository:'antoniocorsano-boop/CurManLight_arena',sourceCommit:'a'.repeat(40),sourceDocumentId:'demo-document',sourceRevisionId:'demo-revision'},curricoloItems:[{id:'demo-annual-item',kind:'ANNUALITA_DISCIPLINARE',schoolStage:'Secondaria di primo grado',gradeLabel:'Classe '+['I','II','III'][grade-1],sourceSection:'demo-section',text}],privacyClass:'PROFESSIONAL_NON_PERSONAL'};
 const scope:Basis['scope']={institutionRef:parentContext.instituteName,schoolYear:parentContext.schoolYear,sourceSchoolYear:parentContext.sourceSchoolYear,schoolOrder:'secondaria',subjectCode:parentContext.subjectCode,gradeLevel:grade,cohortRef:parentContext.cohortRef,regimeRef:regime,applicabilityStatus:parentContext.applicabilityStatus,masterId:parentContext.masterId,masterVersion:parentContext.masterVersion,sourceRevisionId:parentContext.provenance.sourceRevisionId,sourceCommit:parentContext.provenance.sourceCommit,annualItemId:parentContext.curricoloItems[0].id,sourceSection:parentContext.curricoloItems[0].sourceSection,contextDigest:labDigest(parentContext)};
 const bindings=nodes.map((n,i):Basis['bindings'][number]=>{const sourceStart=text.indexOf(n.title);return {nodeId:n.id,segmentId:segment.id,versionId:version.id,annualItemId:scope.annualItemId,sourceRevisionId:scope.sourceRevisionId,sourceSection:scope.sourceSection,sourceSpanRef:'demo-span-'+i,kind:n.type,literalText:n.title,sourceStart,sourceEnd:sourceStart+n.title.length,scopeKind:'annual'};});
 const links:Basis['links']=[{id:'demo-link',versionId:version.id,sourceNodeId:nodes[0].id,targetNodeId:nodes[3].id,relationType:'integration',rationale:'Relazione fittizia',status:'validated',createdAt:time,updatedAt:time,validatedAt:time},{id:'demo-unvalidated',versionId:version.id,sourceNodeId:nodes[1].id,targetNodeId:nodes[3].id,relationType:'development',rationale:'Proposta fittizia',status:'proposed',createdAt:time,updatedAt:time}];
 const basis:Basis={mode:'SYNTHETIC_ONLY',scope,parentContext,version,segment,nodes,bindings,links,authority:{receiptRef:'demo-receipt',adoptionRef:'demo-adoption',sourceRevisionId:scope.sourceRevisionId,versionId:version.id,vigency:'VIGENTE',scopeDigest:labDigest(scope)}};
 return {basis,selected:nodes.map(n=>n.id)};
};
describe('DOC-01/D2b2a — synthetic-only structured curriculum contract',()=>{
 it('does not promote the existing master materialization: proposed nodes and under-review version',()=>{
  const materialized=materializeFixture();
  expect(inspectMaterializationAuthority(materialized)).toEqual(['version-not-approved','segment-not-effective','node-not-approved']);
  const technology=materialized.segments.filter(s=>s.schoolLevel==='secondaria'&&s.subjectOrFieldId==='tecnologia');
  expect(technology.length).toBe(3);
  expect(technology.map(s=>s.frameworkApplicability.framework)).toEqual(['IN2025','IN2012','IN2012']);
  expect(materialized.nodes.filter(n=>technology.some(s=>s.id===n.segmentId)).every(n=>n.workStatus==='proposed')).toBe(true);
 });
 it('preserves all seven distinct categories and only validated explicit relations in the hypothetical fixture',()=>{
  const {basis,selected}=fixture();const packet=buildStructuredLabPacket(basis,selected);expect(packet).not.toBeNull();if(!packet)throw Error('packet');
  expect(packet.items.map(i=>i.kind)).toEqual(['core-theme','competence','milestone','objective','knowledge','skill','evidence']);
  expect(packet.items.map(i=>i.text)).toEqual(basis.nodes.map(n=>n.title));
  expect(packet.links.map(l=>l.linkId)).toEqual(['demo-link']);
  expect(packet.authority).toBe('SYNTHETIC_ONLY');expect(packet.labOnly).toBe(true);expect(packet.missingKinds).toEqual([]);
  expect(validateStructuredLabPacket(packet,basis,selected)).toBe(true);
 });
 it('preserves grade and transition regime without translating one cohort into another',()=>{
  for(const grade of [1,2,3] as const){const {basis,selected}=fixture(grade);const p=buildStructuredLabPacket(basis,selected);expect(p?.scope.gradeLevel).toBe(grade);expect(p?.scope.regimeRef).toBe(grade===1?'IN2025':'IN2012');}
  const {basis,selected}=fixture(2);expect(buildStructuredLabPacket({...basis,segment:{...basis.segment,frameworkApplicability:{...basis.segment.frameworkApplicability,framework:'IN2025'}}},selected)).toBeNull();
  expect(buildStructuredLabPacket({...basis,segment:{...basis.segment,scope:{type:'school-level'}}},selected)).toBeNull();
 });
 it('rejects missing binding, a generic milestone or a type mismatch, and wrong source text span',()=>{
  const {basis,selected}=fixture();const id=selected[2];
  expect(buildStructuredLabPacket({...basis,bindings:basis.bindings.filter(b=>b.nodeId!==id)},selected)).toBeNull();
  const change=(patch:Partial<Basis['bindings'][number]>)=>({...basis,bindings:basis.bindings.map(b=>b.nodeId===id?{...b,...patch}:b)});
  expect(buildStructuredLabPacket(change({kind:'objective'}),selected)).toBeNull();
  expect(buildStructuredLabPacket(change({sourceStart:0}),selected)).toBeNull();
  expect(buildStructuredLabPacket(change({literalText:'Testo diverso'}),selected)).toBeNull();
  expect(buildStructuredLabPacket(change({sourceRevisionId:'demo-other-revision'}),selected)).toBeNull();
 });
 it('rejects unapproved version, proposed nodes, non-effective segment and wrong receipt',()=>{
  const {basis,selected}=fixture();
  expect(buildStructuredLabPacket({...basis,version:{...basis.version,status:'under-review'}},selected)).toBeNull();
  expect(buildStructuredLabPacket({...basis,segment:{...basis.segment,workStatus:'legacy-imported'}},selected)).toBeNull();
  expect(buildStructuredLabPacket({...basis,nodes:basis.nodes.map(n=>({...n,workStatus:'proposed'}))},selected)).toBeNull();
  expect(buildStructuredLabPacket({...basis,authority:{...basis.authority,receiptRef:'demo-other-receipt'}},selected)).toBeNull();
 });
 it('rejects parent-context changes even at the same master version',()=>{
  const {basis,selected}=fixture();
  const p={...basis.parentContext,curricoloItems:[{...basis.parentContext.curricoloItems[0],text:'Alterato'}]};
  expect(buildStructuredLabPacket({...basis,parentContext:p},selected)).toBeNull();
  expect(buildStructuredLabPacket({...basis,parentContext:{...basis.parentContext,cohortRef:'demo-other-cohort'}},selected)).toBeNull();
  expect(buildStructuredLabPacket({...basis,parentContext:{...basis.parentContext,structuralFingerprint:{...basis.parentContext.structuralFingerprint,hash:'1234abce'}}},selected)).toBeNull();
 });
 it('does not fill missing categories or invent links',()=>{
  const {basis,selected}=fixture();const p=buildStructuredLabPacket(basis,[selected[3]]);expect(p?.items.length).toBe(1);expect(p?.missingKinds).toContain('competence');expect(p?.missingKinds).toContain('knowledge');expect(p?.links).toEqual([]);
  expect(buildStructuredLabPacket(basis,[selected[0],selected[0]])).toBeNull();
  expect(buildStructuredLabPacket(basis,['demo-other-node'])).toBeNull();
 });
 it('payload digest cannot substitute for comparison to the independent source',()=>{
  const {basis,selected}=fixture();const p=buildStructuredLabPacket(basis,selected);if(!p)throw Error('packet');
  const {fingerprint,...material}=p;const changed={...material,items:p.items.map((n,i)=>i===0?{...n,text:'Alterato'}:n)};
  const forged={...changed,fingerprint:{...fingerprint,hash:labDigest(changed)}};
  expect(validateStructuredLabPacket(forged,basis,selected)).toBe(false);
  expect(validateStructuredLabPacket({...p,studentId:'demo-student'},basis,selected)).toBe(false);
  expect(validateStructuredLabPacket(p,basis,[selected[0]])).toBe(false);
  expect(Object.isFrozen(p.items[0])).toBe(true);
 });
});
