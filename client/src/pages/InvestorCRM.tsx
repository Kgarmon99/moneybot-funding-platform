import { useState } from 'react';
import {
  Mail,
  Star,
  Plus,
  X,
  Save,
  Trash2,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Clock,
  Target,
} from 'lucide-react';

interface Investor {
  id: number;
  name: string;
  firm: string;
  email: string;
  phone?: string;
  stage: 'Research' | 'Outreach' | 'Meeting' | 'Diligence' | 'Term Sheet' | 'Committed' | 'Passed';
  checkSize: string;
  sectorFocus: string[];
  relationshipStrength: number;
  lastContact: string;
  nextAction: string;
  nextActionDate: string;
  notes: string;
  interactions: Interaction[];
}

interface Interaction {
  id: number;
  date: string;
  type: 'Email' | 'Call' | 'Meeting' | 'Pitch' | 'Follow-up' | 'Intro';
  summary: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
}

const STAGES = ['Research', 'Outreach', 'Meeting', 'Diligence', 'Term Sheet', 'Committed', 'Passed'];

const STAGE_COLORS: Record<string, string> = {
  Research: 'bg-gray-100 text-gray-600',
  Outreach: 'bg-blue-100 text-blue-700',
  Meeting: 'bg-purple-100 text-purple-700',
  Diligence: 'bg-yellow-100 text-yellow-700',
  'Term Sheet': 'bg-orange-100 text-orange-700',
  Committed: 'bg-green-100 text-green-700',
  Passed: 'bg-red-100 text-red-700',
};

