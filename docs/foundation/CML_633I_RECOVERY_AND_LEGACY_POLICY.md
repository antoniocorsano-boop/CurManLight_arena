# CML-633I — Recovery and Legacy Policy

## Recovery Behavior

The guided workflow supports recovery without data loss through the following mechanisms:

### 1. Step Recovery
- Users can navigate backward through completed steps
- All previous selections and state are preserved
- No automatic data loss on navigation

### 2. Source Change Recovery
- If a referenced source becomes unavailable during a break:
  - Workflow shows snapshot of original content
  - Qualifies source as "non disponibile" in UI
  - Maintains original selection until user makes new choice
  - Warning displayed: "Sorgente non disponibile"

### 3. Reset Behavior
- **Reset Action**: Clears only workflow progress (completed steps, current step)
- **Preserves**:
  - All domain artifacts (designs, documents, selections)
  - Institution configuration
  - User preferences
  - Warning history
- **Reset Action**: `resetWorkflow()` - clears only workflow progress

### 3.1 Recovery Scenarios

1. **Interrupted Workflow**
   - User closes browser or application
   - Reopens workspace
   - Workflow state restored from session storage
   - Current step and completed steps preserved

2. **Source Unavailability**
   - Reference source becomes unavailable after selection
   - Workflow shows snapshot of original content
   - Warning displayed: "Sorgente non disponibile"
   - User can continue with existing selections or make new choices

3. **Reset Without Data Loss**
   - `resetWorkflow()` clears only workflow state
   - Domain artifacts (designs, documents, selections) remain intact
   - Session state preserved in IndexedDB/localStorage

## Legacy Behavior

The workflow maintains compatibility with legacy content and maintains clear distinctions:

### Legacy Content Handling

- **Legacy Content**: Clearly labeled as "Legacy" in interface
- **Qualification**: Shows "Legacy" designation in UI
- **Warning**: "Contenuto legacy utilizzato" warning displayed
- **Limitations**:
  - May have different data structure than canonical content
  - May require additional validation steps
  - Not promoted as primary content

### Legacy Integration

- **Consultation**: Legacy content accessible through dedicated tab
- **Selection**: Can be selected but marked as legacy
- **Design Use**: Can be used in design but marked as legacy in document
- **Documentation**: Legacy content appears in document with clear indication

### Error Handling for Legacy Content

- **Legacy Source Error**: "Contenuto legacy non disponibile - Usa versione corrente"
- **Legacy Format Error**: "Formato legacy non supportato - Usa conversione assistita"
- **Migration Warning**: "Migrazione assistita consigliata per contenuti legacy"

## Recovery Behavior Summary

| Scenario | Behavior | User Action |
|----------|----------|-------------|
| Institution not configured | Proceeds in personal mode | Continue with personal mode warning |
| Source unavailable | Shows snapshot, warns user | Continue or reselect available sources |
| Reset workflow | Clears only workflow state | Work resumes with same domain data |
| Source changes during break | Shows snapshot, warns about change | Maintains original selection or update if needed |
