'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Sidebar, Header } from '@/components/layouts';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-liquid">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area - Sidebar is 320px (w-80) + 16px margin (m-4) = 336px */}
      <div className="lg:pr-[336px]">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} notificationCount={3} />

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