export default function InvestorCRM() {
  const [investors, setInvestors] = useState<Investor[]>([
    {
      id: 1,
      name: 'Sarah Chen',
      firm: 'Andreessen Horowitz',
      email: 'sarah@a16z.com',
      stage: 'Meeting',
      checkSize: '$500K - $2M',
      sectorFocus: ['EdTech', 'AI'],
      relationshipStrength: 4,
      lastContact: '2026-05-28',
      nextAction: 'Send updated deck',
      nextActionDate: '2026-06-02',
      notes: 'Interested in our school traction. Wants to see 6-month projections.',
      interactions: [
        { id: 1, date: '2026-05-28', type: 'Meeting', summary: 'Initial pitch, positive reception', sentiment: 'Positive' },
        { id: 2, date: '2026-05-20', type: 'Email', summary: 'Warm intro from John at Techstars', sentiment: 'Positive' },
      ],
    },
    {
      id: 2,
      name: 'Marcus Johnson',
      firm: 'Bessemer Venture Partners',
      email: 'mjohnson@bvp.com',
      stage: 'Diligence',
      checkSize: '$1M - $5M',
      sectorFocus: ['SaaS', 'EdTech'],
      relationshipStrength: 3,
      lastContact: '2026-05-25',
      nextAction: 'Provide financial projections',
      nextActionDate: '2026-06-01',
      notes: 'Asking for detailed unit economics. Wants to talk to 2 school pilot customers.',
      interactions: [
        { id: 3, date: '2026-05-25', type: 'Pitch', summary: 'Full pitch with team', sentiment: 'Positive' },
        { id: 4, date: '2026-05-15', type: 'Meeting', summary: 'Coffee chat, discussed market size', sentiment: 'Neutral' },
      ],
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingInvestor, setEditingInvestor] = useState<Investor | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [selectedInvestorId, setSelectedInvestorId] = useState<number | null>(null);

  const [form, setForm] = useState<Partial<Investor>>({
    name: '',
    firm: '',
    email: '',
    phone: '',
    stage: 'Research',
    checkSize: '',
    sectorFocus: [],
    relationshipStrength: 3,
    nextAction: '',
    nextActionDate: '',
    notes: '',
  });

  const [interactionForm, setInteractionForm] = useState<Partial<Interaction>>({
    type: 'Email',
    summary: '',
    sentiment: 'Neutral',
  });

  const byStage = STAGES.reduce((acc, stage) => {
    acc[stage] = investors.filter((i) => i.stage === stage);
    return acc;
  }, {} as Record<string, Investor[]>);

  const totalCommitted = investors
    .filter((i) => i.stage === 'Committed')
    .length;
  const totalPipeline = investors.filter((i) => i.stage !== 'Passed').length;
  const avgRelationship = investors.length > 0
    ? investors.reduce((sum, i) => sum + i.relationshipStrength, 0) / investors.length
    : 0;

  function openAdd() {
    setEditingInvestor(null);
    setForm({
      name: '',
      firm: '',
      email: '',
      phone: '',
      stage: 'Research',
      checkSize: '',
      sectorFocus: [],
      relationshipStrength: 3,
      nextAction: '',
      nextActionDate: '',
      notes: '',
    });
    setShowModal(true);
  }

  function openEdit(investor: Investor) {
    setEditingInvestor(investor);
    setForm(investor);
    setShowModal(true);
  }

  function handleSave() {
    if (editingInvestor) {
      setInvestors((prev) =>
        prev.map((i) => (i.id === editingInvestor.id ? { ...i, ...form } as Investor : i))
      );
    } else {
      const newInvestor: Investor = {
        ...form as Investor,
        id: Date.now(),
        lastContact: new Date().toISOString().slice(0, 10),
        interactions: [],
      };
      setInvestors((prev) => [...prev, newInvestor]);
    }
    setShowModal(false);
  }

  function handleDelete(id: number) {
    if (!confirm('Delete this investor?')) return;
    setInvestors((prev) => prev.filter((i) => i.id !== id));
  }

  function openInteractionModal(investorId: number) {
    setSelectedInvestorId(investorId);
    setInteractionForm({ type: 'Email', summary: '', sentiment: 'Neutral' });
    setShowInteractionModal(true);
  }

  function saveInteraction() {
    if (!selectedInvestorId) return;
    const newInteraction: Interaction = {
      ...interactionForm as Interaction,
      id: Date.now(),
      date: new Date().toISOString().slice(0, 10),
    };
    setInvestors((prev) =>
      prev.map((i) =>
        i.id === selectedInvestorId
          ? { ...i, interactions: [...i.interactions, newInteraction], lastContact: newInteraction.date }
          : i
      )
    );
    setShowInteractionModal(false);
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Investor CRM</h2>
          <p className="text-gray-500 mt-1">Track every investor interaction and relationship</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Investor
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Pipeline</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalPipeline}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Committed</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalCommitted}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Star className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">Avg. Relationship</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{avgRelationship.toFixed(1)}/5</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-sm text-gray-500">This Week</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {investors.filter((i) => {
              const days = Math.ceil((new Date(i.nextActionDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              return days <= 7 && days >= 0;
            }).length}
          </p>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto">
        <div className="flex gap-4 min-w-max pb-4">
          {STAGES.map((stage) => (
            <div key={stage} className="w-80 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-700">{stage}</h3>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {byStage[stage]?.length || 0}
                </span>
              </div>
              <div className="space-y-3">
                {byStage[stage]?.map((investor) => (
                  <div
                    key={investor.id}
                    className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{investor.name}</h4>
                        <p className="text-sm text-gray-500">{investor.firm}</p>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${
                              s <= investor.relationshipStrength
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STAGE_COLORS[investor.stage]}`}>
                        {investor.stage}
                      </span>
                      <span className="text-xs text-gray-500">{investor.checkSize}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <Mail className="w-3 h-3" />
                      {investor.email}
                    </div>

                    {investor.nextAction && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mb-2">
                        <p className="text-xs text-yellow-700">
                          <span className="font-medium">Next:</span> {investor.nextAction}
                        </p>
                        <p className="text-xs text-yellow-600 mt-0.5">
                          Due: {new Date(investor.nextActionDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => openEdit(investor)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openInteractionModal(investor.id)}
                        className="text-xs text-blue-500 hover:text-blue-700"
                      >
                        Log Interaction
                      </button>
                      <button
                        onClick={() => handleDelete(investor.id)}
                        className="text-xs text-red-500 hover:text-red-700 ml-auto"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Expandable interactions */}
                    {investor.interactions.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <button
                          onClick={() => setExpandedId(expandedId === investor.id ? null : investor.id)}
                          className="flex items-center gap-1 text-xs text-gray-500"
                        >
                          {expandedId === investor.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          {investor.interactions.length} interactions
                        </button>
                        {expandedId === investor.id && (
                          <div className="mt-2 space-y-2">
                            {investor.interactions.map((interaction) => (
                              <div key={interaction.id} className="text-xs bg-gray-50 rounded p-2">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">{interaction.type}</span>
                                  <span className="text-gray-400">{interaction.date}</span>
                                  <span className={`px-1.5 py-0.5 rounded text-xs ${
                                    interaction.sentiment === 'Positive' ? 'bg-green-100 text-green-700' :
                                    interaction.sentiment === 'Negative' ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-600'
                                  }`}>
                                    {interaction.sentiment}
                                  </span>
                                </div>
                                <p className="text-gray-600">{interaction.summary}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Investor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">
                {editingInvestor ? 'Edit Investor' : 'Add Investor'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={form.name || ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              <input
                type="text"
                placeholder="Firm"
                value={form.firm || ''}
                onChange={(e) => setForm({ ...form, firm: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              <input
                type="email"
                placeholder="Email"
                value={form.email || ''}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              <input
                type="text"
                placeholder="Phone"
                value={form.phone || ''}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              <select
                value={form.stage || 'Research'}
                onChange={(e) => setForm({ ...form, stage: e.target.value as any })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Check Size (e.g., $500K - $2M)"
                value={form.checkSize || ''}
                onChange={(e) => setForm({ ...form, checkSize: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              <div>
                <label className="text-sm text-gray-600">Relationship Strength: {form.relationshipStrength}</label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={form.relationshipStrength || 3}
                  onChange={(e) => setForm({ ...form, relationshipStrength: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
              <input
                type="text"
                placeholder="Next Action"
                value={form.nextAction || ''}
                onChange={(e) => setForm({ ...form, nextAction: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              <input
                type="date"
                placeholder="Next Action Date"
                value={form.nextActionDate || ''}
                onChange={(e) => setForm({ ...form, nextActionDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              <textarea
                placeholder="Notes"
                value={form.notes || ''}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                Cancel
              </button>
              <button onClick={handleSave} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interaction Modal */}
      {showInteractionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Log Interaction</h3>
              <button onClick={() => setShowInteractionModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <select
                value={interactionForm.type || 'Email'}
                onChange={(e) => setInteractionForm({ ...interactionForm, type: e.target.value as any })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                {['Email', 'Call', 'Meeting', 'Pitch', 'Follow-up', 'Intro'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <textarea
                placeholder="Summary"
                value={interactionForm.summary || ''}
                onChange={(e) => setInteractionForm({ ...interactionForm, summary: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              <select
                value={interactionForm.sentiment || 'Neutral'}
                onChange={(e) => setInteractionForm({ ...interactionForm, sentiment: e.target.value as any })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                {['Positive', 'Neutral', 'Negative'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowInteractionModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                Cancel
              </button>
              <button onClick={saveInteraction} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
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