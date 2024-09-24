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

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

export default function CreateUserGroupPopUp() {
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [nameError, setNameError] = useState(false);
  const [descriptionError, setDescriptionError] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
    // Clear form inputs when the modal is closed
    setGroupName('');
    setGroupDescription('');
    setNameError(false);
    setDescriptionError(false);
  };

  const handleSave = () => {
    let isValid = true;

    // Check if group name is empty
    if (!groupName.trim()) {
      setNameError(true);
      isValid = false;
    } else {
      setNameError(false);
    }

    // Check if group description is empty
    if (!groupDescription.trim()) {
      setDescriptionError(true);
      isValid = false;
    } else {
      setDescriptionError(false);
    }

    // If both inputs are valid, proceed to save
    if (isValid) {
      const userData = {
        groupName,
        groupDescription,
      };

      // Here you would send the data to your backend (API call)
      console.log('Group Data:', userData);

      // Close the modal after saving
      handleClose();
    }
  };

  return (
    <>
      <Button variant="outlined" onClick={handleClickOpen}>
        Create User Group
      </Button>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle sx={{ m: 0, p: 2, width: 900, background: "#fff0f5" }} id="customized-dialog-title">
          Create User Group
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
            Please enter the details for the new user group.
          </Typography>

          {/* Group Name Input */}
          <TextField
            autoFocus
            margin="dense"
            id="groupName"
            label="Enter Group Name"
            type="text"
            fullWidth
            variant="outlined"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            error={nameError}
            helperText={nameError ? 'Group name is required' : ''}
            required
          />

          {/* Group Description Input */}
          <TextField
            margin="dense"
            id="groupDescription"
            label="Enter Group Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={groupDescription}
            onChange={(e) => setGroupDescription(e.target.value)}
            error={descriptionError}
            helperText={descriptionError ? 'Group description is required' : ''}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleSave}
            autoFocus
            style={{border: "1px solid #00a2ed", background: "#00a2ed", color: "white"}}
          >
            Create user group
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </>
  );
}
