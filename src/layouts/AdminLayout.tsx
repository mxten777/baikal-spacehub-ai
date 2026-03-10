import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Image, Calendar, Archive, FileText,
  Video, MessageSquare, Settings, LogOut, ChevronLeft, Menu, X
} from 'lucide-react'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

const adminNav = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Spaces', href: '/admin/spaces', icon: Image },
  { label: 'Programs', href: '/admin/programs', icon: Calendar },
  { label: 'Archive', href: '/admin/archive', icon: Archive },
  { label: 'Blog', href: '/admin/blog', icon: FileText },
  { label: 'Media', href: '/admin/media', icon: Video },
  { label: 'Inquiries', href: '/admin/inquiries', icon: MessageSquare },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full z-30 bg-brand-black text-white transition-all duration-300
          ${sidebarOpen ? 'w-60' : 'w-16'}`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          {sidebarOpen && (
            <Link to="/" className="font-display text-lg font-light tracking-wider text-white">
              The Lit
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 text-white/60 hover:text-white transition-colors ml-auto"
          >
            {sidebarOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Nav items */}
        <nav className="py-4">
          {adminNav.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm font-sans transition-colors duration-150
                ${isActive
                  ? 'bg-brand-accent/20 text-brand-accent border-r-2 border-brand-accent'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <item.icon size={18} className="shrink-0" />
              {sidebarOpen && <span className="tracking-wide">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-4 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut size={18} className="shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-60' : 'ml-16'}`}>
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 sticky top-0 z-20">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors ml-auto"
          >
            View Site
            <X size={14} className="rotate-45" />
          </Link>
        </header>

        <main className="p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
