'use client';

import { useEffect, useState } from 'react';

import UserCreationModal from '@/components/table';
import { makeApiCall } from '@/utils/ApiRequest';

interface TableItem {
  title: string;
  start: string;
  end: string;
  note: string;
}

interface TimeTableRecord {
  date: string;
  id: string;
  is_finished: boolean;
  table_item: TableItem[];
  total_min: number;
  user_id: string;
}

interface ColumnHeader {
  label: string;
  align: 'left' | 'right' | 'center';
}

export default function Home() {
  const [tableData, setTableData] = useState<TimeTableRecord | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await makeApiCall({
          path: `subject/time-table`,
          method: 'GET',
        });
        setTableData(result.data.attributes);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);
  const columnHeaders: ColumnHeader[] = [
    { label: 'Subject', align: 'left' },
    { label: 'Start Time', align: 'left' },
    { label: 'End Time', align: 'left' },
    { label: 'Description', align: 'left' },
    { label: 'Edit', align: 'right' },
  ];

  return (
    <>
      <span className="font-bold text-4xl">Home</span>
      <UserCreationModal
        tableData={tableData}
        setTableData={setTableData}
        columnHeaders={columnHeaders}
      />
    </>
  );
}
