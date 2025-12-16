'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Upload,
  Trash2,
  Image as ImageIcon,
  X,
  Check,
  Loader2,
  Search,
  FolderOpen,
} from 'lucide-react';

interface Media {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  alt?: string;
  caption?: string;
  folder: string;
  createdAt: string;
}

interface MediaLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (media: Media) => void;
  multiple?: boolean;
}

export default function MediaLibrary({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
}: MediaLibraryProps) {
  const [media, setMedia] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [folder, setFolder] = useState('');
  const [search, setSearch] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const fetchMedia = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (folder) params.set('folder', folder);

      const res = await fetch(`/api/admin/media?${params}`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setMedia(data.media);
      }
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setIsLoading(false);
    }
  }, [folder]);

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen, fetchMedia]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadFiles(Array.from(e.target.files));
    }
  };

  const uploadFiles = async (files: File[]) => {
    setIsUploading(true);

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder || 'general');

      try {
        const res = await fetch('/api/admin/media', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });
        const data = await res.json();
        if (data.success) {
          setMedia((prev) => [data.media, ...prev]);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }

    setIsUploading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce fichier ?')) return;

    try {
      const res = await fetch(`/api/admin/media/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setMedia((prev) => prev.filter((m) => m.id !== id));
        selectedIds.delete(id);
        setSelectedIds(new Set(selectedIds));
      }
    } catch (error) {
      console.error('Error deleting media:', error);
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      if (!multiple) {
        newSelected.clear();
      }
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleConfirmSelection = () => {
    if (onSelect && selectedIds.size > 0) {
      const selectedMedia = media.find((m) => selectedIds.has(m.id));
      if (selectedMedia) {
        onSelect(selectedMedia);
      }
    }
    onClose();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const filteredMedia = media.filter((m) =>
    m.originalName.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ImageIcon className="w-6 h-6" />
            Bibliothèque de médias
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b flex items-center gap-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff6b35]/20 focus:border-[#ff6b35] outline-none"
            />
          </div>
          <select
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff6b35]/20 focus:border-[#ff6b35] outline-none"
          >
            <option value="">Tous les dossiers</option>
            <option value="articles">Articles</option>
            <option value="vlogs">Vlogs</option>
            <option value="general">Général</option>
          </select>
          <label className="px-4 py-2 bg-gradient-to-r from-[#ff6b35] to-[#ff3d7f] text-white rounded-lg cursor-pointer hover:opacity-90 transition-opacity flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Télécharger
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Content */}
        <div
          className={`flex-1 overflow-y-auto p-4 ${
            dragActive ? 'bg-[#ff6b35]/10' : ''
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-[#ff6b35]" />
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <FolderOpen className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-lg font-medium">Aucun média</p>
              <p className="text-sm">Glissez-déposez des fichiers ici ou cliquez sur Télécharger</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredMedia.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleSelect(item.id)}
                  className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                    selectedIds.has(item.id)
                      ? 'border-[#ff6b35] ring-2 ring-[#ff6b35]/20'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img
                    src={item.url}
                    alt={item.alt || item.originalName}
                    className="w-full h-full object-cover"
                  />
                  {selectedIds.has(item.id) && (
                    <div className="absolute top-2 left-2 w-6 h-6 bg-[#ff6b35] rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                    <p className="text-white text-xs truncate">{item.originalName}</p>
                    <p className="text-white/70 text-xs">{formatFileSize(item.size)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isUploading && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 flex items-center gap-4">
                <Loader2 className="w-6 h-6 animate-spin text-[#ff6b35]" />
                <span>Téléchargement en cours...</span>
              </div>
            </div>
          )}

          {dragActive && (
            <div className="absolute inset-4 border-2 border-dashed border-[#ff6b35] rounded-xl flex items-center justify-center bg-[#ff6b35]/10 pointer-events-none">
              <div className="text-center">
                <Upload className="w-12 h-12 text-[#ff6b35] mx-auto mb-2" />
                <p className="text-[#ff6b35] font-medium">Déposez vos fichiers ici</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {onSelect && (
          <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {selectedIds.size} fichier(s) sélectionné(s)
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmSelection}
                disabled={selectedIds.size === 0}
                className="px-4 py-2 bg-gradient-to-r from-[#ff6b35] to-[#ff3d7f] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Sélectionner
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
