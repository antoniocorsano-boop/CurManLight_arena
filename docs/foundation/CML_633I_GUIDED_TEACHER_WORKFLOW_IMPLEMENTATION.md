# CML-633I — Guided Teacher Workflow Implementation

## Overview

The Guided Teacher Workflow (CML-633I) is a structured, teacher-oriented workflow that guides educators through the process of designing curriculum-based instruction. It integrates existing domains and features without creating new parallel systems.

## Key Principles

1. **One Screen, One Decision**: Each step has a clear purpose and primary action
2. **Teacher-Centered Language**: Uses instructional language ("Scegli il riferimento curricolare", "Verifica che sia adatto alla progettazione")
3. **No Technical Jargon**: Avoids labels like A02, A03, A04, A07, Transfer contract, Archive, etc.
4. **Clear Qualification**: Distinguishes between "Corrente", "In revisione", "Pianificato localmente", "Legacy", "Sperimentale"
5. **Progressive Disclosure**: Only shows relevant information at each step
6. **Explicit Confirmation**: Requires confirmation for critical actions
7. **Error Communication**: Provides clear error messages with concrete next actions

## Workflow Steps

1. **Definisci il contesto di lavoro** (Context)
   - Specify institution, school year, order, role
   - Check if institution is configured
   - Proceed to next step

2. **Scegli i riferimenti per la progettazione** (Curriculum Selection)
   - Select curriculum references from various sources
   - View selected references with details
   - Proceed to next step

3. **Controlla ciò che stai usando** (Selection Review)
   - Review selected references and revisions
   - Add or remove references as needed
   - Proceed to next step

4. **Costruisci la progettazione** (Teaching Design)
   - Build teaching design using selected references
   - Modify selections as needed
   - Proceed to next step

5. **Verifica la progettazione** (Design Review)
   - Check design completeness
   - Validate references and revisions
   - Proceed to next step

6. **Prepara il documento** (Document Preparation)
   - Create document for export
   - Verify references and qualifications
   - Choose document format (HTML, JSON, Print)
   - Proceed to completion

7. **Lavoro completato** (Completion)
   - Review completed work
   - Access created design and document
   - Start new workflow or return to home