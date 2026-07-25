# CML-631F — Real Teacher Validation Protocol

## Objective

Verify whether real teachers can understand and complete the guided curriculum connection flow without technical assistance, identifying difficulties, ambiguities, and truly necessary changes.

## Predecessor

CML-631E — Guided Curriculum Connection Flow (complete local, verdict: `CML_631E_GUIDED_CURRICULUM_CONNECTION_FLOW_COMPLETE_LOCAL_REAL_TEACHER_VALIDATION_REQUIRED`)

## Current Status

Technical validation completed:
- All 6 curriculum nodes load correctly
- Progressive link creation flow works
- Keyboard accessibility verified
- Touch-accessible relation descriptions implemented
- TypeScript compiles cleanly
- 728 automated tests pass
- Application build succeeds
- Storybook build succeeds

Of the 9 readiness criteria, 7 are automatically verified. Criteria C1 (completion rate) and C9 (non-technical usability) require real teacher validation.

## Sample

Target: at least 5 real teachers.

Preferred composition:
- Teachers with different professional experience
- At least one teacher with limited digital familiarity
- Teachers from different disciplines
- At least one teacher not involved in CurManLight design
- At least one teacher who does not know the technical meaning of curriculum vertical link

Participant codes: T01, T02, T03, T04, T05

Do not include in any published document:
- Name
- Email address
- School
- Class
- Personal data
- Student-identifiable information

## Test Scenario

Provide each participant with an identical or equivalent scenario:

> You need to create a link between two curriculum elements belonging to different segments. Choose the starting point, the destination, and the type of relationship you consider most appropriate. Before confirming, check that the summary matches your intention.

Do not explain in advance:
- where to select segments
- which node to choose
- how the flow works
- which relationship type to use
- how to reach confirmation

The participant must use only what the interface communicates.

## Assigned Tasks

Each teacher should attempt to:
1. Recognize the purpose of the screen
2. Start a new link
3. Choose the source segment
4. Choose the source node
5. Choose the target segment
6. Choose the target node
7. Understand the available relation types
8. Choose a relation
9. Interpret the summary
10. Confirm the link
11. Verify the link was saved
12. Indicate what they would do next

Do not require the participant to know terms like:
- state
- data archive
- component
- interface
- persistence
- selector
- graph node

Use only professional school and curriculum language.

## Observation Method

Apply the think-aloud method. Invite the teacher to say:
- what they think is happening
- what they expect from the next control
- why they choose a specific action
- what they do not understand
- when they consider the task complete

The facilitator must:
- observe without guiding
- note hesitations
- record incorrect attempts
- distinguish comprehension errors from selection errors
- note points where the participant asks for help
- avoid defending or explaining the product

## Mandatory Metrics

For each participant record at least:
- Task completed: Yes / No
- Completed without help: Yes / No
- Total time: minutes and seconds
- Number of significant hesitations: number
- Number of incorrect actions: number
- Requests for help: number
- Returns to previous steps: number
- Relation types understood: Yes / Partially / No
- Summary understood: Yes / Partially / No
- Confirmation recognized: Yes / No
- Final result recognized: Yes / No

A significant hesitation is an observable pause accompanied by uncertainty, repeated attempts, or a statement of lack of understanding.

## C1 Evaluation — Completion Rate

Calculate:

```text
Completion rate =
participants who complete the task
÷
total participants
× 100
```

Calculate separately:
- overall completion
- completion without help
- completion with one or more interventions
- non-completion.

### Thresholds

- **Ready:** at least 80% complete without help.
- **Ready with minor corrections:** at least 80% complete, but less than 80% without help.
- **Not ready:** less than 80% complete the task.

With a sample of 5 teachers:
- 5 out of 5 without help: passed
- 4 out of 5 without help: passed
- 4 out of 5 with help: corrections needed
- 3 out of 5 or less: not passed

Do not compensate for non-completion by attributing it generically to limited digital competence.

## C9 Evaluation — Non-Technical User

C9 is passed only if the non-technical teacher:
- understands the purpose of the screen
- correctly identifies where to start
- distinguishes source and destination
- understands that selection is progressive
- recognizes the meaning of relations
- correctly interprets the summary
- understands the effect of confirmation
- recognizes the created link
- does not require technical explanations

