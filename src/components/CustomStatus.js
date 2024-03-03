import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import EditIcon from '@mui/icons-material/EditOutlined';
import IconButton from '@mui/material/IconButton';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress'; 
import MoreVertIcon from '@mui/icons-material/MoreVertOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDownOutlined';

export default function PositionedMenu({ id, onStatusChange }) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const customActionsTheme = createTheme({
    palette: {
      delete: {
        main: '#ff6384',
      },
      edit: {
        main: '#038edc',
        light: '#F5EBFF',
        contrastText: '#47008F',
      },
    },
  });

  const handleStatusChange = async (loanId, newStatus) => {
    await updateLoanStatus(loanId, newStatus);
    handleClose();   
    setAnchorEl(null);

    onStatusChange(loanId, newStatus);
  };

  const updateLoanStatus = async (loanId, newStatus) => {
    try {
      const authToken = localStorage.getItem('access_token');
      setInProgress(true);

      const response = await fetch(`http://localhost:5000/update_loan_status/${loanId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.status === 200) {
        console.log('Loan status updated successfully');
      } else {
        console.error('Failed to update loan status');
      }
    } catch (error) {
      console.error('An error occurred while updating loan status:', error);
    } finally {
      // Reset the loading state after the API call is complete
      setInProgress(false);
    }
  };

  const [inProgress, setInProgress] = React.useState(false); // Loading state

  return (
    <div>
      <ThemeProvider theme={customActionsTheme}>
        <IconButton
          aria-label="edit"
          size="small"
          id="demo-positioned-button"
          aria-controls={open ? 'demo-positioned-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
          color="edit"
        >
          <KeyboardArrowDownIcon fontSize="small" size={20}/>
        </IconButton>
      </ThemeProvider>
      <Menu
        id="demo-positioned-menu"
        aria-labelledby="demo-positioned-button"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuItem onClick={() => handleStatusChange(id, 'Pending')}>Pending</MenuItem>
        <MenuItem onClick={() => handleStatusChange(id, 'Under Review')}>Under Review</MenuItem>
        <MenuItem onClick={() => handleStatusChange(id, 'Disbursed')}>Disbursed</MenuItem>
        <MenuItem onClick={() => handleStatusChange(id, 'Repaid')}>Repaid</MenuItem>

        {inProgress && (
          <MenuItem style={{ display: 'flex', gap: '3px', justifyContent: 'center', alignItems: 'center' }}>
           <CircularProgress size={20} />
          </MenuItem>
        )}
      </Menu>
    </div>
  );
}
