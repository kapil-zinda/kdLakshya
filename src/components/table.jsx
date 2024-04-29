'use client';

import * as React from 'react';

import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import EditNoteIcon from '@mui/icons-material/EditNote';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import axios from 'axios';

import PopUpSlide from './PopUpSlide';

// function createData(name, start_time, end_time, duration, description) {
//   return { name, start_time, end_time, duration, description };
// }

export default function BasicTable({ tableData, setTableData, columnHeaders }) {
  const [rows, setRows] = React.useState(tableData);
  const [editingData, setEditingData] = React.useState(null);
  const handleDelete = (name) => {
    setRows(rows.filter((row) => row.name !== name));
  };

  const handleEdit = (rowData) => {
    setEditingData(rowData);
  };

  const handleAdd = (formData) => {
    setRows([...rows, formData]);
  };

  const handleEditSubmit = (oldName, newData) => {
    const updatedRows = rows.map((row) => {
      if (row.name === oldName) {
        return newData;
      }
      return row;
    });
    setRows(updatedRows);
    setEditingData(null);
  };

  const handleStartDayClick = async() => {
    // React.useEffect(() => {
      // const createTable = async () => {
        try {
          const url =
            'https://qwqp4upxb2s2e5snuna7sw77me0pfxnj.lambda-url.ap-south-1.on.aws/time-table';
          const Payload = {
            data: {
              type: 'time-table',
              attributes: {
                new: 'ram',
              },
            },
          };
          const res = await axios.post(url, Payload);
          setTableData(res.data.data.attributes);
          return res.status(201).json(res);
        } catch (error) {
          console.log('error during starting day', error);
        }
      // };
      // createTable();
    // }, []);
  };

  return (
    <>
      {tableData == null ? (
        <div>
          <h1>You haven't started a day, please create a day</h1>
          <button onClick={handleStartDayClick}>start a day</button>
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
                    style={{ color: 'white' , background: "pink"}}
                    key={header.label}
                    align={header.align}
                  >
                    {header.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData && tableData.table_item.map((row) => (
                <TableRow
                  key={row.name}
                  style={{ color: 'white' }}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell
                    component="th"
                    scope="row"
                    style={{ color: 'pink' }}
                  >
                    {row.title}
                  </TableCell>
                  <TableCell align="right" style={{ color: 'pink' }}>
                    {row.start}
                  </TableCell>
                  <TableCell align="right" style={{ color: 'white' }}>
                    {row.end}
                  </TableCell>
                  <TableCell align="right" style={{ color: 'white' }}>
                    {row.duration}
                  </TableCell>
                  <TableCell align="right" style={{ color: 'white' }}>
                    {row.note}
                  </TableCell>
                  <TableCell align="right" style={{ color: 'white' }}>
                    <span>
                      <EditNoteIcon onClick={() => handleEdit(row)} />
                    </span>
                    <DeleteSweepIcon onClick={() => handleDelete(row.name)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <PopUpSlide
            onAdd={handleAdd}
            onEdit={handleEditSubmit}
            editingData={editingData}
          />
        </TableContainer>
      )}
    </>
  );
}
