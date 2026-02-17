import { useEffect, useMemo, useState } from 'react';
import { GripVertical, Plus, Save, Trash2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ToastType } from './Toast';
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type Architecture = '32-bit' | '64-bit';

interface DownloadVersionRow {
  id: string;
  version: string;
  file_name: string;
  architecture: Architecture;
  download_url: string;
  sort_order: number;
  is_active: boolean;
  updated_at: string;
}

interface DownloadVersionBatch {
  version: string;
  sortOrder: number;
  rows: DownloadVersionRow[];
}

interface DownloadVersionManagerProps {
  showToast: (message: string, type: ToastType) => void;
}

interface NewVariantForm {
  key: string;
  file_name: string;
  architecture: Architecture;
  download_url: string;
}

interface NewBatchForm {
  version: string;
  variants: NewVariantForm[];
}

interface SortableBatchCardProps {
  batch: DownloadVersionBatch;
  savingBatchVersion: string | null;
  deletingBatchVersion: string | null;
  onFieldUpdate: <K extends keyof DownloadVersionRow>(id: string, field: K, value: DownloadVersionRow[K]) => void;
  onDeleteVariant: (id: string) => void;
  onSaveBatch: (version: string) => void;
  onDeleteBatch: (version: string) => void;
}

const createVariant = (arch: Architecture): NewVariantForm => ({
  key: crypto.randomUUID(),
  file_name: '',
  architecture: arch,
  download_url: '',
});

const createDefaultBatchForm = (): NewBatchForm => ({
  version: '',
  variants: [createVariant('64-bit'), createVariant('32-bit')],
});

