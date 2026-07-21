# 06 — Copilot Domain: Chat, Suggestions, Voice Input, AI Generation

> AI-powered assistant for curriculum development, with chat interface, inline suggestions, and voice input.

---

## 1. Components

### 1.1 `CopilotPanel.tsx`

```typescript
// State: reads useNavigationStore (copilotChatOpen, copilotTab)
// State: reads useCopilotStore (messages, isLoading)
// Renders: floating panel with chat, suggestions, voice tabs
// Behavior: toggle open/close, switch between tabs
```

**JSX Structure**:
```
<div className={`fixed bottom-4 right-4 z-50 ${isOpen ? 'w-96 h-[600px]' : 'w-12 h-12'}`}>
  {isOpen ? (
    <Card className="flex flex-col h-full">
      <CopilotHeader onClose={close} />
      <Tabs tabs={copilotTabs} activeTab={copilotTab} onChange={setCopilotTab} />
      <div className="flex-1 overflow-auto">
        {copilotTab === 'chat' && <CopilotChat />}
        {copilotTab === 'suggerimenti' && <CopilotSuggestions />}
        {copilotTab === 'voci' && <CopilotVoiceInput />}
      </div>
      {copilotTab === 'chat' && <CopilotInput />}
    </Card>
  ) : (
    <Button onClick={open} className="rounded-full w-12 h-12">
      <Bot />
    </Button>
  )}
</div>
```

### 1.2 `CopilotChat.tsx`

```typescript
// State: reads useCopilotStore (messages, isLoading)
// Renders: message list with user/assistant bubbles
// Behavior: auto-scroll to bottom on new messages
```

### 1.3 `CopilotMessage.tsx`

```typescript
interface CopilotMessageProps {
  message: CopilotMessage;
  onSpeak?: (text: string) => void;
}

// Renders: single message bubble with timestamp, speak button
// Behavior: click speak → TTS
```

### 1.4 `CopilotInput.tsx`

```typescript
// State: local — inputValue
// Renders: text input with send button, voice toggle
// Behavior: Enter to send, click send button
```

### 1.5 `CopilotSuggestions.tsx`

```typescript
// State: reads useCopilotStore (context)
// Renders: contextual suggestion chips based on active tab
// Behavior: click chip → send as message
```

### 1.6 `CopilotChips.tsx`

```typescript
interface CopilotChipsProps {
  suggestions: string[];
  onSelect: (text: string) => void;
}

// Renders: horizontal scrollable chip list
// Behavior: click chip → delegate to parent
```

### 1.7 `CopilotVoiceInput.tsx`

```typescript
// State: reads useCopilotStore (voiceEnabled)
// Uses: useVoiceTyping hook
// Renders: microphone button, transcript display
// Behavior: start/stop voice recognition, show transcript
```

### 1.8 `InlineSuggestion.tsx`

```typescript
interface InlineSuggestionProps {
  field: string;
  suggestion: string;
  isLoading: boolean;
  onAccept: (text: string) => void;
  onDismiss: () => void;
}

// Renders: suggestion card with accept/dismiss buttons
// Behavior: accept → apply to form field, dismiss → hide
```

---

## 2. AI Generation Components

### 2.1 `AiGenerationPanel.tsx`

```typescript
// State: local — topic, isGenerating, generatedCurriculum
// Renders: topic input, generate button, results
// Behavior: generate traguardi/obiettivi/evidenze from topic
```

### 2.2 `GeneratedCurriculum.tsx`

```typescript
interface GeneratedCurriculumProps {
  data: AiGeneratedCurriculum;
  onSave: () => void;
}

// Renders: generated items in categorized lists
// Behavior: review, edit, save to knowledge base
```

### 2.3 `GeminiSuggestion.tsx`

```typescript
interface GeminiSuggestionProps {
  field: string;
  value: string;
  onApply: (text: string) => void;
}

// State: local — isLoading, suggestion
// Renders: suggestion card with apply button
// Behavior: generate suggestion, apply to field
```

---

## 3. Hooks

### 3.1 `useCopilotChat.ts`

