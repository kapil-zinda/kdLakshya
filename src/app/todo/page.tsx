import LineChart from "@/components/charts/LineChart";
import BarChart from "@/components/charts/BarChart";
import DoughnutChart from "@/components/charts/DoughnutChart";
import RadarChart from "@/components/charts/RadarChart";
import PolarAreaChart from "@/components/charts/PolarChart";

const data = {
  labels: ['January', 'February', 'March', 'April', 'May'],
  datasets: [
    {
      label: 'GeeksforGeeks',
      data: [65, 59, 80, 81, 56],
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.8,
    },
    {
      label: 'code hub',
      data: [55, 59, 30, 51, 66],
      fill: true,
      borderColor: 'rgb(200, 92, 192)',
      tension: 0.5,
    },
  ],
};

const doughnutData = {
  labels: ['January', 'February', 'March', 'April', 'May'],
  datasets: [
    {
      label: 'GeeksforGeeks',
      data: [65, 59, 80, 81, 56],
      backgroundColor: [
        'rgba(129, 202, 178, 0.5)',
        'rgba(250, 117, 58, 0.5)',
        'rgba(183, 235, 66, 0.5)',
        'rgba(61, 144, 45, 0.5)',
        'rgba(123, 69, 255, 0.5)',
        'rgba(76, 204, 102, 0.5)',
        'rgba(231, 82, 144, 0.5)'
      ],
      borderColor: [
        'rgb(37, 82, 200)',
        'rgb(242, 99, 177)',
        'rgb(55, 179, 92)',
        'rgb(145, 12, 89)',
        'rgb(229, 191, 78)',
        'rgb(19, 144, 218)',
        'rgb(90, 74, 136)'
      ],
      borderWidth: 1,
    },
    {
      label: 'code hub',
      data: [55, 59, 30, 51, 66],
      backgroundColor: [
        'rgba(135, 217, 50, 0.5)',
        'rgba(240, 128, 34, 0.5)',
        'rgba(217, 44, 90, 0.5)',
        'rgba(63, 118, 245, 0.5)',
        'rgba(193, 83, 114, 0.5)',
        'rgba(82, 147, 201, 0.5)',
        'rgba(45, 252, 168, 0.5)'
      ],
      borderColor: [
        'rgb(98, 156, 218)',
        'rgb(250, 200, 67)',
        'rgb(207, 46, 89)',
        'rgb(28, 187, 240)',
        'rgb(149, 84, 78)',
        'rgb(240, 114, 32)',
        'rgb(51, 233, 138)'
      ],
      borderWidth: 1,
    },
  ],
};

const radarData = {
  labels: ['January', 'February', 'March', 'April', 'May'],
  datasets: [
    {
      label: 'GeeksforGeeks',
      data: [65, 59, 80, 81, 56],
      backgroundColor: 'rgba(129, 202, 178, 0.5)',
      borderColor: 'rgba(129, 202, 178, 0.5)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(250, 117, 58, 0.5)',
      pointBorderColor: 'rgba(183, 235, 66, 0.5)',
      pointHoverBackgroundColor: 'rgba(61, 144, 45, 0.5)',
      pointHoverBorderColor: 'rgba(123, 69, 255, 0.5)',
    },
    {
      label: 'code hub',
      data: [55, 59, 30, 51, 66],
      backgroundColor: 'rgba(135, 217, 50, 0.5)',
      borderColor: 'rgba(240, 128, 34, 0.5)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(217, 44, 90, 0.5)',
      pointBorderColor: 'rgba(63, 118, 245, 0.5)',
      pointHoverBackgroundColor: 'rgba(193, 83, 114, 0.5)',
      pointHoverBorderColor: 'rgba(82, 147, 201, 0.5)',
    },
  ],
};

const options = {
  scales: {
    r: {
      angleLines: {
        color: 'red', // Set the angle line color to red
      },
      ticks: {
        display: true, // Show or hide the ticks
        min: 0, // Minimum value for the ticks
        max: 50, // Maximum value for the ticks
        stepSize: 10, // Interval between the ticks
        font: {
          size: 12, // Font size for the tick labels
          style: 'bold', // Font style for the tick labels
        },
        color: 'red', // Color of the tick labels
        backdropColor: 'rgba(255, 255, 255, 0.75)', // Background color of the tick labels
        count: 6, // Number of ticks
      },
      grid: {
        color: 'green', // Color of the circular grid lines
      },
    },
  },
};

const bardata = {
  labels: ['January', 'February', 'March', 'April', 'May'],
  datasets: [
    {
      label: 'GeeksforGeeks',
      data: [65, 59, 80, 81, 56],
      backgroundColor: 'rgb(200, 92, 92)',
      borderColor: 'rgb(75, 192, 192)',
      borderWidth: 0.5,
    },
    {
      label: 'code hub',
      data: [55, 59, 30, 51, 66],
      backgroundColor: 'rgb(100, 92, 92)',
      borderColor: 'rgb(200, 92, 192)',
      borderWidth: 0.5,
    },
  ],
};

const getRandomInt = (max: number) => Math.floor(Math.random() * max);
const priorities = ["low", "medium", "high", "urgent"];
const states = ["todo", "in process", "stucked", "in review", "done"];
const topics = ["math", "science", "history", "literature", "art"];

