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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search merchant, notes, amount..."
            className="w-full bg-white/45 focus:bg-white/75 border border-white/50 rounded-2xl pl-9 pr-8 py-2.5 text-xs text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-900 shadow-sm transition-all font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-500 hover:text-gray-800"
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
            className="bg-white/45 focus:bg-white/75 border border-white/50 rounded-2xl px-3 py-2.5 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer shadow-sm transition-all"
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
            className="text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap transition-all border shrink-0 flex items-center space-x-1.5 bg-white/40 border-white/50 text-gray-900 hover:bg-white/60 shadow-sm"
            title="Edit, Add or Remove Categories"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-gray-800" />
            <span>Categories</span>
          </button>
        )}

        <button
          onClick={() => {
            playLaserClick(soundEnabled);
            triggerHaptic(10, hapticsEnabled);
            onCategoryChange('all');
          }}
          className={`text-xs font-semibold px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all shrink-0 ${
            selectedCategory === 'all'
              ? 'bg-gray-900 text-white shadow-md border border-gray-900'
              : 'bg-white/35 hover:bg-white/55 border border-white/45 text-gray-800'
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
              className={`text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap transition-all shrink-0 flex items-center space-x-1.5 ${
                isSelected
                  ? 'bg-gray-900 text-white shadow-md border border-gray-900'
                  : 'bg-white/35 hover:bg-white/55 border border-white/45 text-gray-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
