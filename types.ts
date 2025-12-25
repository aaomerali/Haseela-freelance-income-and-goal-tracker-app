
export interface Task {
  id: string;
  title: string;
  price: number;
  isCompleted: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface Client {
  id: string;
  name: string;
  tasks: Task[];
  color: string;
}

export interface MonthlyGoal {
  month: number; // 1-12
  year: number;
  targetAmount: number;
}

export interface AppState {
  clients: Client[];
  goals: MonthlyGoal[];
  currency: string;
}
