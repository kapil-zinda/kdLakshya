"use client";
import { useEffect } from 'react';
import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { TaskProvider } from "@/context/task-context";
import { ChallengeProvider } from "@/context/challenge-context";
import axios from "axios";
import { useRouter } from "next/navigation";

export function Providers({ children }: ThemeProviderProps) {
  const [accessTkn, setAccessTkn] = React.useState<string | null>(null)
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("bearerToken");
      console.log(token, "helelo")
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
      data.append('redirect_uri', 'https://test-10k-hours.uchhal.in/');

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
            localStorage.setItem("bearerToken", response.data.access_token);
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
      window.location.href = `https://dev-p3hppyisuuaems5y.us.auth0.com/authorize?response_type=code&client_id=Yue4u4piwndowcgl5Q4TNlA3fPlrdiwL&redirect_uri=https://test-10k-hours.uchhal.in/&scope=${encodeURIComponent("openid profile email")}`; 
    }
   } catch (error) {
      console.log(error);
   }
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
