import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

function createData(name, start_time, end_time, duration, description) {
  return { name, start_time, end_time, duration, description };
}

const rows = [
  createData('Frozen math', 11, 6.0, 24, 'easy math'),
  createData('Ice cream chemistry', 237, 9.0, 37, "chemistry"),
  createData('Eclair physics', 262, 16.0, 24, "modest physics"),
  createData('Cupcake zoology', 305, 3.7, 67, "testing desc"),
  createData('Gingerbread botany', 356, 16.0, 49, "gingerbread cake"),
];

export default function BasicTable() {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Subject</TableCell>
            <TableCell align="right">Start Time</TableCell>
            <TableCell align="right">End Time</TableCell>
            <TableCell align="right">Duration</TableCell>
            <TableCell align="right">Description</TableCell>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
