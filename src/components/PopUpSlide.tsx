'use client';

import * as React from 'react';

import { makeApiCall } from '@/utils/ApiRequest';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import TextField from '@mui/material/TextField';
import { TransitionProps } from '@mui/material/transitions';

interface FormData {
  name: string;
  start_time: string;
  end_time: string;
  description: string;
}

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

interface PopUpSlideProps {
  setTableData: React.Dispatch<React.SetStateAction<TimeTableRecord | null>>;
}

const Transition = React.forwardRef<
  unknown,
  TransitionProps & { children: React.ReactElement }
>(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const PopUpSlide: React.FC<PopUpSlideProps> = ({ setTableData }) => {
  const [open, setOpen] = React.useState(false);
  const [formData, setFormData] = React.useState<FormData>({
    name: '',
    start_time: '',
    end_time: '',
    description: '',
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const Payload = {
        data: {
          type: 'time-table',
          attributes: {
            title: formData.name,
            start: formData.start_time,
            end: formData.end_time,
            note: formData.description,
          },
        },
      };

      const result = await makeApiCall({
        path: `subject/time-table`,
        method: 'PATCH',
        payload: Payload,
      });
      setTableData(result.data.attributes);
      setOpen(false);
      return result;
    } catch (error) {
      console.error('Error submitting form:', error);
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
        <Button variant="outlined" onClick={handleClickOpen}>
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
};

export default PopUpSlide;
