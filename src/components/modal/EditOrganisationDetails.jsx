import React, { useEffect, useState } from 'react';

import { getItemWithTTL } from '@/utils/customLocalStorageWithTTL';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import axios from 'axios';

const BaseURLAuth = process.env.NEXT_PUBLIC_BaseURLAuth || '';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

export function EditOrganisationDetails({
  onCloses = {},
  data = '',
  orgId = '',
  setData = {},
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [nameError, setNameError] = useState(false);
  const [descriptionError, setDescriptionError] = useState(false);
  const [bearerToken, setBearerToken] = useState('');

  // Populate data when dialog opens
  useEffect(() => {
    if (data) {
      setName(data.name || ''); // Use data.name instead of user.name
      setDescription(data.description || ''); // Use data.description instead of user.description
    }
    const token = getItemWithTTL('bearerToken');
    setBearerToken(token);
  }, [data]);

  const handleClose = () => {
    onCloses();
    setNameError(false);
    setDescriptionError(false);
  };

  const handleSave = async () => {
    let isValid = true;

    // Validate name
    if (!name.trim()) {
      setNameError(true);
      isValid = false;
    } else {
      setNameError(false);
    }

    // Validate description
    if (!description.trim()) {
      setDescriptionError(true);
      isValid = false;
    } else {
      setDescriptionError(false);
    }

    if (isValid) {
      try {
        const res = await axios.patch(
          `${BaseURLAuth}/organizations/${orgId}`,
          {
            data: {
              type: 'organizations',
              id: orgId,
              attributes: {
                name: name,
                description: description,
              },
            },
          },
          {
            headers: {
              Authorization: `Bearer ${bearerToken}`,
              'Content-Type': 'application/vnd.api+json',
            },
          },
        );
        setData(res.data.data.attributes);
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
      open="true"
    >
      <DialogTitle
        sx={{ m: 0, p: 2, width: 900, background: '#fff0f5' }}
        id="customized-dialog-title"
      >
        Update Organisation Details
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
          Please update the details for the organisation.
        </Typography>

        {/* Organisation Name Input */}
        <TextField
          margin="dense"
          id="name"
          label="Organisation Name"
          type="text"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={nameError}
          helperText={nameError ? 'Organisation name is required' : ''}
          required
        />

        {/* Organisation Description Input */}
        <TextField
          margin="dense"
          id="description"
          label="Organisation Description"
          type="text"
          fullWidth
          variant="outlined"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={descriptionError}
          helperText={
            descriptionError ? 'Organisation description is required' : ''
          }
          required
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleSave}
          autoFocus
          style={{
            border: '1px solid #00a2ed',
            background: '#00a2ed',
            color: 'white',
          }}
        >
          Update Organisation
        </Button>
      </DialogActions>
    </BootstrapDialog>
    // <div>hello guys</div>
  );
}
