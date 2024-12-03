'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Lock, Coins } from 'lucide-react'
import TaskItem from '../task/Taskltem'

interface ModuleItemProps {
  module: {
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
  }
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
  onUnlock: () => void
  canUnlock: boolean
}

export default function ModuleItem({
  module,
  onTaskComplete,
  onUnlock,
  canUnlock,
}: ModuleItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleExpand = () => {
    if (!module.isLocked) setIsExpanded(!isExpanded);
  };

  const handleUnlockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUnlock();
  };

  return (
    <div className="mb-4 border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      <div
        className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer"
        onClick={() => !module.isLocked && setIsExpanded(!isExpanded)}
      >
        <h4 className="text-lg font-semibold">{module.name}</h4>
        <div className="flex items-center">
          {module.isLocked ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onUnlock()
              }}
              disabled={!canUnlock}
              className={`flex items-center px-3 py-1 rounded-full text-sm transition duration-200 ${canUnlock
                  ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              <Lock className="h-4 w-4 mr-1" />
              <span>{module.unlockCost}</span>
            </button>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-6 w-6 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''
                }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          )}
        </div>
      </div>
      {!module.isLocked && isExpanded && (
        <div className="p-4">
          <p className="mb-4 text-gray-600">{module.objective}</p>
          <div className="space-y-4">
            {module.taskList.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onTaskComplete={onTaskComplete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}