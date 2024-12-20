'use client';

import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { WebSocketManager } from '@/app/interfaces/WebsocketManager';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { makeApiCall } from '@/utils/ApiRequest';
import { onFilesUpload } from '@/utils/fileUploadUtils';
import {
  Archive,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Edit,
  FileText,
  Folder,
  MoreVertical,
  Move,
  TableProperties,
  Trash2,
  Upload,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';

import FileCopyPopup from './CopyModal';
import FilePreview from './FilePreview';

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

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (folderName: string) => void;
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onClose,
  onCreateFolder,
}) => {
  const [folderName, setFolderName] = useState('');

  const handleCreate = () => {
    onCreateFolder(folderName);
    setFolderName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-[#152160] p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Create New Folder</h2>
        <input
          type="text"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          placeholder="Enter folder name"
          className="w-full p-2 border rounded mb-4"
        />
        <div className="flex justify-end">
          <button
            onClick={handleCreate}
            className="bg-purple-600 text-white px-4 py-2 rounded mr-2"
          >
            Create
          </button>
          <button onClick={onClose} className="bg-gray-400 px-4 py-2 rounded">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

interface FileUploadButtonProps {
  onFileUpload: (files: FileList) => void;
}

const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  onFileUpload,
}) => {
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
      <label
        htmlFor="fileInput"
        className="cursor-pointer flex items-center text-purple-600"
      >
        <Upload size={20} className="mr-2" />
        Upload Files
      </label>
    </div>
  );
};

type SortField = keyof Pick<
  FileObject,
  'entity_name' | 'modified_date' | 'size'
>;
type SortDirection = 'asc' | 'desc';

type NotesTableProps = {
  parentPath: string;
};

