// @vitest-environment node
// @trama-readonly — test-only pure contract; no write surface.
/** DOC-01/D2b2a — test-only contract prototype, never imported by product code.
 * Synthetic authority is not evidence of real adoption. The existing master
 * materializer is explicitly non-vigente. No producer, storage or transport.
 */
import {canonicalSerialize} from '../domain/transfer/signatures';
import type {CurricoloNode,CurricoloSegment,InstituteCurricoloVersion,VerticalCurricoloLink} from '../types/curricolo';

const LAB_CONTRACT='ARENA_REGISTRO_STRUCTURED_CONTENT_LAB_V1' as const;
type Kind=CurricoloNode['type'];
type Scope=Readonly<{institutionRef:string;schoolYear:string;sourceSchoolYear:string;schoolOrder:'secondaria';subjectCode:string;gradeLevel:1|2|3;cohortRef:string;regimeRef:'IN2012'|'IN2025';applicabilityStatus:'APPLICABLE'|'TRANSITIONAL';masterId:string;masterVersion:string;sourceRevisionId:string;sourceCommit:string;annualItemId:string;sourceSection:string;contextDigest:string}>;
type ParentContext=Readonly<{contract:'ARENA_REGISTRO_PLANNING_CONTEXT_V1';contractVersion:1;sourceProduct:'ARENA';targetProduct:'REGISTRO_DOCENTE';importMode:'PREVIEW_ONLY';acceptanceRequired:true;automaticWriteAllowed:false;instituteName:string;schoolYear:string;sourceSchoolYear:string;schoolOrder:'secondaria';subjectCode:string;gradeLevel:1|2|3;cohortRef:string;cohortRefKind:'DERIVED_APPLICABILITY_KEY';normativeRegime:string;applicabilityStatus:'APPLICABLE'|'TRANSITIONAL';authorityState:'APPROVED';vigencyStatus:'VIGENTE';authorityReceiptRef:string;masterId:string;masterVersion:string;structuralFingerprint:{scope:'MASTER';algorithm:'fnv1a';version:1;hash:string};provenance:{repository:'antoniocorsano-boop/CurManLight_arena';sourceCommit:string;sourceDocumentId:string;sourceRevisionId:string};curricoloItems:readonly {id:string;kind:'ANNUALITA_DISCIPLINARE';schoolStage:string;gradeLabel:string;sourceSection:string;text:string}[];privacyClass:'PROFESSIONAL_NON_PERSONAL'}>;
type Binding=Readonly<{nodeId:string;segmentId:string;versionId:string;annualItemId:string;sourceRevisionId:string;sourceSection:string;sourceSpanRef:string;kind:Kind;literalText:string;sourceStart:number;sourceEnd:number;scopeKind:'annual'}>;
type Basis=Readonly<{mode:'SYNTHETIC_ONLY';scope:Scope;parentContext:ParentContext;version:InstituteCurricoloVersion;segment:CurricoloSegment;nodes:readonly CurricoloNode[];bindings:readonly Binding[];links:readonly VerticalCurricoloLink[];authority:{receiptRef:string;sourceRevisionId:string;versionId:string;vigency:'VIGENTE';adoptionRef:string;scopeDigest:string}}>;
type Item=Readonly<{nodeId:string;kind:Kind;text:string;sourceSpanRef:string}>;
type Link=Readonly<{linkId:string;sourceNodeId:string;targetNodeId:string;relationType:VerticalCurricoloLink['relationType']}>;
type Material=Readonly<{contract:typeof LAB_CONTRACT;labOnly:true;sourceProduct:'ARENA';targetProduct:'REGISTRO_DOCENTE';importMode:'PREVIEW_ONLY';acceptanceRequired:true;automaticWriteAllowed:false;privacyClass:'PROFESSIONAL_NON_PERSONAL';authority:'SYNTHETIC_ONLY';scope:Scope;authorityBinding:Basis['authority'];segmentId:string;versionId:string;items:readonly Item[];links:readonly Link[];missingKinds:readonly Kind[]}>;
type LabPacket=Readonly<Material&{fingerprint:{algorithm:'SHA-256';scope:'LAB_PAYLOAD';hash:string}}>;
const kinds:readonly Kind[]=['core-theme','competence','milestone','objective','knowledge','skill','evidence'];
const labDigest=async(v:unknown)=>[...new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256',new TextEncoder().encode(canonicalSerialize(v))))].map(byte=>byte.toString(16).padStart(2,'0')).join('');
const nonempty=(v:unknown):v is string=>typeof v==='string'&&!!v.trim()&&v.length<=16000;
const demoRef=(v:unknown):v is string=>typeof v==='string'&&/^demo-[a-z0-9-]+$/.test(v);
const hash=(v:unknown)=>typeof v==='string'&&/^[0-9a-f]{64}$/.test(v);
const exact=(v:unknown,keys:readonly string[]):v is Record<string,unknown>=>v!==null&&typeof v==='object'&&!Array.isArray(v)&&[Object.prototype,null].includes(Object.getPrototypeOf(v))&&Reflect.ownKeys(v).length===keys.length&&keys.every(k=>{const d=Object.getOwnPropertyDescriptor(v,k);return !!d&&d.enumerable&&Object.prototype.hasOwnProperty.call(d,'value');});
const unique=(v:readonly string[])=>new Set(v).size===v.length;
/** Diagnostic of the existing canonical materializer; does NOT decide adoption. */
function inspectMaterializationAuthority(source:{version:InstituteCurricoloVersion;segments:readonly CurricoloSegment[];nodes:readonly CurricoloNode[]}){
 const {version,segments,nodes}=source;
 const reasons:string[]=[];
 if(version.status!=='approved'||!nonempty(version.approvedAt))reasons.push('version-not-approved');
 if(!segments.length||segments.some(s=>s.versionId!==version.id||s.workStatus!=='effective'))reasons.push('segment-not-effective');
 if(!nodes.length||nodes.some(n=>n.versionId!==version.id||n.workStatus!=='approved'))reasons.push('node-not-approved');
 return Object.freeze(reasons);
}
/** Only an independently constructed hypothetical lab basis may reach this path. */
async function buildStructuredLabPacket(b:Basis,selected:readonly string[]):Promise<LabPacket|null>{
 try{
  if(b.mode!=='SYNTHETIC_ONLY'||!Array.isArray(selected)||!selected.length||!unique(selected)||!selected.every(demoRef))return null;
  const {scope,version,segment,authority,parentContext:p}=b;
  const scopeKeys=['institutionRef','schoolYear','sourceSchoolYear','schoolOrder','subjectCode','gradeLevel','cohortRef','regimeRef','applicabilityStatus','masterId','masterVersion','sourceRevisionId','sourceCommit','annualItemId','sourceSection','contextDigest'];
  if(!exact(scope,scopeKeys)||!['institutionRef','cohortRef','masterId','masterVersion','sourceRevisionId','annualItemId','sourceSection'].every(k=>demoRef(scope[k as keyof Scope]))||!hash(scope.contextDigest)||!/^[a-f0-9]{40}$/.test(scope.sourceCommit)||scope.schoolOrder!=='secondaria'||![1,2,3].includes(scope.gradeLevel)||!nonempty(scope.subjectCode)||!/^20\d{2}\/20\d{2}$/.test(scope.schoolYear)||!/^20\d{2}\/20\d{2}$/.test(scope.sourceSchoolYear)||Number(scope.schoolYear.slice(5))!==Number(scope.schoolYear.slice(0,4))+1||Number(scope.sourceSchoolYear.slice(5))!==Number(scope.sourceSchoolYear.slice(0,4))+1||!['IN2012','IN2025'].includes(scope.regimeRef)||!['APPLICABLE','TRANSITIONAL'].includes(scope.applicabilityStatus))return null;
  if(!exact(authority,['receiptRef','sourceRevisionId','versionId','vigency','adoptionRef','scopeDigest'])||!demoRef(authority.receiptRef)||!demoRef(authority.adoptionRef)||authority.vigency!=='VIGENTE'||authority.scopeDigest!==await labDigest(scope)||authority.sourceRevisionId!==scope.sourceRevisionId||authority.versionId!==version.id)return null;
  const parentKeys=['contract','contractVersion','sourceProduct','targetProduct','importMode','acceptanceRequired','automaticWriteAllowed','instituteName','schoolYear','sourceSchoolYear','schoolOrder','subjectCode','gradeLevel','cohortRef','cohortRefKind','normativeRegime','applicabilityStatus','authorityState','vigencyStatus','authorityReceiptRef','masterId','masterVersion','structuralFingerprint','provenance','curricoloItems','privacyClass'];
  if(!exact(p,parentKeys)||p.contract!=='ARENA_REGISTRO_PLANNING_CONTEXT_V1'||p.contractVersion!==1||p.sourceProduct!=='ARENA'||p.targetProduct!=='REGISTRO_DOCENTE'||p.importMode!=='PREVIEW_ONLY'||p.acceptanceRequired!==true||p.automaticWriteAllowed!==false||p.privacyClass!=='PROFESSIONAL_NON_PERSONAL'||p.authorityState!=='APPROVED'||p.vigencyStatus!=='VIGENTE'||p.authorityReceiptRef!==authority.receiptRef||p.cohortRefKind!=='DERIVED_APPLICABILITY_KEY'||p.instituteName!==scope.institutionRef||!['schoolYear','sourceSchoolYear','schoolOrder','subjectCode','gradeLevel','cohortRef','applicabilityStatus','masterId','masterVersion'].every(k=>p[k as keyof ParentContext]===scope[k as keyof Scope])||p.normativeRegime!==(scope.regimeRef==='IN2025'?'Regime 2025':'Regime 2012')||await labDigest(p)!==scope.contextDigest)return null;
  if(!exact(p.structuralFingerprint,['scope','algorithm','version','hash'])||p.structuralFingerprint.scope!=='MASTER'||p.structuralFingerprint.algorithm!=='fnv1a'||p.structuralFingerprint.version!==1||!/^[a-f0-9]{8}$/.test(p.structuralFingerprint.hash)||!exact(p.provenance,['repository','sourceCommit','sourceDocumentId','sourceRevisionId'])||p.provenance.repository!=='antoniocorsano-boop/CurManLight_arena'||!demoRef(p.provenance.sourceDocumentId)||p.provenance.sourceCommit!==scope.sourceCommit||p.provenance.sourceRevisionId!==scope.sourceRevisionId)return null;
  if(!Array.isArray(p.curricoloItems)||!unique(p.curricoloItems.map(i=>i.id)))return null;
  const annual=p.curricoloItems.find(i=>i.id===scope.annualItemId);
  if(!annual||!exact(annual,['id','kind','schoolStage','gradeLabel','sourceSection','text'])||annual.kind!=='ANNUALITA_DISCIPLINARE'||annual.schoolStage!=='Secondaria di primo grado'||annual.gradeLabel!=='Classe '+['I','II','III'][scope.gradeLevel-1]||annual.sourceSection!==scope.sourceSection||!nonempty(annual.text))return null;
  if(!demoRef(version.id)||!demoRef(segment.id)||version.institutionId!==scope.institutionRef||version.versionNumber!==scope.masterVersion||segment.versionId!==version.id||segment.schoolLevel!==scope.schoolOrder||segment.subjectOrFieldId!==scope.subjectCode||segment.scope.type!=='grade'||segment.scope.grade!==String(scope.gradeLevel)||segment.frameworkApplicability.resolutionStatus!=='resolved'||segment.frameworkApplicability.framework!==scope.regimeRef)return null;
  if(inspectMaterializationAuthority({version,segments:[segment],nodes:b.nodes}).length)return null;
  if(!unique(b.nodes.map(n=>n.id))||!unique(b.bindings.map(x=>x.nodeId))||!unique(b.links.map(l=>l.id)))return null;
  const items:Item[]=[];
  for(const id of selected){
   const n=b.nodes.find(n=>n.id===id),binding=b.bindings.find(x=>x.nodeId===id);
   if(!n||!binding||n.segmentId!==segment.id||n.versionId!==version.id||!kinds.includes(n.type)||!nonempty(n.title))return null;
   if(!exact(binding,['nodeId','segmentId','versionId','annualItemId','sourceRevisionId','sourceSection','sourceSpanRef','kind','literalText','sourceStart','sourceEnd','scopeKind'])||binding.segmentId!==segment.id||binding.versionId!==version.id||binding.annualItemId!==scope.annualItemId||binding.sourceRevisionId!==scope.sourceRevisionId||binding.sourceSection!==scope.sourceSection||!demoRef(binding.sourceSpanRef)||binding.scopeKind!=='annual'||binding.kind!==n.type||binding.literalText!==n.title||!Number.isSafeInteger(binding.sourceStart)||!Number.isSafeInteger(binding.sourceEnd)||binding.sourceStart<0||binding.sourceEnd<=binding.sourceStart||binding.sourceEnd>annual.text.length||annual.text.slice(binding.sourceStart,binding.sourceEnd)!==binding.literalText)return null;
   items.push(Object.freeze({nodeId:id,kind:n.type,text:n.title,sourceSpanRef:binding.sourceSpanRef}));
  }
  // Only already validated canonical relations between the selected nodes.
  const links=b.links.filter(l=>l.versionId===version.id&&l.status==='validated'&&demoRef(l.id)&&['prerequisite','continuity','development','deepening','integration','discontinuity'].includes(l.relationType)&&selected.includes(l.sourceNodeId)&&selected.includes(l.targetNodeId)&&l.sourceNodeId!==l.targetNodeId).map(l=>Object.freeze({linkId:l.id,sourceNodeId:l.sourceNodeId,targetNodeId:l.targetNodeId,relationType:l.relationType}));
  const material:Material=Object.freeze({contract:LAB_CONTRACT,labOnly:true,sourceProduct:'ARENA',targetProduct:'REGISTRO_DOCENTE',importMode:'PREVIEW_ONLY',acceptanceRequired:true,automaticWriteAllowed:false,privacyClass:'PROFESSIONAL_NON_PERSONAL',authority:'SYNTHETIC_ONLY',scope:Object.freeze({...scope}),authorityBinding:Object.freeze({...authority}),segmentId:segment.id,versionId:version.id,items:Object.freeze(items),links:Object.freeze(links),missingKinds:Object.freeze(kinds.filter(k=>!items.some(i=>i.kind===k)))});
  return Object.freeze({...material,fingerprint:Object.freeze({algorithm:'SHA-256',scope:'LAB_PAYLOAD',hash:await labDigest(material)})});
 }catch{return null;}
}
/** Validate against the independent basis, not the claims inside the packet. */
async function validateStructuredLabPacket(packet:unknown,b:Basis,selected:readonly string[]):Promise<boolean>{
 try{
  const expected=await buildStructuredLabPacket(b,selected);
  return !!expected&&canonicalSerialize(packet)===canonicalSerialize(expected);
 }catch{return false;}
}

import {describe,expect,it} from 'vitest';
import {materializeFixture} from './fixtures/curricoloVerticaleMasterFixture';

const fixture=async(grade:1|2|3=1)=>{
 const time='2026-11-19T00:00:00.000Z';
 const version:Basis['version']={id:'demo-version',institutionId:'demo-school',title:'Versione esclusivamente dimostrativa',versionNumber:'demo-master-version',status:'approved',createdAt:time,updatedAt:time,approvedAt:time};
 const kindList:CurricoloNode['type'][]=['core-theme','competence','milestone','objective','knowledge','skill','evidence'];
 const nodes=kindList.map((type,i):CurricoloNode=>({id:'demo-node-'+i,versionId:version.id,segmentId:'demo-segment',type,title:'Testo fittizio '+type,workStatus:'approved',createdAt:time,updatedAt:time}));
 const text=nodes.map(n=>n.title).join('\n');
 const regime=grade===1?'IN2025':'IN2012';
 const segment:Basis['segment']={id:'demo-segment',versionId:version.id,schoolLevel:'secondaria',subjectOrFieldId:'tecnologia',scope:{type:'grade',grade:String(grade)},frameworkApplicability:{framework:regime,resolutionStatus:'resolved',resolutionReason:'Esempio sintetico'},workStatus:'effective',content:{traguardi:[],obiettivi:[],evidenze:[],conoscenze:[],abilita:[],competenze:[],nucleiFondanti:[],proposals:[]},createdAt:time,updatedAt:time};
 const parentContext:Basis['parentContext']={contract:'ARENA_REGISTRO_PLANNING_CONTEXT_V1',contractVersion:1,sourceProduct:'ARENA',targetProduct:'REGISTRO_DOCENTE',importMode:'PREVIEW_ONLY',acceptanceRequired:true,automaticWriteAllowed:false,instituteName:'demo-school',schoolYear:'2026/2027',sourceSchoolYear:'2026/2027',schoolOrder:'secondaria',subjectCode:'tecnologia',gradeLevel:grade,cohortRef:'demo-cohort-'+grade,cohortRefKind:'DERIVED_APPLICABILITY_KEY',normativeRegime:regime==='IN2025'?'Regime 2025':'Regime 2012',applicabilityStatus:grade===1?'APPLICABLE':'TRANSITIONAL',authorityState:'APPROVED',vigencyStatus:'VIGENTE',authorityReceiptRef:'demo-receipt',masterId:'demo-master',masterVersion:version.versionNumber,structuralFingerprint:{scope:'MASTER',algorithm:'fnv1a',version:1,hash:'1234abcd'},provenance:{repository:'antoniocorsano-boop/CurManLight_arena',sourceCommit:'a'.repeat(40),sourceDocumentId:'demo-document',sourceRevisionId:'demo-revision'},curricoloItems:[{id:'demo-annual-item',kind:'ANNUALITA_DISCIPLINARE',schoolStage:'Secondaria di primo grado',gradeLabel:'Classe '+['I','II','III'][grade-1],sourceSection:'demo-section',text}],privacyClass:'PROFESSIONAL_NON_PERSONAL'};
 const scope:Basis['scope']={institutionRef:parentContext.instituteName,schoolYear:parentContext.schoolYear,sourceSchoolYear:parentContext.sourceSchoolYear,schoolOrder:'secondaria',subjectCode:parentContext.subjectCode,gradeLevel:grade,cohortRef:parentContext.cohortRef,regimeRef:regime,applicabilityStatus:parentContext.applicabilityStatus,masterId:parentContext.masterId,masterVersion:parentContext.masterVersion,sourceRevisionId:parentContext.provenance.sourceRevisionId,sourceCommit:parentContext.provenance.sourceCommit,annualItemId:parentContext.curricoloItems[0].id,sourceSection:parentContext.curricoloItems[0].sourceSection,contextDigest:await labDigest(parentContext)};
 const bindings=nodes.map((n,i):Basis['bindings'][number]=>{const sourceStart=text.indexOf(n.title);return {nodeId:n.id,segmentId:segment.id,versionId:version.id,annualItemId:scope.annualItemId,sourceRevisionId:scope.sourceRevisionId,sourceSection:scope.sourceSection,sourceSpanRef:'demo-span-'+i,kind:n.type,literalText:n.title,sourceStart,sourceEnd:sourceStart+n.title.length,scopeKind:'annual'};});
 const links:Basis['links']=[{id:'demo-link',versionId:version.id,sourceNodeId:nodes[0].id,targetNodeId:nodes[3].id,relationType:'integration',rationale:'Relazione fittizia',status:'validated',createdAt:time,updatedAt:time,validatedAt:time},{id:'demo-unvalidated',versionId:version.id,sourceNodeId:nodes[1].id,targetNodeId:nodes[3].id,relationType:'development',rationale:'Proposta fittizia',status:'proposed',createdAt:time,updatedAt:time}];
 const basis:Basis={mode:'SYNTHETIC_ONLY',scope,parentContext,version,segment,nodes,bindings,links,authority:{receiptRef:'demo-receipt',adoptionRef:'demo-adoption',sourceRevisionId:scope.sourceRevisionId,versionId:version.id,vigency:'VIGENTE',scopeDigest:await labDigest(scope)}};
 return {basis,selected:nodes.map(n=>n.id)};
};
describe('DOC-01/D2b2a — synthetic-only raccordo strutturato del curricolo',async()=>{
 it('does not promote the existing master materialization: proposed nodes and under-review version',async()=>{
  const materialized=materializeFixture();
  expect(inspectMaterializationAuthority(materialized)).toEqual(['version-not-approved','segment-not-effective','node-not-approved']);
  const technology=materialized.segments.filter(s=>s.schoolLevel==='secondaria'&&s.subjectOrFieldId==='tecnologia');
  expect(technology.length).toBe(3);
  expect(technology.map(s=>s.frameworkApplicability.framework)).toEqual(['IN2025','IN2012','IN2012']);
  expect(materialized.nodes.filter(n=>technology.some(s=>s.id===n.segmentId)).every(n=>n.workStatus==='proposed')).toBe(true);
 });
 it('preserves all seven distinct categories and only validated explicit relations in the hypothetical fixture',async()=>{
  const {basis,selected}=await fixture();const packet=await buildStructuredLabPacket(basis,selected);expect(packet).not.toBeNull();if(!packet)throw Error('packet');
  expect(packet.items.map(i=>i.kind)).toEqual(['core-theme','competence','milestone','objective','knowledge','skill','evidence']);
  expect(packet.items.map(i=>i.text)).toEqual(basis.nodes.map(n=>n.title));
  expect(packet.links.map(l=>l.linkId)).toEqual(['demo-link']);
  expect(packet.authority).toBe('SYNTHETIC_ONLY');expect(packet.labOnly).toBe(true);expect(packet.missingKinds).toEqual([]);
  expect(await validateStructuredLabPacket(packet,basis,selected)).toBe(true);
 });
 it('preserves grade and transition regime without translating one cohort into another',async()=>{
  for(const grade of [1,2,3] as const){const {basis,selected}=await fixture(grade);const p=await buildStructuredLabPacket(basis,selected);expect(p?.scope.gradeLevel).toBe(grade);expect(p?.scope.regimeRef).toBe(grade===1?'IN2025':'IN2012');}
  const {basis,selected}=await fixture(2);expect(await buildStructuredLabPacket({...basis,segment:{...basis.segment,frameworkApplicability:{...basis.segment.frameworkApplicability,framework:'IN2025'}}},selected)).toBeNull();
  expect(await buildStructuredLabPacket({...basis,segment:{...basis.segment,scope:{type:'school-level'}}},selected)).toBeNull();
 });
 it('rejects missing binding, a generic milestone or a type mismatch, and wrong source text span',async()=>{
  const {basis,selected}=await fixture();const id=selected[2];
  expect(await buildStructuredLabPacket({...basis,bindings:basis.bindings.filter(b=>b.nodeId!==id)},selected)).toBeNull();
  const change=(patch:Partial<Basis['bindings'][number]>)=>({...basis,bindings:basis.bindings.map(b=>b.nodeId===id?{...b,...patch}:b)});
  expect(await buildStructuredLabPacket(change({kind:'objective'}),selected)).toBeNull();
  expect(await buildStructuredLabPacket(change({sourceStart:0}),selected)).toBeNull();
  expect(await buildStructuredLabPacket(change({literalText:'Testo diverso'}),selected)).toBeNull();
  expect(await buildStructuredLabPacket(change({sourceRevisionId:'demo-other-revision'}),selected)).toBeNull();
 });
 it('rejects unapproved version, proposed nodes, non-effective segment and wrong receipt',async()=>{
  const {basis,selected}=await fixture();
  expect(await buildStructuredLabPacket({...basis,version:{...basis.version,status:'under-review'}},selected)).toBeNull();
  expect(await buildStructuredLabPacket({...basis,segment:{...basis.segment,workStatus:'legacy-imported'}},selected)).toBeNull();
  expect(await buildStructuredLabPacket({...basis,nodes:basis.nodes.map(n=>({...n,workStatus:'proposed'}))},selected)).toBeNull();
  expect(await buildStructuredLabPacket({...basis,authority:{...basis.authority,receiptRef:'demo-other-receipt'}},selected)).toBeNull();
 });
 it('rejects parent-context changes even at the same master version',async()=>{
  const {basis,selected}=await fixture();
  const p={...basis.parentContext,curricoloItems:[{...basis.parentContext.curricoloItems[0],text:'Alterato'}]};
  expect(await buildStructuredLabPacket({...basis,parentContext:p},selected)).toBeNull();
  expect(await buildStructuredLabPacket({...basis,parentContext:{...basis.parentContext,cohortRef:'demo-other-cohort'}},selected)).toBeNull();
  expect(await buildStructuredLabPacket({...basis,parentContext:{...basis.parentContext,structuralFingerprint:{...basis.parentContext.structuralFingerprint,hash:'1234abce'}}},selected)).toBeNull();
 });
 it('does not fill missing categories or invent links',async()=>{
  const {basis,selected}=await fixture();const p=await buildStructuredLabPacket(basis,[selected[3]]);expect(p?.items.length).toBe(1);expect(p?.missingKinds).toContain('competence');expect(p?.missingKinds).toContain('knowledge');expect(p?.links).toEqual([]);
  expect(await buildStructuredLabPacket(basis,[selected[0],selected[0]])).toBeNull();
  expect(await buildStructuredLabPacket(basis,['demo-other-node'])).toBeNull();
 });
 it('payload digest cannot substitute for comparison to the independent source',async()=>{
  const {basis,selected}=await fixture();const p=await buildStructuredLabPacket(basis,selected);if(!p)throw Error('packet');
  const {fingerprint,...material}=p;const changed={...material,items:p.items.map((n,i)=>i===0?{...n,text:'Alterato'}:n)};
  const forged={...changed,fingerprint:{...fingerprint,hash:await labDigest(changed)}};
  expect(await validateStructuredLabPacket(forged,basis,selected)).toBe(false);
  expect(await validateStructuredLabPacket({...p,studentId:'demo-student'},basis,selected)).toBe(false);
  expect(await validateStructuredLabPacket(p,basis,[selected[0]])).toBe(false);
  expect(Object.isFrozen(p.items[0])).toBe(true);
 });
});
