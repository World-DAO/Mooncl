'use client';

import React from 'react';
import Image from 'next/image';
import { useWallet } from '@/contexts/WalletContext';
import { formatAddress, formatBalance } from '@/lib/utils';

interface HeaderProps {
  onSidebarToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSidebarToggle }) => {
  const { state, disconnect } = useWallet();

  return (
    <header className="bg-gradient-to-r from-purple-900/80 to-blue-900/80 backdrop-blur-lg border-b border-white/10 p-4">
      <div className="flex items-center justify-between">
        {/* 左侧：菜单按钮 */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onSidebarToggle}
            className="lg:hidden w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* 欢迎消息 */}
          <div className="hidden sm:block">
            <p className="text-white text-lg font-medium">欢迎回来！</p>
            <p className="text-gray-300 text-sm">您的钱包已自动生成，请查看您的邮箱以找回。</p>
          </div>
        </div>

        {/* 右侧：钱包信息 */}
        <div className="flex items-center space-x-4">
          {/* 余额显示 */}
          <div className="bg-white/10 rounded-lg px-4 py-2 flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
              <span className="text-xs">💰</span>
            </div>
            <span className="text-white font-medium">{formatBalance(state.balance)}</span>
          </div>

          {/* 地址显示 */}
          <div className="bg-white/10 rounded-lg px-4 py-2 flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-white text-sm">{formatAddress(state.address || '')}</span>
          </div>

          {/* 用户头像和菜单 */}
          <div className="relative group">
            <button className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center hover:scale-105 transition-transform">
              <span className="text-white text-sm font-medium">U</span>
            </button>

            {/* 下拉菜单 */}
            <div className="absolute right-0 top-12 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-2">
                <button
                  onClick={disconnect}
                  className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                >
                  断开连接
                </button>
              </div>
            </div>
          </div>

          {/* 关闭按钮 */}
          <button className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
