import fs from "node:fs";

const path = process.argv[2] || "exports/atlas-curriculum/current.json";
const input = JSON.parse(fs.readFileSync(path,"utf8"));
const errors=[];
const req=(ok,msg)=>{if(!ok) errors.push(msg)};

req(input.contract==="ARENA_ATLAS_CURRICULUM_EXPORT_V1","unsupported contract");
req(input.contractVersion===1,"unsupported contractVersion");
req(input.profiles==="CurriculumSnapshot v1","bundle must profile CurriculumSnapshot v1");
req(["PROVISIONAL_COMPLETE","APPROVED"].includes(input.authorityState),"invalid authorityState");
if(input.authorityState==="APPROVED"){
  req(input.authorityReceiptRef && typeof input.authorityReceiptRef==="object","APPROVED requires authorityReceiptRef");
  req(input.integrityDigest?.algorithm==="sha256" && /^[0-9a-f]{64}$/.test(input.integrityDigest?.hash||""),"APPROVED requires sha256 integrity digest");
}
if(input.authorityState==="PROVISIONAL_COMPLETE"){
  req(input.authorityReceiptRef===null || input.authorityReceiptRef===undefined,"PROVISIONAL_COMPLETE cannot claim authorityReceiptRef");
}
req(input.structuralFingerprint?.algorithm==="fnv1a","missing structural fingerprint");
req(/^[0-9a-f]{8}$/.test(input.structuralFingerprint?.hash||""),"invalid structural fingerprint");
req(input.coverage?.infanziaFields===5,"expected 5 Infanzia fields");
req(input.coverage?.primaryDisciplines===11,"expected 11 Primary disciplines");
req(input.coverage?.secondaryDisciplines===12,"expected 12 Secondary disciplines");
req(input.coverage?.primaryGradeBands===55,"expected 55 Primary grade bands");
req(input.coverage?.secondaryGradeBands===36,"expected 36 Secondary grade bands");
req(Array.isArray(input.curriculum?.disciplines) && input.curriculum.disciplines.length>=17,"curriculum discipline projection incomplete");
req(Array.isArray(input.curriculum?.transversalAxes) && input.curriculum.transversalAxes.length===3,"transversal axes incomplete");

if(errors.length){
  console.error(errors.map(e=>"ERROR: "+e).join("\n"));
  process.exit(1);
}
console.log(JSON.stringify({
  authorityState:input.authorityState,
  fingerprint:input.structuralFingerprint.hash,
  disciplines:input.curriculum.disciplines.length,
  primaryGradeBands:input.coverage.primaryGradeBands,
  secondaryGradeBands:input.coverage.secondaryGradeBands
},null,2));
