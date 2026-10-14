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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-[calc(env(safe-area-inset-bottom,0px)+16px)] bg-space-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg glass-panel bg-space-900 border border-cyan-500/30 rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-space-950/40 shrink-0">
          <div className="flex items-center space-x-2">
            <Tag className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="font-mono text-xs uppercase tracking-wider text-slate-200 font-bold">
                Taxonomy // Manage Categories
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">
                {categories.length} active • Powers AI & NLP matching
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playLaserClick(soundEnabled);
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-800/80 flex items-center justify-between shrink-0 bg-space-900/60">
          <div className="flex space-x-1 p-1 rounded-xl bg-space-950 border border-slate-800">
            <button
              onClick={() => {
                playLaserClick(soundEnabled);
                setActiveTab('categories');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all flex items-center space-x-1.5 ${
                activeTab === 'categories'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
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
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all flex items-center space-x-1.5 ${
                activeTab === 'learned'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5 text-violet-400" />
              <span>AI Learned Memory ({learnedRules.length})</span>
            </button>
          </div>

          {activeTab === 'categories' && !isAdding && (
            <button
              onClick={() => {
                playLaserClick(soundEnabled);
                setIsAdding(true);
                setErrorMsg('');
              }}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-black text-xs font-mono font-semibold transition-all shadow-neon-cyan"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-2 text-rose-300 text-xs font-mono">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'categories' ? (
            <>
              {/* Add New Category Form Drawer */}
              {isAdding && (
                <form onSubmit={handleAddCategory} className="p-4 rounded-xl bg-space-950/80 border border-cyan-500/30 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5" />
                      New Category
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="text-slate-500 hover:text-slate-300 text-xs font-mono"
                    >
                      Cancel
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                      Category Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Food, Groceries, Fitness, Rent"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-space-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-sans"
                    />
                  </div>

                  {/* Color Swatches */}
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                      Accent Color
                    </label>
                    <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                      {PRESET_COLORS.map(c => (
                        <button
                          type="button"
                          key={c}
                          onClick={() => setNewColor(c)}
                          className={`w-6 h-6 rounded-full border-2 transition-all ${
                            newColor === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Icon Selector */}
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                      Category Icon
                    </label>
                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-1.5 max-h-24 overflow-y-auto p-1 bg-space-900 rounded-xl border border-slate-800">
                      {AVAILABLE_ICONS.map(i => (
                        <button
                          type="button"
                          key={i.name}
                          onClick={() => setNewIcon(i.name)}
                          className={`p-1.5 rounded-lg border transition-all ${
                            newIcon === i.name
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                              : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-space-800'
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
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 text-black font-semibold text-xs font-mono uppercase tracking-wide transition-all shadow-neon-cyan"
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
                      <div key={cat.id} className="p-3 rounded-xl bg-space-950 border border-cyan-500/50 space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            required
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="flex-1 bg-space-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(cat.id)}
                            className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                            title="Save"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCatId(null)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200"
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
                              className={`w-5 h-5 rounded-full border transition-all ${
                                editColor === c ? 'border-white scale-110' : 'border-transparent opacity-60'
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
                      className="p-2.5 rounded-xl bg-space-900/70 border border-slate-800/80 hover:border-slate-700/80 flex items-center justify-between transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center border"
                          style={{ 
                            backgroundColor: cat.bg || `${cat.color}20`,
                            borderColor: cat.border || `${cat.color}50`,
                            color: cat.color 
                          }}
                        >
                          {renderIcon(cat.icon)}
                        </div>
                        <div>
                          <span className="text-xs font-medium text-slate-100 font-sans">
                            {cat.name}
                          </span>
                          <span className="block text-[10px] font-mono text-slate-500">
                            {expCount} {expCount === 1 ? 'expense' : 'expenses'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(cat)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-space-800 transition-colors"
                          title="Edit Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {cat.name.toLowerCase() !== 'miscellaneous' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-space-800 transition-colors"
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
              <div className="p-3 rounded-xl bg-violet-950/20 border border-violet-500/30 flex items-start space-x-2.5 text-xs">
                <Sparkles className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                <div className="text-[11px] text-slate-300 space-y-1">
                  <p className="font-semibold text-white">Adaptive Learning Engine</p>
                  <p className="text-slate-400">
                    Whenever you edit an expense's category, Nexus automatically learns the pattern. Future expenses matching that merchant or phrase will automatically adopt your learned category.
                  </p>
                </div>
              </div>

              {learnedRules.length === 0 ? (
                <div className="py-8 text-center text-slate-500">
                  <BrainCircuit className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
                  <p className="text-xs font-mono">No learned associations yet</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Edit any logged expense to train Nexus to your personal preferences.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pb-1">
                    <span>Learned Associations ({learnedRules.length})</span>
                    {onClearLearnedRules && (
                      <button
                        onClick={() => {
                          if (confirm('Clear all learned AI associations?')) {
                            onClearLearnedRules();
                            playDeleteGlitch(soundEnabled);
                          }
                        }}
                        className="text-rose-400 hover:text-rose-300 flex items-center space-x-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset Memory</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    {learnedRules.map((rule) => (
                      <div
                        key={rule.id}
                        className="p-2.5 rounded-xl bg-space-900/80 border border-slate-800 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <span className="font-mono text-xs text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
                            "{rule.pattern}"
                          </span>
                          <span className="text-slate-500 text-xs">➔</span>
                          <span className="font-mono text-xs font-semibold text-white">
                            {rule.category}
                          </span>
                        </div>

                        {onDeleteLearnedRule && (
                          <button
                            onClick={() => {
                              playDeleteGlitch(soundEnabled);
                              onDeleteLearnedRule(rule.id);
                            }}
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
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
