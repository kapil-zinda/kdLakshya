"use client";
import dynamic from 'next/dynamic';
import 'chart.js/auto';

type RadarChartProps = {
  name: string,
  radarData: {
    labels: string[],
    datasets: {
      label: string,
      data: number[],
      backgroundColor: string,
      borderColor: string,
      borderWidth: number,
      pointBackgroundColor: string,
      pointBorderColor: string,
      pointHoverBackgroundColor: string,
      pointHoverBorderColor: string,
    }[],
  },
  options?: any,
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
//       r: {
//         angleLines: {
//           display: true,
//           color: 'red',
//           lineWidth: 2,
//           borderDash: [5, 5],
//           borderDashOffset: 0.0,
//         },
//         grid: {
//           display: true,
//           color: 'green',
//           lineWidth: 1,
//           circular: true,
//           borderDash: [5, 5],
//           borderDashOffset: 0.0,
//         },
//         pointLabels: {
//           display: true,
//           font: {
//             size: 14,
//             family: 'Arial',
//             style: 'italic',
//             weight: 'bold',
//           },
//           color: 'blue',
//           callback: function(label) {
//             return `${label} label`;
//           },
//         },
//         ticks: {
//           display: true,
//           beginAtZero: true,
//           min: 0,
//           max: 100,
//           stepSize: 10,
//           backdropColor: 'rgba(255, 255, 255, 0.75)',
//           backdropPadding: 2,
//           font: {
//             size: 12,
//             family: 'Arial',
//             style: 'bold',
//             weight: 'normal',
//           },
//           color: 'blue',
//           count: 6,
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
//           size: 12,
//           family: 'Arial',
//           style: 'normal',
//           weight: 'bold',
//         },
//         color: 'black',
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
//         size: 14,
//         family: 'Arial',
//         style: 'bold',
//         weight: 'bold',
//       },
//       titleColor: '#fff',
//       bodyFont: {
//         size: 12,
//         family: 'Arial',
//         style: 'normal',
//         weight: 'normal',
//       },
//       bodyColor: '#fff',
//       footerFont: {
//         size: 10,
//         family: 'Arial',
//         style: 'italic',
//         weight: 'bold',
//       },
//       footerColor: '#fff',
//       displayColors: true,
//     },
//   };

const Radar = dynamic(() => import('react-chartjs-2').then((mod) => mod.Radar), {
  ssr: false,
});

const RadarChart: React.FC<RadarChartProps> = ({ name, radarData, options }) => {
  return (
    <div style={{ width: 'auto', height: 'auto' }}>
      <h1>{name}</h1>
      <Radar data={radarData} options={options}/>
    </div>
  );
};

export default RadarChart;