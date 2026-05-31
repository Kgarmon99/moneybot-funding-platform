import { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  Star,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MapPin,
  DollarSign,
  Calendar,
} from 'lucide-react';
import type { GrantAccelerator } from '../types';

const API_URL = '/api';

const STAGES = ['All', 'Pre-seed', 'Seed'];
const SECTORS = ['All', 'EdTech'];
const LOCATIONS = ['All', 'US', 'Europe', 'Asia', 'Global', 'Africa', 'MENA'];
const STATUSES = ['Not Applied', 'Applied', 'Interview', 'Accepted', 'Rejected'];

export default function Grants() {
  const [grants, setGrants] = useState<GrantAccelerator[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    stage: 'All',
    sector: 'All',
    location: 'All',
    minCheck: '',
    maxCheck: '',
    search: '',
  });
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetchGrants();
  }, []);

  async function fetchGrants() {
    try {
      const params = new URLSearchParams();
      if (filters.stage !== 'All') params.set('stage', filters.stage);
      if (filters.sector !== 'All') params.set('sector', filters.sector);
      if (filters.location !== 'All') params.set('location', filters.location);
      if (filters.minCheck) params.set('minCheck', filters.minCheck);
      if (filters.maxCheck) params.set('maxCheck', filters.maxCheck);
      const res = await fetch(`${API_URL}/grants?${params}`);
      const data = await res.json();
      setGrants(data);
    } catch (err) {
      console.error('Failed to fetch grants:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(fetchGrants, 300);
    return () => clearTimeout(timeout);
  }, [filters]);

  async function updateStatus(id: number, status: string) {
    try {
      await fetch(`${API_URL}/grants/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchGrants();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  }

  const filtered = grants.filter((g) =>
    filters.search
      ? g.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        g.organization.toLowerCase().includes(filters.search.toLowerCase())
      : true
  );

  function renderStars(score: number = 3) {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`w-4 h-4 ${
              s <= score
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
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
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Grant & Accelerator Matcher
        </h2>
        <p className="text-gray-500 mt-1">
          Discover and track funding opportunities for edtech startups
        </p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search grants and accelerators..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">Filters:</span>
          </div>
          <select
            value={filters.stage}
            onChange={(e) =>
              setFilters({ ...filters, stage: e.target.value })
            }
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
          >
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All Stages' : s}
              </option>
            ))}
          </select>
          <select
            value={filters.sector}
            onChange={(e) =>
              setFilters({ ...filters, sector: e.target.value })
            }
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
          >
            {SECTORS.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All Sectors' : s}
              </option>
            ))}
          </select>
          <select
            value={filters.location}
            onChange={(e) =>
              setFilters({ ...filters, location: e.target.value })
            }
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
          >
            {LOCATIONS.map((l) => (
              <option key={l} value={l}>
                {l === 'All' ? 'All Locations' : l}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <input
              type="number"
              placeholder="Min"
              value={filters.minCheck}
              onChange={(e) =>
                setFilters({ ...filters, minCheck: e.target.value })
              }
              className="w-24 text-sm border border-gray-300 rounded-lg px-3 py-1.5"
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxCheck}
              onChange={(e) =>
                setFilters({ ...filters, maxCheck: e.target.value })
              }
              className="w-24 text-sm border border-gray-300 rounded-lg px-3 py-1.5"
            />
          </div>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-500 mb-4">
        Showing {filtered.length} opportunities
      </p>

      {/* Grants List */}
      <div className="space-y-3">
        {filtered.map((grant) => (
          <div
            key={grant.id}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            <div
              className="p-5 cursor-pointer hover:bg-gray-50"
              onClick={() =>
                setExpandedId(expandedId === grant.id ? null : grant.id)
              }
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {grant.name}
                    </h3>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {grant.stage}
                    </span>
                    <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">
                      {grant.sector}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    {grant.organization}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-gray-600">
                      <DollarSign className="w-3.5 h-3.5" />
                      ${grant.check_size_min.toLocaleString()} - ${grant.check_size_max.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 text-gray-600">
                      <MapPin className="w-3.5 h-3.5" />
                      {grant.location}
                    </span>
                    <span className="flex items-center gap-1 text-gray-600">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(grant.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Fit Score</p>
                    {renderStars(grant.fitScore)}
                  </div>
                  {expandedId === grant.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
            </div>
            {expandedId === grant.id && (
              <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-600 mb-4">
                  {grant.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">Status:</span>
                    <select
                      value={grant.status || 'Not Applied'}
                      onChange={(e) => updateStatus(grant.id, e.target.value)}
                      className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <a
                    href={grant.apply_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 text-sm"
                  >
                    Apply
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
