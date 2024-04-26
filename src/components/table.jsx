"use client"
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

function createData(name, start_time, end_time, duration, description) {
  return { name, start_time, end_time, duration, description };
}

export default function BasicTable() {
  const [rows, setRows] = React.useState([
    createData('Frozen math', 11, 6.0, 24, 'easy math'),
    createData('Ice cream chemistry', 237, 9.0, 37, 'chemistry'),
    createData('Eclair physics', 262, 16.0, 24, 'modest physics'),
    createData('Cupcake zoology', 305, 3.7, 67, 'testing desc'),
    createData('Gingerbread botany', 356, 16.0, 49, 'gingerbread cake'),
  ]);
  const [editingData, setEditingData] = React.useState(null);

  const handleDelete = (name) => {
    setRows(rows.filter(row => row.name !== name));
  };

  const handleEdit = (rowData) => {
    setEditingData(rowData);
  };

  const handleAdd = (formData) => {
    setRows([...rows, formData]);
  };

  const handleEditSubmit = (oldName, newData) => {
    const updatedRows = rows.map(row => {
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
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Subject</TableCell>
            <TableCell align="right">Start Time</TableCell>
            <TableCell align="right">End Time</TableCell>
            <TableCell align="right">Duration</TableCell>
            <TableCell align="right">Description</TableCell>
            <TableCell align="right">Function</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.name}
              </TableCell>
              <TableCell align="right">{row.start_time}</TableCell>
              <TableCell align="right">{row.end_time}</TableCell>
              <TableCell align="right">{row.duration}</TableCell>
              <TableCell align="right">{row.description}</TableCell>
              <TableCell align="right">
                <span>
                  <EditNoteIcon onClick={() => handleEdit(row)} />
                </span>
                <DeleteSweepIcon onClick={() => handleDelete(row.name)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <PopUpSlide onAdd={handleAdd} onEdit={handleEditSubmit} editingData={editingData} />
    </TableContainer>
   </>
  );
}