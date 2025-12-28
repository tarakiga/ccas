'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/providers/auth-provider'
import { cn } from '@/lib/utils'
import { UserRole } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Ship,
  Bell,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronRight,
  LogOut,
  ShieldCheck
} from 'lucide-react'

interface SidebarProps {
  open: boolean
  mobileOpen: boolean
  onClose: () => void
}

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  badge?: number
  roles?: UserRole[]
}

export function Sidebar({ open, mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Shipments', href: '/shipments', icon: Ship, badge: 5 },
    { name: 'Alerts', href: '/alerts', icon: Bell, badge: 3 },
    {
      name: 'Metrics',
      href: '/metrics',
      icon: BarChart3,
      roles: [UserRole.MANAGEMENT, UserRole.ADMIN]
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      roles: [UserRole.ADMIN]
    },
  ]

  const filteredNavigation = navigation.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role as UserRole))
  )

  return (
    <>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-[#0A0C10] transition-all duration-500 ease-in-out lg:static lg:translate-x-0',
          'border-r border-white/[0.05] shadow-2xl shadow-black/50',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          open ? 'w-72' : 'lg:w-24'
        )}
      >
        {/* Brand/Logo Area */}
        <div className="flex h-20 items-center px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/20">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            {open && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col"
              >
                <span className="text-lg font-black tracking-tight text-white">CCAS</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-primary-500/80">Customs Clearance Automation System</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-6 scrollbar-none">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => onClose()}
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition-all duration-300',
                  isActive
                    ? 'bg-white/[0.03] text-white'
                    : 'text-gray-500 hover:bg-white/[0.02] hover:text-gray-300'
                )}
              >
                {/* Active Indicator Glow */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute inset-0 rounded-xl border border-white/10 bg-gradient-to-r from-primary-500/10 to-transparent"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}

                <div className={cn(
                  "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all duration-300",
                  isActive ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20" : "bg-white/[0.03] group-hover:bg-white/[0.05]"
                )}>
                  <Icon className="h-5 w-5" />
                </div>

                {open && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative flex flex-1 items-center justify-between overflow-hidden"
                  >
                    <span className="truncate">{item.name}</span>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className={cn(
                          "flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-black",
                          isActive ? "bg-white text-primary-600" : "bg-white/10 text-gray-400 group-hover:bg-white/20"
                        )}>
                          {item.badge}
                        </span>
                      )}
                      {isActive && <ChevronRight className="h-4 w-4 text-primary-400" />}
                    </div>
                  </motion.div>
                )}

                {!open && isActive && (
                  <div className="absolute left-0 h-10 w-1 rounded-r-full bg-primary-500 shadow-[2px_0_10px_rgba(59,130,246,0.5)]" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* User & Help Area */}
        <div className="mt-auto space-y-4 p-4">
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4 text-center ring-1 ring-white/10 transition-colors hover:bg-white/[0.04]"
            >
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/10 text-primary-400">
                <HelpCircle className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-bold text-white">System Learning</p>
              <p className="mt-1 text-xs font-medium text-gray-500">Master the CCAS workflow</p>
              <Link
                href="/tutorials"
                className="mt-4 flex w-full items-center justify-center rounded-xl bg-white/[0.05] py-2.5 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-white/10"
              >
                How to
              </Link>
            </motion.div>
          )}

          <div className={cn(
            "flex items-center gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.01] p-3 transition-all duration-300",
            open ? "px-4" : "justify-center p-2"
          )}>
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border-2 border-white/10 ring-2 ring-primary-500/20">
              <div className="flex h-full w-full items-center justify-center bg-primary-600 text-sm font-black text-white">
                {user?.name?.[0] || 'U'}
              </div>
            </div>
            {open && (
              <div className="flex flex-1 flex-col overflow-hidden">
                <span className="truncate text-sm font-bold text-white">{user?.name || 'Guest User'}</span>
                <span className="truncate text-[10px] font-bold uppercase tracking-wider text-primary-500/80">{user?.role} Access</span>
              </div>
            )}
            {open && (
              <button
                onClick={() => logout()}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
