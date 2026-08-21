'use client';

import React, { useState } from 'react';

import { csvRowsToObjects, downloadCsvTemplate, parseCsv } from '@/utils/csv';
import { toast } from 'react-toastify';

export interface BulkImportResult {
  succeeded: number;
  failed: number;
  errors: Array<{ index: number; error: string }>;
}

interface BulkImportModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  /** CSV column headers, in the order the template + preview show them. */
  templateHeaders: string[];
  /** Subset of templateHeaders that must be present and non-empty per row. */
  requiredHeaders: string[];
  templateFilename: string;
  onImport: (rows: Record<string, string>[]) => Promise<BulkImportResult>;
  onSuccess: () => void;
}

export function BulkImportModal({
  title,
  open,
  onClose,
  templateHeaders,
  requiredHeaders,
  templateFilename,
  onImport,
  onSuccess,
}: BulkImportModalProps) {
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [fileName, setFileName] = useState('');
  const [rowErrors, setRowErrors] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<BulkImportResult | null>(null);

  if (!open) return null;

  const reset = () => {
    setRows([]);
    setFileName('');
    setRowErrors([]);
    setResult(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResult(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || '');
        const parsedRows = csvRowsToObjects(parseCsv(text));

        const errors: string[] = [];
        parsedRows.forEach((row, i) => {
          const missing = requiredHeaders.filter((h) => !row[h]);
          if (missing.length > 0) {
            errors.push(`Row ${i + 2}: missing ${missing.join(', ')}`);
          }
        });

        setRows(parsedRows);
        setRowErrors(errors);

        if (parsedRows.length === 0) {
          toast.error('No data rows found in this file.');
        }
      } catch (error) {
        console.error('Error parsing CSV:', error);
        toast.error('Could not read that file. Make sure it is a valid CSV.');
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (rows.length === 0) return;
    setIsImporting(true);
    try {
      const importResult = await onImport(rows);
      setResult(importResult);
      if (importResult.failed === 0) {
        toast.success(`Imported ${importResult.succeeded} record(s)!`);
        onSuccess();
      } else if (importResult.succeeded > 0) {
        toast.warning(
          `Imported ${importResult.succeeded}, ${importResult.failed} failed - see details below.`,
        );
        onSuccess();
      } else {
        toast.error('Import failed - see details below.');
      }
    } catch (error) {
      console.error('Bulk import failed:', error);
      toast.error('Import failed. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={() => {
              reset();
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-md p-4 text-sm text-blue-900">
            <p className="font-medium mb-1">How this works</p>
            <p>
              Download the template, fill in one row per person, then upload it
              here. Required columns: {requiredHeaders.join(', ')}.
            </p>
            <button
              onClick={() =>
                downloadCsvTemplate(templateFilename, templateHeaders)
              }
              className="mt-2 text-blue-700 hover:text-blue-900 font-medium underline"
            >
              Download CSV template
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload CSV file
            </label>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {fileName && (
              <p className="mt-1 text-xs text-gray-500">
                {fileName} - {rows.length} row(s) found
              </p>
            )}
          </div>

          {rowErrors.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800 max-h-32 overflow-y-auto">
              <p className="font-medium mb-1">
                {rowErrors.length} row(s) have missing required fields and will
                be skipped:
              </p>
              <ul className="list-disc list-inside">
                {rowErrors.slice(0, 10).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
                {rowErrors.length > 10 && (
                  <li>...and {rowErrors.length - 10} more</li>
                )}
              </ul>
            </div>
          )}

          {result && (
            <div
              className={`rounded-md p-3 text-sm ${
                result.failed === 0
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              <p className="font-medium">
                {result.succeeded} succeeded, {result.failed} failed out of{' '}
                {result.succeeded + result.failed}
              </p>
              {result.errors.length > 0 && (
                <ul className="list-disc list-inside mt-1 max-h-32 overflow-y-auto">
                  {result.errors.slice(0, 10).map((err, i) => (
                    <li key={i}>
                      Row {err.index + 2}: {err.error}
                    </li>
                  ))}
                  {result.errors.length > 10 && (
                    <li>...and {result.errors.length - 10} more</li>
                  )}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={() => {
              reset();
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {result ? 'Close' : 'Cancel'}
          </button>
          {!result && (
            <button
              onClick={handleImport}
              disabled={rows.length === 0 || isImporting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isImporting ? 'Importing...' : `Import ${rows.length} row(s)`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