function SortableBatchCard({
  batch,
  savingBatchVersion,
  deletingBatchVersion,
  onFieldUpdate,
  onDeleteVariant,
  onSaveBatch,
  onDeleteBatch,
}: SortableBatchCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: batch.version });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-slate-700 rounded-xl bg-slate-900/40 overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            {...attributes}
            {...listeners}
            className="p-2 rounded-lg bg-slate-800 border border-slate-600 text-slate-300 cursor-grab active:cursor-grabbing"
            title="Drag untuk urutkan versi"
          >
            <GripVertical size={16} />
          </button>
          <div>
            <p className="text-sm text-slate-400">Version Batch</p>
            <p className="text-lg font-bold text-white">v{batch.version}</p>
          </div>
        </div>
        <span className="text-xs text-slate-400">
          {batch.rows.length} varian
        </span>
      </div>

      <div className="p-4 space-y-4">
        {batch.rows.map((row) => (
          <div key={row.id} className="rounded-lg border border-slate-700 bg-slate-950/50 p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-2">File Name</label>
                <input
                  type="text"
                  value={row.file_name}
                  onChange={(e) => onFieldUpdate(row.id, 'file_name', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-900 text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-2">Architecture</label>
                <select
                  value={row.architecture}
                  onChange={(e) => onFieldUpdate(row.id, 'architecture', e.target.value as Architecture)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-900 text-white"
                >
                  <option value="64-bit">64-bit</option>
                  <option value="32-bit">32-bit</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-2">Download URL</label>
              <input
                type="url"
                value={row.download_url}
                onChange={(e) => onFieldUpdate(row.id, 'download_url', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-900 text-white"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={row.is_active}
                  onChange={(e) => onFieldUpdate(row.id, 'is_active', e.target.checked)}
                  className="rounded border-slate-600 bg-slate-900"
                />
                Active
              </label>
              <button
                onClick={() => onDeleteVariant(row.id)}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300"
              >
                <Trash2 size={14} />
                Hapus Varian
              </button>
            </div>
          </div>
        ))}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Last updated: {new Date(batch.rows[0].updated_at).toLocaleString()}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onSaveBatch(batch.version)}
              disabled={savingBatchVersion === batch.version}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 text-white text-sm"
            >
              <Save size={14} />
              {savingBatchVersion === batch.version ? 'Saving...' : 'Save Batch'}
            </button>
            <button
              onClick={() => onDeleteBatch(batch.version)}
              disabled={deletingBatchVersion === batch.version}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 text-sm"
            >
              <Trash2 size={14} />
              {deletingBatchVersion === batch.version ? 'Deleting...' : 'Delete Batch'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DownloadVersionManager({ showToast }: DownloadVersionManagerProps) {
  const [rows, setRows] = useState<DownloadVersionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingBatchVersion, setSavingBatchVersion] = useState<string | null>(null);
  const [deletingBatchVersion, setDeletingBatchVersion] = useState<string | null>(null);
  const [addingBatch, setAddingBatch] = useState(false);
  const [newBatch, setNewBatch] = useState<NewBatchForm>(createDefaultBatchForm);
  const [reordering, setReordering] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const batches = useMemo<DownloadVersionBatch[]>(() => {
    const grouped = new Map<string, DownloadVersionBatch>();

    for (const row of rows) {
      const existing = grouped.get(row.version);
      if (!existing) {
        grouped.set(row.version, {
          version: row.version,
          sortOrder: row.sort_order,
          rows: [row],
        });
      } else {
        existing.rows.push(row);
        existing.sortOrder = Math.min(existing.sortOrder, row.sort_order);
      }
    }

    return Array.from(grouped.values())
      .map((batch) => ({
        ...batch,
        rows: batch.rows.sort((a, b) => {
          if (a.architecture === b.architecture) return a.file_name.localeCompare(b.file_name);
          return a.architecture === '64-bit' ? -1 : 1;
        }),
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [rows]);

  useEffect(() => {
    loadRows();
  }, []);

  const loadRows = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('download_versions')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setRows((data || []) as DownloadVersionRow[]);
    } catch (error) {
      console.error('Failed to load download versions:', error);
      showToast('Failed to load download list', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateRowField = <K extends keyof DownloadVersionRow>(
    id: string,
    field: K,
    value: DownloadVersionRow[K]
  ) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const updateVariant = <K extends keyof NewVariantForm>(
    key: string,
    field: K,
    value: NewVariantForm[K]
  ) => {
    setNewBatch((prev) => ({
      ...prev,
      variants: prev.variants.map((item) =>
        item.key === key ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addVariantField = () => {
    setNewBatch((prev) => ({
      ...prev,
      variants: [...prev.variants, createVariant('64-bit')],
    }));
  };

  const removeVariantField = (key: string) => {
    setNewBatch((prev) => ({
      ...prev,
      variants: prev.variants.filter((item) => item.key !== key),
    }));
  };

  const validateBatch = (version: string, variantRows: NewVariantForm[]) => {
    if (!version.trim()) {
      showToast('Version wajib diisi', 'error');
      return false;
    }

    if (batches.some((batch) => batch.version === version.trim())) {
      showToast('Version sudah ada. Edit dari batch yang tersedia.', 'error');
      return false;
    }

    if (variantRows.length === 0) {
      showToast('Minimal harus ada 1 varian file', 'error');
      return false;
    }

    const usedArchitectures = new Set<Architecture>();
    for (const variant of variantRows) {
      if (!variant.file_name.trim() || !variant.download_url.trim()) {
        showToast('File Name dan Download URL di semua varian wajib diisi', 'error');
        return false;
      }
      if (usedArchitectures.has(variant.architecture)) {
        showToast('Architecture tidak boleh duplikat dalam 1 batch', 'error');
        return false;
      }
      usedArchitectures.add(variant.architecture);
    }

    return true;
  };

  const handleAddBatch = async () => {
    const version = newBatch.version.trim();
    if (!validateBatch(version, newBatch.variants)) return;

    setAddingBatch(true);
    try {
      const nextSortOrder = rows.length > 0 ? Math.max(...rows.map((r) => r.sort_order)) + 1 : 1;

      const payload = newBatch.variants.map((variant) => ({
        version,
        file_name: variant.file_name.trim(),
        architecture: variant.architecture,
        download_url: variant.download_url.trim(),
        sort_order: nextSortOrder,
        is_active: true,
      }));

      const { error } = await supabase.from('download_versions').insert(payload);
      if (error) throw error;

      showToast('Batch download baru berhasil ditambahkan', 'success');
      setNewBatch(createDefaultBatchForm());
      await loadRows();
    } catch (error: any) {
      console.error('Failed to add download batch:', error);
      showToast(error.message || 'Failed to add batch', 'error');
    } finally {
      setAddingBatch(false);
    }
  };

  const saveBatch = async (version: string) => {
    const batchRows = rows.filter((row) => row.version === version);
    if (batchRows.length === 0) return;

    const archSet = new Set<Architecture>();
    for (const row of batchRows) {
      if (!row.version.trim() || !row.file_name.trim() || !row.download_url.trim()) {
        showToast('Version, File Name, dan URL tidak boleh kosong', 'error');
        return;
      }
      if (archSet.has(row.architecture)) {
        showToast(`Architecture duplikat di version ${version}`, 'error');
        return;
      }
      archSet.add(row.architecture);
    }

    setSavingBatchVersion(version);
    try {
      await Promise.all(
        batchRows.map((row) =>
          supabase
            .from('download_versions')
            .update({
              version: row.version.trim(),
              file_name: row.file_name.trim(),
              architecture: row.architecture,
              download_url: row.download_url.trim(),
              is_active: row.is_active,
              sort_order: row.sort_order,
              updated_at: new Date().toISOString(),
            })
            .eq('id', row.id)
        )
      );

      showToast(`Batch v${version} berhasil disimpan`, 'success');
      await loadRows();
    } catch (error) {
      console.error('Failed to save batch:', error);
      showToast('Failed to save batch', 'error');
    } finally {
      setSavingBatchVersion(null);
    }
  };

  const deleteVariant = async (id: string) => {
    if (!confirm('Hapus varian file ini?')) return;

    try {
      const { error } = await supabase
        .from('download_versions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showToast('Varian file dihapus', 'success');
      await loadRows();
    } catch (error) {
      console.error('Failed to delete variant:', error);
      showToast('Failed to delete variant', 'error');
    }
  };

  const deleteBatch = async (version: string) => {
    if (!confirm(`Hapus seluruh batch version ${version}?`)) return;

    setDeletingBatchVersion(version);
    try {
      const { error } = await supabase
        .from('download_versions')
        .delete()
        .eq('version', version);

      if (error) throw error;
      showToast(`Batch v${version} dihapus`, 'success');
      await loadRows();
    } catch (error) {
      console.error('Failed to delete batch:', error);
      showToast('Failed to delete batch', 'error');
    } finally {
      setDeletingBatchVersion(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = batches.findIndex((batch) => batch.version === active.id);
    const newIndex = batches.findIndex((batch) => batch.version === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedBatches = arrayMove(batches, oldIndex, newIndex);
    const updates = reorderedBatches.flatMap((batch, idx) =>
      batch.rows.map((row) => ({
        id: row.id,
        sort_order: idx + 1,
      }))
    );

    setRows((prev) =>
      prev.map((row) => {
        const found = updates.find((item) => item.id === row.id);
        return found ? { ...row, sort_order: found.sort_order } : row;
      })
    );

    setReordering(true);
    try {
      await Promise.all(
        updates.map((item) =>
          supabase
            .from('download_versions')
            .update({ sort_order: item.sort_order })
            .eq('id', item.id)
        )
      );
      showToast('Urutan batch versi berhasil diperbarui', 'success');
      await loadRows();
    } catch (error) {
      console.error('Failed to reorder batches:', error);
      showToast('Failed to reorder batch versions', 'error');
      await loadRows();
    } finally {
      setReordering(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-4">
        <h3 className="text-xl font-bold text-white">Add Download Batch</h3>
        <p className="text-sm text-slate-400">
          Tambah versi sekali, lalu isi beberapa varian architecture (32/64-bit).
        </p>

        <div>
          <label className="block text-sm text-slate-300 mb-2">Version</label>
          <input
            type="text"
            value={newBatch.version}
            onChange={(e) => setNewBatch((prev) => ({ ...prev, version: e.target.value }))}
            placeholder="4.0.0"
            className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-900 text-white"
          />
        </div>

        <div className="space-y-3">
          {newBatch.variants.map((variant, idx) => (
            <div key={variant.key} className="rounded-lg border border-slate-700 bg-slate-900/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Varian #{idx + 1}</p>
                {newBatch.variants.length > 1 && (
                  <button
                    onClick={() => removeVariantField(variant.key)}
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-red-500/20 border border-red-500/30 text-red-300"
                  >
                    <X size={12} />
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-2">File Name</label>
                  <input
                    type="text"
                    value={variant.file_name}
                    onChange={(e) => updateVariant(variant.key, 'file_name', e.target.value)}
                    placeholder="Renamerged-v4.0.0-win-x64.zip"
                    className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-900 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-2">Architecture</label>
                  <select
                    value={variant.architecture}
                    onChange={(e) => updateVariant(variant.key, 'architecture', e.target.value as Architecture)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-900 text-white"
                  >
                    <option value="64-bit">64-bit</option>
                    <option value="32-bit">32-bit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-2">Download URL</label>
                <input
                  type="url"
                  value={variant.download_url}
                  onChange={(e) => updateVariant(variant.key, 'download_url', e.target.value)}
                  placeholder="https://download.domain/v4.0.0/renamerged-v4.0.0-win-x64.zip"
                  className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-900 text-white"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={addVariantField}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-600 bg-slate-900 text-slate-300 hover:bg-slate-800 text-sm"
          >
            <Plus size={14} />
            Add Varian
          </button>
          <button
            onClick={handleAddBatch}
            disabled={addingBatch}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 text-white text-sm"
          >
            <Save size={14} />
            {addingBatch ? 'Adding...' : 'Add Batch Version'}
          </button>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xl font-bold text-white">Download Version List</h3>
          {reordering && <span className="text-xs text-slate-400">Saving order...</span>}
        </div>
        <p className="text-sm text-slate-400">
          Urutan versi sekarang pakai drag & drop seperti FAQ. Field Sort Order disembunyikan.
        </p>

        {batches.length === 0 ? (
          <p className="text-slate-400">Belum ada batch download.</p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={batches.map((batch) => batch.version)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {batches.map((batch) => (
                  <SortableBatchCard
                    key={batch.version}
                    batch={batch}
                    savingBatchVersion={savingBatchVersion}
                    deletingBatchVersion={deletingBatchVersion}
                    onFieldUpdate={updateRowField}
                    onDeleteVariant={deleteVariant}
                    onSaveBatch={saveBatch}
                    onDeleteBatch={deleteBatch}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
