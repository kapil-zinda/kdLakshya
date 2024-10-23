import React, { useState } from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import { getItemWithTTL } from '@/utils/customLocalStorageWithTTL';

const BaseURLAuth = process.env.NEXT_PUBLIC_BaseURLAuth || '';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

export default function CreateUserPopUp({data, setUserDatas}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [firstNameError, setFirstNameError] = useState(false);
  const [lastNameError, setLastNameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const bearerToken = getItemWithTTL("bearerToken"); 
  const handleClose = () => {
    setOpen(false);
    setEmail('');
    setFirstName('');
    setLastName('');
    setTemporaryPassword('');
    setEmailError(false);
    setFirstNameError(false);
    setLastNameError(false);
    setPasswordError(false);
  };

  const handleSave = async() => {
    let isValid = true;
    if (!email.trim()) {
      setEmailError(true);
      isValid = false;
    } else {
      setEmailError(false);
    }

    if (!firstName.trim()) {
      setFirstNameError(true);
      isValid = false;
    } else {
      setFirstNameError(false);
    }

    if (!lastName.trim()) {
      setLastNameError(true);
      isValid = false;
    } else {
      setLastNameError(false);
    }
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;
    if (!passwordRegex.test(temporaryPassword)) {
      setPasswordError(true);
      isValid = false;
    } else {
      setPasswordError(false);
    }
    if (isValid) {
      const userData = {
        email,
        first_name: firstName,
        last_name: lastName,
        temporary_password: temporaryPassword,
      };
      console.log(userData)
      try {
        const res = await axios.post(
            `${BaseURLAuth}/users`,
            {
              data:{
                  type: "users",
                  attributes: userData
              }
          },
            {
              headers: {
                Authorization: `Bearer ${bearerToken}`,
                'Content-Type': 'application/vnd.api+json',
              },
            }
          );
          const updatedUser = res.data.data;
          setUserDatas((prevData) => [...prevData, updatedUser]);
      } catch (error) {
        console.log(error);
      }
      handleClose();
    }
  };

  return (
    <>
      <Button variant="outlined" onClick={handleClickOpen} className='mr-auto'>
        + New user 
      </Button>
      <BootstrapDialog
        onClose={handleClose}
        open={open}
      >
        <DialogTitle sx={{ m: 0, p: 2, width: 900, background: "#fff0f5" }} id="customized-dialog-title">
          Create User
        </DialogTitle>
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          <Typography gutterBottom>
            Please enter the details for the new user.
          </Typography>

          {/* Email Input */}
          <TextField
            autoFocus
            margin="dense"
            id="email"
            label="Enter Email"
            type="email"
            fullWidth
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError}
            helperText={emailError ? 'Email is required' : ''}
            required
          />

          {/* First Name Input */}
          <TextField
            margin="dense"
            id="firstName"
            label="Enter First Name"
            type="text"
            fullWidth
            variant="outlined"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            error={firstNameError}
            helperText={firstNameError ? 'First name is required' : ''}
            required
          />

          {/* Last Name Input */}
          <TextField
            margin="dense"
            id="lastName"
            label="Enter Last Name"
            type="text"
            fullWidth
            variant="outlined"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            error={lastNameError}
            helperText={lastNameError ? 'Last name is required' : ''}
            required
          />

          {/* Temporary Password Input */}
          <TextField
            margin="dense"
            id="temporaryPassword"
            label="Enter Temporary Password"
            type="password"
            fullWidth
            variant="outlined"
            value={temporaryPassword}
            onChange={(e) => setTemporaryPassword(e.target.value)}
            error={passwordError}
            helperText={passwordError ? 'Password must be 8-20 characters, include at least one uppercase letter and one special character' : ''}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleSave}
            autoFocus
            style={{border: "1px solid #00a2ed", background: "#00a2ed", color: "white"}}
          >
            Create user
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </>
  );
}
