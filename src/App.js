import logo from './logo.svg';
import './assets/app.min.css';
import './assets/bootstrap.min.css';
import './assets/jsvectormap.min.css';
import './App.css';
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login.js';
import { AuthProvider } from './components/auth.js';
import {RequireAuth} from './components/RequireAuth';
import Header from './components/Header.js';
import NotFound from './components/NotFound.js';
import Admin from './components/Admin.js';
import Dashboard from './components/admin/Dashboard.js';
import AddUser from './components/AddUser.js';
import EditUser from './components/EditUser.js';
import Payments from './components/admin/Payments.js';
import Loans from './components/admin/Loans.js';
import AddPayment from './components/AddPayment.js';
import Home from './components/user/Home.js';
import RequestLoan from './components/user/RequestLoan.js';

function App() {
  return (
    <AuthProvider>
      <div id="layout-wrapper">
        <Header/>
        <Routes>

        <Route path="/" element={<RequireAuth requiredRole={["member", "administrator", "staff"]}><Home /></RequireAuth>}>
          {/*<Route index element={<Dashboard />} />
          <Route path="payments" element={<Payments/>} />
          <Route path="loans" element={<Loans/>} />*/}
        </Route>

        <Route path="/admin" element={<RequireAuth requiredRole={["administrator", "staff"]}><Admin /></RequireAuth>}>
          <Route index element={<Dashboard />} />
          <Route path="payments" element={<Payments/>} />
          <Route path="loans" element={<Loans/>} />
        </Route>

          <Route path="/login" element={<Login/>} />   
          <Route path="/request-loan" element={<RequestLoan />} />   


        <Route path="/admin/add-user" element={<AddUser />} />
        <Route path="/admin/payments/add-payment" element={<AddPayment />} />
        <Route path="admin/edit-user/:userId" element={<EditUser />} />   

        <Route path="*" element={<NotFound />} />             

        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
