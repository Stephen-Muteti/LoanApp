import {Outlet} from 'react-router-dom';
import { Helmet } from 'react-helmet';
import AdminSidebar from './admin/AdminSidebar.js';
import React, { useState, useEffect } from 'react';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { Footer } from './Footer.js';
import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';

export const Admin = () => {  
  const [showSideBar, setShowSideBar] = useState(false);

  const handleSideBarToggle = () => {
    setShowSideBar(!showSideBar);
  };


  return (
    <>
    <Helmet>
      <title>Tangulbei | Admin</title>
    </Helmet>
    <AdminSidebar
      showSideBar={showSideBar}
    />
    <div className="main-content">
      <SimpleBar className="page-content page-container-scroll">
      <div className="page-title-right menu-bar" style={{display: 'flex', justifyContent: 'right'}}>
        <IconButton aria-label="delete" size="medium" onClick={() => handleSideBarToggle()}>
          <MenuIcon fontSize="inherit" />
        </IconButton>
      </div>
        
          <Outlet/>   
          <Footer/>               
      </SimpleBar>    
    </div>
    </>
  );
};

export default Admin;
