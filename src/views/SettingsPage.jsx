import React from 'react';
import { User, Users, EnvelopeSimple, Shield, LockKey } from "@phosphor-icons/react";

const SettingsPage = () => {
  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-3xl font-bold text-ink mb-2 tracking-tight">Settings</h1>
        <p className="text-slate">Manage your account preferences and team members.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="col-span-1 flex flex-col gap-2">
          <h2 className="font-semibold text-lg text-ink">Profile</h2>
          <p className="text-sm text-slate">Update your personal information and email address.</p>
        </div>
        <div className="col-span-1 lg:col-span-2">
          <div className="bg-paper border border-line rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-line flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate">
                    <User size={18} />
                  </div>
                  <input type="text" defaultValue="Demo User" className="w-full bg-cloud border border-line rounded-lg py-2 pl-10 pr-4 text-ink focus:outline-none focus:border-accent transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate">
                    <EnvelopeSimple size={18} />
                  </div>
                  <input type="email" defaultValue="demo@pixtall.ai" className="w-full bg-cloud border border-line rounded-lg py-2 pl-10 pr-4 text-ink focus:outline-none focus:border-accent transition-colors" />
                </div>
              </div>
            </div>
            <div className="bg-cloud p-4 px-6 flex justify-end">
              <button className="bg-ink text-paper px-4 py-2 rounded-lg font-medium text-sm hover:bg-ink-2 transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-line" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="col-span-1 flex flex-col gap-2">
          <h2 className="font-semibold text-lg text-ink">Security</h2>
          <p className="text-sm text-slate">Manage your password and authentication methods.</p>
        </div>
        <div className="col-span-1 lg:col-span-2">
          <div className="bg-paper border border-line rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cloud flex items-center justify-center text-slate">
                  <LockKey size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-ink">Password</h3>
                  <p className="text-xs text-slate">Last changed 3 months ago</p>
                </div>
              </div>
              <button className="text-sm font-medium border border-line px-4 py-2 rounded-lg hover:bg-cloud transition-colors">Update</button>
            </div>
            <div className="h-px w-full bg-line" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cloud flex items-center justify-center text-slate">
                  <Shield size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-ink">Two-Factor Authentication</h3>
                  <p className="text-xs text-slate">Not enabled</p>
                </div>
              </div>
              <button className="text-sm font-medium border border-line px-4 py-2 rounded-lg hover:bg-cloud transition-colors">Enable</button>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default SettingsPage;
