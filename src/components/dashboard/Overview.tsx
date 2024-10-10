"use client"
import styled from "@emotion/styled";
import { Button } from "@mui/material";
import { PenIcon, User2Icon } from "lucide-react";
import React from 'react'

const Card = styled.div`
    background: "#d3ebffcc";
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

    @media (max-width: 768px) {
        padding: 0.6rem 0.5rem;
    }
`;

const FlexContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
`;

const UserCard = styled.div`
    display: flex;
    width: 100%;
    max-width: 300px;
    height: 100px;
    justify-content: center;
    align-items: center;
    margin: 5px auto;
    
    @media (min-width: 768px) {
        width: 48%;
    }

    @media (min-width: 1024px) {
        width: 32%;
    }
`;

const UserAvatar = styled.div`
    margin: 0 10px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: orange;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0;
`;

const UserInfo = styled.div`
    margin-left: 5px;
    width: 225px;
    font-size: 14px;
`;

const users = [
    { name: "Kapil Zinda", email: "ZindaHaiKapil@mail.com" },
    { name: "Rishabh Kumar", email: "rishabh@mail.com" },
    { name: "John Doe", email: "john@mail.com" },
    // Add more users here
];

export const UserList = () => {
    return (
        <FlexContainer>
            {users.map((user, index) => (
                <UserCard key={index}>
                    <UserAvatar>
                        <User2Icon style={{ height: "30px", width: "30px" }} />
                    </UserAvatar>
                    <UserInfo>
                        <div>{user.name}</div>
                        <div style={{ fontSize: "12px" }}>{user.email}</div>
                    </UserInfo>
                </UserCard>
            ))}
        </FlexContainer>
    );
};

const Overview = () => {
    return (
        <>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 1rem" }}>
                <h1 style={{ fontSize: "22px", textAlign: "center", marginBottom: "1rem" }}>Uchhal Organisation Management Dashboard</h1>
                <Button variant="outlined" style={{ marginBottom: "1rem" }}>
                    <PenIcon style={{ marginRight: "8px", width: "15px" }} /> Edit Details
                </Button>
            </div>
            <Card>
                <h2 style={{ margin: "10px 5px", fontSize: "20px", fontWeight: "500" }}>Organisation Details</h2>
                <hr style={{ margin: "10px 0" }} />
                <div style={{ fontSize: "18px", margin: "24px 1rem" }}>
                    <h3>Organisation Name</h3>
                    <p style={{ fontSize: "14px", margin: "5px 0rem", color: "#696969" }}>Uchhal Data Service</p>
                </div>
                <div style={{ fontSize: "18px", margin: "5px 1rem" }}>Description</div>
                <p style={{ fontSize: "14px", margin: "5px 1rem", color: "#696969" }}>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Tempore dolore neque possimus, doloribus dolorem nesciunt in cum blanditiis aperiam amet?</p>
                <hr style={{ margin: "10px 0" }} />
                <div style={{ fontSize: "18px", margin: "5px 1rem" }}>Organisation Owner</div>
                <UserCard>
                    <UserAvatar>
                        <User2Icon style={{ height: "30px", width: "30px" }} />
                    </UserAvatar>
                    <UserInfo>
                        <div>Kapil Zinda</div>
                        <div style={{ fontSize: "12px" }}>Kapilzindahai@mail.com</div>
                    </UserInfo>
                </UserCard>
                <div style={{ fontSize: "18px", margin: "5px 1rem" }}>Organisation Admins</div>
                <UserList />
            </Card>
        </>
    )
}

export default Overview