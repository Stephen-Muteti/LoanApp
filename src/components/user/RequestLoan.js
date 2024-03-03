import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import axios from 'axios';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import { Helmet } from 'react-helmet';

const RequestLoan = () => {
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState('');
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [dataLoadError, setDataLoadError] = useState(false);
  const [submissionError, setSubmissionError] = useState(false);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setAmount(value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    
    const isValid = validateForm();

    const parsedAmount = parseFloat(amount);

    if (!isValid) {
      return;
    }

    setShowProgressBar(true);
    setShowSuccessMessage(false);
    setSubmissionError(false);

    await submitBrigade(parsedAmount);

    
    setShowSuccessMessage(true);
  };


  const submitBrigade = async (parsedAmount) => {
    try {
      const authToken = localStorage.getItem("access_token");      
      const response = await axios.post(`http://localhost:5000/request_loan`, {'amount' : parsedAmount},
        {
          headers: {Authorization: `Bearer ${authToken}`,},
        }
        );

      if (response.status === 200) {
        setShowSuccessMessage(true);
        setMessage(response.data.message);
      }
    } catch (error) {
      handleRequestError(error);
    } finally {
      setShowProgressBar(false);
    }
};


const handleRequestError = (error) => {
  setSubmissionError(true);
  let message = 'An error occurred while processing your request';
  if (error.response) {
    message = `Error ${error.response.status} : ${error.response.data.error}`;
  } else if (error.request) {
    message = 'Server is unreachable. Try again later';
  }
  setMessage(message);
};

  const validateForm = () => {
    let isValid = true;
    const amountValue = amount; // Declare amount here

    if (!amountValue || isNaN(parseFloat(amountValue))) {
      setAmountError('Please enter a valid amount.');
      isValid = false;
    } else {
      const parsedAmount = parseFloat(amountValue);
      if (parsedAmount <= 0) {
        setAmountError('Amount must be a positive number.');
        isValid = false;
      } else {
        setAmountError('');
      }
    }

    return isValid;
  };

	return(
		<div className="main-content user-main-container">
      <Helmet>
		  <title>Tangulbei | Request Loan</title>
		</Helmet>
      <SimpleBar className="page-content page-container-scroll">
        <div className="container-fluid">
          <div className="row">
            <div className="col-xl-4 send-fire-report-form">
              <div className="card card-h-100">
                <div className="card-header justify-content-between d-flex align-items-center">
                  <h4 className="card-title">Request Loan</h4>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmit}>                

                    {dataLoadError ? (
                      <div className="text-danger">
                        {message}
                      </div>
                    ) : (
                    <>

                    <div className="row">
                      <div className="col-md-12">
                        <div className="mb-3">
                          <TextField
                            required
                            className="form-control"
                            label="Amount"
                            helperText={amountError}
                            id="formrow-email-input"
                            name="amount"
                            value={amount}
                            onChange={handleInputChange}
                            error={amountError ? true : false}
                          />
                        </div>
                      </div>
                    </div>
                    {showProgressBar && (
                      <>
                        <div className="progress-circle-container">
                          <Stack sx={{ color: 'grey.500' }} direction="row">
                            <CircularProgress color="primary" />
                          </Stack>
                        </div>
                      </>
                    )}
                    {(submissionError || showSuccessMessage) && !showProgressBar && (
                      <div className={submissionError ? 'text-danger' : 'text-success'}>
                          {message}
                        </div>
                    )}

                    <div className="mt-4">
                      <button type="submit" className="btn btn-primary w-md">
                        Submit
                      </button>
                    </div>
                    </>
                    )
                  }                  
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SimpleBar>
    </div>
  );
};

export default RequestLoan;