'use client'

import ModuleItem from "./Moduleltem"

interface ModuleListProps {
  moduleList: {
    id: number
    name: string
    objective: string
    taskList: {
      id: number
      name: string
      description: string
      difficulty: number
      tokenReward: number
      experienceReward: number
      assignment: string
      completed: boolean
      feedback?: string
      failed?: boolean
    }[]
    isLocked: boolean
    unlockCost: number
  }[]
  onTaskComplete: (
    taskId: number,
    {
      textContent,
      feedback,
      completed,
      failed,
      score,
    }: { textContent: string; feedback: string; completed: boolean; failed: boolean; score: number }
  ) => void;
  onUnlock: (moduleId: number, unlockCost: number) => void
  availableTokens: number
}

export default function ModuleList({ moduleList, onTaskComplete, onUnlock, availableTokens }: ModuleListProps) {

  return (
    <div>
      <h3 className="text-2xl font-semibold mb-4">Modules</h3>
      {moduleList.map((module) => (
        <ModuleItem
          key={module.id}
          module={module}
          onTaskComplete={onTaskComplete}
          onUnlock={() => onUnlock(module.id, module.unlockCost)}
          canUnlock={availableTokens >= module.unlockCost}
        />
      ))}
    </div>
  )
}

