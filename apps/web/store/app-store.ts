import { create } from 'zustand';
import type { User, Room, RoomMember, Expense, BankSetting } from '@/types';

type WorkspaceScope = 'guest' | `user:${string}`;

interface WorkspaceData {
  currentRoom: Room | null;
  members: RoomMember[];
  expenses: Expense[];
  memberPayments: Record<string, boolean>;
  bankSetting: BankSetting | null;
  notificationSettings: {
    expenseReminder: boolean;
    paymentConfirmation: boolean;
    dutyReminder: boolean;
  };
  monthlyBudget: number;
}

interface AppState extends WorkspaceData {
  user: User | null;
  workspaceScope: WorkspaceScope;
  workspaceReady: boolean;
  isLoading: boolean;

  activateWorkspace: (user: User | null) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
  setCurrentRoom: (room: Room | null) => void;
  setMembers: (members: RoomMember[]) => void;
  addMember: (member: RoomMember) => void;
  updateMember: (memberId: string, updates: Partial<RoomMember>) => void;
  removeMember: (memberId: string) => void;
  setExpenses: (expenses: Expense[]) => void;
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  clearAllExpenses: () => void;
  toggleMemberPayment: (memberId: string) => void;
  setMemberPayment: (memberId: string, paid: boolean) => void;
  setBankSetting: (setting: BankSetting | null) => void;
  setNotificationSettings: (settings: AppState['notificationSettings']) => void;
  setMonthlyBudget: (budget: number) => void;
  setIsLoading: (loading: boolean) => void;
  reset: () => void;
}

const WORKSPACE_STORAGE_VERSION = 1;
const LEGACY_STORAGE_KEY = '4b-app-storage';
let activeWorkspaceScope: WorkspaceScope = 'guest';

const initialWorkspaceState: WorkspaceData = {
  currentRoom: null,
  members: [],
  expenses: [],
  memberPayments: {},
  bankSetting: null,
  notificationSettings: {
    expenseReminder: true,
    paymentConfirmation: true,
    dutyReminder: true,
  },
  monthlyBudget: 2000000,
};

function createDefaultRoom(user: User | null): Room {
  const now = new Date().toISOString();
  return {
    id: user ? `room-${user.id.slice(0, 8)}` : 'guest-room',
    name: user ? 'Phòng của tôi' : 'Không gian dùng thử',
    address: null,
    owner_id: user?.id || 'guest',
    invite_code: user ? '4BHOME' : 'GUEST',
    created_at: now,
    updated_at: now,
  };
}

function getWorkspaceStateKey(scope: WorkspaceScope) {
  return `4b-workspace:${scope}:state`;
}

export function getScopedWorkspaceStorageKey(segment: string) {
  return `4b-workspace:${activeWorkspaceScope}:${segment}`;
}

function parseStoredState(raw: string | null): Partial<WorkspaceData> | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as {
      version?: number;
      state?: Partial<WorkspaceData>;
    };
    return parsed.state ?? null;
  } catch {
    return null;
  }
}

function readLegacyState() {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: Partial<AppState> };
    return parsed.state ?? null;
  } catch {
    return null;
  }
}

function legacyStateBelongsToScope(
  legacy: Partial<AppState> | null,
  scope: WorkspaceScope,
) {
  const legacyUserId = legacy?.user?.id;
  if (scope === 'guest') return !legacyUserId;
  return legacyUserId === scope.slice('user:'.length);
}

function migrateLegacyWorkspace(scope: WorkspaceScope): Partial<WorkspaceData> | null {
  if (typeof window === 'undefined') return null;

  const legacy = readLegacyState();
  if (!legacyStateBelongsToScope(legacy, scope)) return null;

  let currentRoom = legacy?.currentRoom ?? null;
  try {
    const legacyRoomKey =
      scope === 'guest' ? '4b_last_room' : `4b_room_${scope.slice('user:'.length)}`;
    const legacyRoom = window.localStorage.getItem(legacyRoomKey);
    if (legacyRoom) currentRoom = JSON.parse(legacyRoom) as Room;
  } catch {
    // Invalid legacy data is ignored rather than crossing workspace boundaries.
  }

  return {
    currentRoom,
    members: legacy?.members ?? [],
    expenses: legacy?.expenses ?? [],
    memberPayments: legacy?.memberPayments ?? {},
    bankSetting: scope === 'guest' ? null : (legacy?.bankSetting ?? null),
    notificationSettings:
      legacy?.notificationSettings ?? initialWorkspaceState.notificationSettings,
    monthlyBudget: legacy?.monthlyBudget ?? initialWorkspaceState.monthlyBudget,
  };
}

function loadWorkspace(scope: WorkspaceScope): Partial<WorkspaceData> {
  if (typeof window === 'undefined') return {};

  const stored = parseStoredState(window.localStorage.getItem(getWorkspaceStateKey(scope)));
  return stored ?? migrateLegacyWorkspace(scope) ?? {};
}

