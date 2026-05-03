import {type ReactNode } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

interface LayoutProps {
  children: ReactNode;
  titre: string;
}

export default function Layout({ children, titre }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Sidebar fixe */}
      <Sidebar />

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col">
        <Navbar titre={titre} />
        <main className="flex-1 p-6 overflow-auto scrollable scrollable-preview">
          {children}
        </main>
      </div>

    </div>
  );
}