export type ResourceType = 'FOOD' | 'WOOD' | 'STONE' | 'GOLD';

export interface User {
  id: number;
  username: string;
  email: string;
  level: number;
  xp: number;
  hp: number;
  maxHp: number;
  gold: number;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  type: 'DAILY' | 'TODO' | 'HABIT';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EPIC';
  xpReward: number;
  goldReward: number;
  resourceType: ResourceType;
  completed: boolean;
  completedAt?: string;
  streak: number;
  dueDate?: string;
  tags?: string;
  createdAt: string;
}

export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  type: 'DAILY' | 'TODO' | 'HABIT';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EPIC';
  resourceType?: ResourceType;
  dueDate?: string;
  tags?: string;
}

export interface CompleteTaskResponse {
  task: Task;
  user: User;
  xpGained: number;
  goldGained: number;
  leveledUp: boolean;
  resourceType: ResourceType;
  resourceGained: number;
  cityId?: number;
  cityResourceContributed: number;
}

export interface Building {
  id: number;
  cityId: number;
  buildingType: 'FARM' | 'LUMBERMILL' | 'QUARRY' | 'TREASURY';
  name: string;
  icon: string;
  level: number;
  progress: number;
  progressRequired: number;
}

export interface CityMember {
  id: number;
  cityId: number;
  userId: number;
  username: string;
  role: 'FOUNDER' | 'CITIZEN';
  foodContributed: number;
  woodContributed: number;
  stoneContributed: number;
  goldContributed: number;
  totalContributed: number;
  joinedAt: string;
}

export interface City {
  id: number;
  name: string;
  founderUserId: number;
  inviteCode: string;
  level: number;
  food: number;
  wood: number;
  stone: number;
  gold: number;
  createdAt: string;
  buildings: Building[];
  members: CityMember[];
}

