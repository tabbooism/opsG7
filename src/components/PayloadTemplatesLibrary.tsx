/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layers,
  Search,
  Plus,
  Tag,
  Copy,
  Check,
  Terminal,
  Play,
  Cpu,
  Shield,
  Trash2,
  Edit3,
  RotateCcw,
  Download,
  Upload,
  ArrowRight,
  ExternalLink,
  Code2,
  FileCode,
  Sparkles,
  Sliders,
  CheckCircle2,
  X,
  AlertTriangle,
  BookmarkPlus
} from 'lucide-react';
import { Payload, PayloadTemplate, PayloadTemplateParameter } from '../types';
import { useTheme } from '../context/ThemeContext';
import {
  loadTemplatesFromStorage,
  saveTemplatesToStorage,
  renderCommandTemplate,
  DEFAULT_PAYLOAD_TEMPLATES,
} from '../data/defaultTemplates';

interface PayloadTemplatesLibraryProps {
  onInstantiatePayload: (payload: Payload) => void;
  onClose?: () => void;
}

export const PayloadTemplatesLibrary: React.FC<PayloadTemplatesLibraryProps> = ({
  onInstantiatePayload,
  onClose,
}) => {
  const { theme, showToast } = useTheme();
  const isDark = theme === 'dark';

  // Templates State
  const [templates, setTemplates] = useState<PayloadTemplate[]>(() => loadTemplatesFromStorage());
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [tagFilter, setTagFilter] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals State
  const [instantiatingTemplate, setInstantiatingTemplate] = useState<PayloadTemplate | null>(null);
  const [instantiateParams, setInstantiateParams] = useState<Record<string, string>>({});
  const [instantiateFilename, setInstantiateFilename] = useState('');
  const [instantiateTags, setInstantiateTags] = useState<string[]>([]);
  const [instantiateNewTagInput, setInstantiateNewTagInput] = useState('');

  // Create / Edit Template Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PayloadTemplate | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editType, setEditType] = useState<PayloadTemplate['type']>('Executable');
  const [editCategory, setEditCategory] = useState<PayloadTemplate['category']>('Infiltration');
  const [editCommand, setEditCommand] = useState('');
  const [editPlatform, setEditPlatform] = useState('');
  const [editEvasion, setEditEvasion] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editTagInput, setEditTagInput] = useState('');
  const [editParams, setEditParams] = useState<PayloadTemplateParameter[]>([]);

  // Delete Template Confirmation
  const [deletingTemplate, setDeletingTemplate] = useState<PayloadTemplate | null>(null);

  // Available unique tags across templates
  const allTags = useMemo(() => {
    const set = new Set<string>();
    templates.forEach((t) => t.tags.forEach((tag) => set.add(tag)));
    return Array.from(set).sort();
  }, [templates]);

  // Categories count
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: templates.length };
    templates.forEach((t) => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return counts;
  }, [templates]);

  // Filtered templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((tpl) => {
      const matchSearch =
        tpl.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tpl.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tpl.commandTemplate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tpl.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCategory = categoryFilter === 'All' || tpl.category === categoryFilter;
      const matchTag = tagFilter === 'All' || tpl.tags.includes(tagFilter);

      return matchSearch && matchCategory && matchTag;
    });
  }, [templates, searchTerm, categoryFilter, tagFilter]);

  // Handler: Open Instantiate / Use Template
  const handleOpenInstantiate = (template: PayloadTemplate) => {
    setInstantiatingTemplate(template);
    // Initialize default parameter values
    const initialParams: Record<string, string> = {};
    template.parameters?.forEach((p) => {
      initialParams[p.key] = p.defaultValue;
    });
    setInstantiateParams(initialParams);

    // Generate smart default filename
    const ext =
      template.type === 'Executable'
        ? '.exe'
        : template.type === 'Script'
        ? '.ps1'
        : template.type === 'Library'
        ? '.dll'
        : '.bin';
    const cleanName = template.name.replace(/[^a-zA-Z0-9]/g, '_');
    setInstantiateFilename(`${cleanName}${ext}`);
    setInstantiateTags([...template.tags]);
    setInstantiateNewTagInput('');
  };

  // Handler: Execute Deploy / Instantiate to Arsenal
  const handleConfirmInstantiate = () => {
    if (!instantiatingTemplate) return;

    const renderedCmd = renderCommandTemplate(
      instantiatingTemplate.commandTemplate,
      instantiateParams,
      instantiatingTemplate.parameters
    );

    const newId = `PL-${String(Date.now()).slice(-4)}`;
    const newPayload: Payload = {
      id: newId,
      name: instantiateFilename.trim() || `${instantiatingTemplate.name}.bin`,
      type: instantiatingTemplate.type,
      category: instantiatingTemplate.category,
      size: instantiatingTemplate.defaultSize || '1.2 MB',
      status: 'Ready',
      createdAt: new Date().toISOString().split('T')[0],
      hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      campaigns: ['Operation Telemetry', 'Active Staging'],
      command: renderedCmd,
      tags: instantiateTags,
    };

    // Increment usage count in template
    const updated = templates.map((t) =>
      t.id === instantiatingTemplate.id ? { ...t, usageCount: t.usageCount + 1 } : t
    );
    setTemplates(updated);
    saveTemplatesToStorage(updated);

    onInstantiatePayload(newPayload);
    showToast(`Instantiated "${newPayload.name}" from template into Arsenal`);
    setInstantiatingTemplate(null);
  };

  // Handler: Copy command to clipboard
  const handleCopyCommand = (template: PayloadTemplate) => {
    const rendered = renderCommandTemplate(template.commandTemplate, {}, template.parameters);
    navigator.clipboard.writeText(rendered);
    setCopiedId(template.id);
    showToast(`Copied command template for "${template.name}"`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handler: Open Create New Template
  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setEditName('');
    setEditDesc('');
    setEditType('Executable');
    setEditCategory('Infiltration');
    setEditCommand('./module --target {{TARGET_IP}} --port {{PORT}}');
    setEditPlatform('Linux x64 / Windows Server');
    setEditEvasion('Direct Syscalls + TLS Encrypted');
    setEditTags(['Custom', 'Staged']);
    setEditTagInput('');
    setEditParams([
      { key: 'TARGET_IP', label: 'Target IP', defaultValue: '185.220.101.5', description: 'Destination host' },
      { key: 'PORT', label: 'Port', defaultValue: '443', description: 'Listener port' },
    ]);
    setIsEditModalOpen(true);
  };

  // Handler: Open Edit Template
  const handleOpenEdit = (template: PayloadTemplate) => {
    setEditingTemplate(template);
    setEditName(template.name);
    setEditDesc(template.description);
    setEditType(template.type);
    setEditCategory(template.category);
    setEditCommand(template.commandTemplate);
    setEditPlatform(template.targetPlatform || '');
    setEditEvasion(template.evasionProfile || '');
    setEditTags([...template.tags]);
    setEditTagInput('');
    setEditParams(template.parameters ? [...template.parameters] : []);
    setIsEditModalOpen(true);
  };

  // Handler: Save Create / Edit
  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editCommand.trim()) return;

    if (editingTemplate) {
      // Update existing
      const updated = templates.map((t) =>
        t.id === editingTemplate.id
          ? {
              ...t,
              name: editName.trim(),
              description: editDesc.trim(),
              type: editType,
              category: editCategory,
              commandTemplate: editCommand.trim(),
              targetPlatform: editPlatform.trim() || undefined,
              evasionProfile: editEvasion.trim() || undefined,
              tags: editTags,
              parameters: editParams,
            }
          : t
      );
      setTemplates(updated);
      saveTemplatesToStorage(updated);
      showToast(`Updated template "${editName}"`);
    } else {
      // Create new
      const newTemplate: PayloadTemplate = {
        id: `TPL-CUSTOM-${String(Date.now()).slice(-5)}`,
        name: editName.trim(),
        description: editDesc.trim() || 'Custom operator payload configuration template.',
        type: editType,
        category: editCategory,
        tags: editTags.length > 0 ? editTags : ['Custom-Config'],
        commandTemplate: editCommand.trim(),
        defaultSize: '1.5 MB',
        targetPlatform: editPlatform.trim() || 'Universal',
        evasionProfile: editEvasion.trim() || 'Standard Evasion',
        parameters: editParams,
        author: 'Security Operator',
        createdAt: new Date().toISOString().split('T')[0],
        usageCount: 0,
        isCustom: true,
      };
      const updated = [newTemplate, ...templates];
      setTemplates(updated);
      saveTemplatesToStorage(updated);
      showToast(`Created new payload template "${editName}"`);
    }

    setIsEditModalOpen(false);
  };

  // Handler: Delete Template
  const handleConfirmDelete = () => {
    if (!deletingTemplate) return;
    const updated = templates.filter((t) => t.id !== deletingTemplate.id);
    setTemplates(updated);
    saveTemplatesToStorage(updated);
    showToast(`Removed template "${deletingTemplate.name}"`);
    setDeletingTemplate(null);
  };

  // Handler: Reset to System Defaults
  const handleResetDefaults = () => {
    setTemplates(DEFAULT_PAYLOAD_TEMPLATES);
    saveTemplatesToStorage(DEFAULT_PAYLOAD_TEMPLATES);
    showToast('Reset template library to system defaults (8 pre-configured templates)');
  };

  // Handler: Export Templates JSON
  const handleExportTemplates = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(templates, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `payload_templates_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Exported template definitions as JSON');
  };

  // Category Color Badges
  const getCategoryBadgeClass = (category: PayloadTemplate['category']) => {
    switch (category) {
      case 'Infiltration':
        return isDark ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'Persistence':
        return isDark ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Exfiltration':
        return isDark ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Destruction':
        return isDark ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-red-50 text-red-700 border-red-200';
    }
  };

  return (
    <div id="payload-templates-library" className="space-y-6">
      {/* Top Banner & Control Deck */}
      <div
        className={`p-5 sm:p-6 rounded-2xl border transition-all ${
          isDark ? 'bg-black/30 border-white/10' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                <Layers size={18} />
              </div>
              <div>
                <h2 className="text-lg font-mono font-bold tracking-tight">
                  Payload Templates Library
                </h2>
                <span className="text-[11px] font-mono text-cyan-400">
                  {templates.length} Standardized Architecture Presets
                </span>
              </div>
            </div>
            <p className={`text-xs mt-2 max-w-2xl leading-relaxed ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
              Pre-configured stagers, execution scripts, and reflective binaries with standardized tags,
              evasion profiles, and parameterized command placeholders ready for immediate arsenal instantiation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="tpl-create-new-btn"
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-mono font-semibold transition-all shadow-md shadow-cyan-900/20"
            >
              <Plus size={14} />
              <span>New Template</span>
            </button>
            <button
              id="tpl-export-btn"
              onClick={handleExportTemplates}
              title="Export all templates as JSON"
              className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-xs font-mono transition-all ${
                isDark
                  ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white/80'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
              }`}
            >
              <Download size={13} />
              <span>Export JSON</span>
            </button>
            <button
              id="tpl-reset-btn"
              onClick={handleResetDefaults}
              title="Reset templates to standard factory library"
              className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-xs font-mono transition-all ${
                isDark
                  ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white/60 hover:text-white'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-600 hover:text-slate-900'
              }`}
            >
              <RotateCcw size={13} />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>

        {/* Search and Category Filter Deck */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {['All', 'Infiltration', 'Persistence', 'Exfiltration', 'Destruction'].map((cat) => {
              const active = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-cyan-600 text-white font-bold shadow-sm'
                      : isDark
                      ? 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      active
                        ? 'bg-black/20 text-white'
                        : isDark
                        ? 'bg-white/10 text-white/60'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {categoryCounts[cat] || 0}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search and Tag filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search
                size={14}
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                  isDark ? 'text-white/40' : 'text-slate-400'
                }`}
              />
              <input
                type="text"
                placeholder="Search templates, tags, commands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-9 pr-3 py-1.5 text-xs font-mono rounded-lg border focus:outline-none transition-colors ${
                  isDark
                    ? 'bg-black/30 border-white/10 text-white placeholder-white/30 focus:border-cyan-500'
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-cyan-600'
                }`}
              />
            </div>

            {/* Tag Filter Dropdown */}
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className={`py-1.5 px-2.5 text-xs font-mono rounded-lg border focus:outline-none ${
                isDark
                  ? 'bg-[#0B0F17] border-white/10 text-white'
                  : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            >
              <option value="All">All Tags ({allTags.length})</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => {
          const isCopied = copiedId === template.id;
          return (
            <div
              key={template.id}
              className={`rounded-xl border p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-lg ${
                isDark
                  ? 'bg-[#0B0F17]/90 border-white/10 hover:border-cyan-500/40'
                  : 'bg-white border-slate-200 hover:border-cyan-400 shadow-sm'
              }`}
            >
              <div>
                {/* Header Row: Type + Category + Actions */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border uppercase tracking-wider ${getCategoryBadgeClass(
                        template.category
                      )}`}
                    >
                      {template.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white/70'
                          : 'bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      {template.type}
                    </span>
                    {template.isCustom && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                        Custom
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopyCommand(template)}
                      title="Copy command template"
                      className={`p-1.5 rounded transition-colors ${
                        isCopied
                          ? 'text-emerald-400'
                          : isDark
                          ? 'text-white/40 hover:text-white hover:bg-white/10'
                          : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {isCopied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                    <button
                      onClick={() => handleOpenEdit(template)}
                      title="Edit or Duplicate template"
                      className={`p-1.5 rounded transition-colors ${
                        isDark
                          ? 'text-white/40 hover:text-white hover:bg-white/10'
                          : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Edit3 size={14} />
                    </button>
                    {template.isCustom && (
                      <button
                        onClick={() => setDeletingTemplate(template)}
                        title="Delete custom template"
                        className="p-1.5 rounded transition-colors text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Template Title & ID */}
                <h3 className={`font-mono font-bold text-sm tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {template.name}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-[11px] font-mono opacity-60">
                  <span>{template.id}</span>
                  <span>•</span>
                  <span>Used {template.usageCount} times</span>
                </div>

                {/* Description */}
                <p className={`text-xs mt-2.5 line-clamp-2 leading-relaxed ${isDark ? 'text-white/70' : 'text-slate-600'}`}>
                  {template.description}
                </p>

                {/* Platform & Evasion Profile */}
                {(template.targetPlatform || template.evasionProfile) && (
                  <div className="mt-3 space-y-1 text-[11px] font-mono">
                    {template.targetPlatform && (
                      <div className="flex items-center gap-1.5 opacity-80">
                        <Cpu size={12} className="text-cyan-400 shrink-0" />
                        <span className="truncate">{template.targetPlatform}</span>
                      </div>
                    )}
                    {template.evasionProfile && (
                      <div className="flex items-center gap-1.5 opacity-80">
                        <Shield size={12} className="text-emerald-400 shrink-0" />
                        <span className="truncate">{template.evasionProfile}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Command Preview with highlighted placeholders */}
                <div className="mt-3.5">
                  <div className={`p-2.5 rounded-lg border font-mono text-[11px] break-all leading-snug ${
                    isDark ? 'bg-black/60 border-white/5 text-cyan-300' : 'bg-slate-900 border-slate-800 text-cyan-300'
                  }`}>
                    <div className="flex items-center gap-1.5 text-white/40 text-[10px] mb-1 font-mono uppercase">
                      <Terminal size={11} />
                      <span>Template Pattern</span>
                    </div>
                    <span>{template.commandTemplate}</span>
                  </div>
                </div>

                {/* Pre-defined Tags */}
                <div className="mt-3.5">
                  <span className={`text-[10px] font-mono uppercase tracking-wider block mb-1.5 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                    Pre-Defined Tags ({template.tags.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {template.tags.map((tag) => (
                      <span
                        key={tag}
                        onClick={() => setTagFilter(tag)}
                        className={`cursor-pointer px-2 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                          tagFilter === tag
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                            : isDark
                            ? 'bg-white/5 border-white/10 text-white/70 hover:border-cyan-500/30'
                            : 'bg-slate-100 border-slate-200 text-slate-700 hover:border-slate-400'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button: Use This Template */}
              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                <div className="text-[11px] font-mono opacity-60">
                  {template.parameters?.length || 0} parameter{template.parameters?.length !== 1 ? 's' : ''}
                </div>

                <button
                  id={`tpl-use-btn-${template.id}`}
                  onClick={() => handleOpenInstantiate(template)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-mono font-bold transition-all shadow-md shadow-cyan-900/20"
                >
                  <Play size={12} fill="currentColor" />
                  <span>Use Template</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div
          className={`text-center py-12 rounded-xl border ${
            isDark ? 'bg-black/20 border-white/10 text-white/50' : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}
        >
          <Layers size={36} className="mx-auto mb-3 opacity-40" />
          <p className="font-mono text-sm font-semibold">No templates match the current search or filters</p>
          <p className="text-xs mt-1">Try clearing filters or create a new custom template</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('All');
              setTagFilter('All');
            }}
            className="mt-4 px-3.5 py-1.5 rounded-lg text-xs font-mono bg-cyan-600 text-white hover:bg-cyan-500"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* ================================================================ */}
      {/* MODAL 1: INSTANTIATE / USE TEMPLATE                             */}
      {/* ================================================================ */}
      <AnimatePresence>
        {instantiatingTemplate && (
          <div
            id="instantiate-template-modal-backdrop"
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
            onClick={() => setInstantiatingTemplate(null)}
          >
            <motion.div
              id="instantiate-template-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-xl rounded-xl p-6 shadow-2xl border max-h-[90vh] overflow-y-auto ${
                isDark ? 'bg-[#0B0F17] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                    <Play size={18} fill="currentColor" />
                  </div>
                  <div>
                    <h3 className="font-mono font-bold text-base">
                      Instantiate Payload from Template
                    </h3>
                    <p className={`text-xs ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
                      {instantiatingTemplate.name} ({instantiatingTemplate.category} • {instantiatingTemplate.type})
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setInstantiatingTemplate(null)}
                  className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/10 text-white/40' : 'hover:bg-slate-100 text-slate-500'}`}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="mt-5 space-y-4 text-xs font-mono">
                {/* Filename */}
                <div>
                  <label className={`block uppercase tracking-widest text-[10px] mb-1 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                    Module Filename in Arsenal *
                  </label>
                  <input
                    type="text"
                    required
                    value={instantiateFilename}
                    onChange={(e) => setInstantiateFilename(e.target.value)}
                    className={`w-full py-2 px-3 rounded-lg border focus:outline-none ${
                      isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                {/* Configurable Parameters */}
                {instantiatingTemplate.parameters && instantiatingTemplate.parameters.length > 0 && (
                  <div>
                    <label className={`block uppercase tracking-widest text-[10px] mb-2 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                      Template Variables & Parameters ({instantiatingTemplate.parameters.length})
                    </label>
                    <div className="space-y-2.5 p-3 rounded-lg border bg-black/20 border-white/5">
                      {instantiatingTemplate.parameters.map((param) => (
                        <div key={param.key} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                          <div>
                            <span className="font-bold text-cyan-400">{param.label}</span>
                            <span className="block text-[10px] opacity-50">{'{{' + param.key + '}}'}</span>
                          </div>
                          <div className="sm:col-span-2">
                            <input
                              type="text"
                              value={instantiateParams[param.key] ?? param.defaultValue}
                              onChange={(e) =>
                                setInstantiateParams((prev) => ({
                                  ...prev,
                                  [param.key]: e.target.value,
                                }))
                              }
                              placeholder={param.description || param.defaultValue}
                              className={`w-full py-1.5 px-3 rounded-md border text-xs focus:outline-none ${
                                isDark ? 'bg-black/50 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'
                              }`}
                            />
                            {param.description && (
                              <span className="text-[10px] opacity-40 mt-0.5 block">{param.description}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Live Rendered Command Preview */}
                <div>
                  <label className={`block uppercase tracking-widest text-[10px] mb-1 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                    Rendered Execution Command Preview
                  </label>
                  <div
                    className={`p-3 rounded-lg border break-all leading-relaxed ${
                      isDark ? 'bg-black/60 border-cyan-500/30 text-cyan-300' : 'bg-slate-900 border-slate-800 text-cyan-300'
                    }`}
                  >
                    {renderCommandTemplate(
                      instantiatingTemplate.commandTemplate,
                      instantiateParams,
                      instantiatingTemplate.parameters
                    )}
                  </div>
                </div>

                {/* Pre-Defined Tags Customization */}
                <div>
                  <label className={`block uppercase tracking-widest text-[10px] mb-1 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                    Pre-Defined Tags ({instantiateTags.length})
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {instantiateTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => setInstantiateTags((prev) => prev.filter((t) => t !== tag))}
                          className="hover:text-red-400 ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add tag..."
                      value={instantiateNewTagInput}
                      onChange={(e) => setInstantiateNewTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = instantiateNewTagInput.trim();
                          if (val && !instantiateTags.includes(val)) {
                            setInstantiateTags((p) => [...p, val]);
                            setInstantiateNewTagInput('');
                          }
                        }
                      }}
                      className={`flex-1 py-1.5 px-3 rounded-lg border focus:outline-none ${
                        isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = instantiateNewTagInput.trim();
                        if (val && !instantiateTags.includes(val)) {
                          setInstantiateTags((p) => [...p, val]);
                          setInstantiateNewTagInput('');
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg font-semibold bg-white/10 hover:bg-white/20 text-white"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 flex justify-end gap-2.5 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setInstantiatingTemplate(null)}
                  className={`px-4 py-2 rounded-lg text-xs font-mono font-medium border ${
                    isDark ? 'border-white/10 text-white/70 hover:bg-white/5' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  id="confirm-instantiate-btn"
                  type="button"
                  onClick={handleConfirmInstantiate}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-mono font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/30"
                >
                  <Check size={14} />
                  <span>Deploy to Active Arsenal</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================ */}
      {/* MODAL 2: CREATE / EDIT TEMPLATE                                 */}
      {/* ================================================================ */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div
            id="edit-template-modal-backdrop"
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
            onClick={() => setIsEditModalOpen(false)}
          >
            <motion.div
              id="edit-template-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-xl rounded-xl p-6 shadow-2xl border max-h-[90vh] overflow-y-auto ${
                isDark ? 'bg-[#0B0F17] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                    <BookmarkPlus size={18} />
                  </div>
                  <div>
                    <h3 className="font-mono font-bold text-base">
                      {editingTemplate ? 'Edit Payload Template' : 'Create Custom Payload Template'}
                    </h3>
                    <p className={`text-xs ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
                      Define reusable architecture, tags, category, and variable placeholders
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/10 text-white/40' : 'hover:bg-slate-100 text-slate-500'}`}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveTemplate} className="mt-5 space-y-4 text-xs font-mono">
                <div>
                  <label className={`block uppercase tracking-widest text-[10px] mb-1 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                    Template Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Origin Bypass Reverse Shell"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className={`w-full py-2 px-3 rounded-lg border focus:outline-none ${
                      isDark ? 'bg-black/30 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block uppercase tracking-widest text-[10px] mb-1 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                      Category *
                    </label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value as any)}
                      className={`w-full py-2 px-3 rounded-lg border focus:outline-none ${
                        isDark ? 'bg-black/30 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="Infiltration">Infiltration</option>
                      <option value="Persistence">Persistence</option>
                      <option value="Exfiltration">Exfiltration</option>
                      <option value="Destruction">Destruction</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block uppercase tracking-widest text-[10px] mb-1 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                      Type *
                    </label>
                    <select
                      value={editType}
                      onChange={(e) => setEditType(e.target.value as any)}
                      className={`w-full py-2 px-3 rounded-lg border focus:outline-none ${
                        isDark ? 'bg-black/30 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="Executable">Executable (.exe, .bin)</option>
                      <option value="Script">Script (.ps1, .sh, .py)</option>
                      <option value="Library">Library (.dll, .so)</option>
                      <option value="Document">Document (.macro, .hta)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block uppercase tracking-widest text-[10px] mb-1 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                    Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Describe the operational purpose, required conditions, and evasion mechanics..."
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className={`w-full py-2 px-3 rounded-lg border focus:outline-none ${
                      isDark ? 'bg-black/30 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block uppercase tracking-widest text-[10px] mb-1 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                      Target Platform
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Linux x64 / Windows Server"
                      value={editPlatform}
                      onChange={(e) => setEditPlatform(e.target.value)}
                      className={`w-full py-2 px-3 rounded-lg border focus:outline-none ${
                        isDark ? 'bg-black/30 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block uppercase tracking-widest text-[10px] mb-1 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                      Evasion Profile
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. AMSI Bypass + Memory Load"
                      value={editEvasion}
                      onChange={(e) => setEditEvasion(e.target.value)}
                      className={`w-full py-2 px-3 rounded-lg border focus:outline-none ${
                        isDark ? 'bg-black/30 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Command Template */}
                <div>
                  <label className={`block uppercase tracking-widest text-[10px] mb-1 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                    Command Pattern (Use &#123;&#123;VARIABLE&#125;&#125; for placeholders) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="./runner -target {{TARGET_IP}} -p {{PORT}}"
                    value={editCommand}
                    onChange={(e) => setEditCommand(e.target.value)}
                    className={`w-full py-2 px-3 rounded-lg border focus:outline-none text-cyan-300 font-mono ${
                      isDark ? 'bg-black/40 border-white/10' : 'bg-slate-900 border-slate-800'
                    }`}
                  />
                </div>

                {/* Pre-Defined Tags */}
                <div>
                  <label className={`block uppercase tracking-widest text-[10px] mb-1 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                    Pre-Defined Tags ({editTags.length})
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {editTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => setEditTags((prev) => prev.filter((t) => t !== tag))}
                          className="hover:text-red-400"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add tag (e.g. Cloudflare-Bypass)..."
                      value={editTagInput}
                      onChange={(e) => setEditTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = editTagInput.trim();
                          if (val && !editTags.includes(val)) {
                            setEditTags((p) => [...p, val]);
                            setEditTagInput('');
                          }
                        }
                      }}
                      className={`flex-1 py-1.5 px-3 rounded-lg border focus:outline-none ${
                        isDark ? 'bg-black/30 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = editTagInput.trim();
                        if (val && !editTags.includes(val)) {
                          setEditTags((p) => [...p, val]);
                          setEditTagInput('');
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg font-semibold bg-white/10 hover:bg-white/20 text-white"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                <div className="mt-6 pt-4 flex justify-end gap-2.5 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className={`px-4 py-2 rounded-lg text-xs font-mono font-medium border ${
                      isDark ? 'border-white/10 text-white/70 hover:bg-white/5' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    id="save-template-submit-btn"
                    type="submit"
                    className="px-5 py-2 rounded-lg text-xs font-mono font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/30"
                  >
                    Save Template
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================ */}
      {/* MODAL 3: DELETE CONFIRMATION                                    */}
      {/* ================================================================ */}
      <AnimatePresence>
        {deletingTemplate && (
          <div
            id="delete-template-modal-backdrop"
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
            onClick={() => setDeletingTemplate(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-sm rounded-xl p-6 shadow-2xl border ${
                isDark ? 'bg-[#0F111A] border-red-500/30 text-white' : 'bg-white border-red-200 text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30 shrink-0">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-red-400">Delete Template</h3>
                  <p className="text-xs font-mono text-cyan-400 truncate">{deletingTemplate.name}</p>
                </div>
              </div>

              <p className="mt-3 text-xs opacity-70 leading-relaxed font-mono">
                Are you sure you want to permanently delete this custom template?
              </p>

              <div className="mt-5 flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setDeletingTemplate(null)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono border ${
                    isDark ? 'border-white/10 hover:bg-white/5 text-white/70' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-1.5 rounded-lg text-xs font-mono font-semibold bg-red-600 hover:bg-red-500 text-white"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
