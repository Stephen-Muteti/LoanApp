import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';

const AddPayment = () => {
  const [formData, setFormData] = useState({
    amount: '',
    idno: '',
    receipt: '',
  });

  const [idnoError, setIdnoError] = useState('');
  const [amountError, setAmountError] = useState('');
  const [receiptError, setReceiptError] = useState('');

  const [showProgressBar, setShowProgressBar] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [submissionError, setSubmissionError] = useState(false);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const isValid = validateForm();

    formData.amount = parseFloat(formData.amount);

    if (!isValid) {
      return;
    }

    setShowProgressBar(true);
    setShowSuccessMessage(false);
    setSubmissionError(false);

    await submitFormData(formData);

    setShowSuccessMessage(true);
  };

  const submitFormData = async (data) => {
    try {
      const authToken = localStorage.getItem('access_token');
      const response = await axios.post('http://localhost:5000/add_payment', formData, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.status === 200) {
        setShowProgressBar(false);
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

    if (!formData.idno.trim()) {
      setIdnoError('Please enter your ID Number.');
      isValid = false;
    } else if (!/^\d{7,}$/.test(formData.idno)) {
      setIdnoError('ID Number must contain at least 7 digits.');
      isValid = false;
    } else {
      setIdnoError('');
    }

    if (!formData.receipt.trim()) {
      setReceiptError('Please enter your Receipt Number.');
      isValid = false;
    } else {
      setReceiptError('');
    }

    // Check if the amount is a valid number
    if (!formData.amount || isNaN(parseFloat(formData.amount))) {
      setAmountError('Please enter a valid amount.');
      isValid = false;
    } else {
      const amount = parseFloat(formData.amount);
      if (amount <= 0) {
        setAmountError('Amount must be a positive number.');
        isValid = false;
      } else {
        setAmountError('');
      }
    }

    return isValid;
  };


  return (
    <div className="main-content user-main-container">
      <Helmet>
        <title>ZimaMoto | Add payment</title>
      </Helmet>
      <SimpleBar className="page-content page-container-scroll">
        <div className="container-fluid">
          <div className="row">
            <div className="col-xl-6 send-fire-report-form">
              <div className="card card-h-100">
                <div className="card-header justify-content-between d-flex align-items-center">
                  <h4 className="card-title">Add Payment</h4>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <TextField
                            required
                            id="formrow-firstname-input"
                            className="form-control"
                            label="ID Number"
                            helperText={idnoError}
                            value={formData.idno}
                            onChange={handleInputChange}
                            name="idno"
                            error={idnoError ? true : false}
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="mb-3">
                          <TextField
                            required
                            className="form-control"
                            label="Amount (KSH)"
                            helperText={amountError}
                            id="formrow-phone-input"
                            name="amount"
                            value={formData.amount}
                            onChange={handleInputChange}
                            error={amountError ? true : false}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <TextField
                            required
                            id="formrow-firstname-input"
                            className="form-control"
                            label="Receipt Number"
                            helperText={receiptError}
                            value={formData.receipt}
                            onChange={handleInputChange}
                            name="receipt"
                            error={receiptError ? true : false}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Display the progress circle */}
                    {showProgressBar && (
                      <div className="progress-circle-container">
                        <Stack sx={{ color: 'grey.500' }} direction="row">
                          <CircularProgress color="primary" />
                        </Stack>
                      </div>
                    )}

                    {/* Display the success message */}
                    {showSuccessMessage && (
                      <div className={`form-submission-message ${submissionError ? 'text-danger' : 'text-success'}`}>
                        {message}
                      </div>
                    )}

                    <div className="mt-4">
                      <button type="submit" className="btn btn-primary w-md">
                        Submit
                      </button>
                    </div>
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

export default AddPayment;
