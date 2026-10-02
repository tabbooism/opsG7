/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  RefreshCcw, 
  Plus, 
  ChevronRight, 
  Zap, 
  Download, 
  Trash2, 
  Terminal, 
  ArrowUpDown, 
  Tag, 
  Check, 
  X, 
  AlertTriangle, 
  Layers, 
  CheckSquare, 
  Square, 
  MinusSquare,
  Copy,
  Hash,
  Activity,
  ShieldAlert,
  Crosshair,
  Gauge,
  BookmarkPlus,
  Bookmark,
  Sparkles
} from 'lucide-react';
import { Payload, Victim, PayloadTemplate } from '../types';
import { useTheme } from '../context/ThemeContext';
import { PayloadDetailAnalytics } from './PayloadDetailAnalytics';
import { PayloadBreachSimulator } from './PayloadBreachSimulator';
import { PayloadTemplatesLibrary } from './PayloadTemplatesLibrary';
import {
  loadTemplatesFromStorage,
  saveTemplatesToStorage,
  renderCommandTemplate,
} from '../data/defaultTemplates';

interface PayloadsViewProps {
  payloads: Payload[];
  victims?: Victim[];
  onDeployPayload?: (payloadId: string) => void;
  onDeletePayloads?: (ids: string[]) => void;
  onBatchTagPayloads?: (ids: string[], tags: string[], mode: 'add' | 'remove') => void;
  onAddPayload?: (payload: Payload) => void;
  onUpdatePayload?: (payload: Payload) => void;
}

const PRESET_TAGS = [
  'Zero-Day',
  'EDR-Bypass',
  'Memory-Only',
  'Stealth',
  'Cloudflare-Bypass',
  'Direct-Origin',
  'Kernel-Mode',
  'DLL-Injection',
  'Persistence',
  'Exfiltration',
  'Emergency',
  'PowerShell',
];

