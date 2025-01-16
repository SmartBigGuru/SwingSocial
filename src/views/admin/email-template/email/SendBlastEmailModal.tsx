import React, { forwardRef, useImperativeHandle, useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';

export interface SendBlastEmailHandle {
  open: () => void;
  close: () => void;
}

interface RefreshProps {
  refresh: () => void;
  id: string; // emailtemplateid
  templateDetail?: {
    Name?: string; // Template Name
    Subject?: string; // Template Subject
    JsonBody?: string; // JSON body of the template design
    HtmlBody:any;
    Alias?: string; // Template alias
    AssociatedServerId: any;
    TemplateId: any;
  };
}

const SendBlastEmailModal = forwardRef<SendBlastEmailHandle, RefreshProps>((props, ref) => {
  const [open, setOpen] = useState<boolean>(false);
  const [targetSegment, setTargetSegment] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useImperativeHandle(ref, () => ({
    open: () => {
      setOpen(true);
    },
    close: () => {
      setOpen(false);
    },
  }));

  const handleClose = (): void => {
    setOpen(false);
  };

  const handleSend = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await axios.post('/api/admin/email', {
        targetSegment,
        subject: props.templateDetail?.Subject,
        htmlBody: props.templateDetail?.HtmlBody,
      });

      console.log('Response:', response.data);
      alert('Emails sent successfully!');
    } catch (error: any) {
      console.error('Error sending bulk email:', error);
      alert('Failed to send emails.');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <div>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Send Blast Email</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel id="target-segment-label">Target Segment</InputLabel>
            <Select
              labelId="target-segment-label"
              value={targetSegment}
              onChange={(e) => setTargetSegment(e.target.value as string)}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Paid Members">Paid Members</MenuItem>
              <MenuItem value="Free Members">Free Members</MenuItem>
              <MenuItem value="Legacy Members">Legacy Members (Not yet onboarded)</MenuItem>
              <MenuItem value="New Platform Members">New Platform Members (Not legacy)</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary" disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            color="primary"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
});

export default SendBlastEmailModal;
