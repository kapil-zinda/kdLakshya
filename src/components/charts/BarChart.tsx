"use client";
import dynamic from 'next/dynamic';
import 'chart.js/auto';

type BarChartProps = {
	name: string,
    bardata: {
        labels: string[],
        datasets: {
            label: string,
            data: number[],
            backgroundColor: string,
            borderColor: string,
            borderWidth: number,
        }[],
    },
};

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
//   };

const Bar = dynamic(() => import('react-chartjs-2').then((mod) => mod.Bar), {
  ssr: false,
});

const BarChart: React.FC<BarChartProps> = ({ name, bardata }) => {
  return (
    <div style={{ width: 'auto', height: 'auto' }}>
      <h1>{name}</h1>
      <Bar data={bardata} />
    </div>
  );
};

export default BarChart;