function workspaceSnapshot(state: AppState): WorkspaceData {
  return {
    currentRoom: state.currentRoom,
    members: state.members,
    expenses: state.expenses,
    memberPayments: state.memberPayments,
    bankSetting: state.workspaceScope === 'guest' ? null : state.bankSetting,
    notificationSettings: state.notificationSettings,
    monthlyBudget: state.monthlyBudget,
  };
}

function persistWorkspace(state: AppState) {
  if (typeof window === 'undefined' || !state.workspaceReady) return;

  try {
    window.localStorage.setItem(
      getWorkspaceStateKey(state.workspaceScope),
      JSON.stringify({
        version: WORKSPACE_STORAGE_VERSION,
        state: workspaceSnapshot(state),
      }),
    );
  } catch {
    // Storage can be unavailable in private mode. The in-memory workspace still works.
  }
}

export function readScopedWorkspaceItem(segment: string, legacyKey?: string) {
  if (typeof window === 'undefined') return null;

  const scopedKey = getScopedWorkspaceStorageKey(segment);
  const scopedValue = window.localStorage.getItem(scopedKey);
  if (scopedValue !== null || !legacyKey) return scopedValue;

  const legacy = readLegacyState();
  if (!legacyStateBelongsToScope(legacy, activeWorkspaceScope)) return null;

  const legacyValue = window.localStorage.getItem(legacyKey);
  if (legacyValue !== null) {
    window.localStorage.setItem(scopedKey, legacyValue);
  }
  return legacyValue;
}

export function writeScopedWorkspaceItem(segment: string, value: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(getScopedWorkspaceStorageKey(segment), value);
}

export const useAppStore = create<AppState>()((set) => ({
  ...initialWorkspaceState,
  user: null,
  workspaceScope: 'guest',
  workspaceReady: false,
  isLoading: false,

  activateWorkspace: (user) => {
    const workspaceScope: WorkspaceScope = user ? `user:${user.id}` : 'guest';
    const restoredWorkspace = loadWorkspace(workspaceScope);
    activeWorkspaceScope = workspaceScope;
    set({
      ...initialWorkspaceState,
      ...restoredWorkspace,
      currentRoom: restoredWorkspace.currentRoom ?? createDefaultRoom(user),
      user,
      workspaceScope,
      workspaceReady: true,
      isLoading: false,
    });
  },

  setUser: (user) => set({ user }),

  logout: () => {
    const workspaceScope: WorkspaceScope = 'guest';
    const guestWorkspace = loadWorkspace(workspaceScope);
    activeWorkspaceScope = workspaceScope;
    set({
      ...initialWorkspaceState,
      ...guestWorkspace,
      currentRoom: guestWorkspace.currentRoom ?? createDefaultRoom(null),
      user: null,
      workspaceScope,
      workspaceReady: true,
      isLoading: false,
    });
  },

  setCurrentRoom: (currentRoom) => set({ currentRoom }),
  setMembers: (members) => set({ members }),
  addMember: (member) => set((state) => ({ members: [...state.members, member] })),
  updateMember: (memberId, updates) =>
    set((state) => ({
      members: state.members.map((member) =>
        member.id === memberId ? { ...member, ...updates } : member,
      ),
    })),
  removeMember: (memberId) =>
    set((state) => ({
      members: state.members.filter((member) => member.id !== memberId),
    })),
  setExpenses: (expenses) => set({ expenses }),
  addExpense: (expense) => set((state) => ({ expenses: [expense, ...state.expenses] })),
  updateExpense: (id, updates) =>
    set((state) => ({
      expenses: state.expenses.map((expense) =>
        expense.id === id ? { ...expense, ...updates } : expense,
      ),
    })),
  deleteExpense: (id) =>
    set((state) => ({ expenses: state.expenses.filter((expense) => expense.id !== id) })),
  clearAllExpenses: () => set({ expenses: [], memberPayments: {} }),
  toggleMemberPayment: (memberId) =>
    set((state) => ({
      memberPayments: {
        ...state.memberPayments,
        [memberId]: !state.memberPayments[memberId],
      },
    })),
  setMemberPayment: (memberId, paid) =>
    set((state) => ({
      memberPayments: { ...state.memberPayments, [memberId]: paid },
    })),
  setBankSetting: (bankSetting) => set({ bankSetting }),
  setNotificationSettings: (notificationSettings) => set({ notificationSettings }),
  setMonthlyBudget: (monthlyBudget) => set({ monthlyBudget }),
  setIsLoading: (isLoading) => set({ isLoading }),
  reset: () =>
    set((state) => ({
      ...initialWorkspaceState,
      user: state.user,
      workspaceScope: state.workspaceScope,
      workspaceReady: true,
    })),
}));

useAppStore.subscribe(persistWorkspace);
