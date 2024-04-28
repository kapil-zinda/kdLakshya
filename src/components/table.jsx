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

import PopUpSlide from './PopUpSlide';

// function createData(name, start_time, end_time, duration, description) {
//   return { name, start_time, end_time, duration, description };
// }

export default function BasicTable({ arrayData, columnHeaders }) {
  const [rows, setRows] = React.useState(arrayData);
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

  return (
    <>
      <TableContainer component={Paper} className='bg-background' style={{color: "white"}}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              {columnHeaders.map((header) => (
                <TableCell style={{color: "white"}} key={header.label} align={header.align}>
                  {header.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.name}
                style={{color: "white"}}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row" style={{color: "white"}}>
                  {row.name}
                </TableCell>
                <TableCell align="right" style={{color: "white"}}>{row.start_time}</TableCell>
                <TableCell align="right" style={{color: "white"}}>{row.end_time}</TableCell>
                <TableCell align="right" style={{color: "white"}}>{row.duration}</TableCell>
                <TableCell align="right" style={{color: "white"}}>{row.description}</TableCell>
                <TableCell align="right" style={{color: "white"}}>
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
    </>
  );
}
