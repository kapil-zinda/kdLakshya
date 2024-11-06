'use client';

import * as React from 'react';

import { makeApiCall } from '@/utils/ApiRequest';
import EditNoteIcon from '@mui/icons-material/EditNote';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import TextField from '@mui/material/TextField';
import { TransitionProps } from '@mui/material/transitions';

const Transition = React.forwardRef<
  unknown,
  TransitionProps & { children: React.ReactElement }
>(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface TableItem {
  title: string;
  start: string;
  end: string;
  note: string;
}

interface TimeTableRecord {
  date: string;
  id: string;
  is_finished: boolean;
  table_item: TableItem[];
  total_min: number;
  user_id: string;
}

interface EditPopupProps {
  rowNumber: number;
  previousData: TableItem;
  setTableData: React.Dispatch<React.SetStateAction<TimeTableRecord | null>>;
}

const EditPopup: React.FC<EditPopupProps> = ({
  rowNumber,
  previousData,
  setTableData,
}) => {
  const [open, setOpen] = React.useState(false);
  const [formData, setFormData] = React.useState(previousData);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      const Payload = {
        data: {
          type: 'time-table',
          attributes: {
            row: rowNumber,
            title: formData.title,
            start: formData.start,
            end: formData.end,
            note: formData.note,
          },
        },
      };
      const result = await makeApiCall({
        path: `subject/time-table`,
        method: 'PUT',
        payload: Payload,
      });

      setTableData(result.data.attributes);
      setOpen(false);
      return result;
    } catch (error) {
      console.log(error);
    }

    handleClose();
  };

  return (
    <React.Fragment>
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <EditNoteIcon sx={{ color: 'red' }} onClick={handleClickOpen} />
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
};

export default EditPopup;
