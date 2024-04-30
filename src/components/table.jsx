'use client';

import * as React from 'react';

import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import axios from 'axios';

import EditPopup from './EditPopup';
import PopUpSlide from './PopUpSlide';

// function createData(name, start_time, end_time, duration, description) {
//   return { name, start_time, end_time, duration, description };
// }

export default function BasicTable({ tableData, setTableData, columnHeaders }) {
  const handleStartDayClick = async () => {
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
      return res;
    } catch (error) {
      console.log('error during starting day', error);
    }
  };

  return (
    <>
      {tableData == null ? (
        <div>
          <h1>You have not started a day, please create a day</h1>
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
                    style={{ color: 'white', background: 'pink' }}
                    key={header.label}
                    align={header.align}
                  >
                    {header.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData &&
                tableData.table_item.map((row, index) => (
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
                    <TableCell align="left" style={{ color: 'pink' }}>
                      {row.start}
                    </TableCell>
                    <TableCell align="left" style={{ color: 'pink' }}>
                      {row.end}
                    </TableCell>
                    {/* <TableCell align="left" style={{ color: 'pink' }}>
                    {row.duration}
                  </TableCell> */}
                    <TableCell align="left" style={{ color: 'pink' }}>
                      {row.note}
                    </TableCell>
                    <TableCell align="right" style={{ color: 'pink' }}>
                      <span>
                        <EditPopup
                          previousData={row}
                          rowNumber={index}
                          setTableData={setTableData}
                        />
                      </span>
                      {/* <DeleteSweepIcon onClick={() => handleDelete(row.name)} /> */}
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
                  {parseInt(tableData.total_min / 60)} hours{' '}
                  {tableData.total_min % 60} min
                </TableCell>
                {/* <TableCell align="left" style={{ color: 'pink' }}>
                    {row.duration}
                  </TableCell> */}
                <TableCell align="left" style={{ color: 'pink' }}></TableCell>
                <TableCell align="right" style={{ color: 'pink' }}>
                  <span>
                    {/* <EditPopup previousData={row} rowNumber={index} setTableData={setTableData}/> */}
                  </span>
                  {/* <DeleteSweepIcon onClick={() => handleDelete(row.name)} /> */}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <PopUpSlide setTableData={setTableData} />
        </TableContainer>
      )}
    </>
  );
}
