import { beforeEach, describe, expect, it } from 'vitest';
import {
  readScopedWorkspaceItem,
  useAppStore,
  writeScopedWorkspaceItem,
} from './app-store';
import type { BankSetting, RoomMember, User } from '@/types';

const makeUser = (id: string): User => ({
  id,
  email: `${id}@example.com`,
  full_name: id,
  avatar_url: null,
  phone: null,
  zalo_id: null,
  created_at: '2026-09-16T00:00:00.000Z',
  updated_at: '2026-09-16T00:00:00.000Z',
});

const makeMember = (id: string, nickname: string): RoomMember => ({
  id,
  room_id: 'room-test',
  user_id: id,
  nickname,
  role: 'member',
  joined_at: '2026-09-16T00:00:00.000Z',
});

const bankSetting: BankSetting = {
  id: 'bank-1',
  user_id: 'user-a',
  bank_bin: '970436',
  bank_name: 'Vietcombank',
  account_number: '0000000000',
  account_name: 'USER A',
  is_default: true,
  created_at: '2026-09-16T00:00:00.000Z',
  updated_at: '2026-09-16T00:00:00.000Z',
};

describe('scoped dashboard workspaces', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useAppStore.getState().activateWorkspace(null);
    useAppStore.getState().reset();
  });

  it('isolates guest data from every authenticated account', () => {
    useAppStore.getState().addMember(makeMember('guest-member', 'Guest'));
    useAppStore.getState().setMonthlyBudget(1_500_000);

    useAppStore.getState().activateWorkspace(makeUser('user-a'));
    expect(useAppStore.getState().members).toEqual([]);
    expect(useAppStore.getState().monthlyBudget).toBe(2_000_000);

    useAppStore.getState().addMember(makeMember('member-a', 'User A'));
    useAppStore.getState().setBankSetting(bankSetting);
    useAppStore.getState().setMonthlyBudget(3_000_000);

    useAppStore.getState().activateWorkspace(makeUser('user-b'));
    expect(useAppStore.getState().members).toEqual([]);
    expect(useAppStore.getState().bankSetting).toBeNull();

    useAppStore.getState().activateWorkspace(null);
    expect(useAppStore.getState().members[0]?.nickname).toBe('Guest');
    expect(useAppStore.getState().monthlyBudget).toBe(1_500_000);
    expect(useAppStore.getState().bankSetting).toBeNull();

    useAppStore.getState().activateWorkspace(makeUser('user-a'));
    expect(useAppStore.getState().members[0]?.nickname).toBe('User A');
    expect(useAppStore.getState().monthlyBudget).toBe(3_000_000);
    expect(useAppStore.getState().bankSetting?.account_name).toBe('USER A');
  });

  it('returns to the guest workspace on logout without deleting user data', () => {
    useAppStore.getState().setMonthlyBudget(1_250_000);
    useAppStore.getState().activateWorkspace(makeUser('user-a'));
    useAppStore.getState().setMonthlyBudget(4_000_000);

    useAppStore.getState().logout();
    expect(useAppStore.getState().user).toBeNull();
    expect(useAppStore.getState().workspaceScope).toBe('guest');
    expect(useAppStore.getState().monthlyBudget).toBe(1_250_000);

    useAppStore.getState().activateWorkspace(makeUser('user-a'));
    expect(useAppStore.getState().monthlyBudget).toBe(4_000_000);
  });

  it('scopes auxiliary data such as duty schedules', () => {
    writeScopedWorkspaceItem('duties', JSON.stringify(['guest-duty']));

    useAppStore.getState().activateWorkspace(makeUser('user-a'));
    expect(readScopedWorkspaceItem('duties')).toBeNull();
    writeScopedWorkspaceItem('duties', JSON.stringify(['user-duty']));

    useAppStore.getState().activateWorkspace(null);
    expect(JSON.parse(readScopedWorkspaceItem('duties') || '[]')).toEqual([
      'guest-duty',
    ]);
  });
});
