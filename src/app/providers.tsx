"use client";
import { useEffect } from 'react';
import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { TaskProvider } from "@/context/task-context";
import { ChallengeProvider } from "@/context/challenge-context";
import axios from "axios";
import { useRouter } from "next/navigation";
import { userData, updateUserData } from './interfaces/userInterface';

export function Providers({ children }: ThemeProviderProps) {
  const [accessTkn, setAccessTkn] = React.useState<string | null>(null)

  const userMeData = async(bearerToken: string) => {
    try {
      // const res1 = await axios.options("https://apis.testkdlakshya.uchhal.in/auth/users/me?include=permission");
      const res = await axios.get("https://apis.testkdlakshya.uchhal.in/auth/users/me", {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/vnd.api+json',
        },
        withCredentials: true,
      }) 
      const response = res.data.data;
      await updateUserData({
        userId: response.id,
        keyId: "user-"+response.attributes.user_id,
        orgKeyId: "org-"+response.attributes.org,
        orgId: response.attributes.org,
        userEmail: response.attributes.email,
        firstName: response.attributes.first_name,
        lastName: response.attributes.last_name,
        permission: response.user_permissions,
        // allowedTeams: Object.keys(response.user_permissions).filter(key => key.startsWith('team')),
        allowedTeams: []
      })
      console.log(res.data);
      console.log(userData)
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const token = getItemWithTTL("bearerToken");
      if(!token) {
        loginHandler();
      }
      setAccessTkn(token);
    }
  }, []);
  const fetchAuthToken = async (code: string) => {
    try {
      const data = new URLSearchParams();
      data.append('grant_type', 'authorization_code');
      data.append('client_id', 'Yue4u4piwndowcgl5Q4TNlA3fPlrdiwL');
      data.append('client_secret', 'LpLbv2fd249ULiWf_t689qFem9IjS2yFDxkZmsm-0-pCmOhFAdOp1Xgr4TUOjGYY');
      data.append('code', code);
      data.append('redirect_uri', 'http://localhost:3000/');

      const config = {
        method: 'post',
        url: 'https://dev-p3hppyisuuaems5y.us.auth0.com/oauth/token',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: data
      };
      if(!accessTkn) {
          const response = await axios(config);
          console.log('Auth Token:', response.data);  
          setAccessTkn(response.data.access_token)
          if (typeof window !== "undefined") {
            setItemWithTTL("bearerToken", response.data.access_token, 23);
            await userMeData(response.data.access_token)
          }

      }
    } catch (error) {
      console.error('Error fetching auth token:', error);
    }
  };
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const parsedAuthCode = urlParams.get('code');

      if (parsedAuthCode && !accessTkn) {
        fetchAuthToken(parsedAuthCode); // Fetch the auth token
      }
    }
  }, []); 
  let bearerToken: string | null = null;

  // Only access localStorage in the client
  if (typeof window !== "undefined") {
    bearerToken = localStorage.getItem("bearerToken");
  }
  const loginHandler = async() => {
   try {
    console.log("hello", bearerToken);
    if(!accessTkn) {
      window.location.href = `https://dev-p3hppyisuuaems5y.us.auth0.com/authorize?response_type=code&client_id=Yue4u4piwndowcgl5Q4TNlA3fPlrdiwL&redirect_uri=http://localhost:3000/&scope=${encodeURIComponent("openid profile email")}`; 
    }
   } catch (error) {
      console.log(error);
   }
  }
  function setItemWithTTL(key: string, value: any, ttlHours: number) {
    const now = new Date().getTime();
    const ttlMilliseconds = ttlHours * 60 * 60 * 1000; // Convert hours to milliseconds
    const item = {
      value: value,
      expiry: now + ttlMilliseconds,
    };
    localStorage.setItem(key, JSON.stringify(item));
  }
  function getItemWithTTL(key: string) {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) {
      return null;
    }
  
    const item = JSON.parse(itemStr);
    const now = new Date().getTime();
  
    // Check if the item is expired
    if (now > item.expiry) {
      localStorage.removeItem(key); // Remove expired item
      return null;
    }
  
    return item.value;
  }
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ChallengeProvider>
        {/* <div onClick={loginHandler}>login</div> */}
        <TaskProvider>{children}</TaskProvider>
      </ChallengeProvider>
    </NextThemesProvider>
  );
}
