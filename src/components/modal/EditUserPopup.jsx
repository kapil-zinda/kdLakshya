import React, { useState, useEffect } from 'react';
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

export function UpdateUserPopUp({ open1, onClose, user,setUserDatas, userDatas}) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [firstNameError, setFirstNameError] = useState(false);
  const [lastNameError, setLastNameError] = useState(false);
  console.log("edit user id", user.id)
  const [bearerToken, setBearerToken] = useState(''); 
  // Populate data when user prop or open1 changes
  useEffect(() => {
    if (user && open1) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email);
    }
    const token = getItemWithTTL("bearerToken"); 
    setBearerToken(token);
  }, [user, open1, userDatas]);


  const handleClose = () => {
    onClose();
    // Reset error states when the modal is closed
    setFirstNameError(false);
    setLastNameError(false);
  };

  const handleSave = async() => {
    let isValid = true;

    // Validate first name
    if (!firstName.trim()) {
      setFirstNameError(true);
      isValid = false;
    } else {
      setFirstNameError(false);
    }

    // Validate last name
    if (!lastName.trim()) {
      setLastNameError(true);
      isValid = false;
    } else {
      setLastNameError(false);
    }

    // If both inputs are valid, proceed to save
    if (isValid) {
      const updatedUserData = {
        first_name: firstName,
        last_name: lastName,
      };

      // Here you would send the updated data to your backend (API call)
      console.log('Updated User Data:', updatedUserData);
      try {
        const res = await axios.patch(
            `${BaseURLAuth}/users/${user.id}`,
            {
              data: {
                type: "users",
                id: user.id,
                attributes: updatedUserData,
              },
            },
            {
              headers: {
                Authorization: `Bearer ${bearerToken}`,
                'Content-Type': 'application/vnd.api+json',
              },
            }
          );
          const updatedUser = res.data.data.attributes;

          // Update the userDatas array
          const updatedUserDatas = userDatas.map((u) => 
            u.user_id === user.user_id ? { ...u, ...updatedUser } : u
          );
      
          // Update state with new user data
          setUserDatas(updatedUserDatas);
          
        console.log(updatedUserDatas, "aise faadega bhai...");
      } catch (error) {
        console.log(error);
      }

      // Close the modal after saving
      handleClose();
    }
  };

  return (
    <BootstrapDialog
      onClose={handleClose}
      aria-labelledby="customized-dialog-title"
      open={open1}
    >
      <DialogTitle sx={{ m: 0, p: 2, width: 900, background: "#fff0f5" }} id="customized-dialog-title">
        Update User
      </DialogTitle>
      <IconButton
        aria-label="close"
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
          Please update the details for the user.
        </Typography>

        {/* Email Input (Disabled) */}
        <TextField
          margin="dense"
          id="email"
          label="Email"
          type="email"
          fullWidth
          variant="outlined"
          value={email}
          disabled
        />

        {/* First Name Input */}
        <TextField
          margin="dense"
          id="firstName"
          label="Update First Name"
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
          label="Update Last Name"
          type="text"
          fullWidth
          variant="outlined"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          error={lastNameError}
          helperText={lastNameError ? 'Last name is required' : ''}
          required
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleSave}
          autoFocus
          style={{ border: "1px solid #00a2ed", background: "#00a2ed", color: "white" }}
        >
          Update User
        </Button>
      </DialogActions>
    </BootstrapDialog>
  );
}
