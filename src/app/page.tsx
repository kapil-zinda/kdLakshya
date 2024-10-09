"use client"
import BasicTable from "@/components/table"
import { useEffect, useState } from "react";
import axios from 'axios';

const BaseURL = process.env.BaseURL;

export default function Home() {
  const [tableData, setTableData] = useState<any>(null)
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
      <BasicTable tableData={tableData} setTableData={setTableData} columnHeaders={columnHeaders}/>
    </>
  );
}
