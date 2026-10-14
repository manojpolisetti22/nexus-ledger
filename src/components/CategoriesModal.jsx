import React, { useState } from 'react';
import { 
  X, 
  Tag, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  Sparkles, 
  BrainCircuit, 
  RotateCcw,
  Utensils, 
  Fuel, 
  Briefcase, 
  Cpu, 
  Zap, 
  Megaphone, 
  Shield, 
  Coffee, 
  ShoppingBag, 
  Heart, 
  Plane, 
  Home, 
  Film, 
  Dumbbell,
  AlertCircle
} from 'lucide-react';
import { playLaserClick, playCyberBeep, playDeleteGlitch, playCashChime } from '../utils/sound';
import { triggerHaptic } from '../utils/haptics';

const AVAILABLE_ICONS = [
  { name: 'Tag', icon: Tag },
  { name: 'Utensils', icon: Utensils },
  { name: 'Fuel', icon: Fuel },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'Cpu', icon: Cpu },
  { name: 'Zap', icon: Zap },
  { name: 'Megaphone', icon: Megaphone },
  { name: 'Shield', icon: Shield },
  { name: 'Coffee', icon: Coffee },
  { name: 'ShoppingBag', icon: ShoppingBag },
  { name: 'Heart', icon: Heart },
  { name: 'Plane', icon: Plane },
  { name: 'Home', icon: Home },
  { name: 'Film', icon: Film },
  { name: 'Dumbbell', icon: Dumbbell }
];

const PRESET_COLORS = [
  '#00F0FF', // Cyan
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#F43F5E', // Rose
  '#A855F7', // Purple
  '#38BDF8', // Sky
  '#E879F9', // Pink
  '#6366F1', // Indigo
  '#EC4899', // Fuchsia
  '#94A3B8'  // Slate
];

