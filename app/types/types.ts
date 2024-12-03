// src/types/types.ts
export interface TaskCompletion {
  taskId: number
  walletAddress : string
  textContent : string
  imageUrl : string
  feedback : string
  score : number
  completed : boolean
  failed : boolean
}

export interface Task {
  id: number
  name: string
  description: string
  difficulty: number
  tokenReward: number
  experienceReward: number
  assignment: string
  completed: boolean
}

export interface Module {
  id: number
  name: string
  objective: string
  isLocked: boolean
  unlockCost: number
  taskList: Task[]
}

export interface Skill {
  id: BigInt
  name: string
  description: string
  level: number
  experience: number
  progress: number
  moduleList: Module[]
}

export interface UserToken {
  tokenSymbol: string,
  blockchain: string,
  balance: number
}

export interface TaskReward {
  walletAddress: string,
  skill: Skill,
  userToken: UserToken
}