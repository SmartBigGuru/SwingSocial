import React, { forwardRef, useImperativeHandle, useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';

export interface SendTestEmailHandle {
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

const SendTestEmailModal = forwardRef<SendTestEmailHandle, RefreshProps>((props, ref) => {
  const [open, setOpen] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
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
      const response = await axios.post('/api/admin/email/test', {
        email,
        subject: props.templateDetail?.Subject,
        htmlBody: props.templateDetail?.HtmlBody,
      });

      console.log('Response:', response.data);
      alert('Test email sent successfully!');
    } catch (error: any) {
      console.error('Error sending test email:', error);
      alert('Failed to send test email.');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <div>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Send Test Email</DialogTitle>
        <DialogContent>
          <TextField
            label="Recipient Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary" disabled={loading}>
            Close
          </Button>
          <Button
            onClick={handleSend}
            color="primary"
            variant="contained"
            disabled={loading || !email}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
});

export default SendTestEmailModal;
