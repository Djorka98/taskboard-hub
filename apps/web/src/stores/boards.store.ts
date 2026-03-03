import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type BoardWorkspace = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
};

type BoardsByUser = Record<string, BoardWorkspace[]>;
type SelectedBoardByUser = Record<string, string | null>;

type BoardsState = {
  activeUserId: string;
  boardsByUser: BoardsByUser;
  selectedBoardIdByUser: SelectedBoardByUser;
  boards: BoardWorkspace[];
  selectedBoardId: string | null;
  setActiveUser: (userId: string | null | undefined) => void;
  addBoard: (input: { name: string; description: string }) => void;
  updateBoard: (boardId: string, input: { name: string; description: string }) => void;
  removeBoard: (boardId: string) => boolean;
  selectBoard: (boardId: string) => void;
};

const guestUserKey = 'guest';

const normalizeUserKey = (userId: string | null | undefined) => (userId?.trim() ? userId : guestUserKey);

export const useBoardsStore = create<BoardsState>()(
  persist(
    (set, get) => ({
      activeUserId: guestUserKey,
      boardsByUser: {
        [guestUserKey]: [],
      },
      selectedBoardIdByUser: {},
      boards: [],
      selectedBoardId: null,
      setActiveUser: (userId) => {
        const key = normalizeUserKey(userId);
        const state = get();
        const nextBoards = state.boardsByUser[key] ?? [];
        const firstBoardId = nextBoards[0]?.id ?? null;
        const nextSelected = state.selectedBoardIdByUser[key] && nextBoards.some((board) => board.id === state.selectedBoardIdByUser[key])
          ? (state.selectedBoardIdByUser[key] as string)
          : firstBoardId;

        set({
          activeUserId: key,
          boards: nextBoards,
          selectedBoardId: nextSelected,
          boardsByUser: {
            ...state.boardsByUser,
            [key]: nextBoards,
          },
          selectedBoardIdByUser: {
            ...state.selectedBoardIdByUser,
            [key]: nextSelected,
          },
        });
      },
      addBoard: ({ name, description }) => {
        const trimmedName = name.trim();
        const trimmedDescription = description.trim();
        if (!trimmedName) return;

        const userKey = get().activeUserId;
        const scopedBoards = get().boardsByUser[userKey] ?? [];

        const id = trimmedName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');

        if (scopedBoards.some((board) => board.id === id)) return;

        const board: BoardWorkspace = {
          id,
          name: trimmedName,
          description: trimmedDescription || 'Workspace board',
          createdAt: new Date().toISOString(),
        };

        const nextBoards = [board, ...scopedBoards];
        set((state) => ({
          boards: nextBoards,
          selectedBoardId: board.id,
          boardsByUser: {
            ...state.boardsByUser,
            [userKey]: nextBoards,
          },
          selectedBoardIdByUser: {
            ...state.selectedBoardIdByUser,
            [userKey]: board.id,
          },
        }));
      },
      updateBoard: (boardId, { name, description }) => {
        const trimmedName = name.trim();
        if (!trimmedName) return;

        const userKey = get().activeUserId;
        const scopedBoards = get().boardsByUser[userKey] ?? [];
        const nextBoards = scopedBoards.map((board) =>
          board.id === boardId
            ? {
                ...board,
                name: trimmedName,
                description: description.trim() || board.description,
              }
            : board,
        );

        set((state) => ({
          boards: nextBoards,
          boardsByUser: {
            ...state.boardsByUser,
            [userKey]: nextBoards,
          },
        }));
      },
      removeBoard: (boardId) => {
        const userKey = get().activeUserId;
        const currentBoards = get().boardsByUser[userKey] ?? [];
        if (!currentBoards.some((board) => board.id === boardId)) return false;

        const nextBoards = currentBoards.filter((board) => board.id !== boardId);
        const firstBoardId = nextBoards[0]?.id ?? null;
        const selectedBoardId = get().selectedBoardIdByUser[userKey] ?? firstBoardId;
        const nextSelected = selectedBoardId === boardId ? firstBoardId : selectedBoardId;

        set((state) => ({
          boards: nextBoards,
          selectedBoardId: nextSelected,
          boardsByUser: {
            ...state.boardsByUser,
            [userKey]: nextBoards,
          },
          selectedBoardIdByUser: {
            ...state.selectedBoardIdByUser,
            [userKey]: nextSelected,
          },
        }));

        return true;
      },
      selectBoard: (boardId) => {
        const userKey = get().activeUserId;
        const currentBoards = get().boardsByUser[userKey] ?? [];
        if (!currentBoards.some((board) => board.id === boardId)) return;
        set((state) => ({
          selectedBoardId: boardId,
          selectedBoardIdByUser: {
            ...state.selectedBoardIdByUser,
            [userKey]: boardId,
          },
        }));
      },
    }),
    {
      name: 'nexus-boards',
      partialize: (state) => ({
        activeUserId: state.activeUserId,
        boardsByUser: state.boardsByUser,
        selectedBoardIdByUser: state.selectedBoardIdByUser,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const activeUserId = normalizeUserKey(state.activeUserId);
        const boardsByUser = state.boardsByUser ?? {};
        const selectedBoardIdByUser = state.selectedBoardIdByUser ?? {};

        const currentBoards = boardsByUser[activeUserId] ?? [];
        const firstBoardId = currentBoards[0]?.id ?? null;
        const selected = selectedBoardIdByUser[activeUserId] && currentBoards.some((board) => board.id === selectedBoardIdByUser[activeUserId])
          ? (selectedBoardIdByUser[activeUserId] as string)
          : firstBoardId;

        state.activeUserId = activeUserId;
        state.boardsByUser = {
          ...boardsByUser,
          [activeUserId]: currentBoards,
        };
        state.selectedBoardIdByUser = {
          ...selectedBoardIdByUser,
          [activeUserId]: selected,
        };
        state.boards = currentBoards;
        state.selectedBoardId = selected;
      },
    },
  ),
);
