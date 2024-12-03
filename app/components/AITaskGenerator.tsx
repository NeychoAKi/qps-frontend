'use client'

import { useState } from 'react'
import { generateSkill, saveSkill } from '../api/skill'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store';
import { addSkill } from '../store/modules/skillSlice';
import { setToken } from '../store/modules/tokenSlice';
import { callGenerateSkill } from '../contracts/services/skill';
import { ethers } from 'ethers';
import { approveTokens, checkAllowance } from '../contracts/services/token';

export default function AITaskGenerator() {
  const dispatch = useDispatch();

  const { userToken } = useSelector((state: RootState) => state.token);
  const skillList = useSelector((state: RootState) => state.skill.skillList || []); // 默认空数组
  const token = useSelector((state: RootState) => state.token.userToken || {}); // 默认空数组
  const walletAddress = localStorage.getItem('walletAddress') || '';

  const [topic, setTopic] = useState('');
  const [generating, setGenerating] = useState(false);

  // 验证条件
  const canGenerate = () => {
    return topic.trim() !== '' && skillList.length < 10 && userToken.balance >= 50;
  }

  const generateTask = async () => {
    if (!canGenerate) return;

    setGenerating(true);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const costToken = 50;

      // 检查授权
      const allowance = await checkAllowance(walletAddress);
      if (allowance <= ethers.parseUnits("60", 18)) {
        console.log("Insufficient allowance, requesting approval...");
        await approveTokens(Number(allowance), costToken, signer);
      }

      // 调用 generateSkill 仅处理状态更新或其他非合约逻辑
      const updatedUserToken = {
        ...userToken,
        balance: userToken.balance - costToken,
      };

      // 调用服务端接口: 生成任务
      console.log("Generating skill...");
      let skill = await generateSkill(walletAddress, topic, updatedUserToken);
      console.log("Generating skill Successfully: ", skill);
      
      if (skill) {
        const skillId = BigInt(skill.id);
        // 调用合约端接口: 记录用户技能
        await callGenerateSkill(walletAddress, skillId, costToken);

        // 调用服务端接口: 保存用户技能
        await saveSkill(skill);
        // 更新 Redux 状态
        skill = {
          ...skill,
          level: 1,
          experience: 0,
          progress: 0,
        }
        console.log("保存内容：", skill)
        dispatch(addSkill(skill));
        dispatch(setToken(updatedUserToken));
        setTopic('');
      }
    } catch (error) {
      console.error('Error generating task:', error);
    } finally {
      setGenerating(false);
    }
  };


  return (
    <div className="space-y-6">
      <p className="text-gray-600">Generate a new skill by entering a topic below. Each skill costs 50 tokens to generate.</p>
      <div className="flex space-x-4">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter skill topic"
          className="flex-grow px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={generateTask}
          disabled={generating || topic.trim() === '' || skillList.length >= 10 || token < 50}
          className="px-6 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
        >
          {generating ? 'Generating...' : 'Generate'}
        </button>
      </div>
      {(skillList.length >= 10 || token < 50) && (
        <p className="text-red-500 text-sm">
          {skillList.length >= 10 ? "You've reached the maximum number of skills." : "You don't have enough tokens."}
        </p>
      )}
    </div>
  )
}

