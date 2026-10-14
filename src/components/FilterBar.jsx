import React from 'react';
import { Search, Filter, X, ArrowUpDown, Plus, Settings2, SlidersHorizontal } from 'lucide-react';
import { CATEGORIES } from '../types';
import { playLaserClick } from '../utils/sound';
import { triggerHaptic } from '../utils/haptics';

export function FilterBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  categories = CATEGORIES,
  onOpenCategories,
  soundEnabled = true,
  hapticsEnabled = true
}) {
  return (
    <div className="space-y-2 mb-3">
      {/* Search Input + Sort Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search merchant, notes, amount..."
            className="w-full bg-space-900/60 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition-all font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="relative shrink-0">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-space-900/80 border border-slate-800 rounded-xl px-2.5 py-2 text-[11px] font-mono text-slate-300 focus:outline-none focus:border-cyan-500/60 cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="highest">Highest Amount</option>
            <option value="lowest">Lowest Amount</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Category Pills (horizontal scroll on mobile) */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
        {/* Manage Categories Button */}
        {onOpenCategories && (
          <button
            onClick={() => {
              playLaserClick(soundEnabled);
              triggerHaptic(10, hapticsEnabled);
              onOpenCategories();
            }}
            className="text-[11px] font-mono px-2.5 py-1 rounded-full whitespace-nowrap transition-all border shrink-0 flex items-center space-x-1 bg-cyan-500/10 border-cyan-500/30 text-cyan-300 hover:border-cyan-400/60 hover:bg-cyan-500/20"
            title="Edit, Add or Remove Categories"
          >
            <SlidersHorizontal className="w-3 h-3 text-cyan-400" />
            <span>Categories</span>
          </button>
        )}

        <button
          onClick={() => {
            playLaserClick(soundEnabled);
            triggerHaptic(10, hapticsEnabled);
            onCategoryChange('all');
          }}
          className={`text-[11px] font-mono px-3 py-1 rounded-full whitespace-nowrap transition-all border shrink-0 ${
            selectedCategory === 'all'
              ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-[0_0_8px_rgba(0,240,255,0.2)]'
              : 'bg-space-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          All
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.name;
          return (
            <button
              key={cat.id}
              onClick={() => {
                playLaserClick(soundEnabled);
                triggerHaptic(10, hapticsEnabled);
                onCategoryChange(isSelected ? 'all' : cat.name);
              }}
              className={`text-[11px] font-mono px-2.5 py-1 rounded-full whitespace-nowrap transition-all border shrink-0 flex items-center space-x-1.5 ${
                isSelected
                  ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200 shadow-[0_0_8px_rgba(0,240,255,0.2)]'
                  : 'bg-space-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
