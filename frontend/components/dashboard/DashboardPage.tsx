// 'use client';

// import React, { useState } from 'react';
// import Image from 'next/image';
// import Sidebar from '@/components/layout/Sidebar';
// import Header from '@/components/layout/Header';

// const DashboardPage: React.FC = () => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   const toggleSidebar = () => {
//     setSidebarOpen(!sidebarOpen);
//   };

//   return (
//     <div className="min-h-screen relative overflow-hidden">
//       {/* 背景图片 */}
//       <div className="absolute inset-0">
//         <Image
//           src="/img/background/backgroundHorizontal.jpg"
//           alt="Background"
//           fill
//           className="object-cover"
//           priority
//         />
//         {/* 背景遮罩 - 比登录页面稍微透明一些 */}
//         <div className="absolute inset-0 bg-gradient-to-b from-purple-900/60 via-purple-800/40 to-blue-900/60" />
//       </div>

//       {/* 侧边栏 */}
//       <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

//       {/* 主要内容区域 */}
//       <div className="relative z-10 lg:ml-20 min-h-screen flex flex-col">
//         {/* 头部 */}
//         <Header onSidebarToggle={toggleSidebar} />

//         {/* 主要内容 */}
//         <main className="flex-1 p-6">
//           <div className="max-w-6xl mx-auto">
//             {/* 中心区域 */}
//             <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
//               {/* 3D角色区域 */}
//               <div className="relative mb-8">
//                 <div className="w-32 h-32 bg-gradient-to-b from-purple-400 to-blue-500 rounded-full flex items-center justify-center shadow-2xl">
//                   {/* 这里可以放置3D角色或图片 */}
//                   <div className="w-24 h-24 bg-gradient-to-b from-purple-300 to-blue-400 rounded-full flex items-center justify-center">
//                     <span className="text-4xl">👤</span>
//                   </div>
//                 </div>
//                 {/* 阴影效果 */}
//                 <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-black/30 rounded-full blur-lg"></div>
//               </div>

//               {/* 中心按钮 */}
//               <button className="group relative">
//                 <div className="w-64 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl shadow-2xl flex items-center justify-center hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105">
//                   <span className="text-white text-xl font-bold">开始探索</span>
//                 </div>
//                 {/* 按钮发光效果 */}
//                 <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300 -z-10"></div>
//               </button>

//               {/* 装饰元素 */}
//               <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-cyan-400 rounded-full animate-pulse"></div>
//               <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
//               <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
//             </div>

//             {/* 底部装饰区域 */}
//             <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none">
//               {/* 地板装饰 */}
//               <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-600/50 to-blue-600/50 rounded-full blur-sm"></div>

//               {/* 一些装饰性的几何形状 */}
//               <div className="absolute bottom-4 left-8 w-6 h-6 bg-purple-500/30 rounded-lg transform rotate-45"></div>
//               <div className="absolute bottom-6 right-12 w-4 h-4 bg-blue-500/30 rounded-full"></div>
//               <div className="absolute bottom-8 left-1/3 w-3 h-8 bg-pink-500/30 rounded-full"></div>
//               <div className="absolute bottom-4 right-1/4 w-8 h-3 bg-cyan-500/30 rounded-full"></div>
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default DashboardPage;
