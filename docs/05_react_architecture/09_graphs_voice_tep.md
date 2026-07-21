# 09 — Graphs, Voice & TEP Domains

> Interactive architecture/didactic graphs, speech synthesis/recognition, and TEP ergonomic assistance.

---

## 1. Graph Components

### 1.1 `ArchitectureGraph.tsx`

```typescript
// State: local — nodes, edges, draggedNode, zoom, pan, layout, filter, tooltip, legend
// Uses: useGraphDrag hook
// Renders: SVG canvas with draggable nodes and edges
// Behavior: drag nodes, zoom, pan, filter, tooltip on hover
```

**JSX Structure**:
```
<div className="relative w-full h-[600px] border rounded-lg overflow-hidden">
  <GraphControls zoom={zoom} onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={resetView} />
  <svg className="w-full h-full" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
    <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
      {filteredEdges.map(edge => <GraphEdge key={edge.id} {...edge} />)}
      {filteredNodes.map(node => (
        <GraphNode
          key={node.id}
          {...node}
          onMouseDown={handleMouseDown}
          isDragged={draggedNode === node.id}
        />
      ))}
    </g>
  </svg>
  {tooltip && <GraphTooltip {...tooltip} />}
  <GraphLegend items={legendItems} />
</div>
```

### 1.2 `DidacticGraph.tsx`

```typescript
// Same structure as ArchitectureGraph but with didactic-specific nodes/edges
// State: local — didacticNodes, didacticEdges, etc.
// Uses: useGraphDrag hook (shared)
```

### 1.3 `GraphNode.tsx`

```typescript
interface GraphNodeProps {
  id: string;
  x: number;
  y: number;
  label: string;
  type: 'traguardo' | 'obiettivo' | 'evidenza' | 'discipline';
  isDragged: boolean;
  onMouseDown: (id: string, e: React.MouseEvent) => void;
}

// Renders: circle/rectangle with label, color-coded by type
// Behavior: mousedown to start drag
```

### 1.4 `GraphEdge.tsx`

```typescript
interface GraphEdgeProps {
  id: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  type: 'parent' | 'child' | 'related';
}

// Renders: SVG line/curve with arrow
// Behavior: display only
```

### 1.5 `GraphControls.tsx`

```typescript
interface GraphControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFilter?: (filter: string) => void;
}

// Renders: zoom +/- buttons, reset, filter dropdown
// Behavior: zoom/pan controls
```

### 1.6 `GraphTooltip.tsx`

```typescript
interface GraphTooltipProps {
  x: number;
  y: number;
  content: string;
  type: string;
}

// Renders: floating tooltip near cursor
// Behavior: follows cursor, shows on hover
```

---

## 2. Voice Components

### 2.1 `VoiceControls.tsx`

```typescript
// State: reads useCopilotStore (voiceEnabled, language, theme)
// Uses: useSpeech hook
// Renders: speaker icon, voice selector, rate slider
// Behavior: toggle voice, change voice/rate
```

### 2.2 `VoiceTypingButton.tsx`

```typescript
// Uses: useVoiceTyping hook
// Renders: microphone icon (active/inactive state)
// Behavior: start/stop voice recognition
```

### 2.3 `SpeechBlock.tsx`

