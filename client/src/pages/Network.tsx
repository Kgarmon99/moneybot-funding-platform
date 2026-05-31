import { useEffect, useState, useRef } from 'react';
import {
  Plus,
  Users,
  Link2,
  Route,
  X,
  Save,
  Trash2,
  Network,
} from 'lucide-react';
import type { Contact, Connection } from '../types';

const API_URL = '/api';

export default function NetworkPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showConnModal, setShowConnModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [contactForm, setContactForm] = useState<Partial<Contact>>({
    name: '',
    company: '',
    role: '',
    relationship_strength: 3,
    email: '',
    notes: '',
  });
  const [connForm, setConnForm] = useState({
    from_contact_id: '',
    to_contact_id: '',
    intro_path: '',
    status: 'Pending',
    notes: '',
  });
  const [pathFrom, setPathFrom] = useState('');
  const [pathTo, setPathTo] = useState('');
  const [shortestPath, setShortestPath] = useState<string[] | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [cRes, connRes] = await Promise.all([
        fetch(`${API_URL}/contacts`),
        fetch(`${API_URL}/connections`),
      ]);
      setContacts(await cRes.json());
      setConnections(await connRes.json());
    } catch (err) {
      console.error('Failed to fetch network data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    drawNetwork();
  }, [contacts, connections]);

  function drawNetwork() {
    const canvas = canvasRef.current;
    if (!canvas || contacts.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, rect.height);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = Math.min(centerX, centerY) * 0.7;

    const positions = new Map<number, { x: number; y: number }>();
    contacts.forEach((c, i) => {
      const angle = (i / contacts.length) * 2 * Math.PI - Math.PI / 2;
      positions.set(c.id, {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      });
    });

    // Draw edges
    connections.forEach((conn) => {
      const from = positions.get(conn.from_contact_id);
      const to = positions.get(conn.to_contact_id);
      if (!from || !to) return;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.strokeStyle =
        conn.status === 'Intro Made'
          ? '#22c55e'
          : conn.status === 'Requested'
          ? '#f59e0b'
          : '#94a3b8';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw nodes
    contacts.forEach((c) => {
      const pos = positions.get(c.id);
      if (!pos) return;
      const size = 8 + c.relationship_strength * 3;

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, size, 0, 2 * Math.PI);
      ctx.fillStyle =
        c.relationship_strength >= 4
          ? '#2563eb'
          : c.relationship_strength >= 3
          ? '#3b82f6'
          : '#93c5fd';
      ctx.fill();

      ctx.fillStyle = '#374151';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(c.name, pos.x, pos.y + size + 14);
      ctx.fillStyle = '#6b7280';
      ctx.font = '9px sans-serif';
      ctx.fillText(c.company, pos.x, pos.y + size + 26);
    });
  }

  async function saveContact() {
    const url = editingContact
      ? `${API_URL}/contacts/${editingContact.id}`
      : `${API_URL}/contacts`;
    const method = editingContact ? 'PUT' : 'POST';
    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      setShowContactModal(false);
      fetchData();
    } catch (err) {
      console.error('Failed to save contact:', err);
    }
  }

  async function deleteContact(id: number) {
    if (!confirm('Delete this contact?')) return;
    try {
      await fetch(`${API_URL}/contacts/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error('Failed to delete contact:', err);
    }
  }

  async function saveConnection() {
    try {
      await fetch(`${API_URL}/connections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(connForm),
      });
      setShowConnModal(false);
      setConnForm({
        from_contact_id: '',
        to_contact_id: '',
        intro_path: '',
        status: 'Pending',
        notes: '',
      });
      fetchData();
    } catch (err) {
      console.error('Failed to save connection:', err);
    }
  }

  async function findShortestPath() {
    if (!pathFrom || !pathTo) return;
    try {
      const res = await fetch(
        `${API_URL}/contacts/network/shortest-path?from=${pathFrom}&to=${pathTo}`
      );
      const data = await res.json();
      setShortestPath(data.names);
    } catch (err) {
      console.error('Failed to find path:', err);
    }
  }

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
          <h2 className="text-2xl font-bold text-gray-900">
            Warm Intro Network Mapper
          </h2>
          <p className="text-gray-500 mt-1">
            Map your connections and find paths to investors
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowConnModal(true)}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            <Link2 className="w-4 h-4" />
            Add Connection
          </button>
          <button
            onClick={() => {
              setEditingContact(null);
              setContactForm({
                name: '',
                company: '',
                role: '',
                relationship_strength: 3,
                email: '',
                notes: '',
              });
              setShowContactModal(true);
            }}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-4 h-4" />
            Add Contact
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Network Graph */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Network className="w-5 h-5" />
            Network Visualization
          </h3>
          <canvas
            ref={canvasRef}
            className="w-full h-96 border border-gray-100 rounded-lg"
          />
          <div className="flex items-center gap-6 mt-4 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-600" />
              <span>Strong (4-5)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Medium (3)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-300" />
              <span>Weak (1-2)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-green-500" />
              <span>Intro Made</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-yellow-500" />
              <span>Requested</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Shortest Path */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Route className="w-5 h-5" />
              Find Shortest Path
            </h3>
            <div className="space-y-3">
              <select
                value={pathFrom}
                onChange={(e) => setPathFrom(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">From contact...</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.company})
                  </option>
                ))}
              </select>
              <select
                value={pathTo}
                onChange={(e) => setPathTo(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">To contact...</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.company})
                  </option>
                ))}
              </select>
              <button
                onClick={findShortestPath}
                className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 text-sm"
              >
                Find Path
              </button>
              {shortestPath && shortestPath.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs text-green-700 font-medium mb-1">
                    Path found:
                  </p>
                  <p className="text-sm text-green-800">
                    {shortestPath.join(' → ')}
                  </p>
                </div>
              )}
              {shortestPath && shortestPath.length === 0 && (
                <p className="text-sm text-gray-500">No path found.</p>
              )}
            </div>
          </div>

          {/* Contacts List */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Contacts ({contacts.length})
            </h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {contacts.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                  onClick={() => {
                    setEditingContact(c);
                    setContactForm(c);
                    setShowContactModal(true);
                  }}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {c.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {c.role} at {c.company}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <div
                          key={s}
                          className={`w-1.5 h-1.5 rounded-full ${
                            s <= c.relationship_strength
                              ? 'bg-blue-500'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteContact(c.id);
                      }}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">
                {editingContact ? 'Edit Contact' : 'Add Contact'}
              </h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={contactForm.name || ''}
                onChange={(e) =>
                  setContactForm({ ...contactForm, name: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              <input
                type="text"
                placeholder="Company"
                value={contactForm.company || ''}
                onChange={(e) =>
                  setContactForm({ ...contactForm, company: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              <input
                type="text"
                placeholder="Role"
                value={contactForm.role || ''}
                onChange={(e) =>
                  setContactForm({ ...contactForm, role: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              <input
                type="email"
                placeholder="Email"
                value={contactForm.email || ''}
                onChange={(e) =>
                  setContactForm({ ...contactForm, email: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              <div>
                <label className="text-sm text-gray-600">
                  Relationship Strength: {contactForm.relationship_strength}
                </label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={contactForm.relationship_strength || 3}
                  onChange={(e) =>
                    setContactForm({
                      ...contactForm,
                      relationship_strength: Number(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>
              <textarea
                placeholder="Notes"
                value={contactForm.notes || ''}
                onChange={(e) =>
                  setContactForm({ ...contactForm, notes: e.target.value })
                }
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowContactModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={saveContact}
                className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connection Modal */}
      {showConnModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Add Connection</h3>
              <button
                onClick={() => setShowConnModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <select
                value={connForm.from_contact_id}
                onChange={(e) =>
                  setConnForm({ ...connForm, from_contact_id: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">From contact...</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                value={connForm.to_contact_id}
                onChange={(e) =>
                  setConnForm({ ...connForm, to_contact_id: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">To contact...</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Intro path description"
                value={connForm.intro_path}
                onChange={(e) =>
                  setConnForm({ ...connForm, intro_path: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              <select
                value={connForm.status}
                onChange={(e) =>
                  setConnForm({ ...connForm, status: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="Pending">Pending</option>
                <option value="Requested">Requested</option>
                <option value="Intro Made">Intro Made</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Closed">Closed</option>
              </select>
              <textarea
                placeholder="Notes"
                value={connForm.notes}
                onChange={(e) =>
                  setConnForm({ ...connForm, notes: e.target.value })
                }
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowConnModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={saveConnection}
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
