import { Amplify, Hub, Auth} from 'aws-amplify';
import awsExports from '../aws-exports';
import React, {useEffect, useState} from 'react';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import "@fortawesome/fontawesome-free/css/all.min.css";
import { MDBBtn, MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBInput, MDBIcon, MDBCheckbox} from 'mdb-react-ui-kit';
import {ToastContainer, toast} from 'react-toastify';
import { maxHeight, maxWidth } from '@mui/system';
import {Link, Routes, Route, useNavigate} from 'react-router-dom';
import 'react-toastify'

export default function HostHomePage() {
    return (
        <>
        <h2> Host Home Page </h2>
        </>
    )
}