const NotesTable: React.FC<NotesTableProps> = ({ parentPath }) => {
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>('entity_name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [previewFile, setPreviewFile] = useState<FileObject | null>(null);
  const [fileData, setFileData] = useState<FileObject[]>([]);
  const [isCopyPopupOpen, setIsCopyPopupOpen] = useState(false);
  const [isMovePopupOpen, setIsMovePopupOpen] = useState(false);
  const [selectedCopyFile, setSelectedCopyFile] = useState<FileObject | null>(
    null,
  );

  const dateOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata',
    year: 'numeric', // 'numeric' instead of 'string'
    month: 'long', // 'long', 'short', 'narrow', 'numeric', or '2-digit'
    day: 'numeric', // 'numeric' or '2-digit'
  };

  const router = useRouter();
  const handleCall = async (newParentPath: string) => {
    router.push(`/notes/${newParentPath}/`);
  };

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

  const handleCreateFolder = async (folderName: string) => {
    console.log(`Creating folder: ${folderName}`);

    try {
      // Make API call to create the folder in your backend
      const result = await makeApiCall({
        path: `workspace/{user_key_id}/files`,
        method: 'POST',
        payload: {
          data: {
            type: 'folder',
            attributes: {
              name: folderName,
            },
          },
        },
      });

      // If folder creation is successful, update the UI
      console.log(result);

      // Generate a unique ID for the new folder
      const id = uuidv4();

      // Construct the new folder object
      const newFolder: FileObject = {
        id,
        entity_name: folderName,
        entity_type: 'folder',
        created_by: 'user_id',
        s3_key: `user-2/${parentPath}${folderName}/`,
        is_active: true,
        parent_folder_name: `user-2/${parentPath}`,
        workspace_id: 'workspace_id',
        created_date: Date.now(),
        links: {
          self: `https://your-app.com/files/${id}`,
        },
      };

      // Update the fileData state with the new folder
      setFileData((prevFileData) => [...prevFileData, newFolder]);

      // Show a success toast
      toast.success('Folder creation complete', {
        position: 'bottom-right',
        autoClose: 10000, // Display the toast for 10 seconds
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (error) {
      console.error('Error creating folder:', error);

      // Show an error toast in case of failure
      toast.error('Failed to create folder. Please try again.', {
        position: 'bottom-right',
        autoClose: 10000, // Display the toast for 10 seconds
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const useFileOperation = () => {
    const wsManager = WebSocketManager.getInstance();

    const startFileOperation = (selectedFiles: FileObject) => {
      if (!wsManager.isConnectedStatus()) {
        wsManager.connect(
          (message) => {
            console.log('Processing message in file operation:', message);

            console.log(message.action);

            toast.success(message.message, {
              position: 'bottom-right',
              autoClose: 10000, // Display the toast for 10 seconds
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });

            // Handle message actions
            if (message.action === 'WORKSPACE_MOVE_COMPLETE') {
              // Remove the selected file from fileData
              setFileData((prevFileData) =>
                prevFileData.filter(
                  (file1) => file1.s3_key !== selectedFiles.s3_key,
                ),
              );
            } else if (message.action === 'WORKSPACE_RENAME_COMPLETE') {
              // Update entity_name and remove 'operation' key
              setFileData((prevFileData) =>
                prevFileData.map((file1) =>
                  file1.s3_key === selectedFiles.s3_key
                    ? (() => {
                        const updatedFile: FileObject = {
                          ...file1,
                          entity_name: message.data.new_name,
                        };

                        // Remove the 'operation' key
                        delete updatedFile.operation;

                        return updatedFile;
                      })()
                    : file1,
                ),
              );
            } else if (message.action === 'WORKSPACE_COPY_COMPLETE') {
              console.log('in copy');
              // Remove the 'operation' key
              setFileData((prevFileData) =>
                prevFileData.map((file1) =>
                  file1.s3_key === selectedFiles.s3_key
                    ? (() => {
                        const updatedFile = { ...file1 };

                        // Remove the 'operation' key
                        delete updatedFile.operation;

                        return updatedFile;
                      })()
                    : file1,
                ),
              );
              console.log('new data');
            }
          },
          (error) => {
            console.error('Error in file operation WebSocket:', error);
          },
        );
      } else {
        throw new Error(
          'An operation is already in progress. Please wait for it to complete before starting another.',
        );
      }
    };

    return { startFileOperation };
  };

  const handleCopyOperationApply = (
    file: FileObject,
    selectedFiles: FileObject,
  ) => {
    const pathParts = file.s3_key.split('/');
    const operationId = `copy_${Date.now()}`;
    const { startFileOperation } = useFileOperation();

    const newPath =
      pathParts.length > 1 ? '/' + pathParts.slice(1).join('/') : '';

    setIsCopyPopupOpen(false);

    const copyInitiate = async () => {
      startFileOperation(selectedFiles);
      try {
        const result = await makeApiCall({
          path: `workspace/{user_key_id}/files${newPath}?source=workspace&source_workspace_id={user_key_id}`,
          method: 'POST',
          payload: {
            data: {
              id: operationId,
              type: selectedFiles.entity_type,
              attributes: {
                s3_key: selectedFiles.s3_key, // Use selectedFiles here
              },
            },
          },
        });

        console.log(result);

        setFileData((prevFileData) =>
          prevFileData.map((file1) =>
            file1.s3_key === selectedFiles.s3_key
              ? { ...file1, operation: 'workspace_copy' }
              : file1,
          ),
        );

        toast.success(result.data[0].attributes.body, {
          position: 'bottom-right',
          autoClose: 10000, // Display the toast for 10 seconds
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } catch (error) {
        console.log(error);

        toast.error(
          `Failed to perform copy operation. Please try again. \n ${error}`,
          {
            position: 'bottom-right',
            autoClose: 10000, // Display the toast for 10 seconds
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          },
        );
      }
    };

    copyInitiate();
  };

  const handleMoveOperationApply = (
    file: FileObject,
    selectedFiles: FileObject,
  ) => {
    const pathParts = file.s3_key.split('/');

    const newPath = pathParts.length > 1 ? pathParts.slice(1).join('/') : '';

    setIsMovePopupOpen(false);

    const moveInitiate = async () => {
      try {
        const result = await makeApiCall({
          path: `workspace/{user_key_id}/files/${newPath}?action=move&source_workspace_id={user_key_id}`,
          method: 'PATCH',
          payload: {
            data: {
              id: 'random',
              type: selectedFiles.entity_type,
              attributes: {
                s3_key: selectedFiles.s3_key, // Use selectedFiles here
              },
            },
          },
        });

        setFileData((prevFileData) =>
          prevFileData.map((file1) =>
            file1.s3_key === selectedFiles.s3_key
              ? { ...file1, operation: 'workspace_move' }
              : file1,
          ),
        );

        toast.success(result.data.attributes.body, {
          position: 'bottom-right',
          autoClose: 10000, // Display the toast for 10 seconds
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } catch (error) {
        console.log(error);

        toast.error('Failed to perform copy operation. Please try again.', {
          position: 'bottom-right',
          autoClose: 10000, // Display the toast for 10 seconds
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    };

    moveInitiate();
  };

  // `workspace/{user_key_id}/files/${newPath}?type=file`  DELETE

  const handleFileUpload = async (uploadedFiles: FileList) => {
    console.log(`Uploading ${uploadedFiles.length} files`);

    // Prepare an array to store file upload promises
    const uploadPromises = Array.from(uploadedFiles).map(async (file) => {
      const formData = new FormData();
      await formData.append('file', file);
      await formData.append('s3key', `user-2/${parentPath}${file.name}`);

      try {
        await onFilesUpload(formData); // Call the server-side function to upload the file
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
    const successfulUploads = results.filter((result) => result.success);

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
          s3_key: `user-2/${parentPath}${file.name}`, // Set this to the correct S3 path
          is_active: true,
          parent_folder_name: `user-2/${parentPath}`, // Or any folder name you are working with
          workspace_id: 'workspace_id', // Replace with actual workspace ID
          created_date: Date.now(),
          links: {
            self: `https://your-app.com/files/${id}`, // Link to the file in your app
          },
        };
      });

      // Update the state with the new files
      setFileData((prevFileData) => [...prevFileData, ...newFiles]);

      // Show a toast notification
      toast.success('File upload complete', {
        position: 'bottom-right',
        autoClose: 10000, // Display the toast for 10 seconds
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } else {
      // Handle partial upload failures if needed
      toast.error('Some files failed to upload', {
        position: 'bottom-right',
        autoClose: 10000,
      });
    }
  };

  // const determineFileType = (fileName: string): FileObject['type'] => {
  //   const extension = fileName.split('.').pop()?.toLowerCase();
  //   switch (extension) {
  //     case 'doc':
  //     case 'docx':
  //     case 'txt':
  //     case 'pdf':
  //       return 'document';
  //     case 'xls':
  //     case 'xlsx':
  //     case 'csv':
  //       return 'spreadsheet';
  //     case 'zip':
  //     case 'rar':
  //     case '7z':
  //       return 'archive';
  //     default:
  //       return 'document'; // Default to document for unknown types
  //   }
  // };

  // const formatFileSize = (bytes: number): string => {
  //   if (bytes === 0) return '0 Bytes';
  //   const k = 1024;
  //   const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  //   const i = Math.floor(Math.log(bytes) / Math.log(k));
  //   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  // };

  const customSort = (
    a: FileObject,
    b: FileObject,
    field: SortField,
    direction: SortDirection,
  ): number => {
    // First, prioritize folders
    if (a.type === 'folder' && b.type !== 'folder') return -1;
    if (a.type !== 'folder' && b.type === 'folder') return 1;

    // If both are folders or both are files, sort by the specified field
    if (field === 'modified_date') {
      const dateA = new Date(
        (a[field]?.toString() ?? '').replace('me', '').trim(),
      );
      const dateB = new Date(
        (b[field]?.toString() ?? '').replace('me', '').trim(),
      );
      return direction === 'asc'
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    }

    // For all other fields (including name), sort alphabetically
    return direction === 'asc'
      ? (a[field]?.toString() ?? '').localeCompare(b[field]?.toString() ?? '')
      : (b[field]?.toString() ?? '').localeCompare(a[field]?.toString() ?? '');
  };

  const handleSort = (field: SortField) => {
    const newDirection: SortDirection =
      sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);

    const sortedFiles = [...fileData].sort((a, b) =>
      customSort(a, b, field, newDirection),
    );
    setFileData(sortedFiles);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp size={16} className="inline" />
    ) : (
      <ChevronDown size={16} className="inline" />
    );
  };

  interface ActionButtonsProps {
    file: FileObject;
  }

  const handleDownloadFile = async (file: FileObject) => {
    try {
      // Make API call to get the pre-signed URL
      const result = await makeApiCall({
        path: `workspace/{user_key_id}/files/${file.entity_name}?action=file_download`,
        method: 'GET',
      });

      // Extract the signed URL from the API response
      const downloadLink = result.data.links.signed_url;

      // Trigger the file download
      if (downloadLink) {
        // Instead of creating and clicking a link, use the browser's download manager
        const response = await fetch(downloadLink);

        // Get filename from content-disposition header or use the original name
        const contentDisposition = response.headers.get('content-disposition');
        const fileName = contentDisposition
          ? contentDisposition.split('filename=')[1]?.replace(/["']/g, '')
          : file.entity_name;

        // Check if the response is ok
        if (!response.ok) throw new Error('Network response was not ok');

        // Create a download stream
        const reader = response.body?.getReader();
        const chunks: Uint8Array[] = [];

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
          }
        }

        // Combine all chunks into a single Blob
        const blob = new Blob(chunks, { type: 'application/octet-stream' });

        // Use the download attribute to trigger browser's download behavior
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = downloadUrl;
        a.download = fileName;

        // Trigger download
        document.body.appendChild(a);
        a.click();

        // Cleanup
        setTimeout(() => {
          window.URL.revokeObjectURL(downloadUrl);
          document.body.removeChild(a);
        }, 100);
      } else {
        console.error('No signed URL received from the server.');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const ActionButtons: React.FC<ActionButtonsProps> = ({ file }) => (
    <div className="flex items-center gap-1">
      {file.entity_type === 'file' ? (
        <button
          className="p-1.5 hover:bg-gray-100 rounded-full"
          onClick={() => handleDownloadFile(file)}
        >
          <Download size={18} className="text-gray-600" />
        </button>
      ) : (
        <button className="p-1.5 hover:bg-gray-100 rounded-full invisible">
          <Download size={18} className="text-gray-600" />
        </button>
      )}
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
          <DropdownMenuItem
            className="gap-2"
            onClick={() => {
              setSelectedCopyFile(file);
              setIsCopyPopupOpen(true);
            }}
          >
            <Copy size={16} /> Copy
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-2"
            onClick={() => {
              setSelectedCopyFile(file);
              setIsMovePopupOpen(true);
            }}
          >
            <Move size={16} /> Move
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
    if (file.entity_type === 'folder') {
      console.log('double click');
      const newParentPath = parentPath + file.entity_name + '/';

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
              <th
                className="py-2 px-4 text-left rounded-tl-lg cursor-pointer"
                onClick={() => handleSort('entity_name')}
              >
                Name {getSortIcon('entity_name')}
              </th>
              <th
                className="py-2 px-4 text-left cursor-pointer"
                onClick={() => handleSort('modified_date')}
              >
                Last modified {getSortIcon('modified_date')}
              </th>
              <th
                className="py-2 px-4 text-left cursor-pointer"
                onClick={() => handleSort('size')}
              >
                File size
              </th>
              <th className="py-2 px-4 text-left rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {fileData.map((file) => (
              <tr
                key={file.id}
                className={`hover:bg-[#112538] cursor-pointer ${
                  file.operation ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onDoubleClick={() => handleFileDoubleClick(file)}
              >
                <td className="py-2 px-4 flex items-center gap-2 rounded-bl-lg">
                  {file.operation ? (
                    <span className="smallspinner"></span>
                  ) : (
                    getFileIcon(file.entity_type)
                  )}
                  <span className="text-white">{file.entity_name}</span>
                </td>
                <td className="py-2 px-4">
                  {file.modified_date
                    ? new Date(
                        Number(file.modified_date) * 1000,
                      ).toLocaleDateString('en-IN', dateOptions)
                    : '--'}
                </td>
                <td className="py-2 px-4">{file.size ? file.size : '-'}</td>
                <td className="py-2 px-4 rounded-br-lg">
                  <ActionButtons file={file} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="w-full bg-[#081828] rounded-lg">
          `This space is empty, once you upload contents, they&apos;ll appear
          here.`
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

      {isCopyPopupOpen && selectedCopyFile && (
        <FileCopyPopup
          onClose={() => setIsCopyPopupOpen(false)}
          selectedFiles={selectedCopyFile}
          operation="copy"
          destinations={[
            {
              id: 'random',
              entity_name: 'notes (root)',
              entity_type: 'folder',
              s3_key: 'user-2',
              parent_folder_name: 'user-2/',
            },
          ]}
          onCopy={(destination) => {
            console.log('Copying to:', destination.name);
            handleCopyOperationApply(destination, selectedCopyFile);
          }}
        />
      )}
      {isMovePopupOpen && selectedCopyFile && (
        <FileCopyPopup
          onClose={() => setIsMovePopupOpen(false)}
          selectedFiles={selectedCopyFile}
          operation="move"
          destinations={[
            {
              id: 'random',
              entity_name: 'notes (root)',
              entity_type: 'folder',
              s3_key: 'user-2',
              parent_folder_name: 'user-2/',
            },
          ]}
          onCopy={(destination) => {
            console.log('Moving to:', destination.name);
            handleMoveOperationApply(destination, selectedCopyFile);
          }}
        />
      )}
      {/* {currentOperationId && (
        <WebSocketModal
          url="wss://websocket.testkdlakshya.uchhal.in/"
          operationId={currentOperationId}
          onOperationComplete={handleOperationComplete}
        />
      )} */}
    </div>
  );
};

export default NotesTable;
