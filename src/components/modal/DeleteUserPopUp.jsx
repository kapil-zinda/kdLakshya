import React, { useState } from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import { DropdownMenuItem } from '@radix-ui/react-dropdown-menu';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

export function DeleteUserPopup({ user, open, onClose, onDelete }) {
  const handleConfirmDelete = () => {
    // Call the delete logic here
    onDelete(user); // Use the user details for deletion
    onClose();
  };

  return (
    <BootstrapDialog onClose={onClose} aria-labelledby="customized-dialog-title" open={open}>
      <DialogTitle sx={{ m: 0, p: 2, width: 600, background: "#fff0f5" }} id="customized-dialog-title">
        Confirm Deletion
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={onClose}
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
          Are you sure you want to delete this user? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          autoFocus
          style={{ border: "1px solid #00a2ed", background: "grey", color: "white" }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirmDelete}
          autoFocus
          style={{ border: "1px solid red", background: "red", color: "white" }}
        >
          Confirm Delete
        </Button>
      </DialogActions>
    </BootstrapDialog>
  );
}