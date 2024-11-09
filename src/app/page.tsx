'use client';

import { useEffect, useState } from 'react';

import HomePageComponent from '@/components/HomePageComponent';
import UserCreationModal from '@/components/table';
import { makeApiCall } from '@/utils/ApiRequest';
import { getItemWithTTL } from '@/utils/customLocalStorageWithTTL';

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

  const bearerToken = getItemWithTTL('bearerToken');

  return (
    <>
      {bearerToken ? (
        <UserCreationModal
          tableData={tableData}
          setTableData={setTableData}
          columnHeaders={columnHeaders}
        />
      ) : (
        <HomePageComponent />
      )}
      {/* <ContactUs /> */}
    </>
  );
}
