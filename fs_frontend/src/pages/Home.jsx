
import React from "react";
import { Outlet } from "react-router";

function Home() {
  return (
    <>
      <h1>HEADER</h1>
      <Outlet/>
    </>
  );
}

export default Home;
