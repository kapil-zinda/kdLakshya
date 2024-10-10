"use client"
import React, { useState } from 'react';
import { 
  FileText, 
  Folder, 
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
  Move
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface File {
  id: number;
  name: string;
  type: 'folder' | 'document' | 'spreadsheet' | 'archive';
  owner: string;
  lastModified: string;
  size: string;
  starred: boolean;
}

type SortDirection = 'asc' | 'desc';
type SortField = keyof Pick<File, 'name' | 'lastModified' | 'size'>;

const initialFiles: File[] = [
  { 
    id: 1,
    name: 'Colab Notebooks',
    type: 'folder',
    owner: 'me',
    lastModified: 'Mar 16, 2024',
    size: '-',
    starred: false
  },
  {
    id: 2,
    name: 'cover letter',
    type: 'folder',
    owner: 'me',
    lastModified: 'Mar 23, 2024',
    size: '-',
    starred: true
  },
  {
    id: 3,
    name: 'Exciting New Year Cheers to the LinkedIn F...',
    type: 'document',
    owner: 'me',
    lastModified: 'Jan 1, 2024',
    size: '1 KB',
    starred: false
  },
  {
    id: 4,
    name: '3000 Company Database by Rancike.xlsx',
    type: 'spreadsheet',
    owner: 'me',
    lastModified: 'Aug 2, 2023',
    size: '567 KB',
    starred: false
  },
  {
    id: 5,
    name: 'Annual budget',
    type: 'spreadsheet',
    owner: 'me',
    lastModified: 'Jan 1, 2024',
    size: '14 KB',
    starred: true
  }
];

const NotesTable: React.FC = () => {
  const [files, setFiles] = useState<File[]>(initialFiles);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

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

  const customSort = (a: File, b: File, field: SortField, direction: SortDirection): number => {
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
    file: File;
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

  return (
    <div className="max-w-6xl mx-auto p-4 bg-transparent text-white rounded-lg shadow">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th 
              className="py-2 px-4 text-left font-medium text-white cursor-pointer"
              onClick={() => handleSort('name')}
            >
              Name {getSortIcon('name')}
            </th>
            <th 
              className="py-2 px-4 text-left font-medium text-white cursor-pointer"
              onClick={() => handleSort('lastModified')}
            >
              Last modified {getSortIcon('lastModified')}
            </th>
            <th 
              className="py-2 px-4 text-left font-medium text-white cursor-pointer"
              onClick={() => handleSort('size')}
            >
              File size {getSortIcon('size')}
            </th>
            <th className="py-2 px-4 text-left font-medium text-white">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr key={file.id} className="hover:bg-gray-800 hover:rounded-[50%]">
              <td className="py-2 px-4 flex items-center gap-2">
                {getFileIcon(file.type)}
                <span className="text-white">{file.name}</span>
              </td>
              <td className="py-2 px-4 text-white">{file.lastModified}</td>
              <td className="py-2 px-4 text-white">{file.size}</td>
              <td className="py-2 px-4">
                <ActionButtons file={file} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NotesTable;