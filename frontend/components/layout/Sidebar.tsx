// 'use client';

// import React, { useState } from 'react';
// import Image from 'next/image';

// interface SidebarProps {
//   isOpen: boolean;
//   onToggle: () => void;
// }

// const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
//   const [activeItem, setActiveItem] = useState('home');

//   const menuItems = [
//     { id: 'home', icon: '🏠', label: '主页' },
//     { id: 'chat', icon: '💬', label: '聊天' },
//     { id: 'profile', icon: '👤', label: '个人资料' },
//     { id: 'settings', icon: '⚙️', label: '设置' },
//   ];

//   return (
//     <>
//       {/* 侧边栏背景遮罩 (移动端) */}
//       {isOpen && (
//         <div
//           className="fixed inset-0 bg-black/50 z-40 lg:hidden"
//           onClick={onToggle}
//         />
//       )}

//       {/* 侧边栏 */}
//       <div className={`
//         fixed left-0 top-0 h-full bg-gradient-to-b from-purple-900/95 to-blue-900/95 
//         backdrop-blur-lg border-r border-white/10 z-50 transition-transform duration-300 ease-in-out
//         ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
//         w-64 lg:w-20 lg:hover:w-64 group
//       `}>
//         {/* 侧边栏头部 */}
//         <div className="p-6 border-b border-white/10">
//           <div className="flex items-center space-x-3">
//             <Image
//               src="/favicon_w.png"
//               alt="Mooncl"
//               width={32}
//               height={32}
//               className="flex-shrink-0"
//             />
//             <span className="text-white font-semibold text-lg lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200">
//               Mooncl
//             </span>
//           </div>
//         </div>

//         {/* 菜单项 */}
//         <nav className="p-4 space-y-2">
//           {menuItems.map((item) => (
//             <button
//               key={item.id}
//               onClick={() => setActiveItem(item.id)}
//               className={`
//                 w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
//                 ${activeItem === item.id
//                   ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 text-white'
//                   : 'text-gray-300 hover:text-white hover:bg-white/5'
//                 }
//               `}
//             >
//               <span className="text-xl flex-shrink-0">{item.icon}</span>
//               <span className="lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200">
//                 {item.label}
//               </span>
//             </button>
//           ))}
//         </nav>

//         {/* 侧边栏底部 */}
//         <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
//           <div className="flex items-center space-x-3 px-4 py-3">
//             <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex-shrink-0" />
//             <div className="lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200">
//               <p className="text-white text-sm font-medium">用户名</p>
//               <p className="text-gray-400 text-xs">在线</p>
//             </div>
//           </div>
//         </div>

//         {/* 关闭按钮 (移动端) */}
//         <button
//           onClick={onToggle}
//           className="absolute top-4 right-4 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center lg:hidden hover:bg-white/20 transition-colors"
//         >
//           <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//           </svg>
//         </button>
//       </div>
//     </>
//   );
// };

// export default Sidebar;
