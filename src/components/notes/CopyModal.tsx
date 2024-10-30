import React, { useState } from 'react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { makeApiCall } from '@/utils/ApiRequest';
import { File, Folder, Search, X } from 'lucide-react';

interface SelectedFile {
  id: string;
  entity_name: string;
  entity_type: 'folder' | 'file';
  created_by?: string | number;
  depth?: number;
  modified_date?: number | null;
  size?: number;
  extension?: string;
  s3_key: string;
  is_active?: boolean;
  is_pinned?: boolean;
  parent_folder_name: string;
  parent_id?: string;
  workspace_id?: string;
  links?: {
    self?: string;
    [key: string]: any;
  };
  created_date?: number;
  [key: string]: any;
}

interface FileCopyPopupProps {
  onClose: () => void;
  selectedFiles: SelectedFile;
  destinations: SelectedFile[];
  onCopy: (destination: SelectedFile) => void;
  operation: string;
}

const FileCopyPopup: React.FC<FileCopyPopupProps> = ({
  onClose,
  selectedFiles,
  destinations = [],
  onCopy,
  operation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestination, setSelectedDestination] =
    useState<SelectedFile | null>(null);
  const [currentDestinations, setCurrentDestinations] =
    useState<SelectedFile[]>(destinations);
  const [loading, setLoading] = useState<boolean>(false);

  const filteredDestinations = currentDestinations.filter((dest) =>
    dest.entity_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDestinationClick = (destination: SelectedFile) => {
    if (destination.entity_type === 'file') return;
    console.log(destination);
    setSelectedDestination(destination);
    console.log(selectedDestination);
  };

  const isValidDestination = (destination: SelectedFile): boolean => {
    return destination.entity_type !== 'file';
  };

  const handleFileDoubleClick = (file: SelectedFile) => {
    setLoading(true);

    const pathParts = file.s3_key.split('/');

    const newPath =
      pathParts.length > 1 ? pathParts.slice(1).join('/') + '/' : '/';

    const fetchData = async () => {
      try {
        const result = await makeApiCall({
          path: `workspace/user-2/search?path=${newPath}`,
          method: 'GET',
        });
        setCurrentDestinations(result.data.attributes);
        setLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl bg-[#566275]">
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{operation} File</h2>
          <button
            onClick={onClose}
            className="hover:bg-gray-900 hover:text-red-500 p-1 rounded transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </CardHeader>

        <CardContent className="p-0">
          <div className="grid grid-cols-2 divide-x h-[400px]">
            {/* Left side - Selected files */}
            <div className="p-4">
              <p className="text-sm text-gray-900 mb-3">
                Files selected for {operation}.
              </p>
              <div className="space-y-2">
                <div
                  key={selectedFiles.entity_name}
                  className="flex items-center gap-2 p-2 bg-gray-500 rounded"
                >
                  <File className="h-4 w-4 text-gray-800" />
                  <div>
                    <p className="text-sm font-medium">
                      {selectedFiles.entity_name}
                    </p>
                    <p className="text-xs text-gray-800">
                      {selectedFiles.type} • {selectedFiles.size}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Destinations */}
            <div className="p-4">
              <p className="text-sm text-gray-900 mb-3">
                Select a workspace to Copy the file(s) to
              </p>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for workspace content"
                  className="w-full pl-9 pr-4 py-2 border rounded-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Loading or filtered destinations */}
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="spinner"></div> {/* Spinner */}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredDestinations.length > 0 ? (
                    filteredDestinations.map((dest) => {
                      const isFile = dest.entity_type === 'file';
                      return (
                        <div
                          key={dest.entity_name}
                          onClick={() => handleDestinationClick(dest)}
                          onDoubleClick={() => handleFileDoubleClick(dest)}
                          className={`
                            flex items-center gap-2 p-2 rounded
                            ${
                              isFile
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:bg-gray-50 cursor-pointer'
                            }
                            ${selectedDestination && String(selectedDestination.id) === String(dest.id) ? 'bg-gray-100' : 'bg-[#626882]'}
                          `}
                        >
                          {dest.entity_type === 'folder' ? (
                            <Folder className="h-4 w-4 text-gray-800" />
                          ) : (
                            <File className="h-4 w-4 text-gray-800" />
                          )}
                          <div>
                            <p className="text-sm font-medium">{dest.name}</p>
                            <p className="text-xs text-gray-800 capitalize">
                              {dest.entity_name}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex items-center gap-2 p-2 rounded">
                      empty destination
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50 hover:text-red-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => selectedDestination && onCopy(selectedDestination)}
              disabled={
                !selectedDestination || !isValidDestination(selectedDestination)
              }
              className={`
                px-4 py-2 rounded transition-colors
                ${
                  selectedDestination && isValidDestination(selectedDestination)
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-purple-200 cursor-not-allowed text-white'
                }
              `}
            >
              Copy
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FileCopyPopup;
