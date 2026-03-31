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
  dueDate?: string;
  tags?: string;
}

export interface CompleteTaskResponse {
  task: Task;
  user: User;
  xpGained: number;
  goldGained: number;
  leveledUp: boolean;
}
