/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TravelProvider, useTravel } from './context/TravelContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { HomeTab } from './components/tabs/HomeTab';
import { RouteTab } from './components/tabs/RouteTab';
import { ScheduleTab } from './components/tabs/ScheduleTab';
import { PlacesTab } from './components/tabs/PlacesTab';
import { BudgetTab } from './components/tabs/BudgetTab';
import { LuggageTab } from './components/tabs/LuggageTab';
import { PrepTab } from './components/tabs/PrepTab';
import { JournalTab } from './components/tabs/JournalTab';
import { SettingsTab } from './components/tabs/SettingsTab';
import { ToastContainer } from './components/common/Toast';
import { NewTripModal } from './components/modals/NewTripModal';
import { AuthModal } from './components/modals/AuthModal';

const AppContent: React.FC = () => {
  const { activeTab, isAuthModalOpen, closeAuthModal } = useTravel();
  const [isOpenOnMobile, setIsOpenOnMobile] = useState(false);
  const [isNewTripModalOpen, setIsNewTripModalOpen] = useState(false);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab onOpenNewTripModal={() => setIsNewTripModalOpen(true)} />;
      case 'route':
        return <RouteTab />;
      case 'schedule':
        return <ScheduleTab />;
      case 'places':
        return <PlacesTab />;
      case 'budget':
        return <BudgetTab />;
      case 'luggage':
        return <LuggageTab />;
      case 'prep':
        return <PrepTab />;
      case 'journal':
        return <JournalTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <HomeTab onOpenNewTripModal={() => setIsNewTripModalOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpenOnMobile={isOpenOnMobile}
        onCloseMobile={() => setIsOpenOnMobile(false)}
        onOpenNewTripModal={() => setIsNewTripModalOpen(true)}
      />

      {/* Main Content Area (Offset by sidebar width on desktop) */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        <Header
          onToggleMobileMenu={() => setIsOpenOnMobile(!isOpenOnMobile)}
          onOpenNewTripModal={() => setIsNewTripModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {renderActiveTab()}
        </main>

        {/* Quiet Footer */}
        <footer className="border-t border-stone-200/80 px-4 sm:px-8 py-4 text-center text-xs text-stone-500">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="font-editorial font-bold text-stone-700">Hành trình khám phá vùng đất mới</span>
            <span>·</span>
            <span>Sổ tay du lịch kỹ thuật số Nhật Bản</span>
            <span>·</span>
            <span className="font-serif text-[#B83A2E] font-semibold">一期一会</span>
          </div>
        </footer>
      </div>

      {/* Modals & Overlays */}
      <NewTripModal
        isOpen={isNewTripModalOpen}
        onClose={() => setIsNewTripModalOpen(false)}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
      />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <TravelProvider>
      <AppContent />
    </TravelProvider>
  );
}
