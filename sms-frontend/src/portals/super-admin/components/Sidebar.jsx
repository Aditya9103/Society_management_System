import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../../store/slices/authSlice';
import {
    LayoutDashboard,
    Building2,
    Users,
    LogOut,
    ShieldCheck,
} from 'lucide-react';

const navItems = [
    { to: '/super-admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/super-admin/tenants', label: 'Tenants', icon: Building2 },
    { to: '/super-admin/societies', label: 'Societies', icon: Users },
];

export default function Sidebar() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/auth/login');
    };

    return (
        <aside className="fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col bg-gray-900 text-white">
            {/* Logo */}
            <div className="flex h-16 items-center gap-3 border-b border-gray-700/50 px-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                    <ShieldCheck className="h-5 w-5 text-white" />
                </div>
                <div>
                    <p className="text-sm font-bold leading-none text-white">Super Admin</p>
                    <p className="text-xs text-gray-400">SMS Platform</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-4">
                <ul className="space-y-1">
                    {navItems.map(({ to, label, icon: Icon, end }) => (
                        <li key={to}>
                            <NavLink
                                to={to}
                                end={end}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                                        isActive
                                            ? 'bg-indigo-600 text-white'
                                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }`
                                }
                            >
                                <Icon className="h-5 w-5 shrink-0" />
                                {label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* User Info + Logout */}
            <div className="border-t border-gray-700/50 p-4">
                <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                            {user?.firstName} {user?.lastName}
                        </p>
                        <p className="truncate text-xs text-gray-400">{user?.email}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                >
                    <LogOut className="h-4 w-4" />
                    Sign out
                </button>
            </div>
        </aside>
    );
}
