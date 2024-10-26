import React, { useEffect, useState } from 'react';

import { Label } from '@/components/ui/label';
import { makeApiCall } from '@/utils/ApiRequest';
import { Download, Link, MoreVertical, Printer, X } from 'lucide-react';

interface FileObject {
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

interface CustomSwitchProps {
  checked: boolean;
  onChange: () => void;
}

const CustomSwitch: React.FC<CustomSwitchProps> = ({ checked, onChange }) => (
  <div
    className={`w-11 h-6 flex items-center rounded-full p-1 text-gray-600 cursor-pointer ${
      checked ? 'bg-violet-600' : 'bg-violet-300'
    }`}
    onClick={onChange}
  >
    <div
      className={`bg-white w-4 h-4 rounded-full shadow-md transform text-gray-600 transition-transform duration-300 ease-in-out ${
        checked ? 'translate-x-5' : ''
      }`}
    />
  </div>
);

interface FilePreviewProps {
  file: FileObject;
  onClose: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, onClose }) => {
  const [fileLink, setFileLink] = useState<string>('');
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    const fetchFileLink = async () => {
      try {
        const result = await makeApiCall({
          path: `workspace/user-2/files/${file.entity_name}?action=file_download`,
          method: 'GET',
        });
        setFileLink(result.data.links.signed_url);
      } catch (error) {
        console.error('Error fetching file link:', error);
      }
    };

    fetchFileLink();
  }, [fileLink]);

  const isImage = (extension: string) => {
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(
      extension.toLowerCase(),
    );
  };

  // Helper function to check if the file is supported by iframe
  const isIframeSupported = (extension: string) => {
    return ['pdf', 'html', 'htm', 'svg'].includes(extension.toLowerCase());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-300 w-4/5 h-4/5 rounded-lg overflow-hidden flex flex-col">
        <div className="bg-gray-500 p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            Preview - {file.entity_name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-700 hover:text-red-900"
          >
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {fileLink && file.extension ? (
            isImage(file.extension) ? (
              <img
                src={fileLink}
                alt={file.entity_name}
                className="max-w-full h-auto"
              />
            ) : isIframeSupported(file.extension) ? (
              <iframe src={fileLink} className="w-full h-full" />
            ) : (
              <div className="text-center text-gray-500 mt-10">
                Preview not available for this file type
              </div>
            )
          ) : (
            <div className="flex justify-center items-center h-full">
              <div className="spinner"></div> {/* Spinner */}
            </div>
          )}
        </div>
        <div className="bg-gray-300 p-4 flex justify-between items-center">
          <div className="flex space-x-4">
            <button className="flex items-center text-gray-600 hover:text-gray-800">
              <Download size={20} className="mr-2" />
              Download
            </button>
            <button className="flex items-center text-gray-600 hover:text-gray-800">
              <Printer size={20} className="mr-2" />
              Print
            </button>
            <div className="flex items-center space-x-2">
              <CustomSwitch
                checked={isPublic}
                onChange={() => setIsPublic(!isPublic)}
              />
              <Label htmlFor="public-private" className="text-gray-600">
                {isPublic ? 'Public' : 'Private'}
              </Label>
            </div>
            {isPublic && (
              <button className="flex items-center text-gray-600 hover:text-gray-800">
                <Link size={20} className="mr-2" /> Copy Link
              </button>
            )}
          </div>
          <button className="text-gray-600 hover:text-gray-800">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilePreview;
