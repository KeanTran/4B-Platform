import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Room, RoomMember, Expense, BankSetting } from '@/types';

interface AppState {
  // User
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;

  // Current Room
  currentRoom: Room | null;
  setCurrentRoom: (room: Room | null) => void;

  // Room Members
  members: RoomMember[];
  setMembers: (members: RoomMember[]) => void;
  addMember: (member: RoomMember) => void;
  updateMember: (memberId: string, updates: Partial<RoomMember>) => void;
  removeMember: (memberId: string) => void;

  // Expenses
  expenses: Expense[];
  setExpenses: (expenses: Expense[]) => void;
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Bank Settings
  bankSetting: BankSetting | null;
  setBankSetting: (setting: BankSetting | null) => void;

  // Notification Settings
  notificationSettings: {
    expenseReminder: boolean;
    paymentConfirmation: boolean;
    dutyReminder: boolean;
  };
  setNotificationSettings: (settings: AppState['notificationSettings']) => void;

  // Budget
  monthlyBudget: number;
  setMonthlyBudget: (budget: number) => void;

  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  user: null,
  currentRoom: null,
  members: [],
  expenses: [],
  bankSetting: null,
  notificationSettings: {
    expenseReminder: true,
    paymentConfirmation: true,
    dutyReminder: true,
  },
  monthlyBudget: 2000000,
  isLoading: false,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,

      setUser: (user) => set({ user }),

      logout: () => set({ user: null, currentRoom: null }),

      setCurrentRoom: (currentRoom) => set({ currentRoom }),

      setMembers: (members) => set({ members }),

      addMember: (member) =>
        set((state) => ({
          members: [...state.members, member],
        })),

      updateMember: (memberId, updates) =>
        set((state) => ({
          members: state.members.map((m) =>
            m.id === memberId ? { ...m, ...updates } : m,
          ),
        })),

      removeMember: (memberId) =>
        set((state) => ({
          members: state.members.filter((m) => m.id !== memberId),
        })),

      setExpenses: (expenses) => set({ expenses }),

      addExpense: (expense) =>
        set((state) => ({
          expenses: [expense, ...state.expenses],
        })),

      updateExpense: (id, updates) =>
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === id ? { ...e, ...updates } : e,
          ),
        })),

      deleteExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        })),

      setBankSetting: (bankSetting) => set({ bankSetting }),

      setNotificationSettings: (notificationSettings) => set({ notificationSettings }),

      setMonthlyBudget: (monthlyBudget) => set({ monthlyBudget }),

      setIsLoading: (isLoading) => set({ isLoading }),

      reset: () => set(initialState),
    }),
    {
      name: '4b-app-storage',
      partialize: (state) => ({
        user: state.user,
        currentRoom: state.currentRoom,
        members: state.members,
        expenses: state.expenses,
        bankSetting: state.bankSetting,
        notificationSettings: state.notificationSettings,
        monthlyBudget: state.monthlyBudget,
      }),
    },
  ),
);