const getRandomDate = () => {
  const day = getRandomInt(28) + 1; // to avoid 0
  const month = getRandomInt(11) + 1; // to avoid 0
  const year = getRandomInt(3) + 2022; // Years between 2022 and 2024
  return `${day}/${month}/${year}`;
};

const generateRandomTask = () => {
  return {
    title: `Task ${getRandomInt(100)}`,
    deadline: getRandomDate(),
    priority: priorities[getRandomInt(priorities.length)],
    state: states[getRandomInt(states.length)],
    topic: topics[getRandomInt(topics.length)],
  };
};

const generateTasksArray = (numTasks: number) => {
  const tasks = [];
  for (let i = 0; i < numTasks; i++) {
    tasks.push(generateRandomTask());
  }
  return tasks;
};

const tasksArray = generateTasksArray(20);

function generatePriorityCounts(tasksArray) {
  // Initialize an object to store the counts of each priority
  const priorityCounts = {
    low: 0,
    medium: 0,
    high: 0,
    urgent: 0,
  };

  // Count the occurrences of each priority
  tasksArray.forEach((task) => {
    if (priorityCounts[task.priority] !== undefined) {
      priorityCounts[task.priority]++;
    }
  });

  // Generate the bardata object
  const bardata = {
    labels: Object.keys(priorityCounts),
    datasets: [
      {
        label: 'Task Priorities',
        data: Object.values(priorityCounts),
        backgroundColor: 'rgb(200, 92, 92)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 0.5,
      },
    ],
  };

  return bardata;
}

function generateTopicCounts(tasksArray: any[]) {
  const topicCounts: { [key: string]: number } = {};

  // Count the occurrences of each topic
  tasksArray.forEach((task) => {
    const topic = task.topic;
    if (topicCounts[topic]) {
      topicCounts[topic]++;
    } else {
      topicCounts[topic] = 1;
    }
  });

  // Generate the bardata object with proper typing for the `data` array
  const bardata = {
    labels: Object.keys(topicCounts),
    datasets: [
      {
        label: 'Task Topics',
        data: Object.values(topicCounts) as number[], // Explicitly cast to number[]
        backgroundColor: 'rgb(92, 92, 200)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 0.5,
      },
    ],
  };

  return bardata;
}

// Example usage:
const topicBardata = generateTopicCounts(tasksArray);

function generateStatesCounts(tasksArray) {
  const stateCounts = {
    todo: 0,
    "in process": 0,
    stucked: 0,
    "in review": 0,
    done: 0,
  };

  // Count the occurrences of each state
  tasksArray.forEach((task) => {
    if (stateCounts[task.state] !== undefined) {
      stateCounts[task.state]++;
    }
  });

  // Generate the bardata object
  const bardata = {
    labels: Object.keys(stateCounts),
    datasets: [
      {
        label: 'Task States',
        data: Object.values(stateCounts),
        backgroundColor: 'rgb(92, 92, 200)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 0.5,
      },
    ],
  };

  return bardata;
}

const statesArray = generateStatesCounts(tasksArray);

const bardataArray = generatePriorityCounts(tasksArray);
console.log(bardataArray);

const generateRandomData = () => {
  const labels = ['Label 1', 'Label 2', 'Label 3', 'Label 4', 'Label 5'];
  const data = labels.map(() => getRandomInt(100));
  const backgroundColor = labels.map(() => `rgba(${getRandomInt(255)}, ${getRandomInt(255)}, ${getRandomInt(255)}, 0.4)`);
  const borderColor = labels.map(() => `rgba(${getRandomInt(255)}, ${getRandomInt(255)}, ${getRandomInt(255)}, 1)`);
  const hoverBackgroundColor = labels.map(() => `rgba(${getRandomInt(255)}, ${getRandomInt(255)}, ${getRandomInt(255)}, 1)`);
  const hoverBorderColor = labels.map(() => `rgba(${getRandomInt(255)}, ${getRandomInt(255)}, ${getRandomInt(255)}, 1)`);

  return {
    labels,
    datasets: [
      {
        label: 'Random Dataset',
        data,
        backgroundColor,
        borderColor,
        borderWidth: 1,
        hoverBackgroundColor,
        hoverBorderColor,
        hoverBorderWidth: 2,
      },
    ],
  };
};

const randomPolarAreaData = generateRandomData();

const Home = () => {
  return (
    <main className="mb-8">
      <div className="max-w-screen-xl mx-auto py-3">
        <h2 className="text-2xl font-bold tracking-tight">Welcome to 10k Hours</h2>
        <p className="text-muted-foreground">
          Simplify your task management with ease and efficiency.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-20">
          <BarChart
                          name="Tasks By Priority"
                          bardata={bardataArray}
                        />
          <BarChart
                          name="Tasks By States"
                          bardata={statesArray}
                        />
          <BarChart
                          name="Tasks By Topic"
                          bardata={topicBardata}
                          />
          <DoughnutChart
                          name="example chart"
                          doughnutData={doughnutData}
                        />
          <RadarChart
                          name="example chart"
                          radarData={radarData}
                          options={options}
                        />
          <PolarAreaChart name="Tuntun" polarAreaData={randomPolarAreaData} options={options} />
        </div>
      </div>
      <div className="max-w-screen-xl mx-auto">
      </div>
    </main>
  );
};
export default Home;
