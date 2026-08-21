'use client';

import { useCallback, useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { DashboardWrapper } from '@/components/auth/DashboardWrapper';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useUserDataRedux } from '@/hooks/useUserDataRedux';
import { ApiService, type GalleryImage } from '@/services/api';
import { toast } from 'react-toastify';

const CLOUD_FRONT_ORG_DATA_URL = (
  process.env.NEXT_PUBLIC_OrgDataCloudFrontUrl ||
  'https://d2kwquvuus8ixo.cloudfront.net'
).replace(/\/$/, '');

const TAG_SUGGESTIONS = [
  'Events',
  'Sports',
  'Academic',
  'Cultural',
  'Infrastructure',
  'Staff',
  'Students',
  'Awards',
];

export default function GalleryManagement() {
  return (
    <DashboardWrapper allowedRoles={['admin']} redirectTo="/">
      {() => <GalleryManagementContent />}
    </DashboardWrapper>
  );
}

function GalleryManagementContent() {
  const confirm = useConfirm();
  const { userData } = useUserDataRedux();
  const orgId = userData?.orgId;

  const [photos, setPhotos] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selectedTag, setSelectedTag] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryImage | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);

  const loadPhotos = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    setLoadError(false);
    try {
      const images = await ApiService.getGalleryImages(orgId);
      setPhotos(images);
    } catch (error) {
      console.error('Failed to load gallery images:', error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  const tags = [
    'All',
    ...Array.from(
      new Set(photos.map((p) => p.tags?.[0]).filter(Boolean) as string[]),
    ),
  ];

  const filteredPhotos = photos.filter((photo) => {
    const tagMatch = selectedTag === 'All' || photo.tags?.[0] === selectedTag;
    const term = searchTerm.toLowerCase();
    const searchMatch =
      !term ||
      (photo.title || '').toLowerCase().includes(term) ||
      (photo.description || '').toLowerCase().includes(term) ||
      (photo.tags || []).some((tag) => tag.toLowerCase().includes(term));
    return tagMatch && searchMatch;
  });

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    event.target.value = '';
    if (!files || files.length === 0 || !orgId || !userData?.id) return;

    setUploading(true);
    setUploadProgress({ done: 0, total: files.length });

    let failures = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const signedUrlResponse = await ApiService.getOrgImageSignedUrl(
          userData.id,
          'gallery',
        );
        await ApiService.uploadFileToS3(
          signedUrlResponse.data.signed_url,
          file,
        );

        const imageUrl = `${CLOUD_FRONT_ORG_DATA_URL}/${signedUrlResponse.data.file_path}`;
        await ApiService.createGalleryImage(orgId, {
          image_url: imageUrl,
          title: file.name.replace(/\.[^/.]+$/, ''),
          description: '',
          tags: [],
          active: true,
        });
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        failures++;
      }
      setUploadProgress({ done: i + 1, total: files.length });
    }

    setUploading(false);
    setUploadProgress(null);
    await loadPhotos();

    if (failures > 0) {
      toast.error(
        `${files.length - failures} of ${files.length} photo(s) uploaded. ${failures} failed — please try again.`,
      );
    }
  };

  const handleToggleActive = async (photo: GalleryImage) => {
    if (!orgId) return;
    try {
      const updated = await ApiService.updateGalleryImage(orgId, photo.id, {
        active: !photo.active,
      });
      setPhotos((prev) =>
        prev.map((p) => (p.id === photo.id ? { ...p, ...updated } : p)),
      );
      setSelectedPhoto((prev) =>
        prev && prev.id === photo.id ? { ...prev, ...updated } : prev,
      );
    } catch (error) {
      console.error('Failed to update photo:', error);
      toast.error('Failed to update photo. Please try again.');
    }
  };

  const handleDelete = async (photo: GalleryImage) => {
    if (!orgId) return;
    if (!(await confirm(`Delete "${photo.title || 'this photo'}"?`))) return;
    try {
      await ApiService.deleteGalleryImage(orgId, photo.id);
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
      setSelectedPhoto(null);
    } catch (error) {
      console.error('Failed to delete photo:', error);
      toast.error('Failed to delete photo. Please try again.');
    }
  };

  const handleSaveDetails = async (
    photo: GalleryImage,
    updates: { title: string; description: string; tags: string[] },
  ) => {
    if (!orgId) return;
    try {
      const updated = await ApiService.updateGalleryImage(
        orgId,
        photo.id,
        updates,
      );
      setPhotos((prev) =>
        prev.map((p) => (p.id === photo.id ? { ...p, ...updated } : p)),
      );
      setSelectedPhoto((prev) =>
        prev && prev.id === photo.id ? { ...prev, ...updated } : prev,
      );
      toast.success('Photo details saved');
    } catch (error) {
      console.error('Failed to save photo details:', error);
      toast.error('Failed to save photo details. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:text-foreground mr-4"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </Link>
              <h1 className="text-xl font-semibold text-foreground">
                Gallery Management
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {/* Upload Photos */}
              <label
                className={`cursor-pointer flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors ${
                  uploading ? 'opacity-60 pointer-events-none' : ''
                }`}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                {uploading
                  ? `Uploading ${uploadProgress?.done ?? 0}/${uploadProgress?.total ?? 0}...`
                  : 'Upload Photos'}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Filters and Search */}
        <div className="mb-6 space-y-4">
          {tags.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Filter by Tag
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedTag === tag
                        ? 'bg-indigo-600 text-white'
                        : 'bg-muted text-foreground hover:bg-accent'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search photos by title, description, or tag..."
              className="w-full sm:max-w-md px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loadError ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Could not load the gallery right now.
            </p>
            <button
              onClick={loadPhotos}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Photos Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative group bg-card rounded-lg shadow-sm border border-border overflow-hidden hover:shadow-md transition-all duration-200"
                >
                  {/* Published Status */}
                  <div className="absolute top-2 right-2 z-10">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        photo.active
                          ? 'bg-green-500 text-white'
                          : 'bg-yellow-500 text-white'
                      }`}
                    >
                      {photo.active ? 'Published' : 'Hidden'}
                    </span>
                  </div>

                  {/* Photo */}
                  <div
                    className="relative aspect-square bg-muted overflow-hidden cursor-pointer"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <Image
                      src={photo.image_url}
                      alt={photo.title || 'Gallery photo'}
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>

                  {/* Photo Info */}
                  <div className="p-3">
                    <h4 className="text-sm font-semibold text-foreground truncate mb-1">
                      {photo.title || 'Untitled'}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {photo.description}
                    </p>
                    {photo.tags && photo.tags.length > 0 && (
                      <span className="text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-800">
                        {photo.tags[0]}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredPhotos.length === 0 && (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 mx-auto text-muted-foreground mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No photos found
                </h3>
                <p className="text-muted-foreground mb-4">
                  {photos.length === 0
                    ? 'Upload your first photo to get started'
                    : 'Try a different tag or search term'}
                </p>
                {photos.length === 0 && (
                  <label className="cursor-pointer px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 inline-block">
                    Upload Photos
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                )}
              </div>
            )}
          </>
        )}

        {/* Photo Detail Modal */}
        {selectedPhoto && (
          <PhotoDetailModal
            key={selectedPhoto.id}
            photo={selectedPhoto}
            onClose={() => setSelectedPhoto(null)}
            onToggleActive={() => handleToggleActive(selectedPhoto)}
            onDelete={() => handleDelete(selectedPhoto)}
            onSave={(updates) => handleSaveDetails(selectedPhoto, updates)}
          />
        )}
      </main>
    </div>
  );
}

function PhotoDetailModal({
  photo,
  onClose,
  onToggleActive,
  onDelete,
  onSave,
}: {
  photo: GalleryImage;
  onClose: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
  onSave: (updates: {
    title: string;
    description: string;
    tags: string[];
  }) => void;
}) {
  const [title, setTitle] = useState(photo.title || '');
  const [description, setDescription] = useState(photo.description || '');
  const [tag, setTag] = useState(photo.tags?.[0] || '');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            {photo.title || 'Untitled photo'}
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Photo Display */}
            <div className="space-y-4">
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <Image
                  src={photo.image_url}
                  alt={photo.title || 'Gallery photo'}
                  fill
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="flex items-center justify-between">
                <button
                  onClick={onToggleActive}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    photo.active
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                >
                  {photo.active
                    ? 'Hide from public gallery'
                    : 'Publish to public gallery'}
                </button>
                <button
                  onClick={onDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
                >
                  Delete Photo
                </button>
              </div>
            </div>

            {/* Photo Details */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Tag (shown as its category on the public gallery)
                </label>
                <input
                  type="text"
                  list="gallery-tag-suggestions"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g. Sports"
                />
                <datalist id="gallery-tag-suggestions">
                  {TAG_SUGGESTIONS.map((suggestion) => (
                    <option key={suggestion} value={suggestion} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Status
                </label>
                <div>
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      photo.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {photo.active ? 'Published' : 'Hidden'}
                  </span>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={() =>
                    onSave({
                      title,
                      description,
                      tags: tag ? [tag] : [],
                    })
                  }
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                >
                  Save Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
