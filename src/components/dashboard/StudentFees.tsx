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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Fee Details</h2>
        <Button onClick={handlePrint}>Print</Button>
      </div>

      {/* Fee Summary */}
      <div className="bg-gray-800 p-6 rounded-lg">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  const radius = 25 + innerRadius + (outerRadius - innerRadius);
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
                  const radius = 25 + innerRadius + (outerRadius - innerRadius);
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
      <div className="bg-gray-800 p-6 rounded-lg">
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
      <div className="bg-gray-800 p-6 rounded-lg">
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

      {/* Print Section */}
      <div className="print-section bg-white text-black p-8 hidden print:block">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">
            SHREE LAHARI SINGH MEMO. INTER COLLEGE GHANGHAULI, ALIGARH
          </h1>
          <p>Phone No. 9897470696</p>
          <h2 className="text-xl font-bold mt-4">
            Fee Statement - {feeData.academicYear}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p>
              <strong>Name:</strong> Rahul Kumar
            </p>
            <p>
              <strong>{"Father's Name:"}</strong> Nanak Chand
            </p>
            <p>
              <strong>Class:</strong> 11
            </p>
          </div>
          <div>
            <p>
              <strong>Roll No:</strong> 2211136
            </p>
            <p>
              <strong>S.R.No.:</strong> 2316
            </p>
            <p>
              <strong>Academic Year:</strong> {feeData.academicYear}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2">Fee Structure</h3>
          <table className="w-full border-collapse border border-gray-800">
            <thead>
              <tr>
                <th className="border border-gray-800 p-2">Fee Type</th>
                <th className="border border-gray-800 p-2">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-800 p-2">Tuition Fee</td>
                <td className="border border-gray-800 p-2 text-center">
                  ₹{feeData.feeStructure.tuitionFee}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-800 p-2">Development Fee</td>
                <td className="border border-gray-800 p-2 text-center">
                  ₹{feeData.feeStructure.developmentFee}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-800 p-2">Exam Fee</td>
                <td className="border border-gray-800 p-2 text-center">
                  ₹{feeData.feeStructure.examFee}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-800 p-2">Transport Fee</td>
                <td className="border border-gray-800 p-2 text-center">
                  ₹{feeData.feeStructure.transportFee}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-800 p-2">Library Fee</td>
                <td className="border border-gray-800 p-2 text-center">
                  ₹{feeData.feeStructure.libraryFee}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-800 p-2">Other Fees</td>
                <td className="border border-gray-800 p-2 text-center">
                  ₹{feeData.feeStructure.otherFees}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-800 p-2 font-bold">Total</td>
                <td className="border border-gray-800 p-2 text-center font-bold">
                  ₹{feeData.feeStructure.totalFee}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2">Payment History</h3>
          <table className="w-full border-collapse border border-gray-800">
            <thead>
              <tr>
                <th className="border border-gray-800 p-2">Receipt No.</th>
                <th className="border border-gray-800 p-2">Date</th>
                <th className="border border-gray-800 p-2">Description</th>
                <th className="border border-gray-800 p-2">Payment Mode</th>
                <th className="border border-gray-800 p-2">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {feeData.feePayments.map((payment) => (
                <tr key={payment.id}>
                  <td className="border border-gray-800 p-2">
                    {payment.receiptNumber}
                  </td>
                  <td className="border border-gray-800 p-2">
                    {new Date(payment.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="border border-gray-800 p-2">
                    {payment.description}
                  </td>
                  <td className="border border-gray-800 p-2">
                    {payment.paymentMode}
                  </td>
                  <td className="border border-gray-800 p-2 text-center">
                    ₹{payment.amount}
                  </td>
                </tr>
              ))}
              <tr>
                <td
                  colSpan={4}
                  className="border border-gray-800 p-2 font-bold"
                >
                  Total Paid
                </td>
                <td className="border border-gray-800 p-2 text-center font-bold">
                  ₹{feeData.totalPaid}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2">Fee Summary</h3>
          <table className="w-full border-collapse border border-gray-800">
            <tbody>
              <tr>
                <td className="border border-gray-800 p-2 font-bold">
                  Total Fee
                </td>
                <td className="border border-gray-800 p-2 text-center">
                  ₹{feeData.feeStructure.totalFee}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-800 p-2 font-bold">
                  Total Paid
                </td>
                <td className="border border-gray-800 p-2 text-center">
                  ₹{feeData.totalPaid}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-800 p-2 font-bold">
                  Balance Due
                </td>
                <td className="border border-gray-800 p-2 text-center font-bold">
                  ₹{feeData.totalDue}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-12">
          <div className="text-center">
            <p>Sig. of Accountant</p>
          </div>
          <div className="text-center">
            <p>Sig. of Principal</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentFees;
