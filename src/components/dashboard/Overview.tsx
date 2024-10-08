"use client"
import styled from "@emotion/styled";
import { Button } from "@mui/material";
import { PenIcon, User2Icon } from "lucide-react";
import Image from "next/image";
import React from 'react'
const Card = styled.div`
    background:"#d3ebffcc";
    position: relative;
    cursor: pointer;
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
    width: 100%;
    padding: 0.8rem 1rem;
    margin-top: 2rem;
    border-radius: 0.5rem;
    box-shadow: rgb(23 93 207 / 20%) 0px 2px 8px 0px, 0px 0px 2px #1949a1;
    border: 1px solid rgb(66, 133, 244);
    transition: 250ms;

    /* arrangemetns */
    // display: flex;

    @media (max-width: 400px) {
        padding: 0.6rem 0.5rem;
    }
`;
const users = [
    { name: "Kapil Zinda", email: "ZindaHaiKapil@mail.com" },
    { name: "Rishabh Kumar", email: "rishabh@mail.com" },
    // Add more users here
  ];
  
  export const UserList = () => {
    return (
      <div>
        {users.map((user, index) => (
          <div key={index} style={{ fontSize: "18px", margin: "5px 1rem", display: 'flex', width: "300px", height: "100px", justifyContent: 'center', alignItems: "center"}}>
            <div style={{ margin: "0 10px", width: "60px", height: "60px", borderRadius: "50%", background: "orange", display: "flex", justifyContent: 'center', alignItems: "center", padding: "0" }}>
              <User2Icon style={{ height: "30px", width: "30px" }} />
            </div>
            <div style={{ marginLeft: "5px", width: "225px", fontSize: "14px" }}>
              <div>{user.name}</div>
              <div style={{ fontSize: "12px" }}>{user.email}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
const Overview = () => {
  return (
    <>
    <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
        <h1 style={{fontSize: "22px"}}>Uchhal Organisation Management Dashboard</h1>
       <Button variant="outlined" style={{marginLeft: "auto"}}><PenIcon style={{marginRight: "8px", width: "15px"}} /> Edit Details </Button> 
    </div>
    <Card>
    <h2 style={{margin: "10px 5px", fontSize: "20px", fontWeight: "500"}}>Organisation Details</h2>
    <hr style={{margin: "10px 0"}}/>
    <div style={{fontSize: "18px", margin: "24px 1rem"}}>
        <h3>Organisation Name</h3>
        <p style={{fontSize: "14px",margin: "5px 0rem", color: "#696969"}}>Uchhal Data Service</p>
    </div>
    <div style={{fontSize: "18px", margin: "5px 1rem"}}>Description</div>
    <p style={{fontSize: "14px",margin: "5px 1rem", color: "#696969" }}>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Tempore dolore neque possimus, doloribus dolorem nesciunt in cum blanditiis aperiam amet?</p>
    <hr style={{margin: "10px 0"}}/>
    <div style={{fontSize: "18px", margin: "5px 1rem"}}>Organisation Owner</div>
    {/* <p style={{fontSize: "14px",margin: "5px 1rem" }}>Edit the details for the Organisation Owner</p> */}
    <div style={{fontSize: "18px", margin: "5px 1rem", display: 'flex', width: "300px", height: "100px", justifyContent: 'center', alignItems: "center"}}>
       <div style={{margin: "0 10px",width: "60px",  height: "60px", borderRadius: "50%", background: "orange", display: "flex", justifyContent: 'center', alignItems: "center", padding: "0"}}> <User2Icon style={{height: "30px", width: "30px"}} /> </div>
       <div style={{marginLeft: "5px", width: "225px", fontSize: "14px"}}> 
            <div>Kapil Zinda</div>
            <div style={{fontSize: "12px"}} >Kapilzindahai@mail.com</div>
       </div>
    </div>
    <div style={{fontSize: "18px", margin: "5px 1rem"}}>Organisation Admins</div>
    {/* <p style={{fontSize: "14px",margin: "5px 1rem" }}>Edit the details for the Organisation Admin</p> */}
    <div style={{display: "flex", margin: "auto"}}>
        <div style={{fontSize: "18px", margin: "5px 1rem", display: 'flex', width: "300px", height: "100px", justifyContent: 'center', alignItems: "center"}}>
        <div style={{margin: "0 10px",width: "60px",  height: "60px", borderRadius: "50%", background: "orange", display: "flex", justifyContent: 'center', alignItems: "center", padding: "0"}}> <User2Icon style={{height: "30px", width: "30px"}} /> </div>
        <div style={{marginLeft: "5px", width: "225px", fontSize: "14px"}}> 
                <div>Kapil Zinda</div>
                <div style={{fontSize: "12px"}} >Kapilzindahai@mail.com</div>
        </div>
        </div>
        <div style={{fontSize: "18px", margin: "5px auto", display: 'flex', width: "300px", height: "100px", justifyContent: 'center', alignItems: "center"}}>
        <div style={{margin: "0 10px",width: "60px",  height: "60px", borderRadius: "50%", background: "orange", display: "flex", justifyContent: 'center', alignItems: "center", padding: "0"}}> <User2Icon style={{height: "30px", width: "30px"}} /> </div>
        <div style={{marginLeft: "5px", width: "225px", fontSize: "14px"}}> 
                <div>Kapil Zinda</div>
                <div style={{fontSize: "12px"}} >Kapilzindahai@mail.com</div>
        </div>
        </div>
        <div style={{fontSize: "18px", margin: "5px auto", display: 'flex', width: "300px", height: "100px", justifyContent: 'center', alignItems: "center"}}>
        <div style={{margin: "0 10px",width: "60px",  height: "60px", borderRadius: "50%", background: "orange", display: "flex", justifyContent: 'center', alignItems: "center", padding: "0"}}> <User2Icon style={{height: "30px", width: "30px"}} /> </div>
        <div style={{marginLeft: "5px", width: "225px", fontSize: "14px"}}> 
                <div>Kapil Zinda</div>
                <div style={{fontSize: "12px"}} >Kapilzindahai@mail.com</div>
        </div>
        </div>
        
    </div>
    </Card>
    </>
  )
}

export default Overview