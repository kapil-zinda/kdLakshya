"use client";
import dynamic from 'next/dynamic';
import 'chart.js/auto';

type PolarAreaChartProps = {
  name: string,
  polarAreaData: {
    labels: string[],
    datasets: {
      label: string,
      data: number[],
      backgroundColor: string[],
      borderColor: string[],
      borderWidth: number,
      hoverBackgroundColor: string[],
      hoverBorderColor: string[],
      hoverBorderWidth: number,
    }[],
  },
  options?: any, // Add an optional options prop
};

// const options = {
//     responsive: true,
//     maintainAspectRatio: false,
//     scale: {
//       ticks: {
//         beginAtZero: true,
//         min: 0,
//         max: 100,
//         stepSize: 10,
//         backdropColor: 'rgba(255, 255, 255, 0.75)',
//         color: '#666',
//         font: {
//           family: 'Arial',
//           size: 12,
//           style: 'normal',
//           weight: 'bold',
//         },
//       },
//       angleLines: {
//         display: true,
//         color: 'rgba(0, 0, 0, 0.1)',
//         lineWidth: 1,
//       },
//       gridLines: {
//         circular: true,
//         color: 'rgba(0, 0, 0, 0.1)',
//         lineWidth: 1,
//       },
//       pointLabels: {
//         display: true,
//         font: {
//           family: 'Arial',
//           size: 12,
//           style: 'normal',
//           weight: 'bold',
//         },
//         color: '#666',
//       },
//     },
//     animation: {
//       animateRotate: true,
//       animateScale: true,
//       duration: 1000,
//       easing: 'easeInOutQuart',
//     },
//     layout: {
//       padding: {
//         top: 10,
//         right: 20,
//         bottom: 10,
//         left: 20,
//       },
//     },
//     plugins: {
//       legend: {
//         display: true,
//         position: 'top',
//         align: 'center',
//         labels: {
//           boxWidth: 40,
//           padding: 10,
//           font: {
//             family: 'Arial',
//             size: 12,
//             style: 'normal',
//             weight: 'bold',
//           },
//           color: 'black',
//           usePointStyle: true,
//         },
//       },
//       tooltip: {
//         enabled: true,
//         mode: 'nearest',
//         intersect: false,
//         callbacks: {
//           label: function (tooltipItem: any) {
//             let label = tooltipItem.label || '';
//             if (label) {
//               label += ': ';
//             }
//             if (tooltipItem.raw !== null) {
//               label += tooltipItem.raw;
//             }
//             return label;
//           },
//         },
//         backgroundColor: 'rgba(0,0,0,0.8)',
//         titleFont: {
//           family: 'Arial',
//           size: 14,
//           style: 'bold',
//           weight: 'bold',
//         },
//         titleColor: '#fff',
//         bodyFont: {
//           family: 'Arial',
//           size: 12,
//           style: 'normal',
//           weight: 'normal',
//         },
//         bodyColor: '#fff',
//         footerFont: {
//           family: 'Arial',
//           size: 10,
//           style: 'italic',
//           weight: 'bold',
//         },
//         footerColor: '#fff',
//         displayColors: true,
//       },
//       title: {
//         display: true,
//         text: 'Custom Chart Title',
//         font: {
//           family: 'Arial',
//           size: 20,
//           style: 'bold',
//           weight: 'bold',
//         },
//         color: '#111',
//         padding: {
//           top: 10,
//           bottom: 10,
//         },
//       },
//       subtitle: {
//         display: true,
//         text: 'Custom Chart Subtitle',
//         font: {
//           family: 'Arial',
//           size: 16,
//           style: 'italic',
//           weight: 'normal',
//         },
//         color: '#666',
//         padding: {
//           top: 0,
//           bottom: 10,
//         },
//       },
//     },
//     elements: {
//       arc: {
//         backgroundColor: 'rgba(75,192,192,0.4)',
//         borderColor: 'rgba(75,192,192,1)',
//         borderWidth: 1,
//         hoverBackgroundColor: 'rgba(75,192,192,1)',
//         hoverBorderColor: 'rgba(75,192,192,1)',
//         hoverBorderWidth: 2,
//       },
//     },
//   };

const PolarArea = dynamic(() => import('react-chartjs-2').then((mod) => mod.PolarArea), {
  ssr: false,
});

const PolarAreaChart: React.FC<PolarAreaChartProps> = ({ name, polarAreaData, options }) => {
  return (
    <div style={{ width: 'auto', height: 'auto' }}>
      <h1>{name}</h1>
      <PolarArea data={polarAreaData} options={options} />
    </div>
  );
};

export default PolarAreaChart;