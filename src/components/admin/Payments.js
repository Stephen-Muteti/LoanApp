import AdminSidebar from './AdminSidebar.js';
import PaymentsTable from './PaymentsTable.js';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import {NavLink, Outlet, useNavigate} from 'react-router-dom';

const Payments = () => {
	return(
		<div className="container-fluid">
			<div className="row">
                <div className="col-12">
                    <div className="page-title-box d-flex align-items-center justify-content-between">
                        <h4 className="mb-0">Manage Payments</h4>
                        <div className="page-title-right">
                            <Stack direction="row" className="add-user-container">
                              <NavLink to="add-payment" className="add-user-link">
                                <Button variant="outlined" startIcon={<AddOutlinedIcon />}>
                                  Add payment
                                </Button>
                                </NavLink>
                            </Stack>
                        </div>
                    </div>
                </div>
            <div className="row fire-reports-wrapper">
                <PaymentsTable/>
            </div>
            <div className="row fire-reports-wrapper display-flex-center">
                {/*<FireReportsChart/>*/}
            </div>
            </div>
        </div>
		)
}

export default Payments;