export function CategoriesModal({
  isOpen,
  onClose,
  categories,
  onSaveCategories,
  expenses,
  onUpdateExpenses,
  learnedRules = [],
  onDeleteLearnedRule,
  onClearLearnedRules,
  soundEnabled = true,
  hapticsEnabled = true
}) {
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'learned'
  const [isAdding, setIsAdding] = useState(false);
  const [editingCatId, setEditingCatId] = useState(null);

  // New Category Form State
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#00F0FF');
  const [newIcon, setNewIcon] = useState('Tag');
  const [errorMsg, setErrorMsg] = useState('');

  // Edit Category Form State
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editIcon, setEditIcon] = useState('Tag');

  if (!isOpen) return null;

  const countExpenses = (catName) => {
    return expenses.filter(e => (e.category || '').toLowerCase() === catName.toLowerCase()).length;
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const trimmed = newName.trim();
    if (!trimmed) return;

    if (categories.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMsg('A category with this name already exists.');
      return;
    }

    const newCat = {
      id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: trimmed,
      color: newColor,
      icon: newIcon,
      bg: `${newColor}1F`,
      border: `${newColor}4D`
    };

    const updated = [...categories, newCat];
    onSaveCategories(updated);
    playCashChime(soundEnabled);
    triggerHaptic(20, hapticsEnabled);

    setNewName('');
    setIsAdding(false);
  };

  const handleStartEdit = (cat) => {
    playLaserClick(soundEnabled);
    setEditingCatId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color);
    setEditIcon(cat.icon || 'Tag');
  };

  const handleSaveEdit = (catId) => {
    const trimmed = editName.trim();
    if (!trimmed) return;

    const oldCat = categories.find(c => c.id === catId);
    if (!oldCat) return;

    // Check duplicate name
    if (categories.some(c => c.id !== catId && c.name.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMsg('A category with this name already exists.');
      return;
    }

    const updatedCategories = categories.map(c => {
      if (c.id === catId) {
        return {
          ...c,
          name: trimmed,
          color: editColor,
          icon: editIcon,
          bg: `${editColor}1F`,
          border: `${editColor}4D`
        };
      }
      return c;
    });

    onSaveCategories(updatedCategories);

    // If renamed, update existing expenses that were using oldCat.name
    if (oldCat.name !== trimmed && onUpdateExpenses) {
      const updatedExpenses = expenses.map(e => {
        if (e.category?.toLowerCase() === oldCat.name.toLowerCase()) {
          return { ...e, category: trimmed };
        }
        return e;
      });
      onUpdateExpenses(updatedExpenses);
    }

    playCyberBeep(soundEnabled);
    triggerHaptic(15, hapticsEnabled);
    setEditingCatId(null);
    setErrorMsg('');
  };

  const handleDeleteCategory = (cat) => {
    if (cat.name.toLowerCase() === 'miscellaneous') {
      alert('The "Miscellaneous" default category cannot be deleted.');
      return;
    }

    const expCount = countExpenses(cat.name);
    const msg = expCount > 0 
      ? `Delete "${cat.name}"? ${expCount} existing expenses will be reassigned to "Miscellaneous".`
      : `Delete "${cat.name}" category?`;

    if (!confirm(msg)) return;

    playDeleteGlitch(soundEnabled);
    triggerHaptic(30, hapticsEnabled);

    const updatedCategories = categories.filter(c => c.id !== cat.id);
    onSaveCategories(updatedCategories);

    // Reassign affected expenses to Miscellaneous
    if (expCount > 0 && onUpdateExpenses) {
      const updatedExpenses = expenses.map(e => {
        if (e.category?.toLowerCase() === cat.name.toLowerCase()) {
          return { ...e, category: 'Miscellaneous' };
        }
        return e;
      });
      onUpdateExpenses(updatedExpenses);
    }
  };

  const renderIcon = (iconName, className = "w-4 h-4") => {
    const item = AVAILABLE_ICONS.find(i => i.name === iconName);
    const Comp = item ? item.icon : Tag;
    return <Comp className={className} />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-[calc(env(safe-area-inset-bottom,0px)+16px)] bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white/80 sm:bg-white/85 backdrop-blur-2xl border border-white/60 rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200/60 flex items-center justify-between bg-white/40 shrink-0">
          <div className="flex items-center space-x-2.5">
            <Tag className="w-5 h-5 text-gray-800" />
            <div>
              <h2 className="text-sm uppercase tracking-wider text-gray-900 font-bold">
                Categories & AI Memory
              </h2>
              <p className="text-xs text-gray-600 font-medium">
                {categories.length} active • Powers categorization
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playLaserClick(soundEnabled);
              onClose();
            }}
            className="p-1.5 rounded-full text-gray-600 hover:text-black hover:bg-white/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="px-6 pt-3 pb-2.5 border-b border-gray-200/60 flex items-center justify-between shrink-0 bg-white/30">
          <div className="flex space-x-1 p-1 rounded-2xl bg-white/40 border border-white/50">
            <button
              onClick={() => {
                playLaserClick(soundEnabled);
                setActiveTab('categories');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                activeTab === 'categories'
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-700 hover:text-black'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Categories ({categories.length})</span>
            </button>
            <button
              onClick={() => {
                playLaserClick(soundEnabled);
                setActiveTab('learned');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                activeTab === 'learned'
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-700 hover:text-black'
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5 text-amber-500" />
              <span>Learned Memory ({learnedRules.length})</span>
            </button>
          </div>

          {activeTab === 'categories' && !isAdding && (
            <button
              onClick={() => {
                playLaserClick(soundEnabled);
                setIsAdding(true);
                setErrorMsg('');
              }}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold uppercase transition-all shadow-md active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-300 flex items-center space-x-2 text-red-900 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'categories' ? (
            <>
              {/* Add New Category Form Drawer */}
              {isAdding && (
                <form onSubmit={handleAddCategory} className="p-4 rounded-2xl bg-white/60 border border-white/60 space-y-3.5 animate-in fade-in duration-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900 uppercase flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5" />
                      New Category
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="text-gray-600 hover:text-black text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                      Category Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Food, Groceries, Fitness, Rent"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-white/70 focus:bg-white/90 border border-white/60 rounded-xl px-3.5 py-2 text-xs font-semibold text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 font-sans"
                    />
                  </div>

                  {/* Color Swatches */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                      Accent Color
                    </label>
                    <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                      {PRESET_COLORS.map(c => (
                        <button
                          type="button"
                          key={c}
                          onClick={() => setNewColor(c)}
                          className={`w-6 h-6 rounded-full border-2 transition-all ${
                            newColor === c ? 'border-gray-900 scale-110 shadow-md' : 'border-transparent opacity-75 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Icon Selector */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                      Category Icon
                    </label>
                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-1.5 max-h-24 overflow-y-auto p-1.5 bg-white/50 rounded-xl border border-white/50">
                      {AVAILABLE_ICONS.map(i => (
                        <button
                          type="button"
                          key={i.name}
                          onClick={() => setNewIcon(i.name)}
                          className={`p-1.5 rounded-lg border transition-all ${
                            newIcon === i.name
                              ? 'bg-gray-900 text-white border-gray-900'
                              : 'border-transparent text-gray-600 hover:text-black hover:bg-white/60'
                          }`}
                          title={i.name}
                        >
                          <i.icon className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-3 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wide transition-all shadow-md active:scale-98"
                  >
                    Save Category
                  </button>
                </form>
              )}

              {/* List of Categories */}
              <div className="space-y-2">
                {categories.map((cat) => {
                  const isEditing = editingCatId === cat.id;
                  const expCount = countExpenses(cat.name);

                  if (isEditing) {
                    return (
                      <div key={cat.id} className="p-3.5 rounded-2xl bg-white/70 border border-gray-900/30 space-y-2.5 shadow-sm">
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            required
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="flex-1 bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(cat.id)}
                            className="p-2 rounded-xl bg-gray-900 text-white hover:bg-black"
                            title="Save"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCatId(null)}
                            className="p-2 rounded-xl text-gray-600 hover:text-black"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Edit Color Swatches */}
                        <div className="flex items-center space-x-1.5 pt-1">
                          {PRESET_COLORS.map(c => (
                            <button
                              type="button"
                              key={c}
                              onClick={() => setEditColor(c)}
                              className={`w-5 h-5 rounded-full border-2 transition-all ${
                                editColor === c ? 'border-gray-900 scale-110' : 'border-transparent opacity-70'
                              }`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={cat.id}
                      className="p-3 rounded-2xl bg-white/40 border border-white/50 hover:bg-white/60 flex items-center justify-between transition-all shadow-xs"
                    >
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/40 bg-white/60 shadow-xs"
                          style={{ 
                            color: cat.color 
                          }}
                        >
                          {renderIcon(cat.icon)}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-gray-900 font-sans block">
                            {cat.name}
                          </span>
                          <span className="block text-[11px] text-gray-600 font-medium">
                            {expCount} {expCount === 1 ? 'expense' : 'expenses'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(cat)}
                          className="p-1.5 rounded-lg text-gray-600 hover:text-black hover:bg-white/60 transition-colors"
                          title="Edit Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {cat.name.toLowerCase() !== 'miscellaneous' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-1.5 rounded-lg text-gray-600 hover:text-red-600 hover:bg-white/60 transition-colors"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* AI Learned Memory Tab */
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-600/25 flex items-start space-x-2.5 text-xs shadow-xs">
                <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-950 space-y-1">
                  <p className="font-bold">Adaptive Learning Engine</p>
                  <p className="text-amber-900/90 font-medium">
                    Whenever you edit an expense's category, Nexus automatically learns the pattern. Future expenses matching that merchant or phrase will automatically adopt your learned category.
                  </p>
                </div>
              </div>

              {learnedRules.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  <BrainCircuit className="w-8 h-8 mx-auto text-gray-400 mb-2 opacity-50" />
                  <p className="text-xs font-semibold text-gray-700">No learned associations yet</p>
                  <p className="text-xs text-gray-600 mt-0.5 font-medium">
                    Edit any logged expense to train Nexus to your personal preferences.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-xs text-gray-700 font-semibold pb-1">
                    <span>Learned Associations ({learnedRules.length})</span>
                    {onClearLearnedRules && (
                      <button
                        onClick={() => {
                          if (confirm('Clear all learned AI associations?')) {
                            onClearLearnedRules();
                            playDeleteGlitch(soundEnabled);
                          }
                        }}
                        className="text-red-700 hover:text-red-900 flex items-center space-x-1 font-semibold"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset Memory</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {learnedRules.map((rule) => (
                      <div
                        key={rule.id}
                        className="p-3 rounded-2xl bg-white/40 border border-white/50 flex items-center justify-between shadow-xs"
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <span className="text-xs font-bold text-gray-900 bg-white/60 px-2.5 py-1 rounded-lg border border-white/60">
                            "{rule.pattern}"
                          </span>
                          <span className="text-gray-400 text-xs">➔</span>
                          <span className="text-xs font-extrabold text-gray-900">
                            {rule.category}
                          </span>
                        </div>

                        {onDeleteLearnedRule && (
                          <button
                            onClick={() => {
                              playDeleteGlitch(soundEnabled);
                              onDeleteLearnedRule(rule.id);
                            }}
                            className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                            title="Remove Rule"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
