'use client'

import { useCallback, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import { setSkillList } from "../store/modules/skillSlice";
import ConnectWalletButton from "./wallet/ConnectWalletButton";
import { setToken } from "../store/modules/tokenSlice";
import { balanceOf, distributeReward } from "../contracts/services/token";
import { getSkillListByUserAddress } from "../api/skill";
import { getSkill } from "../contracts/services/skill";

export default function Header() {

  // Redux 和本地状态
  const dispatch = useDispatch();
  const { userToken } = useSelector((state) => state.token);

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  /**
   * 重置状态（清空 Redux 和本地状态）
   */
  const resetState = () => {
    const blankToken = {
      balance: "0.0",
      blockchain: "ETH",
      tokenSymbol: "TCAI",
    };

    // 清空 Redux 状态
    dispatch(setSkillList([]));
    dispatch(setToken(blankToken));

    // 重置本地状态
    setWalletAddress(null);
  };

  /**
   * 加载用户信息（调用 API 和合约方法）
   */
  const loadUserInfo = useCallback(async (address: string) => {
    if (!address || loadUserInfo.isLoading) return; // 避免重复调用
    loadUserInfo.isLoading = true;

    try {
      // 1. 用户技能情况
      // 1) 获得用户技能列表(服务端)
      let skillList = await getSkillListByUserAddress(address);
      // 2) 获得用户技能等级(合约端)
      if (skillList && skillList.length > 0) {
        console.log(skillList)
        skillList = await Promise.all(
          skillList.map(async skill => {
            const skillId = BigInt(skill.id);
            let { level, experience } = await getSkill(address, skillId);

            level = Number(level);
            experience = Number(experience);

            const threshold = 100;
            const progress = ((experience % threshold) / threshold) * 100;

            return {
              ...skill,
              level,
              experience,
              progress
            };
          })
        );
      } else {
        skillList = [];
      }

      // 2. 获得链上账户 TCAI 余额
      const balance = await balanceOf(address);

      // 3. 更新 Redux 状态
      dispatch(setToken({
        balance: balance ? balance : "0",
        blockchain: "ETH",
        tokenSymbol: "TCAI",
      }));
      dispatch(setSkillList(skillList));
    } catch (err) {
      console.error("Failed to load user info:", err.message);
    } finally {
      loadUserInfo.isLoading = false; // 释放调用锁
    }
  }, [dispatch]);

  loadUserInfo.isLoading = false; // 初始化调用锁

  /**
   * 处理钱包连接
   */
  const handleConnectWallet = async (account: string | null) => {
    if (!account) {
      handleDisconnect();
      return;
    }

    try {
      // 加载用户信息
      await loadUserInfo(account);

      // 更新本地状态
      setWalletAddress(account);

      // 保存到本地存储
      localStorage.setItem("walletAddress", account);
      localStorage.setItem("isSigned", "true");
    } catch (err) {
      console.error("Failed to connect wallet:", err.message);
      alert("Failed to connect wallet. Please try again.");
    }
  };

  /**
   * 处理钱包断开连接
   */
  const handleDisconnect = () => {
    console.log("Wallet disconnected. Clearing data...");
    resetState();

    // 清空本地存储
    localStorage.removeItem("walletAddress");
    localStorage.removeItem("walletSignature");
    localStorage.removeItem("isSigned");
  };

  /**
   * 处理签到（调用奖励分发合约）
   */
  const handleCheckIn = async (walletAddress: string | null) => {
    
    // 检查是否已连接钱包
    if (!walletAddress) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      console.log("Checking in...");
      console.log(userToken)

      // 调用合约方法：分发奖励
      await distributeReward(walletAddress, 100);

      // 更新 Redux 状态
      const currentBalance = Number(userToken.balance);
      const newBalance = currentBalance + 100;
      dispatch(
        setToken({
          balance: newBalance,
          blockchain: userToken.blockchain,
          tokenSymbol: userToken.tokenSymbol,
        })
      );
      alert("Check-in successful!");
      setIsCheckedIn(true);
    } catch (err) {
      console.error("Check-in failed:", err.message);
      alert("Check-in failed. Please try again.");
    }
  };

  /**
   * 初始化（检查本地存储的用户信息）
   */
  useEffect(() => {
    const savedAddress = localStorage.getItem("walletAddress");
    const savedSignature = localStorage.getItem("walletSignature");
    const signedStatus = localStorage.getItem("isSigned") === "true";

    if (savedAddress && savedSignature && signedStatus) {
      loadUserInfo(savedAddress);
      setWalletAddress(savedAddress);
    }
  }, []);


  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
          </svg>
          <div>
            <h1 className="text-3xl font-bold">TaskCraft AI</h1>
            <p className="mt-2 text-blue-100">Develop your skills with AI-generated tasks</p>
          </div>
        </div>

        {/* Wallet Connection */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleCheckIn(walletAddress)}
            disabled={!walletAddress || isCheckedIn}
            className={`px-4 py-2 rounded-full font-bold text-white transition-all duration-300 ease-in-out ${!walletAddress || isCheckedIn
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600'
              }`}
          >
            {isCheckedIn ? 'Checked In' : 'Check In'}
          </button>
          <ConnectWalletButton onAddressChange={handleConnectWallet} />
        </div>
      </div>
    </header>
  )
}