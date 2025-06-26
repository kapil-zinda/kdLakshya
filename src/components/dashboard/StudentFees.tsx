'use client';

import React from 'react';

import { dummyStudentFee } from '@/data/studentDashboardDummyData';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import { Button } from '../ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

// Add global styles for print media
const printStyles = `
  @media print {
    /* Hide UI elements */
    .no-print {
      display: none !important;
    }

    /* Show only print content */
    .print-only {
      display: block !important;
      padding: 20px !important;
      margin: 0 !important;
      width: 100% !important;
      background: white !important;
    }

    /* Reset colors for printing */
    .print-only * {
      color: black !important;
      background: white !important;
      border-color: black !important;
    }

    /* Ensure tables print properly */
    table {
      width: 100% !important;
      border-collapse: collapse !important;
    }

    th, td {
      border: 1px solid black !important;
      padding: 8px !important;
      text-align: left !important;
    }

    /* Hide specific UI elements */
    nav, 
    header,
    footer,
    .sidebar,
    .navigation,
    button,
    select {
      display: none !important;
    }

    /* Reset page margins */
    @page {
      margin: 2cm;
    }

    /* Ensure text is readable */
    body {
      background: white !important;
      color: black !important;
    }
  }
`;

const StudentFees: React.FC = () => {
  // Get fee data
  const feeData = dummyStudentFee;

  // Prepare fee structure chart data
  const feeStructureChartData = [
    {
      name: 'Tuition Fee',
      value: feeData.feeStructure.tuitionFee,
      color: '#4CAF50',
    },
    {
      name: 'Development Fee',
      value: feeData.feeStructure.developmentFee,
      color: '#2196F3',
    },
    {
      name: 'Exam Fee',
      value: feeData.feeStructure.examFee,
      color: '#FFC107',
    },
    {
      name: 'Transport Fee',
      value: feeData.feeStructure.transportFee,
      color: '#9C27B0',
    },
    {
      name: 'Library Fee',
      value: feeData.feeStructure.libraryFee,
      color: '#F44336',
    },
    {
      name: 'Other Fees',
      value: feeData.feeStructure.otherFees,
      color: '#FF9800',
    },
  ];

  // Prepare payment status chart data
  const paymentStatusChartData = [
    {
      name: 'Paid',
      value: feeData.totalPaid,
      color: '#4CAF50',
    },
    {
      name: 'Due',
      value: feeData.totalDue,
      color: '#F44336',
    },
  ];

  // Function to handle printing
  const handlePrint = () => {
    window.print();
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-2 rounded shadow-md">
          <p className="text-white">{`${payload[0].name}: ₹${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      {/* Add print styles */}
      <style>{printStyles}</style>

      {/* UI Controls - Hidden during print */}
      <div className="no-print">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Fee Details</h2>
          <Button onClick={handlePrint}>Print</Button>
        </div>

        {/* Fee Summary */}
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h3 className="text-xl font-semibold mb-4">
            Fee Summary - {feeData.academicYear}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-1">Total Fee</h4>
              <p className="text-2xl font-bold">
                ₹{feeData.feeStructure.totalFee}
              </p>
            </div>
            <div className="bg-green-700 p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-1">Total Paid</h4>
              <p className="text-2xl font-bold">₹{feeData.totalPaid}</p>
            </div>
            <div className="bg-red-700 p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-1">Total Due</h4>
              <p className="text-2xl font-bold">₹{feeData.totalDue}</p>
            </div>
          </div>
        </div>

        {/* Fee Structure and Payment Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Fee Structure Chart */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Fee Structure</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={feeStructureChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    percent,
                    index,
                  }) => {
                    const RADIAN = Math.PI / 180;
                    const radius =
                      25 + innerRadius + (outerRadius - innerRadius);
                    const x = cx + radius * Math.cos(-midAngle * RADIAN) * 0.8;
                    const y = cy + radius * Math.sin(-midAngle * RADIAN) * 0.8;

                    return (
                      <text
                        x={x}
                        y={y}
                        fill={feeStructureChartData[index].color}
                        textAnchor={x > cx ? 'start' : 'end'}
                        dominantBaseline="central"
                        fontSize={10}
                      >
                        {feeStructureChartData[index].name} (
                        {(percent * 100).toFixed(0)}%)
                      </text>
                    );
                  }}
                >
                  {feeStructureChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke={entry.color}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Status Chart */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Payment Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentStatusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    percent,
                    index,
                  }) => {
                    const RADIAN = Math.PI / 180;
                    const radius =
                      25 + innerRadius + (outerRadius - innerRadius);
                    const x = cx + radius * Math.cos(-midAngle * RADIAN) * 0.8;
                    const y = cy + radius * Math.sin(-midAngle * RADIAN) * 0.8;

                    return (
                      <text
                        x={x}
                        y={y}
                        fill={paymentStatusChartData[index].color}
                        textAnchor={x > cx ? 'start' : 'end'}
                        dominantBaseline="central"
                      >
                        {paymentStatusChartData[index].name} (
                        {(percent * 100).toFixed(0)}%)
                      </text>
                    );
                  }}
                >
                  {paymentStatusChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke={entry.color}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fee Structure Details */}
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h3 className="text-xl font-semibold mb-4">Fee Structure Details</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-white">Fee Type</TableHead>
                  <TableHead className="text-white text-right">
                    Amount (₹)
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium text-white">
                    Tuition Fee
                  </TableCell>
                  <TableCell className="text-right text-white">
                    ₹{feeData.feeStructure.tuitionFee}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-white">
                    Development Fee
                  </TableCell>
                  <TableCell className="text-right text-white">
                    ₹{feeData.feeStructure.developmentFee}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-white">
                    Exam Fee
                  </TableCell>
                  <TableCell className="text-right text-white">
                    ₹{feeData.feeStructure.examFee}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-white">
                    Transport Fee
                  </TableCell>
                  <TableCell className="text-right text-white">
                    ₹{feeData.feeStructure.transportFee}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-white">
                    Library Fee
                  </TableCell>
                  <TableCell className="text-right text-white">
                    ₹{feeData.feeStructure.libraryFee}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-white">
                    Other Fees
                  </TableCell>
                  <TableCell className="text-right text-white">
                    ₹{feeData.feeStructure.otherFees}
                  </TableCell>
                </TableRow>
                <TableRow className="bg-gray-700">
                  <TableCell className="font-bold text-white">Total</TableCell>
                  <TableCell className="text-right font-bold text-white">
                    ₹{feeData.feeStructure.totalFee}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h3 className="text-xl font-semibold mb-4">Payment History</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-white">Receipt No.</TableHead>
                  <TableHead className="text-white">Date</TableHead>
                  <TableHead className="text-white">Description</TableHead>
                  <TableHead className="text-white">Payment Mode</TableHead>
                  <TableHead className="text-white text-right">
                    Amount (₹)
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeData.feePayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium text-white">
                      {payment.receiptNumber}
                    </TableCell>
                    <TableCell className="text-white">
                      {new Date(payment.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="text-white">
                      {payment.description}
                    </TableCell>
                    <TableCell className="text-white">
                      {payment.paymentMode}
                    </TableCell>
                    <TableCell className="text-right text-white">
                      ₹{payment.amount}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-gray-700">
                  <TableCell colSpan={4} className="font-bold text-white">
                    Total Paid
                  </TableCell>
                  <TableCell className="text-right font-bold text-white">
                    ₹{feeData.totalPaid}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Due Fees */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Due Fees</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-1">Total Fee</h4>
              <p className="text-2xl font-bold">
                ₹{feeData.feeStructure.totalFee}
              </p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-1">Total Paid</h4>
              <p className="text-2xl font-bold">₹{feeData.totalPaid}</p>
            </div>
            <div className="bg-red-700 p-4 rounded-lg col-span-1 md:col-span-2">
              <h4 className="text-sm font-medium mb-1">Balance Due</h4>
              <p className="text-2xl font-bold">₹{feeData.totalDue}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Print-only content */}
      <div className="print-only">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-black">
            SHREE LAHARI SINGH MEMO. INTER COLLEGE GHANGHAULI, ALIGARH
          </h1>
          <p className="text-black">Phone No. 9897470696</p>
          <h2 className="text-xl font-bold mt-4 text-black">
            Fee Statement - {feeData.academicYear}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-black">
              <strong>Name:</strong> Rahul Kumar
            </p>
            <p className="text-black">
              <strong>{"Father's Name:"}</strong> Nanak Chand
            </p>
            <p className="text-black">
              <strong>Class:</strong> 11
            </p>
          </div>
          <div>
            <p className="text-black">
              <strong>Roll No:</strong> 2211136
            </p>
            <p className="text-black">
              <strong>S.R.No.:</strong> 2316
            </p>
            <p className="text-black">
              <strong>Academic Year:</strong> {feeData.academicYear}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2 text-black">Fee Structure</h3>
          <table className="w-full border-collapse border border-black">
            <thead>
              <tr>
                <th className="border border-black p-2 text-black">Fee Type</th>
                <th className="border border-black p-2 text-black">
                  Amount (₹)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black p-2 text-black">
                  Tuition Fee
                </td>
                <td className="border border-black p-2 text-center text-black">
                  ₹{feeData.feeStructure.tuitionFee}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 text-black">
                  Development Fee
                </td>
                <td className="border border-black p-2 text-center text-black">
                  ₹{feeData.feeStructure.developmentFee}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 text-black">Exam Fee</td>
                <td className="border border-black p-2 text-center text-black">
                  ₹{feeData.feeStructure.examFee}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 text-black">
                  Transport Fee
                </td>
                <td className="border border-black p-2 text-center text-black">
                  ₹{feeData.feeStructure.transportFee}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 text-black">
                  Library Fee
                </td>
                <td className="border border-black p-2 text-center text-black">
                  ₹{feeData.feeStructure.libraryFee}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 text-black">
                  Other Fees
                </td>
                <td className="border border-black p-2 text-center text-black">
                  ₹{feeData.feeStructure.otherFees}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold text-black">
                  Total
                </td>
                <td className="border border-black p-2 text-center font-bold text-black">
                  ₹{feeData.feeStructure.totalFee}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2 text-black">Payment History</h3>
          <table className="w-full border-collapse border border-black">
            <thead>
              <tr>
                <th className="border border-black p-2 text-black">
                  Receipt No.
                </th>
                <th className="border border-black p-2 text-black">Date</th>
                <th className="border border-black p-2 text-black">
                  Description
                </th>
                <th className="border border-black p-2 text-black">
                  Payment Mode
                </th>
                <th className="border border-black p-2 text-black">
                  Amount (₹)
                </th>
              </tr>
            </thead>
            <tbody>
              {feeData.feePayments.map((payment) => (
                <tr key={payment.id}>
                  <td className="border border-black p-2 text-black">
                    {payment.receiptNumber}
                  </td>
                  <td className="border border-black p-2 text-black">
                    {new Date(payment.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="border border-black p-2 text-black">
                    {payment.description}
                  </td>
                  <td className="border border-black p-2 text-black">
                    {payment.paymentMode}
                  </td>
                  <td className="border border-black p-2 text-center text-black">
                    ₹{payment.amount}
                  </td>
                </tr>
              ))}
              <tr>
                <td
                  colSpan={4}
                  className="border border-black p-2 font-bold text-black"
                >
                  Total Paid
                </td>
                <td className="border border-black p-2 text-center font-bold text-black">
                  ₹{feeData.totalPaid}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2 text-black">Fee Summary</h3>
          <table className="w-full border-collapse border border-black">
            <tbody>
              <tr>
                <td className="border border-black p-2 font-bold text-black">
                  Total Fee
                </td>
                <td className="border border-black p-2 text-center text-black">
                  ₹{feeData.feeStructure.totalFee}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold text-black">
                  Total Paid
                </td>
                <td className="border border-black p-2 text-center text-black">
                  ₹{feeData.totalPaid}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold text-black">
                  Balance Due
                </td>
                <td className="border border-black p-2 text-center font-bold text-black">
                  ₹{feeData.totalDue}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-12">
          <div className="text-center">
            <p className="text-black">Sig. of Accountant</p>
          </div>
          <div className="text-center">
            <p className="text-black">Sig. of Principal</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentFees;
