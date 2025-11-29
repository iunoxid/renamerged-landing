import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Save, X, GripVertical } from 'lucide-react';
import { ToastType } from './ToastContainer';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SortableFAQItemProps {
  faq: FAQItem;
  index: number;
  editingId: string | null;
  onEdit: (id: string) => void;
  onUpdate: (id: string) => void;
  onDelete: (id: string) => void;
  onCancelEdit: () => void;
  onFieldUpdate: (id: string, field: keyof FAQItem, value: any) => void;
}

function SortableFAQItem({
  faq,
  index,
  editingId,
  onEdit,
  onUpdate,
  onDelete,
  onCancelEdit,
  onFieldUpdate,
}: SortableFAQItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: faq.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-slate-800/50 border ${
        faq.is_active ? 'border-slate-700' : 'border-red-500/30'
      } rounded-lg p-4 ${isDragging ? 'z-50 shadow-2xl' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div
          {...attributes}
          {...listeners}
          className="flex items-center justify-center w-10 h-10 bg-blue-500/20 border border-blue-500/30 rounded-lg flex-shrink-0 cursor-grab active:cursor-grabbing hover:bg-blue-500/30 transition-colors"
          title="Drag to reorder"
        >
          <GripVertical size={20} className="text-blue-400" />
        </div>

        <div className="flex items-center justify-center w-8 h-8 bg-slate-700/50 rounded-lg flex-shrink-0">
          <span className="text-base font-bold text-slate-300">{index + 1}</span>
        </div>

        <div className="flex-1 min-w-0">
          {editingId === faq.id ? (
            <div className="space-y-3">
              <input
                type="text"
                value={faq.question}
                onChange={(e) => onFieldUpdate(faq.id, 'question', e.target.value)}
                placeholder="Question"
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                value={faq.answer}
                onChange={(e) => onFieldUpdate(faq.id, 'answer', e.target.value)}
                placeholder="Answer"
                rows={3}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ) : (
            <div className="space-y-1">
              <h4 className="text-base font-semibold text-white leading-tight">{faq.question}</h4>
              <p className="text-sm text-gray-400 leading-relaxed">{faq.answer}</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {editingId === faq.id ? (
            <>
              <button
                onClick={() => onUpdate(faq.id)}
                className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                title="Save"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={onCancelEdit}
                className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                title="Cancel"
              >
                <X size={16} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onEdit(faq.id)}
                className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                title="Edit"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => onDelete(faq.id)}
                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface FAQManagerProps {
  showToast: (message: string, type: ToastType) => void;
}

export default function FAQManager({ showToast }: FAQManagerProps) {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    is_active: true,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    try {
      const { data, error } = await supabase
        .from('faq_items')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setFaqs(data || []);
    } catch (error) {
      console.error('Error loading FAQs:', error);
      showToast('Failed to load FAQs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.question || !formData.answer) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    try {
      const maxOrder = faqs.length > 0 ? Math.max(...faqs.map(f => f.sort_order)) : 0;

      const { error } = await supabase
        .from('faq_items')
        .insert({
          question: formData.question,
          answer: formData.answer,
          is_active: formData.is_active,
          sort_order: maxOrder + 1,
        });

      if (error) throw error;

      showToast('FAQ added successfully!', 'success');
      setIsAdding(false);
      setFormData({ question: '', answer: '', is_active: true });
      loadFAQs();
    } catch (error) {
      console.error('Error adding FAQ:', error);
      showToast('Failed to add FAQ', 'error');
    }
  };

  const handleUpdate = async (id: string) => {
    const faq = faqs.find(f => f.id === id);
    if (!faq) return;

    try {
      const { error } = await supabase
        .from('faq_items')
        .update({
          question: faq.question,
          answer: faq.answer,
          is_active: faq.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      showToast('FAQ updated successfully!', 'success');
      setEditingId(null);
      loadFAQs();
    } catch (error) {
      console.error('Error updating FAQ:', error);
      showToast('Failed to update FAQ', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      const { error } = await supabase
        .from('faq_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      showToast('FAQ deleted successfully!', 'success');
      loadFAQs();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      showToast('Failed to delete FAQ', 'error');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = faqs.findIndex((faq) => faq.id === active.id);
    const newIndex = faqs.findIndex((faq) => faq.id === over.id);

    const newFaqs = arrayMove(faqs, oldIndex, newIndex);
    setFaqs(newFaqs);

    try {
      const updates = newFaqs.map((faq, index) => ({
        id: faq.id,
        sort_order: index + 1,
      }));

      for (const update of updates) {
        await supabase
          .from('faq_items')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);
      }

      showToast('FAQ order updated!', 'success');
    } catch (error) {
      console.error('Error updating FAQ order:', error);
      showToast('Failed to reorder FAQs', 'error');
      loadFAQs();
    }
  };

  const updateFAQ = (id: string, field: keyof FAQItem, value: any) => {
    setFaqs(faqs.map(faq =>
      faq.id === id ? { ...faq, [field]: value } : faq
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-white">FAQ Management</h3>
          <p className="text-sm text-slate-400 mt-1">Drag items to reorder</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
        >
          {isAdding ? <X size={20} /> : <Plus size={20} />}
          {isAdding ? 'Cancel' : 'Add New FAQ'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-4">
          <h4 className="text-lg font-bold text-white">Add New FAQ</h4>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Question
            </label>
            <input
              type="text"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter FAQ question"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Answer
            </label>
            <textarea
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter FAQ answer"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 rounded bg-slate-700 border-slate-600"
            />
            <label htmlFor="is_active" className="text-sm text-slate-300">
              Active (visible on website)
            </label>
          </div>

          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all"
          >
            <Save size={20} />
            Save FAQ
          </button>
        </div>
      )}

      <div className="space-y-4">
        {faqs.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No FAQs found. Add your first FAQ to get started.
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={faqs.map(faq => faq.id)}
              strategy={verticalListSortingStrategy}
            >
              {faqs.map((faq, index) => (
                <SortableFAQItem
                  key={faq.id}
                  faq={faq}
                  index={index}
                  editingId={editingId}
                  onEdit={setEditingId}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  onCancelEdit={() => {
                    setEditingId(null);
                    loadFAQs();
                  }}
                  onFieldUpdate={updateFAQ}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
