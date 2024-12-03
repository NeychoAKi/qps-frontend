'use client'

import {
  updateSkill,
  getSkill,
} from '../../contracts/services/skill';
import {
  completeTask as completeTaskContract,
  claimReward,
} from '../../contracts/services/taskCompletion';
import {
  distributeReward as distributeRewardContract,
} from '../../contracts/services/token';

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '../../components/Header'
import ModuleList from '../../components/module/ModuleList'

import { AppDispatch, RootState } from '@/app/store'
import { useDispatch, useSelector } from 'react-redux'
import { completeTask, saveSkill, setSkillList } from '@/app/store/modules/skillSlice'
import { Skill } from '@/app/types/types'
import { getSkillById } from '@/app/api/skill'
import { saveTaskCompletion } from '@/app/api/task';

export default function SkillDetail() {
  const { id } = useParams() // 获取路由参数
  const router = useRouter()
  const dispatch = useDispatch();
  const { userToken } = useSelector((state) => state.token);
  const { selectedTask, skillList } = useSelector((state) => state.skill);
  const [token, setToken] = useState(userToken);
  const [skill, setSkill] = useState<Skill | null>(null);
  const walletAddress = localStorage.getItem('walletAddress');

  // 获取技能
  useEffect(() => {
    const fetchSkill = async () => {
      try {
        // 1. 根据ID查询服务端的技能信息
        const skillDetail = await getSkillById(walletAddress, id);
        // 2. 根据ID查询合约端的技能等级
        const skill = skillList.find(skill => skill.id == id);
        let { level, experience } = skill;
        // const skillId = BigInt(id);
        // let { level, experience } = await getSkill(walletAddress, skillId);

        level = Number(level)
        experience = Number(experience)

        // 3. 整合技能信息
        const skillData = {
          ...skillDetail,
          level,
          experience
        }

        // 更新组件状态
        setSkill(skillData);

        // 更新Redux
        dispatch(setSkillList(skillData));
      } catch (error) {
        console.error('Error fetching skill:', error);
      }
    };

    if (walletAddress && id) {
      fetchSkill();
    }
  }, []);

  // 更新技能的经验和等级
  const calcSkillLevel = (experienceReward: number) => {
    const threshold = 100;
    let newExperience = skill.experience + experienceReward;
    let newLevel = skill.level;

    while (newExperience >= threshold) {
      const gap = newExperience / threshold;
      newLevel += gap;
    }

    return {
      ...skill,
      level: newLevel,
      experience: newExperience,
      progress: (newExperience / threshold) * 100,
    };
  };

  // 更新用户代币余额
  const updateTokenBalance = (tokenReward: number) => {
    // 确保 userToken.balance 是数字类型
    const currentBalance = Number(userToken.balance);
    const rewardToAdd = Number(tokenReward);

    // 打印调试信息
    console.log('Current token balance (as number):', currentBalance);
    console.log('Token reward (as number):', rewardToAdd);

    // 正确累加
    const updatedBalance = currentBalance + rewardToAdd;

    console.log('Updated token balance (calculated):', updatedBalance);

    return {
      ...userToken,
      balance: updatedBalance,
    };
  };

  /**
   * 接收到 TaskItem 的任务完成，完成奖励分发逻辑
   * @param taskId 
   * @param param1 
   * @returns 
   */
  const handleTaskRewardDistribute = async (taskId: number, { textContent, feedback, completed, failed, score }: any) => {
    // 1. 若任务完成直接返回
    if (!completed) return false;

    try {
      const logHeader = "handleTaskComeplete: ";

      // 2. 获得当前任务的任务奖励
      const { experienceReward, tokenReward } = selectedTask;

      // 3. 计算新的技能和代币状态
      const newSkillData = calcSkillLevel(experienceReward);
      const newTokenData = updateTokenBalance(tokenReward);

      console.log(logHeader + 'Task completion initiated...');
      console.log(logHeader + '新的任务奖励: ', { newSkillData, newTokenData });

      // 4. 调用合约端接口：分发奖励
      console.log(logHeader + 'Calling contract to claim reward...');
      const skillId = BigInt(skill.id);
      console.log(
        walletAddress,
        skillId,
        taskId,
        tokenReward,
        experienceReward,
        newSkillData.level
      )
      await claimReward(
        walletAddress,
        skillId,
        taskId,
        tokenReward,
        experienceReward,
        newSkillData.level
      );

      /**
        * 4. 调用服务端接口：保存任务完成情况
        * 
        * 利用合约端接口的原子性：先调用合约端接口，再调用服务端接口
        */
      console.log('TaskItem: Save Task Completion...');
      await saveTaskCompletion({
        taskId: taskId,
        walletAddress,
        textContent: textContent,
        imgUrl: '',
        feedback: feedback || 'No feedback provided.',
        score: score || 0,
        completed: completed || false,
        failed: failed || false,
      })
      console.log('TaskItem: Save Task Completion Successfully!');

      // 保存到 Redux
      dispatch(saveSkill(newSkillData));
      dispatch(updateTokenBalance(newTokenData));
      
      dispatch(
        completeTask({
          taskId,
          feedback,
          completed,
          failed,
          score,
        })
      );

      console.log(logHeader + 'Task completed and reward claimed successfully.');

      return true;
    } catch (error) {
      console.error('Error completing task:', error);
      return false;
    }
  };

  // 解锁模块
  const handleUnlockModule = (moduleId: number, unlockCost: number) => {
  };

  if (!skill) {
    return <div className="min-h-screen flex items-center justify-center">
      <p className="text-2xl font-bold text-gray-600">Skill not found</p>
    </div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:underline flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Skills
          </button>
          <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-yellow-500 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-lg font-semibold">{token.balance} {token.tokenSymbol}</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold mb-4">{skill.name}</h2>
          <div className="flex items-center mb-6">
            <div className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full mr-2">
              Level {skill.level}
            </div>
            <div className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
              {skill.experience} XP
            </div>
          </div>
          <ModuleList
            moduleList={skill.moduleList}
            onTaskComplete={handleTaskRewardDistribute}
            onUnlock={handleUnlockModule}
            availableTokens={userToken.balance}
          />
        </div>
      </main>
    </div>
  );
}