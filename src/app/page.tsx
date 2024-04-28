"use client"
import BasicTable from "@/components/table"
export default function Home() {
  const arrayData = [
    {"name":'Frozen math',"start_time": 11, "end_time":6.0, "duration":24, "description":'easy math'},
    {"name":'Ice cream chemistry', "start_time":237, "end_time":9.0,"duration":37, "description":'chemistry'},
    {"name":'Eclair physics', "start_time":262, "end_time":16.0, "duration":24, "description":'modest physics'},
    {"name":'Cupcake zoology', "start_time":305, "end_time":3.7, "duration":67, "description":'testing desc'},
    {"name":'Gingerbread botany', "start_time":356, "end_time":16.0, "duration":49, "description":'gingerbread cake'},
  ]
  const columnHeaders = [
    { label: 'Subject', align: 'left' },
    { label: 'Start Time', align: 'right' },
    { label: 'End Time', align: 'right' },
    { label: 'Duration', align: 'right' },
    { label: 'Description', align: 'right' },
    { label: 'Function', align: 'right' }
  ];
  
  
  return (
    <>
      <span className="font-bold text-4xl">Home</span>
      <div className="border-dashed border border-zinc-500 w-full h-12 rounded-lg"></div>
      <BasicTable arrayData={arrayData} columnHeaders={columnHeaders}/>
      {/* <PopUpSlide/> */}
    </>
  );
}
