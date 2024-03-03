import {NavLink, Outlet} from 'react-router-dom';
import HomeOutlinedIcon from '@mui/icons-material/Home';
import InfoOutlinedIcon from '@mui/icons-material/Info';
import BarChartOutlinedIcon from '@mui/icons-material/BarChart';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import MoneyIcon from '@mui/icons-material/Money';
import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './auth.js';


const Header = () => {
    const auth = useAuth();

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        navigate('/login');
        auth.logout();
    };

	return(
        <>
		<header id="page-topbar">
	        <div className="navbar-header row">
                <div className="col-xl-6 navbar-brand-box brand-box-for-user">
                    <NavLink to="/" className="logo app-name-link logo-dark">
                        <span className="app-name">
                            Tangulbei
                        </span>
                    </NavLink>
                </div>
	        	{auth.user && (
                <ul className="col-xl-4 nav nav-tabs nav-tabs-custom navbar home-navbar" role="tablist">                
                    
                    <li className="nav-item">
                        <NavLink className="nav-link" data-bs-toggle="tab" role="tab" to="/" end>
                            <span className="d-block d-sm-none"><i><HomeOutlinedIcon/></i></span>
                            <span className="d-none d-sm-block">Home</span> 
                        </NavLink>
                    </li>
                    
                        <div className="id-container">{auth.user.idno}</div>
                        <Button onClick={handleLogout}>
                            <span className="d-block d-sm-none"><i><LogoutIcon/></i></span>
                            <span className="d-none d-sm-block">Logout</span>    
                        </Button>
                    
                </ul>)}
	        </div>
      	</header>            
        </>
		);
}

export default Header;