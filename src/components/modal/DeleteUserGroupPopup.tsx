import React from 'react';

import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

interface TeamPermission {
  [email: string]: string; // Key is an email, value is the permission level (e.g., "manage")
}

type TeamAttributes = {
  name: string;
  description: string;
  created_ts: number;
  modified_ts: number;
  is_active: boolean;
  permission: TeamPermission;
  key_id: string;
  org: string;
  id: string;
};

type TeamData = {
  type: string;
  id: string;
  attributes: TeamAttributes;
  links?: {
    self?: string;
  };
};

interface DeleteUserGroupPopupProps {
  team: TeamData; // Team data to be deleted
  open: boolean; // Whether the popup is open or not
  onClose: () => void; // Function to close the popup
  onDelete: (team: TeamData) => void; // Function to handle the deletion
}

export default function DeleteUserGroupPopup({
  team,
  open,
  onClose,
  onDelete,
}: DeleteUserGroupPopupProps) {
  const handleConfirmDelete = () => {
    // Call the delete logic here
    onDelete(team); // Use the user details for deletion
    onClose();
  };

  return (
    <>
      <BootstrapDialog
        onClose={onClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle
          sx={{ m: 0, p: 2, width: 600, background: '#fff0f5' }}
          id="customized-dialog-title"
        >
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
            Are you sure you want to delete this user group? This action cannot
            be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onClose}
            autoFocus
            style={{
              border: '1px solid #00a2ed',
              background: 'grey',
              color: 'white',
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            autoFocus
            style={{
              border: '1px solid red',
              background: 'red',
              color: 'white',
            }}
          >
            Confirm Delete
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </>
  );
}
