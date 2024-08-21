"use client";
import dynamic from 'next/dynamic';
import 'chart.js/auto';

type LineChartProps = {
	name:string,
    linedata: {
        labels: string[],
        datasets:
        {
        label: string,
        data: number[],
        fill: boolean,
        borderColor: string,
        tension: number
    }[]},
};

// type LineChartProps = {
//     name: string,
//     lineData: {
//       labels: string[],
//       datasets: {
//         label: string,
//         data: number[],
//         fill: boolean,
//         borderColor: string,
//         backgroundColor: string,
//         borderWidth: number,
//         pointBorderColor: string,
//         pointBackgroundColor: string,
//         pointBorderWidth: number,
//         pointHoverRadius: number,
//         pointHoverBackgroundColor: string,
//         pointHoverBorderColor: string,
//         pointHoverBorderWidth: number,
//         pointRadius: number,
//         pointHitRadius: number,
//         tension: number,
//       }[],
//     },
//     options?: any, // Add an optional options prop
//   };

// const options = {
//     responsive: true,
//     maintainAspectRatio: false,
//     animation: {
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
//     scales: {
//       x: {
//         display: true,
//         title: {
//           display: true,
//           text: 'X Axis Title',
//           color: '#911',
//           font: {
//             family: 'Arial',
//             size: 20,
//             weight: 'bold',
//             style: 'italic',
//           },
//           padding: {top: 20, left: 0, right: 0, bottom: 0}
//         },
//         grid: {
//           display: true,
//           color: 'rgba(255, 0, 0, 0.2)',
//           borderDash: [5, 5],
//           borderDashOffset: 0.0,
//           lineWidth: 1,
//           drawBorder: true,
//           drawOnChartArea: true,
//           drawTicks: true,
//         },
//         ticks: {
//           display: true,
//           color: 'red',
//           font: {
//             family: 'Arial',
//             size: 12,
//             style: 'normal',
//             lineHeight: 1.5,
//           },
//           padding: 10,
//         },
//       },
//       y: {
//         display: true,
//         title: {
//           display: true,
//           text: 'Y Axis Title',
//           color: '#191',
//           font: {
//             family: 'Arial',
//             size: 20,
//             weight: 'bold',
//             style: 'italic',
//           },
//           padding: {top: 20, left: 0, right: 0, bottom: 0}
//         },
//         grid: {
//           display: true,
//           color: 'rgba(0, 255, 0, 0.2)',
//           borderDash: [5, 5],
//           borderDashOffset: 0.0,
//           lineWidth: 1,
//           drawBorder: true,
//           drawOnChartArea: true,
//           drawTicks: true,
//         },
//         ticks: {
//           display: true,
//           color: 'green',
//           font: {
//             family: 'Arial',
//             size: 12,
//             style: 'normal',
//             lineHeight: 1.5,
//           },
//           padding: 10,
//         },
//       },
//     },
//     legend: {
//       display: true,
//       position: 'top',
//       align: 'center',
//       labels: {
//         boxWidth: 40,
//         padding: 10,
//         font: {
//           family: 'Arial',
//           size: 12,
//           style: 'normal',
//           weight: 'bold',
//         },
//         color: 'black',
//         usePointStyle: true,
//       },
//     },
//     tooltips: {
//       enabled: true,
//       mode: 'nearest',
//       intersect: false,
//       callbacks: {
//         label: function(tooltipItem) {
//           return `${tooltipItem.label}: ${tooltipItem.raw}`;
//         },
//       },
//       backgroundColor: 'rgba(0,0,0,0.8)',
//       titleFont: {
//         family: 'Arial',
//         size: 14,
//         style: 'bold',
//         weight: 'bold',
//       },
//       titleColor: '#fff',
//       bodyFont: {
//         family: 'Arial',
//         size: 12,
//         style: 'normal',
//         weight: 'normal',
//       },
//       bodyColor: '#fff',
//       footerFont: {
//         family: 'Arial',
//         size: 10,
//         style: 'italic',
//         weight: 'bold',
//       },
//       footerColor: '#fff',
//       displayColors: true,
//     },
//     elements: {
//       line: {
//         tension: 0.4, // Bezier curve tension
//         borderWidth: 3,
//         borderColor: 'rgba(75,192,192,1)',
//         backgroundColor: 'rgba(75,192,192,0.4)',
//         fill: true,
//       },
//       point: {
//         radius: 5,
//         borderWidth: 2,
//         backgroundColor: 'rgba(75,192,192,1)',
//         borderColor: 'rgba(75,192,192,1)',
//         hoverRadius: 7,
//         hoverBorderWidth: 2,
//         hoverBackgroundColor: 'rgba(75,192,192,1)',
//         hoverBorderColor: 'rgba(75,192,192,1)',
//         hitRadius: 10,
//       },
//     },
//     plugins: {
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
//       tooltip: {
//         enabled: true,
//         mode: 'index',
//         intersect: false,
//         callbacks: {
//           label: function(context) {
//             let label = context.dataset.label || '';
//             if (label) {
//               label += ': ';
//             }
//             if (context.parsed.y !== null) {
//               label += context.parsed.y;
//             }
//             return label;
//           },
//         },
//       },
//       legend: {
//         display: true,
//         position: 'top',
//         labels: {
//           color: 'black',
//           font: {
//             family: 'Arial',
//             size: 12,
//           },
//         },
//       },
//     },
//   };

const Line = dynamic(() => import('react-chartjs-2').then((mod) => mod.Line), {
  ssr: false,
});

const LineChart:React.FC<LineChartProps> = ({name, linedata}) => {
  return (
    <div style={{ width: 'auto', height: 'auto' }}>
      <h1>{name}</h1>
      <Line data={linedata} />
    </div>
  );
};
export default LineChart;