### Threshold

C9 is passed when at least 4 out of 5 participants satisfy all of the following:
1. complete the task
2. do not need technical explanations
3. understand source and destination
4. understand the summary
5. recognize the final result

Report separately any critical issues for the participant with the least digital familiarity.

## Post-Test Questions

At the end ask the following questions, without suggesting the answer:
1. What did you think you had to do?
2. From which element did you understand how to start?
3. At which step were you most uncertain?
4. Was the difference between source and destination clear?
5. Did you understand the available relation types?
6. Did the summary represent what you wanted to do?
7. After confirmation, did you understand what had happened?
8. Which word or indication would you change?
9. Would you use this flow in your curriculum work?
10. What would prevent you from using it independently?

Record answers in a brief, anonymous form.

## Issue Classification

Classify each observation in exactly one main category:

- **BLOCKING**
  - prevents completion
  - produces an incorrect link
  - requires facilitator intervention

- **SIGNIFICANT**
  - causes significant hesitation
  - produces multiple attempts
  - reduces comprehension
  - does not always prevent completion

- **MINOR**
  - concerns wording, spacing, or preference
  - does not obstruct the task
  - does not change the outcome

- **PREFERENCE**
  - expresses personal taste
  - is not supported by an observed problem
  - must not automatically generate a modification

For each issue indicate:
- participants involved
- frequency
- affected step
- observed evidence
- consequence
- severity
- possible intervention
- proposed decision

## Rule for Subsequent Modifications

Do not automatically implement every suggestion.

A modification is a candidate for intervention when at least one of the following conditions applies:
- prevents completion for at least one participant
- causes the same error for at least 2 participants
- causes significant hesitation for at least 3 participants
- makes source, destination, or relation ambiguous
- prevents understanding of the summary
- prevents recognition of the saved record
- introduces an accessibility barrier

Isolated preferences must be documented but not implemented without further evidence.

## Session Documentation

Create `docs/CML_631F_REAL_TEACHER_VALIDATION_REPORT.md`.

The report must contain:
1. date or period of sessions
2. number of participants
3. aggregated sample characteristics
4. anonymous individual results
5. aggregated results
6. C1 calculation
7. C9 evaluation
8. observed difficulties
9. brief anonymized quotes, when useful
10. issue classification
11. proposed interventions
12. final decision

## Data Treatment

- Use only anonymous codes (T01-T05)
- Do not store names, emails, schools, or classes
- Do not link participant codes to personal data
- Store session notes in a secure location accessible only to the evaluation team
- Do not share identifiable data outside the evaluation team
- Destroy identifiable data after the report is finalized

## Facilitator Instructions

1. Prepare the environment with the dev server running on the target device
2. Have the observation grid ready for each session
3. Record metrics in real time, not from memory
4. Do not explain the interface before the session
5. Do not correct the participant during the task
6. Only intervene if the participant is completely blocked and cannot proceed
7. If intervention is necessary, note it as a blocking issue
8. After the task, ask the post-test questions in the same order for all participants
9. Do not lead the participant toward a specific answer
10. Thank the participant and explain how the data will be used

## Verdicts

### Validation Passed

```text
CML_631F_REAL_TEACHER_VALIDATION_PASSED
```

Use when:
- C1 is passed
- C9 is passed
- no blocking issues emerge
- any significant issues are limited and circumscribed

### Validation Passed with Minor Corrections Required

```text
CML_631F_REAL_TEACHER_VALIDATION_PASSED_MINOR_CORRECTIONS_REQUIRED
```

Use when:
- the task is completable
- no structural defects emerge
- corrections of text, hierarchy, explanation, or feedback are needed

### Correction Required Before Extension

```text
CML_631F_REAL_TEACHER_VALIDATION_CORRECT_BEFORE_EXTENSION
```

Use when:
- C1 or C9 is not passed
- at least one blocking issue is confirmed
- source, destination, relation, or confirmation are not understood
- the flow requires frequent help

### Validation Not Executed

```text
CML_631F_REAL_TEACHER_VALIDATION_NOT_EXECUTED
```

Use when only protocol and tools have been prepared, without real sessions.

Do not use a passing verdict in the absence of actual sessions.