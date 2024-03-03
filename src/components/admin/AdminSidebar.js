import DashboardIcon from '@mui/icons-material/DashboardOutlined';
import Analytics from '@mui/icons-material/AutoGraphOutlined';
import HelpCenterIcon from '@mui/icons-material/HelpCenterOutlined';
import ManageAccountsIcon from '@mui/icons-material/ManageAccountsOutlined';
import ManageBrigadesIcon from '@mui/icons-material/DirectionsBusFilledOutlined';
import PaymentsIcon from '@mui/icons-material/PaymentsOutlined';
import {NavLink} from 'react-router-dom';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import MoneyIcon from '@mui/icons-material/Money';
import React, { useState, useEffect } from 'react';


const AdminSidebar = ({showSideBar}) => {

    const sidebarStyle = {
      display: showSideBar ? 'block' : 'none',
    };

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, []);

    const isSmallScreen = windowWidth <= 1000;

	return(
		<div className="vertical-menu admin-sidebar" style={isSmallScreen ? sidebarStyle : {}}>
			<SimpleBar data-simplebar className="sidebar-menu-scroll admin-menu-scroll">
	            <div id="sidebar-menu">
	                <ul className="metismenu list-unstyled" id="side-menu">
	                    <li>
                            <NavLink to="" end>
                                <i className="icon nav-icon admin-sidebar-links"><ManageAccountsIcon/></i>
                                <span className="menu-item" data-key="t-sales">Manage Users</span>
                                <span className="badge rounded-pill badge-soft-secondary"></span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="payments">
                                <i className="icon nav-icon admin-sidebar-links"><PaymentsIcon/></i>
                                <span className="menu-item" data-key="t-sales">Payments</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="loans">
                                <i className="icon nav-icon admin-sidebar-links"><MoneyIcon/></i>
                                <span className="menu-item" data-key="t-sales">Loans</span>
                            </NavLink>
                        </li>
	                </ul>
	            </div>
	        </SimpleBar>
        </div>
		);
}

export default AdminSidebar;