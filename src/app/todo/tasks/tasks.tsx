'use client';

import { useTask } from '@/context/task-context';

import { DataTable } from './components/data-table';

const Tasks = () => {
  const { tasks } = useTask() || [];

  return (
    <>
      <DataTable />
    </>
  );
};
export default Tasks;
