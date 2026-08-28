# Docente OS → Arena — Human Triage v1

## Scopo

Questo boundary trasforma una `DocenteFeedbackObservation` già ammessa come evidenza professionale non autoritativa in una decisione di triage esplicitamente umana.

## Esiti ammessi

- `NOT_RELEVANT`: l’osservazione viene chiusa senza effetti sul curricolo.
- `NEEDS_CONTEXT`: l’osservazione richiede ulteriore contesto e non genera alcuna proposta.
- `CANDIDATE_FOR_PROPOSAL_AUTHORING`: un essere umano identifica il nodo curricolare candidato e autorizza soltanto l’avvio dell’authoring di una proposta.

## Confine di autorità

Anche l’esito `CANDIDATE_FOR_PROPOSAL_AUTHORING` non crea una `RevisionProposal` e non abilita alcuna decisione istituzionale. Produce esclusivamente una `DocenteFeedbackProposalAuthoringRequest` con stato `AWAITING_HUMAN_PROPOSAL_AUTHORING` e con:

- `automaticProposalAllowed=false`;
- `automaticDecisionAllowed=false`;
- provenienza ed evidenze conservate;
- curriculum version e target node espliciti;
- motivazione umana obbligatoria.

La successiva `RevisionProposal` dovrà essere redatta e confermata nel workflow di revisione Arena già esistente. Il passaggio alla decisione istituzionale resta separato e soggetto ai boundary di autorità già vigenti.

## Fuori perimetro

- trasporto runtime Docente OS → Arena;
- persistenza condivisa;
- creazione automatica di `RevisionProposal`;
- decisione automatica;
- modifica della baseline curricolare;
- nuova capability o membership;
- interfaccia finale di triage.
