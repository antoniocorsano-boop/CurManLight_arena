import { create } from 'zustand';
import { UdaModel } from '../types/curriculum';

export interface SharedUda {
  id: string;
  uda: UdaModel;
  authorId: string;
  authorName: string;
  sharedAt: number;
  likes: string[];
  annotations: Annotation[];
}

export interface Annotation {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: number;
}

export interface OutcomeStat {
  completionRate: number;
  satisfactionRate: number;
  selfEvaluation: string;
  lastUpdated: number;
}

export interface SocialState {
  board: SharedUda[];
  annotations: Record<string, Annotation[]>;
  likes: Record<string, string[]>;
  outcomeStats: Record<string, OutcomeStat>;

  addToBoard: (uda: SharedUda) => void;
  removeFromBoard: (id: string) => void;
  addAnnotation: (udaId: string, annotation: Annotation) => void;
  toggleLike: (udaId: string, userId: string) => void;
  setOutcomeStats: (udaId: string, stats: OutcomeStat) => void;
}

export const useSocialStore = create<SocialState>()((set) => ({
  board: [],
  annotations: {},
  likes: {},
  outcomeStats: {},

  addToBoard: (uda) =>
    set((state) => ({ board: [...state.board, uda] })),
  removeFromBoard: (id) =>
    set((state) => ({ board: state.board.filter((u) => u.id !== id) })),
  addAnnotation: (udaId, annotation) =>
    set((state) => ({
      annotations: {
        ...state.annotations,
        [udaId]: [...(state.annotations[udaId] || []), annotation],
      },
    })),
  toggleLike: (udaId, userId) =>
    set((state) => {
      const current = state.likes[udaId] || [];
      const hasLiked = current.includes(userId);
      return {
        likes: {
          ...state.likes,
          [udaId]: hasLiked
            ? current.filter((id) => id !== userId)
            : [...current, userId],
        },
      };
    }),
  setOutcomeStats: (udaId, stats) =>
    set((state) => ({
      outcomeStats: { ...state.outcomeStats, [udaId]: stats },
    })),
}));
