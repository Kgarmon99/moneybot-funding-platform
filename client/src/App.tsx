import { Routes, Route, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  Users,
  FolderOpen,
  BarChart3,
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Grants from './pages/Grants';
import Network from './pages/Network';
import DataRoom from './pages/DataRoom';

function App() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-primary-700 flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            MoneyBot Funding
          </h1>
          <p className="text-xs text-gray-500 mt-1">Accelerator Platform</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </NavLink>
          <NavLink
            to="/grants"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <Search className="w-5 h-5" />
            Grants & Accelerators
          </NavLink>
          <NavLink
            to="/network"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <Users className="w-5 h-5" />
            Warm Intro Network
          </NavLink>
          <NavLink
            to="/data-room"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <FolderOpen className="w-5 h-5" />
            Investor Data Room
          </NavLink>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-400">
            MoneyBot Funding Accelerator v1.0
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/grants" element={<Grants />} />
          <Route path="/network" element={<Network />} />
          <Route path="/data-room" element={<DataRoom />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
