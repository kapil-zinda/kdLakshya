"use client"
import styled from "@emotion/styled";
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
const page = () => {
  return (
    <>
    <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
        <h1 style={{fontSize: "22px"}}>Uchhal Organisation Management Dashboard</h1>
       <button style={{marginLeft: "auto"}}> Edit Details </button> 
    </div>
    <Card>
    <h2 style={{margin: "10px 5px", fontSize: "20px", fontWeight: "500"}}>Organisation Details</h2>
    <hr style={{margin: "10px 0"}}/>
    <div style={{fontSize: "18px", margin: "5px 1rem"}}>Name {"&"} Email</div>
    <p style={{fontSize: "14px",margin: "5px 1rem" }}>Edit the details for the Organisation</p>
    <div style={{fontSize: "18px", margin: "24px 1rem"}}>
        <h3>Organisation Name</h3>
        <p style={{fontSize: "14px",margin: "5px 0rem"}}>Uchhal Data Service</p>
    </div>
    <hr style={{margin: "10px 0"}}/>
    <div style={{fontSize: "18px", margin: "5px 1rem"}}>Organisation Admin</div>
    <p style={{fontSize: "14px",margin: "5px 1rem" }}>Edit the details for the Organisation</p>
    <div>
        
        <p>Uchhal Data Service</p>
    </div>
    </Card>
    </>
  )
}

export default page