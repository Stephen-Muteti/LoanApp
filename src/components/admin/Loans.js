import AdminSidebar from './AdminSidebar.js';
import LoansTable from './LoansTable.js';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import {NavLink, Outlet, useNavigate} from 'react-router-dom';
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined';

const Loans = () => {
	return(
		<div className="container-fluid">
			<div className="row">
                <div className="col-12">
                    <div className="page-title-box d-flex align-items-center justify-content-between">
                        <h4 className="mb-0">Manage Loans</h4>
                        <div className="page-title-right">
                            <ol className="breadcrumb m-0">
                                <li className="breadcrumb-item"><a>Admin</a></li>
                                <i><ArrowForwardIosOutlinedIcon/></i>
                                <li className="breadcrumb-item active">Loans</li>
                            </ol>
                        </div>
                    </div>
                </div>
            <div className="row fire-reports-wrapper">
                <LoansTable/>
            </div>
            <div className="row fire-reports-wrapper display-flex-center">
                {/*<FireReportsChart/>*/}
            </div>
            </div>
        </div>
		)
}

export default Loans;