import { useEffect, useState } from 'react';
import {
  Plus,
  Calendar,
  DollarSign,
  Clock,
  X,
  Save,
  Trash2,
} from 'lucide-react';
import type { FundingOpportunity, FundingStage } from '../types';
import { FUNDING_STAGES } from '../types';

const API_URL = '/api';

function getUrgencyColor(deadline: string): string {
  const days = Math.ceil(
    (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (days < 7) return 'border-l-red-500 bg-red-50';
  if (days < 30) return 'border-l-yellow-500 bg-yellow-50';
  return 'border-l-green-500 bg-green-50';
}

function getUrgencyBadge(deadline: string): string {
  const days = Math.ceil(
    (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (days < 7) return 'bg-red-100 text-red-700';
  if (days < 30) return 'bg-yellow-100 text-yellow-700';
  return 'bg-green-100 text-green-700';
}

function formatDeadline(deadline: string): string {
  const days = Math.ceil(
    (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (days < 0) return 'Overdue';
  if (days === 0) return 'Today';
  if (days === 1) return '1 day';
  return `${days} days`;
}

export default function Dashboard() {
  const [opportunities, setOpportunities] = useState<FundingOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<FundingOpportunity>>({
    source_name: '',
    amount: 0,
    deadline: '',
    stage: 'Lead',
    last_action: '',
    next_action: '',
    notes: '',
  });

  useEffect(() => {
    fetchOpportunities();
  }, []);

  async function fetchOpportunities() {
    try {
      const res = await fetch(`${API_URL}/opportunities`);
      const data = await res.json();
      setOpportunities(data);
    } catch (err) {
      console.error('Failed to fetch opportunities:', err);
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditingId(null);
    setForm({
      source_name: '',
      amount: 0,
      deadline: '',
      stage: 'Lead',
      last_action: '',
      next_action: '',
      notes: '',
    });
    setShowModal(true);
  }

  function openEdit(opp: FundingOpportunity) {
    setEditingId(opp.id);
    setForm({
      source_name: opp.source_name,
      amount: opp.amount,
      deadline: opp.deadline.slice(0, 10),
      stage: opp.stage,
      last_action: opp.last_action,
      next_action: opp.next_action,
      notes: opp.notes,
    });
    setShowModal(true);
  }

  async function handleSave() {
    const url = editingId
      ? `${API_URL}/opportunities/${editingId}`
      : `${API_URL}/opportunities`;
    const method = editingId ? 'PUT' : 'POST';
    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setShowModal(false);
      fetchOpportunities();
    } catch (err) {
      console.error('Failed to save:', err);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this opportunity?')) return;
    try {
      await fetch(`${API_URL}/opportunities/${id}`, { method: 'DELETE' });
      fetchOpportunities();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  }

  const byStage: Record<string, FundingOpportunity[]> = {};
  for (const stage of FUNDING_STAGES) {
    byStage[stage] = opportunities.filter((o) => o.stage === stage);
  }

  const totalAmount = opportunities.reduce((sum, o) => sum + o.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Funding Dashboard</h2>
          <p className="text-gray-500 mt-1">
            Track your fundraising pipeline and opportunities
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Opportunity
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-primary-600" />
            </div>
            <span className="text-sm text-gray-500">Pipeline Value</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${totalAmount.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-sm text-gray-500">Active Opportunities</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{opportunities.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Avg. Days to Deadline</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {opportunities.length > 0
              ? Math.round(
                  opportunities.reduce(
                    (sum, o) =>
                      sum +
                      Math.ceil(
                        (new Date(o.deadline).getTime() - Date.now()) /
                          (1000 * 60 * 60 * 24)
                      ),
                    0
                  ) / opportunities.length
                )
              : 0}
          </p>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto">
        <div className="flex gap-4 min-w-max pb-4">
          {FUNDING_STAGES.map((stage) => (
            <div key={stage} className="w-72 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-700">{stage}</h3>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {byStage[stage]?.length || 0}
                </span>
              </div>
              <div className="space-y-3">
                {byStage[stage]?.map((opp) => (
                  <div
                    key={opp.id}
                    onClick={() => openEdit(opp)}
                    className={`bg-white rounded-lg p-4 border border-gray-200 border-l-4 cursor-pointer hover:shadow-md transition-shadow ${getUrgencyColor(
                      opp.deadline
                    )}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {opp.source_name}
                      </h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(opp.id);
                        }}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-lg font-bold text-gray-900 mb-2">
                      ${opp.amount.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${getUrgencyBadge(
                          opp.deadline
                        )}`}
                      >
                        {formatDeadline(opp.deadline)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">
                      <span className="font-medium">Last:</span> {opp.last_action}
                    </p>
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Next:</span> {opp.next_action}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">
                {editingId ? 'Edit Opportunity' : 'Add Opportunity'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source Name
                </label>
                <input
                  type="text"
                  value={form.source_name || ''}
                  onChange={(e) =>
                    setForm({ ...form, source_name: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount ($)
                </label>
                <input
                  type="number"
                  value={form.amount || ''}
                  onChange={(e) =>
                    setForm({ ...form, amount: Number(e.target.value) })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline
                </label>
                <input
                  type="date"
                  value={form.deadline || ''}
                  onChange={(e) =>
                    setForm({ ...form, deadline: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stage
                </label>
                <select
                  value={form.stage || 'Lead'}
                  onChange={(e) =>
                    setForm({ ...form, stage: e.target.value as FundingStage })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {FUNDING_STAGES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Action
                </label>
                <input
                  type="text"
                  value={form.last_action || ''}
                  onChange={(e) =>
                    setForm({ ...form, last_action: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Next Action
                </label>
                <input
                  type="text"
                  value={form.next_action || ''}
                  onChange={(e) =>
                    setForm({ ...form, next_action: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={form.notes || ''}
                  onChange={(e) =>
                    setForm({ ...form, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
