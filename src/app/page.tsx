"use client"
import BasicTable from "@/components/table"
import { useEffect, useState } from "react";
import axios from 'axios';
import CreateUserGroupPopUp from "@/components/modal/CreateUserGroupPopUp";
import EditUserGroupPopup from "@/components/modal/EditUserGroupPopup";
import DeleteUserGroupPopup from "@/components/modal/DeleteUserGroupPopup";
import {DataTables} from "@/components/table/DataTable"
import {UpdateUserPopUp} from '@/components/modal/EditUserPopup'

const BaseURL = process.env.BaseURL;

export default function Home() {
  // const arrayData = [
  //   {"name":'Frozen math',"start_time": 11, "end_time":6.0, "duration":24, "description":'easy math'},
  //   {"name":'Ice cream chemistry', "start_time":237, "end_time":9.0,"duration":37, "description":'chemistry'},
  //   {"name":'Eclair physics', "start_time":262, "end_time":16.0, "duration":24, "description":'modest physics'},
  //   {"name":'Cupcake zoology', "start_time":305, "end_time":3.7, "duration":67, "description":'testing desc'},
  //   {"name":'Gingerbread botany', "start_time":356, "end_time":16.0, "duration":49, "description":'gingerbread cake'},
  //   https://qwqp4upxb2s2e5snuna7sw77me0pfxnj.lambda-url.ap-south-1.on.aws/
  // ]
  const [tableData, setTableData] = useState<any>(null)
  const handleDelete = () => {
    // Perform the delete action (API call or local delete)
    console.log('User group deleted.');
  };
  useEffect(()=>{
    const fetchData = async()=>{
      try {
        const res = await axios.get(BaseURL + "time-table");
        setTableData(res.data.data.attributes)
      console.log(res.data.data)
      } catch (error) {
        console.log(error)
      }
    }
    fetchData()
  },[])
  const columnHeaders = [
    { label: 'Subject', align: 'left' },
    { label: 'Start Time', align: 'left' },
    { label: 'End Time', align: 'left' },
    { label: 'Description', align: 'left' },
    { label: 'Edit', align: 'right' }
  ];
  
  
  return (
    <>
      <span className="font-bold text-4xl">Home</span>
      <div className="border-dashed border border-zinc-500 w-full h-12 rounded-lg"></div>
      <DataTables />
      <CreateUserGroupPopUp/>
      <EditUserGroupPopup/>
      <DeleteUserGroupPopup onDelete={handleDelete}/>
      {/* <DeleteUserPopup onDelete={handleDelete}/> */}
      <BasicTable tableData={tableData} setTableData={setTableData} columnHeaders={columnHeaders}/>
      {/* <PopUpSlide/> */}
    </>
  );
}
