import { useEffect, useState, useRef } from 'react';
import {
  Upload,
  FolderOpen,
  FileText,
  Lock,
  Eye,
  Copy,
  Trash2,
  X,
  Folder,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import type { DataRoomDocument, DocumentView } from '../types';

const API_URL = '/api';

const FOLDERS = ['Pitch Materials', 'Financials', 'Legal', 'Metrics', 'Product', 'Uncategorized'];

export default function DataRoom() {
  const [documents, setDocuments] = useState<DataRoomDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(FOLDERS));
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFolder, setUploadFolder] = useState('Uncategorized');
  const [selectedDoc, setSelectedDoc] = useState<DataRoomDocument | null>(null);
  const [docViews, setDocViews] = useState<DocumentView[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    try {
      const res = await fetch(`${API_URL}/documents`);
      const data = await res.json();
      setDocuments(data);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', uploadFolder);
    try {
      await fetch(`${API_URL}/documents/upload`, {
        method: 'POST',
        body: formData,
      });
      setShowUpload(false);
      fetchDocuments();
    } catch (err) {
      console.error('Failed to upload:', err);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this document?')) return;
    try {
      await fetch(`${API_URL}/documents/${id}`, { method: 'DELETE' });
      fetchDocuments();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  }

  async function loadDocViews(docId: number) {
    try {
      const res = await fetch(`${API_URL}/documents/${docId}/views`);
      const data = await res.json();
      setDocViews(data);
    } catch (err) {
      console.error('Failed to load views:', err);
    }
  }

  function toggleFolder(folder: string) {
    const next = new Set(expandedFolders);
    if (next.has(folder)) {
      next.delete(folder);
    } else {
      next.add(folder);
    }
    setExpandedFolders(next);
  }

  function copyLink(link: string, password?: string) {
    const text = password
      ? `Link: ${window.location.origin}/share/${link}\nPassword: ${password}`
      : `${window.location.origin}/share/${link}`;
    navigator.clipboard.writeText(text);
    alert('Link copied to clipboard!');
  }

  const docsByFolder: Record<string, DataRoomDocument[]> = {};
  for (const folder of FOLDERS) {
    docsByFolder[folder] = documents.filter((d) => d.folder === folder);
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
            Investor Data Room
          </h2>
          <p className="text-gray-500 mt-1">
            Organize and share documents with investors
          </p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          <Upload className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Folder Tree */}
        <div className="col-span-1 bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            Folders
          </h3>
          <div className="space-y-1">
            {FOLDERS.map((folder) => (
              <div key={folder}>
                <button
                  onClick={() => toggleFolder(folder)}
                  className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm ${
                    selectedFolder === folder
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {expandedFolders.has(folder) ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                  <Folder className="w-4 h-4" />
                  <span className="flex-1 text-left">{folder}</span>
                  <span className="text-xs text-gray-400">
                    {docsByFolder[folder]?.length || 0}
                  </span>
                </button>
                {expandedFolders.has(folder) && (
                  <div className="ml-6 space-y-0.5">
                    {docsByFolder[folder]?.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => {
                          setSelectedDoc(doc);
                          loadDocViews(doc.id);
                        }}
                        className={`flex items-center gap-2 w-full px-3 py-1.5 rounded text-xs ${
                          selectedDoc?.id === doc.id
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <FileText className="w-3 h-3" />
                        <span className="truncate">{doc.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Document Details */}
        <div className="col-span-3">
          {selectedDoc ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedDoc.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedDoc.folder} •{' '}
                    {(selectedDoc.file_size / 1024 / 1024).toFixed(2)} MB •{' '}
                    Uploaded {new Date(selectedDoc.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      copyLink(
                        selectedDoc.shareable_link || '',
                        selectedDoc.password
                      )
                    }
                    className="flex items-center gap-2 border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy Link
                  </button>
                  <button
                    onClick={() => handleDelete(selectedDoc.id)}
                    className="flex items-center gap-2 border border-red-200 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 text-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>

              {/* Share Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Shareable Link
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <code className="bg-white px-3 py-1.5 rounded border text-gray-600">
                    {window.location.origin}/share/{selectedDoc.shareable_link}
                  </code>
                  {selectedDoc.password && (
                    <span className="text-gray-500">
                      Password:{' '}
                      <span className="font-mono text-gray-700">
                        {selectedDoc.password}
                      </span>
                    </span>
                  )}
                </div>
              </div>

              {/* Views */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  View History ({docViews.length} views)
                </h4>
                {docViews.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 text-gray-500 font-medium">
                          Viewer
                        </th>
                        <th className="text-left py-2 text-gray-500 font-medium">
                          Date
                        </th>
                        <th className="text-left py-2 text-gray-500 font-medium">
                          IP Address
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {docViews.map((v) => (
                        <tr key={v.id} className="border-b border-gray-100">
                          <td className="py-2">
                            {v.viewer_email || 'Anonymous'}
                          </td>
                          <td className="py-2">
                            {new Date(v.viewed_at).toLocaleString()}
                          </td>
                          <td className="py-2 text-gray-500">
                            {v.ip_address || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-sm text-gray-500">
                    No views yet. Share the link to track access.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                Select a document
              </h3>
              <p className="text-gray-500">
                Click on a document from the folder tree to view details and
                sharing options.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Upload Document</h3>
              <button
                onClick={() => setShowUpload(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Folder
                </label>
                <select
                  value={uploadFolder}
                  onChange={(e) => setUploadFolder(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  {FOLDERS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Click to select a file or drag and drop
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleUpload(e.target.files[0]);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
