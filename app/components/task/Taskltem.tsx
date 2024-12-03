'use client'

import { useEffect, useState } from 'react'
import { Check, Eye, RotateCcw } from 'lucide-react'
import { saveTaskCompletion, verifyTask } from '@/app/api/task'
import { useDispatch, useSelector } from 'react-redux'
import { setSelectedTask } from '@/app/store/modules/skillSlice'
import { completeTask } from '@/app/contracts/services/taskCompletion'

interface TaskItemProps {
  task: {
    id: number
    name: string
    description: string
    difficulty: number
    tokenReward: number
    experienceReward: number
    assignment: string
    textContent: string
    completed: boolean
    feedback?: string
    failed?: boolean
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
}

export default function TaskItem({ task: initialTask, onTaskComplete }: TaskItemProps) {
  const [task, setTask] = useState(initialTask);

  const dispatch = useDispatch();

  const [isExpanded, setIsExpanded] = useState(false)
  const [submission, setSubmission] = useState(initialTask.textContent || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const walletAddress = localStorage.getItem('walletAddress');

  useEffect(() => {
    setSubmission(task.textContent || ""); // 确保内容为字符串
  }, [task]);

  // 选择任务
  const handleTaskSelect = (task) => {
    dispatch(setSelectedTask(task));
  };

  // 提交任务
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 内容非空才提交
    if (submission.trim()) {
      setIsSubmitting(true)

      // 1. 调用服务端接口：验证任务
      await verifyTask({
        walletAddress: walletAddress,
        taskId: task.id,
        textContent: submission,
        imgUrl: ''
      }).then(async (res) => {
        console.log("任务验证成果：", res);

        // 2. 调用合约端接口：记录完成任务
        console.log('TaskItem: Calling contract to complete task...');
        await completeTask(walletAddress, task.id);
        console.log('TaskItem: Contract Save Task Completion Successfully!');

        // 3. 通知父组件完成任务奖励的分发
        console.log('TaskItem: Notify Parent Component to Distribute Reward...');
        await onTaskComplete(task.id, {
          textContent: submission,
          feedback: res?.feedback || 'No feedback provided.',
          completed: res?.completed || false,
          failed: res?.failed || false,
          score: res?.score || 0,
        })

        // 5. 更新本地状态
        setTask((prevTask) => ({
          ...prevTask,
          feedback: res?.feedback || 'No feedback provided.',
          completed: res?.completed || false,
          failed: res?.failed || false,
          score: res?.score || 0,
        }));
        setSubmission(submission);
      }).finally(() => {
        setIsSubmitting(false)
      })
    }
  }

  return (
    <div className="mb-4 border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      <div
        className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer"
        onClick={() => {
          setIsExpanded(!isExpanded),
          handleTaskSelect(task)
        }}
      >
        <div className="flex items-center space-x-4">
          <div
            className={`w-2 h-2 rounded-full ${task.completed
              ? 'bg-green-500'
              : task.failed
                ? 'bg-red-500'
                : 'bg-gray-400'
              }`}
          />
          <h4 className="text-lg font-semibold">{task.name}</h4>
        </div>
        <div className="flex items-center space-x-2">
          {task.completed ? (
            <Check className="h-5 w-5 text-green-500" />
          ) : task.failed ? (
            <RotateCcw className="h-5 w-5 text-red-500" />
          ) : (
            <Eye className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </div>
      {isExpanded && (
        <div className="p-4 border-t">
          <div className="mb-4">
            <h5 className="font-semibold mb-2">Description:</h5>
            <p className="text-gray-600">{task.description}</p>
          </div>
          <div className="mb-4">
            <h5 className="font-semibold mb-2">Assignment:</h5>
            <p className="bg-gray-50 p-3 rounded">{task.assignment}</p>
          </div>
          <div className="mb-4 flex justify-between text-sm text-gray-600">
            <span>Difficulty: {task.difficulty}</span>
            <span>Rewards: {task.tokenReward} tokens, {task.experienceReward} XP</span>
          </div>
          <h5 className="font-semibold mb-2">Feedback:</h5>
          {task.feedback && (
            <div
              className={`mb-4 p-3 rounded ${!task.failed
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
                }`}
            >
              {task.feedback}
            </div>
          )}
          {/* 任务提交内容 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="submission" className="block text-sm font-medium text-gray-700 mb-1">
                Your Submission
              </label>
              <textarea
                id="submission"
                value={submission}
                onChange={(e) => setSubmission(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Enter your task submission here..."
                disabled={task.completed || isSubmitting} // 如果任务完成，禁用编辑
                readOnly={task.completed} // 设置为只读              
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || submission.trim() === '' || task.completed}
              className={`w-full py-2 px-4 rounded-lg text-white font-semibold transition duration-200 ${isSubmitting || submission.trim() === '' || task.completed
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
                }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Task'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
