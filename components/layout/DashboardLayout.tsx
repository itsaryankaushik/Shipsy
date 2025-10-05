'use client';

import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export interface DashboardLayoutProps {
  children: React.ReactNode;
  user?: {
    name: string;
    email: string;
  } | null;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, user }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
