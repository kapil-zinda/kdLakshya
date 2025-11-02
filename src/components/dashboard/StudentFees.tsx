'use client';

import React, { useEffect, useState } from 'react';

import { ApiService } from '@/services/api';
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
  /* Hide print-only content on screen */
  .print-only {
    display: none !important;
  }

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
  const [loading, setLoading] = useState(true);
  const [feeData, setFeeData] = useState<any>(null);
  const [studentData, setStudentData] = useState<any>(null);

  useEffect(() => {
    const fetchFeeData = async () => {
      try {
        // Get student data from localStorage
        const storedStudentData = localStorage.getItem('studentAuth');
        if (!storedStudentData) {
          console.error('No student data found');
          setLoading(false);
          return;
        }

        const parsed = JSON.parse(storedStudentData);
        setStudentData(parsed);

        // Get org ID and student ID
        const orgId = await ApiService.getCurrentOrgId();
        const studentId = parsed.id;

        // Fetch student fees from API
        const response = await ApiService.getStudentFees(orgId, studentId);
        console.log('Student fees response:', response);

        if (response.data && response.data.length > 0) {
          // Use the first fee record (or you can handle multiple)
          const feeRecord = response.data[0];
          const attributes = feeRecord.attributes;

          // Transform API data to match component structure
          const transformedData = {
            academicYear: attributes.academic_year || '2024-25',
            feeStructure: {
              tuitionFee: attributes.components?.tuition_fees || 0,
              developmentFee: attributes.components?.registration_fee || 0,
              examFee: attributes.components?.exam_fees || 0,
              transportFee: 0,
              libraryFee: attributes.components?.admission_fee || 0,
              otherFees: attributes.components?.other_fees || 0,
              totalFee: attributes.amount || 0,
            },
            totalPaid: attributes.total_paid || 0,
            totalDue: attributes.total_due || attributes.remaining_amount || 0,
            feePayments: (attributes.payments || []).map((payment: any) => ({
              id: payment.id,
              receiptNumber: payment.receipt_number,
              date: payment.date,
              description: payment.description,
              paymentMode: payment.method,
              amount: payment.amount,
              month: payment.month || '',
              remarks: payment.remarks || '',
            })),
          };

          setFeeData(transformedData);
        } else {
          // No fee data found
          setFeeData({
            academicYear: '2024-25',
            feeStructure: {
              tuitionFee: 0,
              developmentFee: 0,
              examFee: 0,
              transportFee: 0,
              libraryFee: 0,
              otherFees: 0,
              totalFee: 0,
            },
            totalPaid: 0,
            totalDue: 0,
            feePayments: [],
          });
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching fee data:', error);
        setLoading(false);
      }
    };

    fetchFeeData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading fee details...</p>
        </div>
      </div>
    );
  }

  if (!feeData) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-400">No fee data available</p>
      </div>
    );
  }

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

  // Function to download payment slip
  const handleDownloadSlip = (payment: any) => {
    // Create a new window for the receipt
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Receipt - ${payment.receiptNumber}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .header p {
              margin: 5px 0;
            }
            .receipt-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 20px;
            }
            .info-group {
              margin-bottom: 10px;
            }
            .info-label {
              font-weight: bold;
              display: inline-block;
              width: 150px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              border: 1px solid #000;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f0f0f0;
            }
            .total {
              font-weight: bold;
              font-size: 18px;
            }
            .signatures {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              margin-top: 60px;
            }
            .signature {
              text-align: center;
              border-top: 1px solid #000;
              padding-top: 10px;
            }
            @media print {
              button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>SHREE LAHARI SINGH MEMO INTER COLLEGE</h1>
            <p>GHANGHAULI, ALIGARH</p>
            <p>Phone No. 9897470696</p>
            <h2 style="margin-top: 10px;">PAYMENT RECEIPT</h2>
          </div>

          <div class="receipt-info">
            <div>
              <div class="info-group">
                <span class="info-label">Receipt No:</span>
                <span>${payment.receiptNumber}</span>
              </div>
              <div class="info-group">
                <span class="info-label">Student Name:</span>
                <span>${studentData ? `${studentData.firstName} ${studentData.lastName}` : 'N/A'}</span>
              </div>
              <div class="info-group">
                <span class="info-label">Class:</span>
                <span>${studentData?.gradeLevel || 'N/A'}</span>
              </div>
              <div class="info-group">
                <span class="info-label">Roll No:</span>
                <span>${studentData?.rollNumber || 'N/A'}</span>
              </div>
            </div>
            <div>
              <div class="info-group">
                <span class="info-label">Payment Date:</span>
                <span>${payment.date}</span>
              </div>
              <div class="info-group">
                <span class="info-label">Academic Year:</span>
                <span>${feeData.academicYear}</span>
              </div>
              <div class="info-group">
                <span class="info-label">Payment Method:</span>
                <span>${payment.paymentMode}</span>
              </div>
              ${
                payment.month
                  ? `
              <div class="info-group">
                <span class="info-label">Month:</span>
                <span>${payment.month}</span>
              </div>
              `
                  : ''
              }
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: right;">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${payment.description}</td>
                <td style="text-align: right;">₹${payment.amount.toLocaleString()}</td>
              </tr>
              ${
                payment.remarks
                  ? `
              <tr>
                <td colspan="2"><strong>Remarks:</strong> ${payment.remarks}</td>
              </tr>
              `
                  : ''
              }
              <tr class="total">
                <td>Total Amount Paid</td>
                <td style="text-align: right;">₹${payment.amount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div style="margin: 20px 0;">
            <p><strong>Amount in Words:</strong> ${numberToWords(payment.amount)} Rupees Only</p>
          </div>

          <div class="signatures">
            <div class="signature">
              <p>Accountant's Signature</p>
            </div>
            <div class="signature">
              <p>Principal's Signature</p>
            </div>
          </div>

          <div style="text-align: center; margin-top: 40px; font-size: 12px;">
            <p>This is a computer-generated receipt</p>
          </div>

          <div style="margin-top: 20px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">
              Print Receipt
            </button>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();
  };

  // Helper function to convert number to words
  const numberToWords = (num: number): string => {
    const ones = [
      '',
      'One',
      'Two',
      'Three',
      'Four',
      'Five',
      'Six',
      'Seven',
      'Eight',
      'Nine',
    ];
    const tens = [
      '',
      '',
      'Twenty',
      'Thirty',
      'Forty',
      'Fifty',
      'Sixty',
      'Seventy',
      'Eighty',
      'Ninety',
    ];
    const teens = [
      'Ten',
      'Eleven',
      'Twelve',
      'Thirteen',
      'Fourteen',
      'Fifteen',
      'Sixteen',
      'Seventeen',
      'Eighteen',
      'Nineteen',
    ];

    if (num === 0) return 'Zero';

    const convert = (n: number): string => {
      if (n < 10) return ones[n];
      if (n >= 10 && n < 20) return teens[n - 10];
      if (n >= 20 && n < 100)
        return (
          tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '')
        );
      if (n >= 100 && n < 1000)
        return (
          ones[Math.floor(n / 100)] +
          ' Hundred' +
          (n % 100 !== 0 ? ' ' + convert(n % 100) : '')
        );
      if (n >= 1000 && n < 100000)
        return (
          convert(Math.floor(n / 1000)) +
          ' Thousand' +
          (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '')
        );
      if (n >= 100000)
        return (
          convert(Math.floor(n / 100000)) +
          ' Lakh' +
          (n % 100000 !== 0 ? ' ' + convert(n % 100000) : '')
        );
      return '';
    };

    return convert(Math.floor(num));
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
          {feeData.feePayments.length > 0 ? (
            <div className="space-y-4">
              {feeData.feePayments.map((payment: any) => (
                <div
                  key={payment.id}
                  className="bg-gray-700 p-4 rounded-lg border border-gray-600"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          ₹{payment.amount.toLocaleString()}
                        </span>
                        <span className="text-gray-400 text-sm">
                          {payment.date}
                        </span>
                      </div>
                      <p className="text-white font-medium mb-1">
                        {payment.description}
                      </p>
                      <div className="flex gap-4 text-sm text-gray-300">
                        <span>
                          <strong>Receipt:</strong> {payment.receiptNumber}
                        </span>
                        <span>
                          <strong>Method:</strong> {payment.paymentMode}
                        </span>
                        {payment.month && (
                          <span>
                            <strong>Month:</strong> {payment.month}
                          </span>
                        )}
                      </div>
                      {payment.remarks && (
                        <p className="text-sm text-gray-400 mt-2">
                          <strong>Remarks:</strong> {payment.remarks}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDownloadSlip(payment)}
                      className="ml-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Download Slip
                    </button>
                  </div>
                </div>
              ))}
              <div className="bg-gray-700 p-4 rounded-lg border-2 border-green-600">
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold text-lg">
                    Total Paid
                  </span>
                  <span className="text-green-400 font-bold text-xl">
                    ₹{feeData.totalPaid.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">
              No payment history available
            </p>
          )}
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
          <h1 className="text-2xl font-bold text-white">
            SHREE LAHARI SINGH MEMO INTER COLLEGE GHANGHAULI, ALIGARH
          </h1>
          <p className="text-white">Phone No. 9897470696</p>
          <h2 className="text-xl font-bold mt-4 text-white">
            Fee Statement - {feeData.academicYear}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-white">
              <strong>Name:</strong>{' '}
              {studentData
                ? `${studentData.firstName} ${studentData.lastName}`
                : 'N/A'}
            </p>
            <p className="text-white">
              <strong>{"Father's Name:"}</strong>{' '}
              {studentData?.guardianInfo?.father_name || 'N/A'}
            </p>
            <p className="text-white">
              <strong>Class:</strong> {studentData?.gradeLevel || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-white">
              <strong>Roll No:</strong> {studentData?.rollNumber || 'N/A'}
            </p>
            <p className="text-white">
              <strong>Student ID:</strong> {studentData?.id || 'N/A'}
            </p>
            <p className="text-white">
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
              {feeData.feePayments.map((payment: any) => (
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
