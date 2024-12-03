import { updateSkill, getSkill } from '../contracts/services/skill';
import { depositToRewardPool, distributeReward, withdrawRewardPool } from '../contracts/services/token';
import { completeTask, claimReward, checkTaskCompletion, checkRewardClaimed } from '../contracts/services/taskCompletion';

const userAddress = '0x90F79bf6EB2c4f870365E785982E1f101E93b906'; // 用户地址
const skillId = 1; // 技能ID
const taskId = 101; // 任务ID
const tokenReward = 100; // 奖励的代币数量
const experienceReward = 50; // 奖励的经验值
const newSkillLevel = 2; // 新的技能等级
const rewardPoolDeposit = 500; // 存入奖励池的代币数量

async function main() {
  try {
    console.log(`[${new Date().toISOString()}] Starting interaction tests...`);

    // Step 1: Update skill
    console.log(`[${new Date().toISOString()}] Updating skill...`);
    await updateSkill(userAddress, skillId, experienceReward, newSkillLevel);
    const skillInfo = await getSkill(userAddress, skillId);
    console.log(`Updated Skill Info: Level=${skillInfo?.level}, Progress=${skillInfo?.progress}`);

    // Step 2: Complete a task and check status
    console.log(`[${new Date().toISOString()}] Completing task...`);
    await completeTask(userAddress, taskId);
    const isTaskCompleted = await checkTaskCompletion(userAddress, taskId);
    console.log(`Task Completion Status: ${isTaskCompleted}`);
/* 
    // Step 3: Claim reward for the task
    console.log(`[${new Date().toISOString()}] Claiming reward...`);
    await claimReward(userAddress, skillId, taskId, tokenReward, experienceReward, newSkillLevel);
    const isRewardClaimed = await checkRewardClaimed(userAddress, taskId);
    console.log(`Reward Claimed Status: ${isRewardClaimed}`);

    // Step 4: Deposit to the reward pool
    console.log(`[${new Date().toISOString()}] Depositing to reward pool...`);
    await depositToRewardPool(rewardPoolDeposit);

    // Step 5: Distribute reward from the pool
    console.log(`[${new Date().toISOString()}] Distributing reward...`);
    await distributeReward(userAddress, tokenReward);

    // Step 6: Withdraw from the reward pool
    console.log(`[${new Date().toISOString()}] Withdrawing from reward pool...`);
    await withdrawRewardPool(rewardPoolDeposit / 2); // 提取部分代币
 */
    console.log(`[${new Date().toISOString()}] Interaction tests completed successfully!`);
  } catch (error) {
    console.error(`Error during interaction tests: ${error.message}`);
  }
}

// Run the script
main();