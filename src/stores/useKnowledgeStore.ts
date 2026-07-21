import { create } from 'zustand';

export interface CustomKbDoc {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  source: string;
  createdAt: number;
}

export interface KnowledgeState {
  customDocs: CustomKbDoc[];
  glossaryTerms: GlossaryTerm[];
  selectedDocId: string | null;
  searchQuery: string;
  tags: string[];

  addCustomDoc: (doc: CustomKbDoc) => void;
  removeCustomDoc: (id: string) => void;
  addGlossaryTerm: (term: GlossaryTerm) => void;
  removeGlossaryTerm: (id: string) => void;
  setSelectedDocId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setTags: (tags: string[]) => void;
}

export const useKnowledgeStore = create<KnowledgeState>()((set) => ({
  customDocs: [],
  glossaryTerms: [],
  selectedDocId: null,
  searchQuery: '',
  tags: [],

  addCustomDoc: (doc) =>
    set((state) => ({ customDocs: [...state.customDocs, doc] })),
  removeCustomDoc: (id) =>
    set((state) => ({ customDocs: state.customDocs.filter((d) => d.id !== id) })),
  addGlossaryTerm: (term) =>
    set((state) => ({ glossaryTerms: [...state.glossaryTerms, term] })),
  removeGlossaryTerm: (id) =>
    set((state) => ({ glossaryTerms: state.glossaryTerms.filter((t) => t.id !== id) })),
  setSelectedDocId: (selectedDocId) => set({ selectedDocId }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setTags: (tags) => set({ tags }),
}));
