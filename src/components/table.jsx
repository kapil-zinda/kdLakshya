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

const BaseURL = process.env.BaseURL;
export default function BasicTable({ tableData, setTableData, columnHeaders }) {
  const handleStartDayClick = async () => {
    try {
      const Payload = {
        data: {
          type: 'time-table',
          attributes: {
            new: 'ram',
          },
        },
      };
      const res = await axios.post(BaseURL + "time-table", Payload);
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
                    style={{ color: 'white'}}
                    className=' bg-background'
                    key={header.label}
                    align={header.align}
                  >
                    {header.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody className=' bg-background'>
              {tableData &&
                tableData.table_item.map((row, index) => (
                  <TableRow
                    key={index}
                    className='bg-background'
                    style={{ color: 'white' }}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell
                    className=' bg-background'
                      component="th"
                      scope="row"
                      style={{ color: 'white' }}
                    >
                      {row.title}
                    </TableCell>
                    <TableCell align="left" style={{ color: 'white' }}>
                      {row.start}
                    </TableCell>
                    <TableCell align="left" style={{ color: 'white' }}>
                      {row.end}
                    </TableCell>
                    {/* <TableCell align="left" style={{ color: 'white' }}>
                    {row.duration}
                  </TableCell> */}
                    <TableCell align="left" style={{ color: 'white' }}>
                      {row.note}
                    </TableCell>
                    <TableCell align="right" style={{ color: 'white' }}>
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
                <TableCell component="th" scope="row" style={{ color: 'white' }}>
                  Duration:
                </TableCell>
                <TableCell align="left" style={{ color: 'white' }}></TableCell>
                <TableCell align="left" style={{ color: 'white' }}>
                  {parseInt(tableData.total_min / 60)} hours{' '}
                  {tableData.total_min % 60} min
                </TableCell>
                {/* <TableCell align="left" style={{ color: 'white' }}>
                    {row.duration}
                  </TableCell> */}
                <TableCell align="left" style={{ color: 'white' }}></TableCell>
                <TableCell align="right" style={{ color: 'white' }}>
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
