import React from 'react';
import { cn } from './Button';
import { Shield, Lock, Bell, Calendar, Users } from 'lucide-react';

export function AuthCard({ title, subtitle, children, className }) {
  return (
    <div className="flex min-h-screen bg-[#0B0D17] text-white">
      {/* Left Side - Hidden on Mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img src="/loginbg.png" alt="Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D17]/90 to-[#0B0D17]/40" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 space-y-24">
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
          <div className="space-y-6 max-w-md">
            <h2 className="text-5xl font-extrabold tracking-tight">
              Welcome <span className="text-indigo-500">Home</span>
            </h2>
            <div className="w-12 h-1 bg-indigo-500 rounded-full" />
            <p className="text-lg text-slate-300 leading-relaxed">
              Access your community, manage your account, and stay connected with everything that matters.
            </p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="relative z-10 grid grid-cols-4 gap-4 mt-12">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
               <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-indigo-400" />
               </div>
               <div>
                 <h4 className="text-xs font-semibold text-white">Secure Access</h4>
                 <p className="text-[10px] text-slate-400 mt-1">Bank-level security to protect your data</p>
               </div>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
               <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-indigo-400" />
               </div>
               <div>
                 <h4 className="text-xs font-semibold text-white">Real-time Updates</h4>
                 <p className="text-[10px] text-slate-400 mt-1">Stay informed with instant notifications</p>
               </div>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
               <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-indigo-400" />
               </div>
               <div>
                 <h4 className="text-xs font-semibold text-white">Easy Bookings</h4>
                 <p className="text-[10px] text-slate-400 mt-1">Book amenities and manage your visits</p>
               </div>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
               <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <Users className="w-4 h-4 text-indigo-400" />
               </div>
               <div>
                 <h4 className="text-xs font-semibold text-white">Community First</h4>
                 <p className="text-[10px] text-slate-400 mt-1">Everything you need in one place</p>
               </div>
            </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        {/* Decorative corner glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        
        <div className={cn('w-full max-w-[420px] bg-white/5 backdrop-blur-xl border border-white/10 p-8 sm:p-10 rounded-3xl shadow-2xl relative z-10', className)}>
          <div className="mb-6">
            {title && (
              <h2 className="text-3xl font-bold text-white mb-2">
                {title.includes('back') ? (
                  <>Welcome <span className="text-indigo-400">back</span> 👋</>
                ) : (
                  title
                )}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm text-slate-400">{subtitle}</p>
            )}
          </div>
          <div className="space-y-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default AuthCard;
