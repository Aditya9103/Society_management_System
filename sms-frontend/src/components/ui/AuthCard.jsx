import React from 'react';
import { cn } from './Button';
import { Shield, Lock, Bell, Calendar, Users } from 'lucide-react';

export function AuthCard({ title, subtitle, children, className }) {
  return (
    <div className="flex min-h-screen text-white relative">
      {/* Full Page Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img src="/loginbg.png" alt="Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D17]/80 via-[#0B0D17]/60 to-[#0B0D17]/95" />
      </div>

      {/* Left Side - Hidden on Mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-between p-8 lg:p-10 overflow-hidden">
        {/* Content */}
        <div className="relative z-10 space-y-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">Society Management</h1>
              <p className="text-xs text-indigo-200 tracking-[0.2em] uppercase">System</p>
            </div>
          </div>

          {/* Main Copy */}
          <div className="space-y-4 max-w-sm">
            <h2 className="text-4xl font-extrabold tracking-tight">
              Welcome <span className="text-indigo-500">Home</span>
            </h2>
            <div className="w-10 h-1 bg-indigo-500 rounded-full" />
            <p className="text-base text-slate-300 leading-relaxed">
              Access your community, manage your account, and stay connected with everything that matters.
            </p>

            {/* TEMPORARY QUICK DEMO CREDENTIALS - REMOVE LATER */}
            <div className="mt-8 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 backdrop-blur-md">
              <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">Quick Demo Access</h3>
              <div className="space-y-1.5 text-sm text-slate-300 font-mono">
                <p className="flex items-center justify-between">
                  <span>Email:</span> <span className="text-white font-semibold">vonolel118@aratrin.com</span>
                </p>
                <p className="flex items-center justify-between">
                  <span>Pass:</span> <span className="text-white pr-23 font-semibold">password123</span>
                </p>
              </div>
            </div>
            {/* END TEMPORARY QUICK DEMO CREDENTIALS */}
          </div>
        </div>

        {/* Feature Cards */}
        <div className="relative z-10 grid grid-cols-4 gap-3 mt-8">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex flex-col gap-2">
            <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div>
              <h4 className="text-[11px] font-semibold text-white">Secure Access</h4>
              <p className="text-[9px] text-slate-400 mt-0.5">Bank-level security</p>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex flex-col gap-2">
            <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <Bell className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div>
              <h4 className="text-[11px] font-semibold text-white">Live Updates</h4>
              <p className="text-[9px] text-slate-400 mt-0.5">Instant notifications</p>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex flex-col gap-2">
            <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div>
              <h4 className="text-[11px] font-semibold text-white">Easy Bookings</h4>
              <p className="text-[9px] text-slate-400 mt-0.5">Manage your visits</p>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex flex-col gap-2">
            <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div>
              <h4 className="text-[11px] font-semibold text-white">Community</h4>
              <p className="text-[9px] text-slate-400 mt-0.5">Everything in one place</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 relative z-10 overflow-hidden">
        {/* Decorative corner glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

        <div className={cn('w-full max-w-[400px] bg-white/5 backdrop-blur-xl border border-white/10 p-6 sm:p-8 rounded-3xl shadow-2xl relative z-10', className)}>
          <div className="mb-4">
            {title && (
              <h2 className="text-2xl font-bold text-white mb-1.5">
                {title.includes('back') ? (
                  <>Welcome <span className="text-indigo-400">back</span> 👋</>
                ) : (
                  title
                )}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs text-slate-400">{subtitle}</p>
            )}
          </div>
          <div className="space-y-3">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default AuthCard;
