'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Photo {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  album: string;
  uploadDate: string;
  fileSize: string;
  dimensions: string;
  tags: string[];
  isPublished: boolean;
}

interface Album {
  id: string;
  name: string;
  description: string;
  coverPhoto: string;
  photoCount: number;
  category: string;
  createdDate: string;
}

export default function GalleryManagement() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAlbum, setSelectedAlbum] = useState('All');
  const [viewMode, setViewMode] = useState<'photos' | 'albums'>('albums');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateAlbumModal, setShowCreateAlbumModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const [albumFormData, setAlbumFormData] = useState({
    name: '',
    description: '',
    category: 'Events',
  });
  const router = useRouter();

  const categories = [
    'All',
    'Events',
    'Sports',
    'Academic',
    'Cultural',
    'Infrastructure',
    'Staff',
    'Students',
    'Awards',
    'Festivals',
    'Other',
  ];

  useEffect(() => {
    const authData = localStorage.getItem('adminAuth');
    if (!authData) {
      router.push('/admin-portal/login');
      return;
    }

    // Load sample data
    const samplePhotos: Photo[] = [
      {
        id: '1',
        title: 'Annual Sports Day 2024',
        description: 'Students participating in various sports activities',
        url: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=300&fit=crop',
        category: 'Sports',
        album: 'Sports Day 2024',
        uploadDate: '2024-01-15',
        fileSize: '2.4 MB',
        dimensions: '1920x1080',
        tags: ['sports', 'students', 'athletics'],
        isPublished: true,
      },
      {
        id: '2',
        title: 'Science Exhibition',
        description: 'Students showcasing their science projects',
        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
        category: 'Academic',
        album: 'Science Fair 2024',
        uploadDate: '2024-01-12',
        fileSize: '1.8 MB',
        dimensions: '1920x1080',
        tags: ['science', 'exhibition', 'students'],
        isPublished: true,
      },
      {
        id: '3',
        title: 'Cultural Program',
        description: 'Annual cultural celebration with dance and music',
        url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=300&fit=crop',
        category: 'Cultural',
        album: 'Cultural Night 2024',
        uploadDate: '2024-01-10',
        fileSize: '3.1 MB',
        dimensions: '1920x1080',
        tags: ['culture', 'dance', 'music'],
        isPublished: true,
      },
      {
        id: '4',
        title: 'New Library Building',
        description: 'Our newly constructed modern library facility',
        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
        category: 'Infrastructure',
        album: 'Campus Infrastructure',
        uploadDate: '2024-01-08',
        fileSize: '2.7 MB',
        dimensions: '1920x1080',
        tags: ['library', 'building', 'infrastructure'],
        isPublished: true,
      },
      {
        id: '5',
        title: 'Teachers Training Workshop',
        description: 'Professional development session for faculty',
        url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop',
        category: 'Staff',
        album: 'Faculty Development',
        uploadDate: '2024-01-05',
        fileSize: '1.9 MB',
        dimensions: '1920x1080',
        tags: ['teachers', 'training', 'workshop'],
        isPublished: true,
      },
      {
        id: '6',
        title: 'Academic Awards Ceremony',
        description: 'Recognizing student achievements and excellence',
        url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=300&fit=crop',
        category: 'Awards',
        album: 'Awards Ceremony 2024',
        uploadDate: '2024-01-03',
        fileSize: '2.2 MB',
        dimensions: '1920x1080',
        tags: ['awards', 'students', 'achievement'],
        isPublished: true,
      },
    ];

    const sampleAlbums: Album[] = [
      {
        id: '1',
        name: 'Sports Day 2024',
        description:
          'Annual sports day celebration with various athletic events',
        coverPhoto:
          'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=300&h=200&fit=crop',
        photoCount: 24,
        category: 'Sports',
        createdDate: '2024-01-15',
      },
      {
        id: '2',
        name: 'Science Fair 2024',
        description: 'Student science projects and experiments showcase',
        coverPhoto:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop',
        photoCount: 18,
        category: 'Academic',
        createdDate: '2024-01-12',
      },
      {
        id: '3',
        name: 'Cultural Night 2024',
        description: 'Traditional and modern cultural performances',
        coverPhoto:
          'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=200&fit=crop',
        photoCount: 32,
        category: 'Cultural',
        createdDate: '2024-01-10',
      },
      {
        id: '4',
        name: 'Campus Infrastructure',
        description: 'School buildings, facilities and campus views',
        coverPhoto:
          'https://images.unsplash.com/photo-1562774053-701939374585?w=300&h=200&fit=crop',
        photoCount: 15,
        category: 'Infrastructure',
        createdDate: '2024-01-08',
      },
      {
        id: '5',
        name: 'Faculty Development',
        description: 'Teacher training programs and workshops',
        coverPhoto:
          'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&h=200&fit=crop',
        photoCount: 12,
        category: 'Staff',
        createdDate: '2024-01-05',
      },
      {
        id: '6',
        name: 'Awards Ceremony 2024',
        description: 'Student recognition and achievement celebration',
        coverPhoto:
          'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=300&h=200&fit=crop',
        photoCount: 20,
        category: 'Awards',
        createdDate: '2024-01-03',
      },
    ];

    setPhotos(samplePhotos);
    setAlbums(sampleAlbums);
    setLoading(false);
  }, [router]);

  const filteredPhotos = photos.filter((photo) => {
    const categoryMatch =
      selectedCategory === 'All' || photo.category === selectedCategory;
    const albumMatch = selectedAlbum === 'All' || photo.album === selectedAlbum;
    const searchMatch =
      photo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    return categoryMatch && albumMatch && searchMatch;
  });

  const filteredAlbums = albums.filter((album) => {
    const categoryMatch =
      selectedCategory === 'All' || album.category === selectedCategory;
    const searchMatch =
      album.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      album.description.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setUploadFiles(files);
      setShowUploadModal(true);
    }
  };

  const processUpload = () => {
    if (!uploadFiles) return;

    // In a real application, you would upload files to a server
    // For demo purposes, we'll simulate the upload
    const newPhotos: Photo[] = [];

    for (let i = 0; i < uploadFiles.length; i++) {
      const file = uploadFiles[i];
      const newPhoto: Photo = {
        id: (photos.length + i + 1).toString(),
        title: file.name.split('.')[0],
        description: 'Uploaded photo',
        url: URL.createObjectURL(file), // In production, this would be the server URL
        category: 'Other',
        album: 'Uploads',
        uploadDate: new Date().toISOString().split('T')[0],
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        dimensions: '1920x1080',
        tags: [],
        isPublished: false,
      };
      newPhotos.push(newPhoto);
    }

    setPhotos((prev) => [...prev, ...newPhotos]);
    setShowUploadModal(false);
    setUploadFiles(null);
    alert(`Successfully uploaded ${newPhotos.length} photo(s)`);
  };

  const handleCreateAlbum = () => {
    if (!albumFormData.name) {
      alert('Please enter album name');
      return;
    }

    const newAlbum: Album = {
      id: (albums.length + 1).toString(),
      name: albumFormData.name,
      description: albumFormData.description,
      coverPhoto:
        'https://images.unsplash.com/photo-1562774053-701939374585?w=300&h=200&fit=crop',
      photoCount: 0,
      category: albumFormData.category,
      createdDate: new Date().toISOString().split('T')[0],
    };

    setAlbums((prev) => [...prev, newAlbum]);
    setShowCreateAlbumModal(false);
    setAlbumFormData({ name: '', description: '', category: 'Events' });
    alert('Album created successfully!');
  };

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos((prev) =>
      prev.includes(photoId)
        ? prev.filter((id) => id !== photoId)
        : [...prev, photoId],
    );
  };

  const handleBulkDelete = () => {
    if (selectedPhotos.length === 0) {
      alert('Please select photos to delete');
      return;
    }

    if (confirm(`Delete ${selectedPhotos.length} selected photo(s)?`)) {
      setPhotos((prev) =>
        prev.filter((photo) => !selectedPhotos.includes(photo.id)),
      );
      setSelectedPhotos([]);
      alert('Photos deleted successfully');
    }
  };

  const handleBulkPublish = () => {
    if (selectedPhotos.length === 0) {
      alert('Please select photos to publish');
      return;
    }

    setPhotos((prev) =>
      prev.map((photo) =>
        selectedPhotos.includes(photo.id)
          ? { ...photo, isPublished: true }
          : photo,
      ),
    );
    setSelectedPhotos([]);
    alert(`${selectedPhotos.length} photo(s) published successfully`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link
                href="/admin-portal/dashboard"
                className="text-gray-500 hover:text-gray-700 mr-4"
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
              <h1 className="text-xl font-semibold text-gray-900">
                Gallery Management
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Upload Photos */}
              <label className="cursor-pointer flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors">
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
                Upload Photos
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
              {/* Create Album */}
              <button
                onClick={() => setShowCreateAlbumModal(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Create Album
              </button>
              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('albums')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'albums'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Albums
                </button>
                <button
                  onClick={() => setViewMode('photos')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'photos'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Photos
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Filters and Search */}
        <div className="mb-6 space-y-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Search and Album Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search photos, albums, or tags..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {viewMode === 'photos' && (
              <div className="sm:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Album
                </label>
                <select
                  value={selectedAlbum}
                  onChange={(e) => setSelectedAlbum(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="All">All Albums</option>
                  {albums.map((album) => (
                    <option key={album.id} value={album.name}>
                      {album.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Bulk Actions for Photos */}
          {viewMode === 'photos' && selectedPhotos.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">
                  {selectedPhotos.length} photo(s) selected
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleBulkPublish}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                  >
                    Publish
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setSelectedPhotos([])}
                    className="px-3 py-1 bg-gray-400 text-white text-sm rounded-md hover:bg-gray-500"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content based on view mode */}
        {viewMode === 'albums' ? (
          /* Albums Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAlbums.map((album) => (
              <div
                key={album.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
                onClick={() => {
                  setSelectedAlbum(album.name);
                  setViewMode('photos');
                }}
              >
                <div className="aspect-video bg-gray-200 overflow-hidden">
                  <img
                    src={album.coverPhoto}
                    alt={album.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {album.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {album.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          album.category === 'Events'
                            ? 'bg-blue-100 text-blue-800'
                            : album.category === 'Sports'
                              ? 'bg-green-100 text-green-800'
                              : album.category === 'Academic'
                                ? 'bg-purple-100 text-purple-800'
                                : album.category === 'Cultural'
                                  ? 'bg-pink-100 text-pink-800'
                                  : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {album.category}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {album.photoCount} photos
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    Created: {new Date(album.createdDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Photos Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                className="relative group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
              >
                {/* Selection Checkbox */}
                <div className="absolute top-2 left-2 z-10">
                  <input
                    type="checkbox"
                    checked={selectedPhotos.includes(photo.id)}
                    onChange={() => togglePhotoSelection(photo.id)}
                    className="w-4 h-4 text-indigo-600 bg-white border-gray-300 rounded focus:ring-indigo-500"
                  />
                </div>

                {/* Published Status */}
                {photo.isPublished && (
                  <div className="absolute top-2 right-2 z-10">
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Published
                    </span>
                  </div>
                )}

                {/* Photo */}
                <div
                  className="aspect-square bg-gray-200 overflow-hidden cursor-pointer"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>

                {/* Photo Info */}
                <div className="p-3">
                  <h4 className="text-sm font-semibold text-gray-900 truncate mb-1">
                    {photo.title}
                  </h4>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {photo.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        photo.category === 'Events'
                          ? 'bg-blue-100 text-blue-800'
                          : photo.category === 'Sports'
                            ? 'bg-green-100 text-green-800'
                            : photo.category === 'Academic'
                              ? 'bg-purple-100 text-purple-800'
                              : photo.category === 'Cultural'
                                ? 'bg-pink-100 text-pink-800'
                                : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {photo.category}
                    </span>
                    <span className="text-xs text-gray-400">
                      {photo.fileSize}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {((viewMode === 'albums' && filteredAlbums.length === 0) ||
          (viewMode === 'photos' && filteredPhotos.length === 0)) && (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 mb-4"
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {viewMode} found
            </h3>
            <p className="text-gray-600 mb-4">
              {viewMode === 'albums'
                ? 'Create your first album to organize photos'
                : 'Upload photos or adjust your filters'}
            </p>
            {viewMode === 'albums' ? (
              <button
                onClick={() => setShowCreateAlbumModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Create Album
              </button>
            ) : (
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

        {/* Upload Photos Modal */}
        {showUploadModal && uploadFiles && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Upload Photos
                </h3>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadFiles(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
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
                <p className="text-sm text-gray-600 mb-4">
                  Ready to upload {uploadFiles.length} file(s)
                </p>
                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                  {Array.from(uploadFiles).map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <span className="text-sm text-gray-900 truncate">
                        {file.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {(file.size / (1024 * 1024)).toFixed(1)} MB
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      setUploadFiles(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={processUpload}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                  >
                    Upload Photos
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Album Modal */}
        {showCreateAlbumModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Create New Album
                </h3>
                <button
                  onClick={() => setShowCreateAlbumModal(false)}
                  className="text-gray-400 hover:text-gray-600"
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
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Album Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={albumFormData.name}
                    onChange={(e) =>
                      setAlbumFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter album name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={albumFormData.description}
                    onChange={(e) =>
                      setAlbumFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter album description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={albumFormData.category}
                    onChange={(e) =>
                      setAlbumFormData((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {categories
                      .filter((cat) => cat !== 'All')
                      .map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowCreateAlbumModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateAlbum}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
                  >
                    Create Album
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Photo Detail Modal */}
        {selectedPhoto && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedPhoto.title}
                </h3>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="text-gray-400 hover:text-gray-600"
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
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={selectedPhoto.url}
                        alt={selectedPhoto.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => {
                          setPhotos((prev) =>
                            prev.map((p) =>
                              p.id === selectedPhoto.id
                                ? { ...p, isPublished: !p.isPublished }
                                : p,
                            ),
                          );
                          setSelectedPhoto((prev) =>
                            prev
                              ? { ...prev, isPublished: !prev.isPublished }
                              : null,
                          );
                        }}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                          selectedPhoto.isPublished
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {selectedPhoto.isPublished ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this photo?')) {
                            setPhotos((prev) =>
                              prev.filter((p) => p.id !== selectedPhoto.id),
                            );
                            setSelectedPhoto(null);
                            alert('Photo deleted successfully');
                          }
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
                      >
                        Delete Photo
                      </button>
                    </div>
                  </div>

                  {/* Photo Details */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Photo Details
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Description
                          </label>
                          <p className="text-sm text-gray-900">
                            {selectedPhoto.description}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Category
                            </label>
                            <p className="text-sm text-gray-900">
                              {selectedPhoto.category}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Album
                            </label>
                            <p className="text-sm text-gray-900">
                              {selectedPhoto.album}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              File Size
                            </label>
                            <p className="text-sm text-gray-900">
                              {selectedPhoto.fileSize}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Dimensions
                            </label>
                            <p className="text-sm text-gray-900">
                              {selectedPhoto.dimensions}
                            </p>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Upload Date
                          </label>
                          <p className="text-sm text-gray-900">
                            {new Date(
                              selectedPhoto.uploadDate,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Status
                          </label>
                          <span
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              selectedPhoto.isPublished
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {selectedPhoto.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        {selectedPhoto.tags.length > 0 && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Tags
                            </label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {selectedPhoto.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
