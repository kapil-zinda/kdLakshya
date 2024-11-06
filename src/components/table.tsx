'use client';

import React from 'react';

import { makeApiCall } from '@/utils/ApiRequest';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import EditPopup from './EditPopup';
import PopUpSlide from './PopUpSlide';

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

interface UserCreationModalProps {
  tableData: TimeTableRecord | null;
  setTableData: React.Dispatch<React.SetStateAction<TimeTableRecord | null>>;
  columnHeaders: ColumnHeader[];
}

const getFormattedDate = () => {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const year = String(today.getFullYear()).slice(-2);

  return `${month}/${day}/${year}`;
};

const UserCreationModal: React.FC<UserCreationModalProps> = ({
  tableData,
  setTableData,
  columnHeaders,
}) => {
  const handleStartDayClick = async () => {
    try {
      const payload = {
        data: {
          type: 'time-table',
          attributes: {
            date: getFormattedDate(),
          },
        },
      };
      const result = await makeApiCall({
        path: `subject/time-table`,
        method: 'POST',
        payload,
      });
      console.log(result);
      setTableData(result.data.attributes);
    } catch (error) {
      console.error('Error during starting day', error);
    }
  };

  return (
    <>
      {!tableData ? (
        <div>
          <h1>You have not started a day, please create a day</h1>
          <button onClick={handleStartDayClick}>Start a day</button>
        </div>
      ) : (
        <TableContainer
          component={Paper}
          className="bg-background"
          style={{ color: 'white' }}
        >
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                {columnHeaders.map((header) => (
                  <TableCell
                    key={header.label}
                    align={header.align}
                    style={{ color: 'white', background: 'pink' }}
                  >
                    {header.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.table_item.map((item, index) => (
                <TableRow
                  key={`${tableData.id}-${index}`}
                  style={{ color: 'white' }}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell
                    component="th"
                    scope="row"
                    style={{ color: 'pink' }}
                  >
                    {item.title}
                  </TableCell>
                  <TableCell align="left" style={{ color: 'pink' }}>
                    {item.start}
                  </TableCell>
                  <TableCell align="left" style={{ color: 'pink' }}>
                    {item.end}
                  </TableCell>
                  <TableCell align="left" style={{ color: 'pink' }}>
                    {item.note}
                  </TableCell>
                  <TableCell align="right" style={{ color: 'pink' }}>
                    <EditPopup
                      previousData={item}
                      rowNumber={index}
                      setTableData={setTableData}
                    />
                  </TableCell>
                </TableRow>
              ))}
              <TableRow
                style={{ color: 'white' }}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row" style={{ color: 'pink' }}>
                  Duration:
                </TableCell>
                <TableCell align="left" style={{ color: 'pink' }}></TableCell>
                <TableCell align="left" style={{ color: 'pink' }}>
                  {Math.floor(tableData.total_min / 60)} hours{' '}
                  {tableData.total_min % 60} min
                </TableCell>
                <TableCell align="left" style={{ color: 'pink' }}></TableCell>
                <TableCell align="right" style={{ color: 'pink' }}></TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <PopUpSlide setTableData={setTableData} />
        </TableContainer>
      )}
    </>
  );
};

export default UserCreationModal;
