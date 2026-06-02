/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { LayoutDashboard, Award, HelpCircle, FileText, Smartphone, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SidebarProps {
  activeTab: "sales" | "product";
  setActiveTab: (tab: "sales" | "product") => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen
}) => {
  const menuItems = [
    {
      id: "sales",
      label: "Sales Performance",
      desc: "Revenue & Regional stats",
      icon: LayoutDashboard
    },
    {
      id: "product",
      label: "Product & Customer",
      desc: "Device lines & Audience",
      icon: Award
    }
  ] as const;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-100 p-6">
      {/* Brand Header */}
      <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center p-0.5 shadow-md shadow-brand-primary/20">
          <div className="w-full h-full rounded-lg bg-slate-900 flex items-center justify-center text-white font-extrabold text-lg tracking-wider font-heading">
            S
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-heading font-black text-sm uppercase tracking-widest text-slate-100">
              Samsung
            </span>
            <span className="text-[10px] font-black px-1.5 py-0.5 bg-brand-primary/20 text-brand-primary rounded font-heading uppercase">
              CRM
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">
            Powered by ShopVibe
          </span>
        </div>
        
        {/* Mobile close button inside mobile menu */}
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden ml-auto p-1 text-slate-400 hover:text-white rounded-lg focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-8 space-y-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-heading block mb-4 px-2">
          Management Hub
        </span>
        
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsOpen(false); // Close mobile drawer on pick
              }}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 text-left cursor-pointer group ${
                isActive
                  ? "bg-slate-800 border-l-4 border-l-brand-primary text-slate-100"
                  : "text-slate-400 hover:bg-slate-800/55 hover:text-slate-100 border-l-4 border-l-transparent"
              }`}
            >
              <Icon className={`w-5 h-5 group-hover:scale-110 transition-transform ${isActive ? "text-brand-primary" : "text-slate-400"}`} />
              <div>
                <span className="block text-sm font-bold tracking-tight">
                  {item.label}
                </span>
                <span className="block text-[10px] text-slate-500 font-normal mt-0.5">
                  {item.desc}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Guide Card Footer */}
      <div className="mt-auto bg-slate-800/40 border border-slate-800 rounded-2xl p-4 text-center">
        <HelpCircle className="w-6 h-6 text-brand-secondary mx-auto mb-2" />
        <span className="text-xs font-bold text-slate-200 block font-heading">
          Need custom analysis?
        </span>
        <p className="text-[10px] text-slate-450 leading-relaxed mt-1">
          Upload any Samsung CRM spreadsheet format to auto-aggregate and redraw analytics.
        </p>
        <div className="mt-3 flex gap-2 justify-center">
          <span className="text-[9px] font-bold bg-slate-700 hover:border-slate-500 text-slate-300 font-mono px-2 py-1 rounded">
            UTF-8 CSV
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden md:block w-64 h-screen fixed top-0 left-0 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Dynamic Overlay) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="md:hidden fixed inset-0 bg-black z-30"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="md:hidden fixed top-0 left-0 w-64 h-full z-40 shadow-xl"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
