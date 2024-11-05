import React, { useEffect, useState } from 'react';

import { makeApiCall } from '@/utils/ApiRequest';
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

type CustomTeam = {
  name: string;
  description: string;
  id: string;
};

interface EditUserGroupPopupProps {
  team: CustomTeam; // Team data to be deleted
  open1: boolean; // Whether the popup is open or not
  onClose: () => void; // Function to close the popup
  setTeamDatas: React.Dispatch<React.SetStateAction<TeamData[]>>;
  teamDatas: TeamData[];
}

export default function EditUserGroupPopup({
  open1,
  onClose,
  team,
  setTeamDatas,
  teamDatas,
}: EditUserGroupPopupProps) {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [nameError, setNameError] = useState(false);
  const [descriptionError, setDescriptionError] = useState(false);

  const handleClose = () => {
    onClose();
    setNameError(false);
    setDescriptionError(false);
  };

  useEffect(() => {
    if (team && open1) {
      setGroupName(team.name);
      setGroupDescription(team.description);
    }
  }, [team, open1, teamDatas]);

  const handleSave = async () => {
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
      const updatedTeamData = {
        name: groupName,
        description: groupDescription,
      };

      try {
        const res = await makeApiCall({
          path: `auth/organizations/{org_id}/teams/${team.id}`,
          method: 'PATCH',
          payload: {
            data: {
              type: 'users',
              id: team.id,
              attributes: updatedTeamData,
            },
          },
        });
        const updatedTeam = res.data;
        console.log(team.id, teamDatas, updatedTeam);

        // Update the teamDatas array
        const updatedTeamDatas = teamDatas.map((u) =>
          u.id === team.id ? { ...u, ...updatedTeam } : u,
        );

        // Update state with new team data
        setTeamDatas(updatedTeamDatas);
      } catch (error) {
        console.log(error);
      }

      // Close the modal after saving
      handleClose();
    }
  };

  return (
    <>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open1}
      >
        <DialogTitle
          sx={{ m: 0, p: 2, width: 900, background: '#fff0f5' }}
          id="customized-dialog-title"
        >
          Edit User Group
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
            onClick={handleClose}
            autoFocus
            style={{
              border: '1px solid #00a2ed',
              background: 'grey',
              color: 'white',
            }}
          >
            Discard
          </Button>
          <Button
            onClick={handleSave}
            autoFocus
            style={{
              border: '1px solid #00a2ed',
              background: '#00a2ed',
              color: 'white',
            }}
          >
            Save changes
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </>
  );
}
