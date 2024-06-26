"use client"
import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import TextField from '@mui/material/TextField';
import axios from 'axios';

import EditNoteIcon from '@mui/icons-material/EditNote';
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const BaseURL = process.env.BaseURL;

export default function EditPopup({ rowNumber, previousData, setTableData}) {
  const [open, setOpen] = React.useState(false);
  const [formData, setFormData] = React.useState(previousData);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async() => {
    try {
      const Payload = {
        data: {
          type: 'time-table',
          attributes: {
            row: rowNumber,
            title: formData.title,
            start: formData.start,
            end: formData.end,
            note: formData.note
          }
        }
      }
      const res = await axios.put(BaseURL + "time-table", Payload);
      setTableData(res.data.data.attributes)
      setOpen(false);
      return res;
    } catch (error) {
      console.log(error)
    }
   
    handleClose();
  };

  return (
    <React.Fragment>
      <div style={{width: "100%", display: "flex", alignItems: 'center', justifyContent: "center"}}>
      <EditNoteIcon sx={{color: "red"}} variant="outlined" onClick={handleClickOpen}/>
      </div>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>Edit entry</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Title"
            type="text"
            fullWidth
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <TextField
            margin="dense"
            id="start_time"
            label="Start Time"
            type="time"
            fullWidth
            name="start"
            value={formData.start}
            onChange={handleChange}
            required
          />
          <TextField
            margin="dense"
            id="end_time"
            label="End Time"
            type="time"
            fullWidth
            name="end"
            value={formData.end}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            id="description"
            label="Description"
            type="text"
            fullWidth
            name="note"
            value={formData.note}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit}>{'Save'}</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

