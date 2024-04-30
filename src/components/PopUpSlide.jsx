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
// import { log } from 'console';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function PopUpSlide({setTableData}) {
  const [open, setOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    start_time: '',
    end_time: '',
    duration: '',
    description: '',
  });

  // React.useEffect(() => {
  //   if (editingData) {
  //     setFormData(editingData);
  //     setOpen(true);
  //   }
  // }, [editingData]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    // setFormData({
    //   name: '',
    //   start_time: '',
    //   end_time: '',
    //   description: '',
    // });
  };

  console.log(onAdd);
  console.log(onEdit);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async() => {
    try {
      const URL = "https://qwqp4upxb2s2e5snuna7sw77me0pfxnj.lambda-url.ap-south-1.on.aws/time-table"
      const Payload = {
        data: {
          type: 'time-table',
          attributes: {
            title: formData.name,
            start: '12:12',
            end: formData.end_time,
            note: formData.description
          }
        }
      }
      const res = await axios.patch(URL, Payload);
      console.log(res)
      setTableData(res.data.data.attributes)
      setOpen(false)
      return res;
    } catch (error) {
      console.log(error)
    }
   
    handleClose();
  };

  return (
    <React.Fragment>
      <div style={{width: "100%", display: "flex", alignItems: 'center', justifyContent: "center"}}>
      <Button variant="outlined" onClick={handleClickOpen}>
        {/* {editingData ? 'Edit' : 'Push I'} */}
        Push Item
      </Button>
      </div>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>Create a new entry</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Title"
            type="text"
            fullWidth
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <TextField
            margin="dense"
            id="start_time"
            label="Start Time"
            type="time"
            fullWidth
            name="start_time"
            value={formData.start_time}
            onChange={handleChange}
            required
          />
          <TextField
            margin="dense"
            id="end_time"
            label="End Time"
            type="time"
            fullWidth
            name="end_time"
            value={formData.end_time}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            id="description"
            label="Description"
            type="text"
            fullWidth
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Add</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

