"use client"

import React, { useEffect, useState } from 'react';
import {
  Folder,
  Upload,
  FileText,
  TableProperties,
  Archive,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Share2,
  Download,
  Edit,
  Star,
  Trash2,
  Info,
  Copy,
  Move,
  Printer,
  X,
  Link
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { makeApiCall } from "@/utils/ApiRequest";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import { onFilesUpload } from '@/utils/fileUploadUtils';

interface CustomSwitchProps {
  checked: boolean;
  onChange: () => void;
}

const CustomSwitch: React.FC<CustomSwitchProps> = ({ checked, onChange }) => (
  <div
    className={`w-11 h-6 flex items-center rounded-full p-1 text-gray-600 cursor-pointer ${checked ? 'bg-violet-600' : 'bg-violet-300'
      }`}
    onClick={onChange}
  >
    <div
      className={`bg-white w-4 h-4 rounded-full shadow-md transform text-gray-600 transition-transform duration-300 ease-in-out ${checked ? 'translate-x-5' : ''
        }`}
    />
  </div>
);

interface FilePreviewProps {
  file: FileObject;
  onClose: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, onClose }) => {
  const [isPublic, setIsPublic] = useState(false);

  if (!file.file) {
    return null; // or show an error message
  }

  const fileUrl = URL.createObjectURL(file.file);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-300 w-4/5 h-4/5 rounded-lg overflow-hidden flex flex-col">
        <div className="bg-gray-500 p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Preview - {file.name}</h2>
          <button onClick={onClose} className="text-gray-700 hover:text-red-900">
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {file.file.type.startsWith('image/') ? (
            <img src={fileUrl} alt={file.name} className="max-w-full h-auto" />
          ) : file.file.type === 'application/pdf' ? (
            <iframe src={fileUrl} className="w-full h-full" />
          ) : (
            <div className="text-center text-gray-500 mt-10">
              Preview not available for this file type
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
              <Label htmlFor="public-private" className='text-gray-600'>
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

interface FileItem {
  id: number;
  name: string;
  type: 'folder' | 'document' | 'spreadsheet' | 'archive';
  owner: string;
  lastModified: string;
  size: string;
  starred: boolean;
  file?: File; // Add this to store the actual File object
}

interface FileObject {
  id: string;
  entity_name: string;
  entity_type: "folder" | "file";
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

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (folderName: string) => void;
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({ isOpen, onClose, onCreateFolder }) => {
  const [folderName, setFolderName] = useState('');

  const handleCreate = () => {
    onCreateFolder(folderName);
    setFolderName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Create New Folder</h2>
        <input
          type="text"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          placeholder="Enter folder name"
          className="w-full p-2 border rounded mb-4"
        />
        <div className="flex justify-end">
          <button onClick={handleCreate} className="bg-purple-600 text-white px-4 py-2 rounded mr-2">Create</button>
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
        </div>
      </div>
    </div>
  );
};

interface FileUploadButtonProps {
  onFileUpload: (files: FileList) => void;
}

const FileUploadButton: React.FC<FileUploadButtonProps> = ({ onFileUpload }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      onFileUpload(files);
    }
  };

  return (
    <div>
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        style={{ display: 'none' }}
        id="fileInput"
      />
      <label htmlFor="fileInput" className="cursor-pointer flex items-center text-purple-600">
        <Upload size={20} className="mr-2" />
        Upload Files
      </label>
    </div>
  );
};

type SortField = keyof Pick<FileItem, 'name' | 'lastModified' | 'size'>;
type SortDirection = 'asc' | 'desc';


type NotesTableProps = {
	parentPath:string,
};

const NotesTable: React.FC<NotesTableProps> = ({parentPath}) =>  {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [previewFile, setPreviewFile] = useState<FileObject | null>(null);
  const [fileData, setFileData] = useState<FileObject[]>([]);
  const dateOptions = { timeZone: 'Asia/Kolkata', year: "numeric", month: 'long', day: 'numeric' };

  const router = useRouter();
  const handleCall = async(newParentPath: string) => {
    router.push(`/notes/${newParentPath}/`);
  }
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await makeApiCall({
          path: `workspace/user-2/search?path=${parentPath}`,
          method: 'GET',
        });
        setFileData(result.data.attributes);
      } catch (error) {
        console.log(error);
      }
    };
  
    fetchData();
  }, []);

  const getFileIcon = (type: File['type']) => {
    switch (type) {
      case 'folder':
        return <Folder className="text-blue-500" size={20} />;
      case 'spreadsheet':
        return <TableProperties className="text-green-600" size={20} />;
      case 'archive':
        return <Archive className="text-gray-600" size={20} />;
      default:
        return <FileText className="text-blue-400" size={20} />;
    }
  };

  const handleCreateFolder = (folderName: string) => {
    // Implement folder creation logic here
    console.log(`Creating folder: ${folderName}`);
    // Update files state with new folder
    setFiles(prevFiles => [
      ...prevFiles,
      {
        id: Date.now(),
        name: folderName,
        type: 'folder',
        owner: 'me',
        lastModified: new Date().toLocaleDateString(),
        size: '-',
        starred: false
      }
    ]);
  };

  const handleFileUpload = async (uploadedFiles: FileList) => {
    console.log(`Uploading ${uploadedFiles.length} files`);
  
    // Prepare an array to store file upload promises
    const uploadPromises = Array.from(uploadedFiles).map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
  
      try {
        await onFilesUpload(formData);  // Call the server-side function to upload the file
        console.log(`File ${file.name} uploaded successfully.`);
        return { success: true, file };
      } catch (error) {
        console.error(`Failed to upload file ${file.name}:`, error);
        return { success: false, file };
      }
    });
  
    // Wait for all uploads to complete
    const results = await Promise.all(uploadPromises);
  
    // Check if all files were uploaded successfully
    const successfulUploads = results.filter(result => result.success);
  
    if (successfulUploads.length === uploadedFiles.length) {
      // If all files were uploaded, update the UI
      const newFiles: FileObject[] = successfulUploads.map(({ file }) => {
        const id = uuidv4(); // Generate a UUID for each file
        const extension = file.name.split('.').pop()?.toLowerCase() || '';
        const fileSize = file.size;
  
        return {
          id,
          entity_name: file.name,
          entity_type: 'file',
          created_by: 'user_id', // Replace with actual user ID
          modified_date: Date.now(),
          size: fileSize,
          extension,
          s3_key: `s3/path/to/${file.name}`, // Set this to the correct S3 path
          is_active: true,
          parent_folder_name: 'root', // Or any folder name you are working with
          workspace_id: 'workspace_id', // Replace with actual workspace ID
          created_date: Date.now(),
          links: {
            self: `https://your-app.com/files/${id}`, // Link to the file in your app
          },
        };
      });
  
      // Update the state with the new files
      setFileData(prevFileData => [...prevFileData, ...newFiles]);
  
      // Show a toast notification
      toast.success("File upload complete", {
        position: "bottom-right",
        autoClose: 10000,  // Display the toast for 10 seconds
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } else {
      // Handle partial upload failures if needed
      toast.error("Some files failed to upload", {
        position: "bottom-right",
        autoClose: 10000,
      });
    }
  };

  const determineFileType = (fileName: string): FileItem['type'] => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'doc':
      case 'docx':
      case 'txt':
      case 'pdf':
        return 'document';
      case 'xls':
      case 'xlsx':
      case 'csv':
        return 'spreadsheet';
      case 'zip':
      case 'rar':
      case '7z':
        return 'archive';
      default:
        return 'document'; // Default to document for unknown types
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const customSort = (a: FileItem, b: FileItem, field: SortField, direction: SortDirection): number => {
    // First, prioritize folders
    if (a.type === 'folder' && b.type !== 'folder') return -1;
    if (a.type !== 'folder' && b.type === 'folder') return 1;

    // If both are folders or both are files, sort by the specified field
    if (field === 'lastModified') {
      const dateA = new Date(a[field].replace('me', '').trim());
      const dateB = new Date(b[field].replace('me', '').trim());
      return direction === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    }

    // For all other fields (including name), sort alphabetically
    return direction === 'asc' ?
      a[field].toString().localeCompare(b[field].toString()) :
      b[field].toString().localeCompare(a[field].toString());
  };

  const handleSort = (field: SortField) => {
    const newDirection: SortDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);

    const sortedFiles = [...files].sort((a, b) => customSort(a, b, field, newDirection));
    setFiles(sortedFiles);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ?
      <ChevronUp size={16} className="inline" /> :
      <ChevronDown size={16} className="inline" />;
  };

  interface ActionButtonsProps {
    file: FileObject;
  }

  const ActionButtons: React.FC<ActionButtonsProps> = ({ file }) => (
    <div className="flex items-center gap-1">
      <button className="p-1.5 hover:bg-gray-100 rounded-full">
        <Download size={18} className="text-gray-600" />
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-1.5 hover:bg-gray-100 rounded-full">
            <MoreVertical size={18} className="text-gray-600" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem className="gap-2">
            <Edit size={16} /> Rename
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2">
            <Copy size={16} /> Copy
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2">
            <Move size={16} /> Move
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2">
            <Info size={16} /> View details
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 text-red-600">
            <Trash2 size={16} /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  const handleFileDoubleClick = (file: FileObject) => {
    // Check if the file is a folder
    console.log(file)
    console.log(file.entity_type === "folder")
    if (file.entity_type === "folder") {
      console.log("double click")
      const newParentPath = parentPath + file.entity_name + "/";

      handleCall(newParentPath);
    } else {
      // If it's not a folder, set it as a preview file
      setPreviewFile(file);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 bg-[#061422] rounded-lg shadow">
      <div className="flex justify-between mb-4">
        <button
          onClick={() => setIsCreateFolderModalOpen(true)}
          className="flex items-center text-purple-600"
        >
          <Folder size={20} className="mr-2" />
          Create Folder
        </button>
        <FileUploadButton onFileUpload={handleFileUpload} />
      </div>

      {fileData.length > 0 ? (
        <table className="w-full bg-[#081828] rounded-lg">
        <thead>
          <tr className="bg-[#092030]">
            <th className="py-2 px-4 text-left rounded-tl-lg cursor-pointer" onClick={() => handleSort('name')}>
              Name {getSortIcon('name')}
            </th>
            <th className="py-2 px-4 text-left cursor-pointer" onClick={() => handleSort('lastModified')}>
              Last modified {getSortIcon('lastModified')}
            </th>
            <th className="py-2 px-4 text-left cursor-pointer" onClick={() => handleSort('size')}>File size</th>
            <th className="py-2 px-4 text-left rounded-tr-lg">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {fileData.map((file) => (
            <tr key={file.id} className="hover:bg-[#112538] cursor-pointer"
              onDoubleClick={() => handleFileDoubleClick(file)}>
              <td className="py-2 px-4 flex items-center gap-2 rounded-bl-lg">
                {getFileIcon(file.entity_type)}
                <span className="text-white">{file.entity_name}</span>
              </td>
              <td className="py-2 px-4">{file.modified_date ? new Date(Number(file.modified_date) * 1000).toLocaleDateString('en-IN', dateOptions) : "--"}</td>
              <td className="py-2 px-4">{file.size ? file.size : "-"}</td>
              <td className="py-2 px-4 rounded-br-lg">
                <ActionButtons file={file} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      ):(
        <div className="w-full bg-[#081828] rounded-lg">
          This space is empty, once you upload contents, they'll appear here.
        </div>
      )}

      <CreateFolderModal
        isOpen={isCreateFolderModalOpen}
        onClose={() => setIsCreateFolderModalOpen(false)}
        onCreateFolder={handleCreateFolder}
      />

      {previewFile && (
        <FilePreview file={previewFile} onClose={() => setPreviewFile(null)} />
      )}
    </div>
  );
};

export default NotesTable;