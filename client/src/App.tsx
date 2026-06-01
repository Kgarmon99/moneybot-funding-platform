import { useState } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  Users,
  FolderOpen,
  BarChart3,
  Briefcase,
  Menu,
  X,
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Grants from './pages/Grants';
import Network from './pages/Network';
import DataRoom from './pages/DataRoom';
import InvestorCRM from './pages/InvestorCRM';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/grants', icon: Search, label: 'Grants & Accelerators' },
    { to: '/network', icon: Users, label: 'Warm Intro Network' },
    { to: '/data-room', icon: FolderOpen, label: 'Investor Data Room' },
    { to: '/investors', icon: Briefcase, label: 'Investor CRM' },
  ];

  return (
    <div className="flex h-screen bg-black">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#111111] border-r border-[#222222] flex flex-col transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-[#222222]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#43ff64] rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">MoneyBot</h1>
                <p className="text-xs text-[#666666]">Funding Accelerator</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-[#666666] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#43ff64]/10 text-[#43ff64]'
                    : 'text-[#888888] hover:bg-[#1a1a1a] hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[#222222]">
          <div className="text-xs text-[#333333]">
            MoneyBot Funding Accelerator v1.0
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto min-w-0 bg-black">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-4 p-4 bg-[#111111] border-b border-[#222222]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-[#888888] hover:bg-[#1a1a1a] rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#43ff64] rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-black" />
            </div>
            <span className="font-semibold text-white">MoneyBot</span>
          </div>
        </div>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/grants" element={<Grants />} />
          <Route path="/network" element={<Network />} />
          <Route path="/data-room" element={<DataRoom />} />
          <Route path="/investors" element={<InvestorCRM />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