```typescript
interface SpeechBlockProps {
  text: string;
  blockId: string;
}

// Uses: useSpeech hook
// Renders: text with speaker icon
// Behavior: click to speak/cancel

---

## 3. TEP Components

### 3.1 `TepBanner.tsx`

```typescript
// State: reads useTEP hook (isDismissed)
// Renders: banner with two action buttons
// Behavior: dismiss permanently on action
```

**JSX Structure**:
```
{!isDismissed && (
  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
    <p className="text-amber-800">
      Sembri avere difficoltà con la griglia. Vuoi provare una modalità semplificata?
    </p>
    <div className="flex gap-2 mt-2">
      <Button onClick={dismissSimplify}>Prova semplificata</Button>
      <Button onClick={dismissWizard}>Passa alla procedura guidata</Button>
    </div>
  </div>
)}
```

### 3.2 `TepSimplifiedGrid.tsx`

```typescript
// State: reads useTEP hook (simplifyActive)
// Renders: simplified grid layout (fewer columns, larger text)
// Behavior: display only
```

---

## 4. Hooks

### 4.1 `useGraphDrag.ts` (shared between both graphs)

```typescript
function useGraphDrag(nodes: GraphNode[]): {
  draggedNode: string | null;
  handleMouseDown: (id: string, e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
}
// Behavior: drag-and-drop with offset tracking
```

### 4.2 `useSpeechSynthesis.ts`

```typescript
function useSpeechSynthesis(): {
  speak: (text: string, options?: SpeechOptions) => void;
  cancel: () => void;
  isSpeaking: boolean;
  voices: SpeechSynthesisVoice[];
  selectedVoice: string;
  setSelectedVoice: (voice: string) => void;
  rate: number;
  setRate: (rate: number) => void;
}
// Reads: window.speechSynthesis
// Behavior: TTS with voice selection
```

### 4.3 `useSpeechRecognition.ts`

```typescript
function useSpeechRecognition(): {
  start: () => void;
  stop: () => void;
  isActive: boolean;
  transcript: string;
  error: string | null;
  language: string;
  setLanguage: (lang: string) => void;
}
// Reads: window.SpeechRecognition / webkitSpeechRecognition
// Behavior: speech-to-text
```

### 4.4 `useTEPDetection.ts`

```typescript
function useTEPDetection(): {
  isDismissed: boolean;
  simplifyActive: boolean;
  wizardMode: boolean;
  dismissSimplify: () => void;
  dismissWizard: () => void;
  resetTEP: () => void;
  missClickCount: number;
}
// Reads: localStorage
// Writes: localStorage
// Behavior: tracks miss-clicks, triggers TEP banner after 4 small-target clicks
```

---

## 5. Handlers

```typescript
// In ArchitectureGraph
const handleGraphMouseDown = (id: string, e: React.MouseEvent) => {
  e.preventDefault();
  setDraggedNode(id);
};

const handleGraphMouseMove = (e: React.MouseEvent) => {
  if (!draggedNode) return;
  const svg = e.currentTarget as SVGElement;
  const rect = svg.getBoundingClientRect();
  const x = (e.clientX - rect.left - pan.x) / zoom;
  const y = (e.clientY - rect.top - pan.y) / zoom;
  setNodes(prev => prev.map(n => n.id === draggedNode ? { ...n, x, y } : n));
};

const handleGraphMouseUp = () => {
  setDraggedNode(null);
};

// In VoiceControls
const handleToggleSpeech = (text: string, blockId: string) => {
  if (isSpeaking && currentBlock === blockId) {
    cancel();
  } else {
    speak(text, { blockId });
  }
};

const handleToggleVoiceTyping = () => {
  if (isActive) {
    stop();
  } else {
    start();
  }
};
```

---

## 6. Tests

| Test File | Tests |
|-----------|-------|
| `ArchitectureGraph.test.tsx` | renders nodes/edges, drags node, zooms, pans |
| `DidacticGraph.test.tsx` | renders nodes/edges, drags node |
| `GraphNode.test.tsx` | renders node, handles mousedown |
| `GraphEdge.test.tsx` | renders edge |
| `GraphControls.test.tsx` | zoom in/out, reset, filter |
| `GraphTooltip.test.tsx` | renders tooltip |
| `VoiceControls.test.tsx` | renders controls, toggles voice |
| `VoiceTypingButton.test.tsx` | renders mic, starts/stops recognition |
| `SpeechBlock.test.tsx` | renders text, speaks on click |
| `TepBanner.test.tsx` | renders banner, dismisses |
| `TepSimplifiedGrid.test.tsx` | renders simplified layout |
| `useGraphDrag.test.ts` | drags node correctly |
| `useSpeechSynthesis.test.ts` | speaks, cancels, changes voice |
| `useSpeechRecognition.test.ts` | starts, stops, returns transcript |
| `useTEPDetection.test.ts` | tracks miss-clicks, shows banner |

**Total**: ~40 tests