```typescript
function useCopilotChat(): {
  messages: CopilotMessage[];
  isLoading: boolean;
  sendMessage: (text: string) => void;
  clearMessages: () => void;
}
// Reads: useCopilotStore, useCurriculumStore
// Behavior: sends message, generates contextual response
```

### 3.2 `useCopilotSuggestions.ts`

```typescript
function useCopilotSuggestions(): {
  suggestions: string[];
  isLoading: boolean;
  generateSuggestion: (field: string) => void;
}
// Reads: useCopilotStore (context), useCurriculumStore
// Behavior: generates field-specific suggestions
```

---

## 4. Handlers

```typescript
// In CopilotChat
const handleSendCopilotMessage = async () => {
  if (!inputValue.trim()) return;

  const userMessage: CopilotMessage = {
    id: crypto.randomUUID(),
    role: 'user',
    content: inputValue,
    timestamp: Date.now(),
    context: { activeTab, discipline, order },
  };

  store.addMessage(userMessage);
  store.setLoading(true);
  setInputValue('');

  // GDPR filter
  const filteredContent = filterGdpr(userMessage.content);

  // Generate contextual response
  const response = await generateCopilotResponse(filteredContent, activeTab, discipline);
  
  const assistantMessage: CopilotMessage = {
    id: crypto.randomUUID(),
    role: 'assistant',
    content: response,
    timestamp: Date.now(),
  };

  store.addMessage(assistantMessage);
  store.setLoading(false);
};

// In InlineSuggestion
const handleGenerateInlineRealTaskSuggestion = async () => {
  setInlineSuggestionLoading(true);
  const suggestion = await generateRealTaskSuggestion(discipline, order);
  setInlineSuggestionLoading(false);
  // Show suggestion in UI
};

const handleAcceptGemSuggestion = () => {
  if (gemSuggestionText && activeGemField) {
    // Apply to appropriate form field
    setFormField(activeGemField, gemSuggestionText);
    setGemSuggestionText('');
    setActiveGemField(null);
    toast.success('Suggerimento applicato');
  }
};
```

---

## 5. Data Flow

```
User types message in CopilotInput
  → handleSendCopilotMessage()
  → filterGdpr(text) from lib/gdprFilter.ts
  → generateCopilotResponse() (simulated AI)
  → useCopilotStore.addMessage(response)
  → CopilotChat re-renders

User clicks suggestion chip
  → handleSelectCopilotChip(text)
  → delegates to handleSendCopilotMessage(text)
  → Same flow as above

User clicks voice button
  → useVoiceTyping.start()
  → speech recognition starts
  → transcript appears in input
  → user confirms → handleSendCopilotMessage(transcript)

User clicks "Suggerisci" on form field
  → handleTriggerGemSuggestion(field)
  → generateSuggestion(field, discipline, order)
  → InlineSuggestion appears
  → user clicks "Accetta"
  → handleAcceptGemSuggestion()
  → form field updated
```

---

## 6. Tests

| Test File | Tests |
|-----------|-------|
| `CopilotPanel.test.tsx` | renders closed, opens on click, closes |
| `CopilotChat.test.tsx` | renders messages, auto-scrolls |
| `CopilotMessage.test.tsx` | renders message, shows speak button |
| `CopilotInput.test.tsx` | renders input, sends on Enter |
| `CopilotSuggestions.test.tsx` | renders chips, selects chip |
| `CopilotChips.test.tsx` | renders chips, selects chip |
| `CopilotVoiceInput.test.tsx` | renders mic button, starts recognition |
| `InlineSuggestion.test.tsx` | renders suggestion, accepts/dismisses |
| `AiGenerationPanel.test.tsx` | renders input, generates curriculum |
| `GeneratedCurriculum.test.tsx` | renders items, saves to KB |
| `GeminiSuggestion.test.tsx` | renders suggestion, applies to field |
| `useCopilotChat.test.ts` | sends message, receives response |
| `useCopilotSuggestions.test.ts` | generates suggestions |

**Total**: ~30 tests