export const PayloadsView: React.FC<PayloadsViewProps> = ({
  payloads,
  victims = [],
  onDeployPayload,
  onDeletePayloads,
  onBatchTagPayloads,
  onAddPayload,
  onUpdatePayload,
}) => {
  const { theme, showToast } = useTheme();
  const isDark = theme === 'dark';

  // View Mode: 'table' | 'simulator' | 'templates'
  const [activeMode, setActiveMode] = useState<'table' | 'simulator' | 'templates'>('table');
  const [simulationPayloadId, setSimulationPayloadId] = useState<string | null>(null);

  // Template Library State
  const [availableTemplates, setAvailableTemplates] = useState<PayloadTemplate[]>(() => loadTemplatesFromStorage());
  const [savingPayloadAsTemplate, setSavingPayloadAsTemplate] = useState<Payload | null>(null);
  const [saveTemplateName, setSaveTemplateName] = useState('');
  const [saveTemplateDesc, setSaveTemplateDesc] = useState('');
  const [saveTemplateTags, setSaveTemplateTags] = useState<string[]>([]);
  const [saveTemplateTagInput, setSaveTemplateTagInput] = useState('');

  // Filters and Sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [tagFilter, setTagFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Payload; direction: 'asc' | 'desc' } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal States
  const [isBatchTagModalOpen, setIsBatchTagModalOpen] = useState(false);
  const [isBatchDeleteModalOpen, setIsBatchDeleteModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [singleDeletePayload, setSingleDeletePayload] = useState<Payload | null>(null);

  // Batch Tagging Modal State
  const [batchTagMode, setBatchTagMode] = useState<'add' | 'remove'>('add');
  const [selectedTagsForBatch, setSelectedTagsForBatch] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');

  // Inline tag input on expanded row
  const [inlineTagInput, setInlineTagInput] = useState<{ [id: string]: string }>({});

  // New Upload Form State
  const [newPayloadName, setNewPayloadName] = useState('');
  const [newPayloadType, setNewPayloadType] = useState<Payload['type']>('Executable');
  const [newPayloadCategory, setNewPayloadCategory] = useState<Payload['category']>('Infiltration');
  const [newPayloadCommand, setNewPayloadCommand] = useState('');
  const [newPayloadTags, setNewPayloadTags] = useState<string[]>(['Zero-Day']);
  const [newPayloadTagInput, setNewPayloadTagInput] = useState('');

  // Extract all unique tags present across payloads
  const allAvailableTags = useMemo(() => {
    const tagsSet = new Set<string>();
    payloads.forEach((p) => {
      p.tags?.forEach((t) => tagsSet.add(t));
    });
    PRESET_TAGS.forEach((t) => tagsSet.add(t));
    return Array.from(tagsSet).sort();
  }, [payloads]);

  // Filter and sort payloads
  const filteredPayloads = useMemo(() => {
    return payloads
      .filter((p) => {
        const query = searchTerm.toLowerCase();
        const matchesSearch =
          p.name.toLowerCase().includes(query) ||
          p.id.toLowerCase().includes(query) ||
          p.command.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(query)));

        const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
        const matchesTag = tagFilter === 'All' || (p.tags && p.tags.includes(tagFilter));

        return matchesSearch && matchesCategory && matchesTag;
      })
      .sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;
        const aVal = a[key] ?? '';
        const bVal = b[key] ?? '';
        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
      });
  }, [payloads, searchTerm, categoryFilter, tagFilter, sortConfig]);

  // Checkbox references for master select all
  const filteredIds = useMemo(() => filteredPayloads.map((p) => p.id), [filteredPayloads]);
  const isAllSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedIds.has(id));
  const isSomeSelected = filteredIds.some((id) => selectedIds.has(id)) && !isAllSelected;

  const headerCheckboxRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = isSomeSelected;
    }
  }, [isSomeSelected]);

  // Handlers for Selection
  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      // Deselect all visible
      const next = new Set(selectedIds);
      filteredIds.forEach((id) => next.delete(id));
      setSelectedIds(next);
    } else {
      // Select all visible
      const next = new Set(selectedIds);
      filteredIds.forEach((id) => next.add(id));
      setSelectedIds(next);
    }
  };

  const handleToggleSelectRow = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleSort = (key: keyof Payload) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  // Bulk Deletion Execution
  const handleExecuteBatchDelete = () => {
    const idsToDelete = Array.from(selectedIds);
    if (idsToDelete.length === 0) return;

    if (onDeletePayloads) {
      onDeletePayloads(idsToDelete);
    }
    showToast(`Permanently decommissioned ${idsToDelete.length} payload(s) from arsenal`);
    setSelectedIds(new Set());
    setIsBatchDeleteModalOpen(false);
  };

  // Single Deletion Execution
  const handleExecuteSingleDelete = (payload: Payload) => {
    if (onDeletePayloads) {
      onDeletePayloads([payload.id]);
    }
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(payload.id);
      return next;
    });
    setSingleDeletePayload(null);
    showToast(`Payload ${payload.name} deleted`);
  };

  // Bulk Tagging Execution
  const handleToggleBatchTagChip = (tag: string) => {
    setSelectedTagsForBatch((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddCustomTagToBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customTagInput.trim();
    if (!trimmed) return;
    if (!selectedTagsForBatch.includes(trimmed)) {
      setSelectedTagsForBatch((prev) => [...prev, trimmed]);
    }
    setCustomTagInput('');
  };

  const handleExecuteBatchTagging = () => {
    const targetIds = Array.from(selectedIds);
    if (targetIds.length === 0 || selectedTagsForBatch.length === 0) {
      setIsBatchTagModalOpen(false);
      return;
    }

    if (onBatchTagPayloads) {
      onBatchTagPayloads(targetIds, selectedTagsForBatch, batchTagMode);
    }
    showToast(
      `${batchTagMode === 'add' ? 'Attached' : 'Removed'} ${selectedTagsForBatch.length} tag(s) across ${targetIds.length} payload(s)`
    );

    setSelectedTagsForBatch([]);
    setIsBatchTagModalOpen(false);
  };

  // Inline Tag Add / Remove per row
  const handleAddInlineTag = (payload: Payload, tagToAdd: string) => {
    const trimmed = tagToAdd.trim();
    if (!trimmed) return;
    const currentTags = payload.tags || [];
    if (currentTags.includes(trimmed)) return;

    const updated = {
      ...payload,
      tags: [...currentTags, trimmed],
    };
    if (onUpdatePayload) {
      onUpdatePayload(updated);
    }
    setInlineTagInput((prev) => ({ ...prev, [payload.id]: '' }));
    showToast(`Added tag "${trimmed}" to ${payload.name}`);
  };

  const handleRemoveInlineTag = (payload: Payload, tagToRemove: string) => {
    const currentTags = payload.tags || [];
    const updated = {
      ...payload,
      tags: currentTags.filter((t) => t !== tagToRemove),
    };
    if (onUpdatePayload) {
      onUpdatePayload(updated);
    }
    showToast(`Removed tag "${tagToRemove}" from ${payload.name}`);
  };

  // Add New Payload Execution
  const handleCreateNewPayload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayloadName.trim() || !newPayloadCommand.trim()) {
      showToast('Please specify payload name and command');
      return;
    }

    const randomHash = Math.random().toString(16).substring(2, 6) + '...' + Math.random().toString(16).substring(2, 6);
    const newPayload: Payload = {
      id: `PL-0${Math.floor(Math.random() * 800 + 100)}`,
      name: newPayloadName.trim(),
      type: newPayloadType,
      category: newPayloadCategory,
      size: `${(Math.random() * 3 + 0.1).toFixed(1)} MB`,
      status: 'Ready',
      createdAt: new Date().toISOString().split('T')[0],
      hash: randomHash,
      campaigns: ['Ad-Hoc Operation'],
      command: newPayloadCommand.trim(),
      tags: newPayloadTags,
    };

    if (onAddPayload) {
      onAddPayload(newPayload);
    }
    showToast(`New module ${newPayload.name} successfully deployed to repository`);
    setNewPayloadName('');
    setNewPayloadCommand('');
    setNewPayloadTags(['Zero-Day']);
    setIsUploadModalOpen(false);
  };

  // Handle Save Payload as Template
  const handleOpenSaveAsTemplate = (payload: Payload) => {
    setSavingPayloadAsTemplate(payload);
    const cleanName = payload.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
    setSaveTemplateName(cleanName);
    setSaveTemplateDesc(`Reusable architecture for ${payload.type} module in ${payload.category} category.`);
    setSaveTemplateTags(payload.tags ? [...payload.tags] : ['Arsenal-Export']);
    setSaveTemplateTagInput('');
  };

  const handleConfirmSaveAsTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!savingPayloadAsTemplate || !saveTemplateName.trim()) return;

    const newTemplate: PayloadTemplate = {
      id: `TPL-CUSTOM-${String(Date.now()).slice(-5)}`,
      name: saveTemplateName.trim(),
      description: saveTemplateDesc.trim() || `Saved configuration based on ${savingPayloadAsTemplate.name}`,
      type: savingPayloadAsTemplate.type,
      category: savingPayloadAsTemplate.category,
      tags: saveTemplateTags.length > 0 ? saveTemplateTags : ['Custom-Preset'],
      commandTemplate: savingPayloadAsTemplate.command,
      defaultSize: savingPayloadAsTemplate.size,
      targetPlatform: 'Universal Staging',
      evasionProfile: 'Standard Evasion Profile',
      author: 'Red Team Operator',
      createdAt: new Date().toISOString().split('T')[0],
      usageCount: 0,
      isCustom: true,
    };

    const updated = [newTemplate, ...availableTemplates];
    setAvailableTemplates(updated);
    saveTemplatesToStorage(updated);
    showToast(`Saved "${newTemplate.name}" to Payload Templates library`);
    setSavingPayloadAsTemplate(null);
  };

  // Handle Apply Template to Upload Module Form
  const handleApplyTemplateToUploadForm = (templateId: string) => {
    const t = availableTemplates.find((item) => item.id === templateId);
    if (!t) return;
    const ext =
      t.type === 'Executable' ? '.exe' : t.type === 'Script' ? '.ps1' : t.type === 'Library' ? '.dll' : '.bin';
    setNewPayloadName(`${t.name.replace(/[^a-zA-Z0-9]/g, '_')}${ext}`);
    setNewPayloadType(t.type);
    setNewPayloadCategory(t.category);
    setNewPayloadCommand(renderCommandTemplate(t.commandTemplate, {}, t.parameters));
    setNewPayloadTags([...t.tags]);
    showToast(`Pre-populated form from template "${t.name}"`);
  };

  return (
    <motion.div
      id="payloads-view-container"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-widest uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Module Arsenal & Staging
            </span>
            <span className={`text-xs font-mono ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
              {payloads.length} Modules in Inventory
            </span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Payload Repository & Compilers
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
            Manage, verify hashes, stage modules, and execute bulk operations across active C2 endpoints.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher: Arsenal Table vs Breach Simulator vs Payload Templates */}
          <div className={`p-1 rounded-lg border flex items-center gap-1 ${
            isDark ? 'bg-black/40 border-white/10' : 'bg-slate-100 border-slate-300'
          }`}>
            <button
              id="payloads-mode-table-btn"
              onClick={() => setActiveMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${
                activeMode === 'table'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : isDark ? 'text-white/60 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers size={13} />
              <span>Arsenal Table</span>
            </button>
            <button
              id="payloads-mode-simulator-btn"
              onClick={() => setActiveMode('simulator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${
                activeMode === 'simulator'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10'
              }`}
            >
              <Crosshair size={13} />
              <span>Breach Simulator</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            </button>
            <button
              id="payloads-mode-templates-btn"
              onClick={() => {
                setAvailableTemplates(loadTemplatesFromStorage());
                setActiveMode('templates');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${
                activeMode === 'templates'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : isDark ? 'text-white/60 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bookmark size={13} />
              <span>Templates</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeMode === 'templates' ? 'bg-black/20 text-white' : 'bg-cyan-500/20 text-cyan-300'
              }`}>
                {availableTemplates.length}
              </span>
            </button>
          </div>

          <button
            id="payloads-scan-hashes-btn"
            onClick={() => showToast('Integrity hashes scanned against SHA-256 database: all verified')}
            className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-xs font-medium transition-colors ${
              isDark 
                ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white' 
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
            }`}
          >
            <RefreshCcw size={13} />
            <span>Verify Hashes</span>
          </button>
          <button
            id="payloads-upload-module-btn"
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md shadow-cyan-900/20"
          >
            <Plus size={13} />
            <span>Upload Module</span>
          </button>
        </div>
      </div>

      {/* Main Content: Templates Library OR Simulation Workbench OR Arsenal Table */}
      {activeMode === 'templates' ? (
        <PayloadTemplatesLibrary
          onInstantiatePayload={(newPayload) => {
            if (onAddPayload) {
              onAddPayload(newPayload);
            }
            setActiveMode('table');
          }}
          onClose={() => setActiveMode('table')}
        />
      ) : activeMode === 'simulator' ? (
        <PayloadBreachSimulator
          payloads={payloads}
          victims={victims}
          selectedPayloadId={simulationPayloadId || undefined}
          onSelectPayload={(id) => setSimulationPayloadId(id)}
          onDeployPayload={onDeployPayload}
          onClose={() => setActiveMode('table')}
        />
      ) : (
        <>
          {/* Floating or Pinned Bulk Action Toolbar when items are selected */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            id="payloads-bulk-action-bar"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className={`p-3 sm:p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xl transition-all ${
              isDark 
                ? 'bg-[#0E1626] border-cyan-500/30 text-white' 
                : 'bg-cyan-50/95 border-cyan-300 text-cyan-950'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 font-mono font-bold text-xs border border-cyan-500/30">
                {selectedIds.size}
              </span>
              <div>
                <span className="text-xs font-bold tracking-tight">
                  {selectedIds.size} Payload{selectedIds.size > 1 ? 's' : ''} Selected
                </span>
                <span className={`hidden sm:inline text-xs ml-2 font-mono ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                  (out of {payloads.length} total)
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Batch Tagging Trigger */}
              <button
                id="bulk-tag-trigger-btn"
                onClick={() => {
                  setSelectedTagsForBatch([]);
                  setIsBatchTagModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm transition-all"
              >
                <Tag size={14} />
                <span>Batch Tagging</span>
              </button>

              {/* Batch Deletion Trigger */}
              <button
                id="bulk-delete-trigger-btn"
                onClick={() => setIsBatchDeleteModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 text-white shadow-sm transition-all"
              >
                <Trash2 size={14} />
                <span>Batch Delete</span>
              </button>

              {/* Quick status update */}
              <div className="flex items-center gap-1 border-l pl-2 ml-1 border-cyan-500/20">
                <button
                  onClick={() => {
                    if (onUpdatePayload) {
                      payloads
                        .filter((p) => selectedIds.has(p.id))
                        .forEach((p) => onUpdatePayload({ ...p, status: 'Ready' }));
                    }
                    showToast(`Marked ${selectedIds.size} payload(s) as Ready`);
                  }}
                  className={`px-2.5 py-1.5 rounded-md text-[11px] font-mono border transition-colors ${
                    isDark ? 'border-white/10 hover:bg-white/10 text-emerald-400' : 'border-slate-300 hover:bg-white text-emerald-700'
                  }`}
                  title="Mark selected Ready"
                >
                  Set Ready
                </button>
                <button
                  onClick={() => {
                    if (onUpdatePayload) {
                      payloads
                        .filter((p) => selectedIds.has(p.id))
                        .forEach((p) => onUpdatePayload({ ...p, status: 'Deprecated' }));
                    }
                    showToast(`Marked ${selectedIds.size} payload(s) as Deprecated`);
                  }}
                  className={`px-2.5 py-1.5 rounded-md text-[11px] font-mono border transition-colors ${
                    isDark ? 'border-white/10 hover:bg-white/10 text-amber-400' : 'border-slate-300 hover:bg-white text-amber-700'
                  }`}
                  title="Mark selected Deprecated"
                >
                  Set Deprecated
                </button>
              </div>

              {/* Clear Selection */}
              <button
                id="bulk-clear-selection-btn"
                onClick={handleClearSelection}
                className={`p-1.5 rounded-lg text-xs border transition-colors ${
                  isDark ? 'border-white/10 hover:bg-white/10 text-white/50 hover:text-white' : 'border-slate-300 hover:bg-white text-slate-600'
                }`}
                title="Clear Selection"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter and Search Bar */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row gap-4 items-center justify-between ${
        isDark ? 'bg-[#0A0E17] border-white/10' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        {/* Search input */}
        <div className="relative w-full md:w-80 group">
          <Search
            className={`absolute left-3 top-1/2 -translate-y-1/2 ${
              isDark ? 'text-white/30 group-focus-within:text-cyan-400' : 'text-slate-400 group-focus-within:text-cyan-600'
            }`}
            size={14}
          />
          <input
            id="payloads-search-input"
            type="text"
            placeholder="Search by name, command, tag, hash..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full py-2 pl-10 pr-4 text-xs font-mono rounded-lg border focus:outline-none transition-colors ${
              isDark 
                ? 'bg-black/30 border-white/10 text-white focus:border-cyan-500/50' 
                : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-600'
            }`}
          />
        </div>

        {/* Filters and Selection Helpers */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <Filter size={13} className={isDark ? 'text-white/40' : 'text-slate-400'} />
            <select
              id="payloads-category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`py-1.5 px-2.5 text-xs rounded-lg border focus:outline-none ${
                isDark 
                  ? 'bg-black/30 border-white/10 text-white focus:border-cyan-500/50' 
                  : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-600'
              }`}
            >
              <option value="All">All Categories</option>
              <option value="Infiltration">Infiltration</option>
              <option value="Persistence">Persistence</option>
              <option value="Exfiltration">Exfiltration</option>
              <option value="Destruction">Destruction</option>
            </select>
          </div>

          {/* Tag Filter */}
          <div className="flex items-center gap-1.5">
            <Tag size={13} className={isDark ? 'text-white/40' : 'text-slate-400'} />
            <select
              id="payloads-tag-filter"
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className={`py-1.5 px-2.5 text-xs rounded-lg border focus:outline-none ${
                isDark 
                  ? 'bg-black/30 border-white/10 text-white focus:border-cyan-500/50' 
                  : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-600'
              }`}
            >
              <option value="All">All Tags ({allAvailableTags.length})</option>
              {allAvailableTags.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Select Buttons */}
          <button
            onClick={handleToggleSelectAll}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
              isDark ? 'border-white/10 hover:bg-white/5 text-white/70' : 'border-slate-300 hover:bg-slate-50 text-slate-700'
            }`}
          >
            {isAllSelected ? 'Deselect All' : `Select All (${filteredPayloads.length})`}
          </button>
        </div>
      </div>

      {/* Payloads Table Container */}
      <div className={`border rounded-xl overflow-hidden shadow-sm ${
        isDark ? 'bg-[#0A0E17] border-white/10' : 'bg-white border-slate-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[850px]">
            <thead className={`text-[10px] font-mono uppercase tracking-widest border-b ${
              isDark ? 'bg-white/5 border-white/5 text-white/40' : 'bg-slate-100 border-slate-200 text-slate-500'
            }`}>
              <tr>
                {/* Master Bulk Checkbox */}
                <th className="w-12 px-4 py-4 text-center">
                  <input
                    ref={headerCheckboxRef}
                    id="payloads-select-all-checkbox"
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleToggleSelectAll}
                    aria-label="Select all payloads"
                    className="w-4 h-4 rounded border-slate-400 text-cyan-600 focus:ring-cyan-500 cursor-pointer accent-cyan-500"
                  />
                </th>
                <th className="px-5 py-4 font-normal cursor-pointer" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1.5">
                    <span>Payload & Identifier</span>
                    <ArrowUpDown size={10} />
                  </div>
                </th>
                <th className="px-5 py-4 font-normal cursor-pointer" onClick={() => handleSort('category')}>
                  <div className="flex items-center gap-1.5">
                    <span>Category</span>
                    <ArrowUpDown size={10} />
                  </div>
                </th>
                <th className="px-5 py-4 font-normal">Tags</th>
                <th className="px-5 py-4 font-normal">Type & Size</th>
                <th className="px-5 py-4 font-normal">Status</th>
                <th className="px-5 py-4 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-xs ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
              {filteredPayloads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-xs font-mono opacity-50">
                    No payloads match the specified filters or search query.
                  </td>
                </tr>
              ) : (
                filteredPayloads.map((payload) => {
                  const isSelected = selectedIds.has(payload.id);
                  const isExpanded = expandedId === payload.id;

                  return (
                    <React.Fragment key={payload.id}>
                      <tr
                        id={`payload-row-${payload.id}`}
                        onClick={() => setExpandedId(isExpanded ? null : payload.id)}
                        className={`transition-colors cursor-pointer ${
                          isSelected
                            ? isDark
                              ? 'bg-cyan-950/30 hover:bg-cyan-950/40'
                              : 'bg-cyan-50/70 hover:bg-cyan-50'
                            : isExpanded
                              ? isDark ? 'bg-white/5' : 'bg-slate-50'
                              : isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'
                        }`}
                      >
                        {/* Row Selection Checkbox */}
                        <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            id={`payload-checkbox-${payload.id}`}
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleToggleSelectRow(payload.id, e as any)}
                            aria-label={`Select ${payload.name}`}
                            className="w-4 h-4 rounded border-slate-400 text-cyan-600 focus:ring-cyan-500 cursor-pointer accent-cyan-500"
                          />
                        </td>

                        {/* Payload Name & Hash */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <ChevronRight
                              size={14}
                              className={`transition-transform duration-300 ${
                                isExpanded ? 'rotate-90 text-cyan-400' : 'opacity-40'
                              }`}
                            />
                            <div>
                              <div className={`font-semibold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {payload.name}
                              </div>
                              <div className={`text-[10px] font-mono mt-0.5 flex items-center gap-2 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
                                <span>{payload.id}</span>
                                <span>•</span>
                                <span>{payload.hash}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-5 py-4">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${
                            payload.category === 'Infiltration' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                            payload.category === 'Persistence' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            payload.category === 'Exfiltration' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                            'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            {payload.category}
                          </span>
                        </td>

                        {/* Tags Pill List */}
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap items-center gap-1 max-w-[240px]">
                            {payload.tags && payload.tags.length > 0 ? (
                              payload.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                                    isDark
                                      ? 'bg-white/5 border-white/10 text-cyan-300'
                                      : 'bg-slate-100 border-slate-200 text-cyan-800'
                                  }`}
                                >
                                  {tag}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] font-mono opacity-30 italic">No tags</span>
                            )}
                            {payload.tags && payload.tags.length > 3 && (
                              <span className="text-[10px] font-mono opacity-60">
                                +{payload.tags.length - 3}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Type & Size */}
                        <td className="px-5 py-4">
                          <div className="text-xs">{payload.type}</div>
                          <div className={`text-[10px] font-mono mt-0.5 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                            {payload.size}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4 font-mono text-[10px] uppercase">
                          <span className={`px-2 py-0.5 rounded border ${
                            payload.status === 'Ready'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : payload.status === 'Deployed'
                                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            {payload.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            {/* Run Breach Simulation */}
                            <button
                              onClick={() => {
                                setSimulationPayloadId(payload.id);
                                setActiveMode('simulator');
                              }}
                              title="Calculate Theoretical Breach Probability in Simulation Mode"
                              className="p-1.5 rounded transition-colors hover:bg-cyan-500/20 text-cyan-400/90 hover:text-cyan-300"
                            >
                              <Crosshair size={14} />
                            </button>

                            {/* Save as Template */}
                            <button
                              onClick={() => handleOpenSaveAsTemplate(payload)}
                              title="Save this payload configuration as a reusable Template"
                              className="p-1.5 rounded transition-colors hover:bg-cyan-500/20 text-cyan-400/80 hover:text-cyan-300"
                            >
                              <BookmarkPlus size={14} />
                            </button>

                            {/* View Analytics & Heat Map */}
                            <button
                              onClick={() => {
                                setExpandedId(isExpanded ? null : payload.id);
                              }}
                              title="Toggle Telemetry & Heat Map"
                              className={`p-1.5 rounded transition-colors ${
                                isExpanded
                                  ? 'bg-cyan-500/20 text-cyan-400'
                                  : 'hover:bg-cyan-500/10 text-cyan-400/80 hover:text-cyan-300'
                              }`}
                            >
                              <Activity size={14} />
                            </button>

                            {/* Deploy */}
                            <button
                              onClick={() => {
                                if (onDeployPayload) onDeployPayload(payload.id);
                                showToast(`Staged module ${payload.name} for offensive execution`);
                              }}
                              title="Deploy module"
                              className="p-1.5 hover:bg-cyan-500/10 text-cyan-400 rounded transition-colors"
                            >
                              <Zap size={14} />
                            </button>

                            {/* Download */}
                            <button
                              onClick={() => showToast(`Encrypted binary for ${payload.name} downloaded`)}
                              title="Download binary"
                              className="p-1.5 hover:bg-white/10 rounded transition-colors opacity-60 hover:opacity-100"
                            >
                              <Download size={14} />
                            </button>

                            {/* Single Delete */}
                            <button
                              onClick={() => setSingleDeletePayload(payload)}
                              title="Decommission module"
                              className="p-1.5 hover:bg-red-500/10 text-red-400 rounded transition-colors opacity-60 hover:opacity-100"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Row Detail View */}
                      {isExpanded && (
                        <tr className={isDark ? 'bg-white/[0.02]' : 'bg-slate-50'}>
                          <td colSpan={7} className="px-6 py-5 border-l-2 border-l-cyan-500">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                              {/* Tags Management on Row */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-mono uppercase tracking-widest opacity-50 flex items-center gap-1.5">
                                    <Tag size={12} className="text-cyan-400" />
                                    Assigned Tags
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  {payload.tags && payload.tags.length > 0 ? (
                                    payload.tags.map((t) => (
                                      <span
                                        key={t}
                                        className="group inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                                      >
                                        <span>{t}</span>
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveInlineTag(payload, t)}
                                          className="opacity-40 group-hover:opacity-100 hover:text-red-400 ml-0.5"
                                          title={`Remove ${t}`}
                                        >
                                          ×
                                        </button>
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-xs text-white/40">No tags assigned.</span>
                                  )}
                                </div>

                                {/* Add Tag Input for this row */}
                                <div className="flex items-center gap-1.5 pt-2">
                                  <input
                                    type="text"
                                    placeholder="Add tag (e.g. Memory-Only)..."
                                    value={inlineTagInput[payload.id] || ''}
                                    onChange={(e) =>
                                      setInlineTagInput((prev) => ({
                                        ...prev,
                                        [payload.id]: e.target.value,
                                      }))
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddInlineTag(payload, inlineTagInput[payload.id] || '');
                                      }
                                    }}
                                    className={`py-1 px-2 text-[11px] font-mono rounded border focus:outline-none flex-1 ${
                                      isDark
                                        ? 'bg-black/40 border-white/10 text-white placeholder-white/30'
                                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                                    }`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleAddInlineTag(payload, inlineTagInput[payload.id] || '')
                                    }
                                    className="px-2 py-1 rounded text-[11px] bg-cyan-600 hover:bg-cyan-500 text-white font-mono"
                                  >
                                    Add
                                  </button>
                                </div>
                              </div>

                              {/* Campaigns info */}
                              <div className="space-y-2">
                                <span className="text-[10px] font-mono uppercase tracking-widest opacity-50 flex items-center gap-1.5">
                                  <Layers size={12} className="text-cyan-400" />
                                  Active Campaigns
                                </span>
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  {payload.campaigns.map((c) => (
                                    <span
                                      key={c}
                                      className="px-2.5 py-1 rounded text-[11px] font-mono bg-white/5 border border-white/10 text-white/70"
                                    >
                                      {c}
                                    </span>
                                  ))}
                                </div>
                                <div className={`text-[10px] font-mono pt-2 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                                  Created: {payload.createdAt} • Binary Type: {payload.type}
                                </div>
                              </div>

                              {/* Command execution block */}
                              <div className="space-y-2">
                                <span className="text-[10px] font-mono uppercase tracking-widest opacity-50 flex items-center gap-1.5">
                                  <Terminal size={12} className="text-cyan-400" />
                                  Execution Syntax
                                </span>
                                <div className="mt-1 p-2.5 rounded bg-black text-cyan-300 font-mono text-xs flex items-center justify-between border border-white/10">
                                  <code className="break-all">{payload.command}</code>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(payload.command);
                                      showToast('Execution command copied to clipboard');
                                    }}
                                    className="p-1 hover:bg-white/20 rounded text-white/50 hover:text-white shrink-0 ml-2"
                                    title="Copy command"
                                  >
                                    <Copy size={13} />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Simulation Mode Quick Launcher Banner */}
                            <div className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 transition-all ${
                              isDark ? 'bg-cyan-950/20 border-cyan-500/30' : 'bg-cyan-50/80 border-cyan-200'
                            }`}>
                              <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                                  <Crosshair size={16} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-xs font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                      Theoretical Breach Probability Simulator
                                    </span>
                                    <span className="px-1.5 py-0.2 text-[9px] font-mono uppercase bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/40">
                                      Gauge & Modeling
                                    </span>
                                  </div>
                                  <p className={`text-[11px] mt-0.5 ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
                                    Calculate evasion margins against Windows Defender, CrowdStrike Falcon, Cloudflare WAF, and custom patch lags.
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleOpenSaveAsTemplate(payload)}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all border ${
                                    isDark
                                      ? 'border-white/10 hover:border-cyan-500/40 text-white/80 hover:text-white bg-white/5'
                                      : 'border-slate-300 hover:border-cyan-500 text-slate-700 hover:text-slate-900 bg-white'
                                  }`}
                                >
                                  <BookmarkPlus size={13} className="text-cyan-400" />
                                  <span>Save as Template</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setSimulationPayloadId(payload.id);
                                    setActiveMode('simulator');
                                  }}
                                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-mono font-bold transition-all shadow-md shadow-cyan-950/30 whitespace-nowrap"
                                >
                                  <Gauge size={13} />
                                  <span>Simulate Breach for {payload.id}</span>
                                </button>
                              </div>
                            </div>

                            {/* Data Visualizations: Recharts Success Rate Trend Line & Target Vulnerability Coverage Heat Map */}
                            <PayloadDetailAnalytics payload={payload} isDark={isDark} />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {/* ================================================================ */}
      {/* MODAL 1: BATCH TAGGING MODAL                                    */}
      {/* ================================================================ */}
      <AnimatePresence>
        {isBatchTagModalOpen && (
          <div
            id="batch-tagging-modal-backdrop"
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsBatchTagModalOpen(false)}
          >
            <motion.div
              id="batch-tagging-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-lg rounded-xl p-6 shadow-2xl border ${
                isDark ? 'bg-[#0B0F17] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                    <Tag size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">
                      Batch Tag Operations
                    </h3>
                    <p className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                      Apply or strip tags across {selectedIds.size} selected payload module(s)
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsBatchTagModalOpen(false)}
                  className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/10 text-white/40' : 'hover:bg-slate-100 text-slate-500'}`}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="mt-5 space-y-5">
                {/* Operation Mode Toggle */}
                <div>
                  <label className={`block text-[10px] font-mono uppercase tracking-widest mb-2 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                    Tag Action Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      id="tag-mode-add-btn"
                      onClick={() => setBatchTagMode('add')}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${
                        batchTagMode === 'add'
                          ? isDark
                            ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                            : 'bg-cyan-50 border-cyan-400 text-cyan-900 font-bold'
                          : isDark
                            ? 'bg-white/5 border-white/10 text-white/50'
                            : 'bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                    >
                      <Plus size={14} />
                      <span>Attach Tags</span>
                    </button>

                    <button
                      type="button"
                      id="tag-mode-remove-btn"
                      onClick={() => setBatchTagMode('remove')}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${
                        batchTagMode === 'remove'
                          ? isDark
                            ? 'bg-red-500/20 border-red-500/50 text-red-300'
                            : 'bg-red-50 border-red-400 text-red-900 font-bold'
                          : isDark
                            ? 'bg-white/5 border-white/10 text-white/50'
                            : 'bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                    >
                      <Trash2 size={14} />
                      <span>Strip Tags</span>
                    </button>
                  </div>
                </div>

                {/* Preset Tag Selection Chips */}
                <div>
                  <label className={`block text-[10px] font-mono uppercase tracking-widest mb-2 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                    Select Standard Arsenal Tags
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                    {PRESET_TAGS.map((tag) => {
                      const isSelected = selectedTagsForBatch.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleToggleBatchTagChip(tag)}
                          className={`px-2.5 py-1 rounded-md text-xs font-mono border transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? isDark
                                ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300'
                                : 'bg-cyan-600 border-cyan-600 text-white'
                              : isDark
                                ? 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {isSelected && <Check size={12} />}
                          <span>{tag}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Tag Input */}
                <form onSubmit={handleAddCustomTagToBatch} className="space-y-1.5">
                  <label className={`block text-[10px] font-mono uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                    Or Create Custom Tag
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Origin-185-Target, Staged-Drop..."
                      value={customTagInput}
                      onChange={(e) => setCustomTagInput(e.target.value)}
                      className={`flex-1 py-2 px-3 text-xs font-mono rounded-lg border focus:outline-none ${
                        isDark ? 'bg-black/30 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                    <button
                      type="submit"
                      disabled={!customTagInput.trim()}
                      className="px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white"
                    >
                      Add
                    </button>
                  </div>
                </form>

                {/* Active Selected Tags Display */}
                <div className={`p-3 rounded-lg border ${isDark ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                  <span className={`text-[10px] font-mono uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                    Tags to {batchTagMode === 'add' ? 'Attach' : 'Strip'} ({selectedTagsForBatch.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedTagsForBatch.length === 0 ? (
                      <span className="text-xs text-amber-500/80 italic">Select or type tags above</span>
                    ) : (
                      selectedTagsForBatch.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                        >
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleToggleBatchTagChip(tag)}
                            className="hover:text-red-400 ml-1"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="mt-6 flex justify-end gap-2.5 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsBatchTagModalOpen(false)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium border ${
                    isDark ? 'border-white/10 text-white/70 hover:bg-white/5' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="confirm-batch-tag-btn"
                  disabled={selectedTagsForBatch.length === 0}
                  onClick={handleExecuteBatchTagging}
                  className="px-5 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white shadow-lg shadow-cyan-900/20"
                >
                  Apply to {selectedIds.size} Payload{selectedIds.size > 1 ? 's' : ''}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================ */}
      {/* MODAL 2: BATCH DELETION CONFIRMATION MODAL                      */}
      {/* ================================================================ */}
      <AnimatePresence>
        {isBatchDeleteModalOpen && (
          <div
            id="batch-delete-modal-backdrop"
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsBatchDeleteModalOpen(false)}
          >
            <motion.div
              id="batch-delete-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md rounded-xl p-6 shadow-2xl border ${
                isDark ? 'bg-[#0F111A] border-red-500/30 text-white' : 'bg-white border-red-200 text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3 pb-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30 shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-red-400">
                    Confirm Batch Decommission
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
                    Irreversible module purge
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <p className="leading-relaxed">
                  You are about to permanently purge and delete{' '}
                  <strong className="text-red-400 font-mono">{selectedIds.size} payload module(s)</strong>{' '}
                  from the active C2 repository. Active beacon links using these commands will be orphaned.
                </p>

                {/* List of payloads being deleted */}
                <div className={`p-3 rounded-lg border max-h-40 overflow-y-auto space-y-1.5 font-mono text-[11px] ${
                  isDark ? 'bg-black/40 border-white/5' : 'bg-slate-50 border-slate-200'
                }`}>
                  {payloads
                    .filter((p) => selectedIds.has(p.id))
                    .map((p) => (
                      <div key={p.id} className="flex justify-between items-center text-white/70">
                        <span className="truncate max-w-[200px] text-cyan-400 font-bold">{p.name}</span>
                        <span className="text-[10px] opacity-60">[{p.id}] {p.category}</span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2.5 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsBatchDeleteModalOpen(false)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium border ${
                    isDark ? 'border-white/10 text-white/70 hover:bg-white/5' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="confirm-batch-delete-btn"
                  onClick={handleExecuteBatchDelete}
                  className="px-5 py-2 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/40"
                >
                  Purge {selectedIds.size} Modules
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================ */}
      {/* MODAL 3: SINGLE DELETION CONFIRMATION MODAL                     */}
      {/* ================================================================ */}
      <AnimatePresence>
        {singleDeletePayload && (
          <div
            id="single-delete-modal-backdrop"
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setSingleDeletePayload(null)}
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
                  <h3 className="font-bold text-sm text-red-400">
                    Delete Payload
                  </h3>
                  <p className="text-xs font-mono text-cyan-400">
                    {singleDeletePayload.name} ({singleDeletePayload.id})
                  </p>
                </div>
              </div>

              <p className="mt-3 text-xs opacity-70 leading-relaxed">
                Are you sure you want to remove this module from the repository?
              </p>

              <div className="mt-5 flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setSingleDeletePayload(null)}
                  className={`px-3 py-1.5 rounded-lg text-xs border ${
                    isDark ? 'border-white/10 hover:bg-white/5 text-white/70' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleExecuteSingleDelete(singleDeletePayload)}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 text-white"
                >
                  Delete Module
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================ */}
      {/* MODAL 4: UPLOAD / STAGE NEW PAYLOAD MODULE                      */}
      {/* ================================================================ */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div
            id="upload-module-modal-backdrop"
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsUploadModalOpen(false)}
          >
            <motion.div
              id="upload-module-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-lg rounded-xl p-6 sm:p-7 shadow-2xl border ${
                isDark ? 'bg-[#0B0F17] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                    <Plus size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Stage New Offensive Module</h3>
                    <p className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                      Register binary or script to the C2 payload arsenal
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/10 text-white/40' : 'hover:bg-slate-100 text-slate-500'}`}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateNewPayload} className="mt-5 space-y-4 text-xs">
                {/* Populate from Template Shortcut */}
                <div className={`p-3 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 ${
                  isDark ? 'bg-cyan-950/20 border-cyan-500/30' : 'bg-cyan-50/80 border-cyan-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <Sparkles size={15} className="text-cyan-400 shrink-0" />
                    <div>
                      <span className="text-xs font-mono font-bold block">Populate from Template</span>
                      <span className={`text-[10px] ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
                        Quickly apply pre-defined tags, categories & parameters
                      </span>
                    </div>
                  </div>
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) {
                        handleApplyTemplateToUploadForm(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className={`py-1.5 px-2.5 rounded text-xs font-mono border focus:outline-none ${
                      isDark ? 'bg-black/60 border-cyan-500/40 text-cyan-300' : 'bg-white border-cyan-300 text-cyan-900'
                    }`}
                  >
                    <option value="" disabled>Select a Template...</option>
                    {availableTemplates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} [{t.category}]
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block font-mono uppercase tracking-widest text-[10px] mb-1 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                    Module Filename *
                  </label>
                  <input
                    id="new-payload-name-input"
                    type="text"
                    required
                    placeholder="e.g. OriginTunnel.exe, TokenStealer.ps1"
                    value={newPayloadName}
                    onChange={(e) => setNewPayloadName(e.target.value)}
                    className={`w-full py-2 px-3 font-mono rounded-lg border focus:outline-none ${
                      isDark ? 'bg-black/30 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block font-mono uppercase tracking-widest text-[10px] mb-1 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                      Type
                    </label>
                    <select
                      value={newPayloadType}
                      onChange={(e) => setNewPayloadType(e.target.value as any)}
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

                  <div>
                    <label className={`block font-mono uppercase tracking-widest text-[10px] mb-1 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                      Category
                    </label>
                    <select
                      value={newPayloadCategory}
                      onChange={(e) => setNewPayloadCategory(e.target.value as any)}
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
                </div>

                <div>
                  <label className={`block font-mono uppercase tracking-widest text-[10px] mb-1 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                    Execution Command *
                  </label>
                  <input
                    id="new-payload-command-input"
                    type="text"
                    required
                    placeholder="e.g. ./origintunnel -target opduel.com -connect 45.142.214.19"
                    value={newPayloadCommand}
                    onChange={(e) => setNewPayloadCommand(e.target.value)}
                    className={`w-full py-2 px-3 font-mono rounded-lg border focus:outline-none ${
                      isDark ? 'bg-black/30 border-white/10 text-cyan-300' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                {/* Initial Tags */}
                <div>
                  <label className={`block font-mono uppercase tracking-widest text-[10px] mb-1 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                    Initial Module Tags
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {newPayloadTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => setNewPayloadTags((prev) => prev.filter((t) => t !== tag))}
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
                      value={newPayloadTagInput}
                      onChange={(e) => setNewPayloadTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = newPayloadTagInput.trim();
                          if (val && !newPayloadTags.includes(val)) {
                            setNewPayloadTags((p) => [...p, val]);
                            setNewPayloadTagInput('');
                          }
                        }
                      }}
                      className={`flex-1 py-1.5 px-3 text-xs font-mono rounded-lg border focus:outline-none ${
                        isDark ? 'bg-black/30 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = newPayloadTagInput.trim();
                        if (val && !newPayloadTags.includes(val)) {
                          setNewPayloadTags((p) => [...p, val]);
                          setNewPayloadTagInput('');
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white"
                    >
                      + Add Tag
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-2.5 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className={`px-4 py-2 rounded-lg text-xs font-medium border ${
                      isDark ? 'border-white/10 text-white/70 hover:bg-white/5' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    id="submit-new-payload-btn"
                    type="submit"
                    className="px-5 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/20"
                  >
                    Deploy to Arsenal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================ */}
      {/* MODAL 5: SAVE PAYLOAD CONFIGURATION AS TEMPLATE                 */}
      {/* ================================================================ */}
      <AnimatePresence>
        {savingPayloadAsTemplate && (
          <div
            id="save-template-modal-backdrop"
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
            onClick={() => setSavingPayloadAsTemplate(null)}
          >
            <motion.div
              id="save-template-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-lg rounded-xl p-6 sm:p-7 shadow-2xl border ${
                isDark ? 'bg-[#0B0F17] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                    <BookmarkPlus size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base font-mono">Save as Payload Template</h3>
                    <p className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                      Store configuration, pre-defined tags, and category for reusable staging
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSavingPayloadAsTemplate(null)}
                  className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/10 text-white/40' : 'hover:bg-slate-100 text-slate-500'}`}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleConfirmSaveAsTemplate} className="mt-5 space-y-4 text-xs font-mono">
                <div>
                  <label className={`block uppercase tracking-widest text-[10px] mb-1 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                    Template Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={saveTemplateName}
                    onChange={(e) => setSaveTemplateName(e.target.value)}
                    className={`w-full py-2 px-3 rounded-lg border focus:outline-none ${
                      isDark ? 'bg-black/30 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-2.5 rounded-lg border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="block text-[10px] uppercase opacity-50">Category</span>
                    <span className="font-bold text-cyan-400">{savingPayloadAsTemplate.category}</span>
                  </div>
                  <div className={`p-2.5 rounded-lg border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="block text-[10px] uppercase opacity-50">Type</span>
                    <span className="font-bold">{savingPayloadAsTemplate.type}</span>
                  </div>
                </div>

                <div>
                  <label className={`block uppercase tracking-widest text-[10px] mb-1 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={saveTemplateDesc}
                    onChange={(e) => setSaveTemplateDesc(e.target.value)}
                    className={`w-full py-2 px-3 rounded-lg border focus:outline-none ${
                      isDark ? 'bg-black/30 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block uppercase tracking-widest text-[10px] mb-1 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                    Command Pattern (Variables can be specified as &#123;&#123;PARAM&#125;&#125;)
                  </label>
                  <div className={`p-2.5 rounded-lg border text-cyan-300 break-all ${isDark ? 'bg-black/50 border-white/10' : 'bg-slate-900 border-slate-800'}`}>
                    {savingPayloadAsTemplate.command}
                  </div>
                </div>

                {/* Pre-Defined Tags */}
                <div>
                  <label className={`block uppercase tracking-widest text-[10px] mb-1 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                    Pre-Defined Tags ({saveTemplateTags.length})
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {saveTemplateTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => setSaveTemplateTags((prev) => prev.filter((t) => t !== tag))}
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
                      placeholder="Add tag..."
                      value={saveTemplateTagInput}
                      onChange={(e) => setSaveTemplateTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = saveTemplateTagInput.trim();
                          if (val && !saveTemplateTags.includes(val)) {
                            setSaveTemplateTags((p) => [...p, val]);
                            setSaveTemplateTagInput('');
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
                        const val = saveTemplateTagInput.trim();
                        if (val && !saveTemplateTags.includes(val)) {
                          setSaveTemplateTags((p) => [...p, val]);
                          setSaveTemplateTagInput('');
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
                    onClick={() => setSavingPayloadAsTemplate(null)}
                    className={`px-4 py-2 rounded-lg text-xs font-mono font-medium border ${
                      isDark ? 'border-white/10 text-white/70 hover:bg-white/5' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    id="confirm-save-template-btn"
                    type="submit"
                    className="px-5 py-2 rounded-lg text-xs font-mono font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/30"
                  >
                    Save to Template Library
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
