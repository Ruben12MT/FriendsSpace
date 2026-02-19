import React from "react";
import { Outlet } from "react-router";
import HomeBar from "../components/HomeBar";

function Home() {

  return (
    <>
      <HomeBar />
      <Outlet />
    </>
  );
}

export default Home;