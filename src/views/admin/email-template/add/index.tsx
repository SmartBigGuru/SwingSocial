'use client';

import { forwardRef, useEffect, useImperativeHandle, useState, useRef } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Grid, TextField, FormControl, FormLabel, OutlinedInput } from "@mui/material";
import EmailEditor, { EditorRef, EmailEditorProps } from "react-email-editor";
import { toast } from "react-toastify";
import axios from "axios";

// Interface for the modal handle
export interface AddNewPartnerHandle {
  open: () => void;
  close: () => void;
}

// Props for refreshing parent state or data
interface RefreshProps {
  refresh: () => void;
}

const AddNewAdvertiserDialog = forwardRef<AddNewPartnerHandle, RefreshProps>((props, ref) => {
  const { refresh } = props;
  const [openDialog, setOpenDialog] = useState(false);
  const emailEditorRef = useRef<EditorRef>(null);
  const [templateName, setTemplateName] = useState('');
  const [subject, setSubject] = useState('');

  // Imperative handle for parent components to control the modal
  useImperativeHandle(ref, () => ({
    open: () => {
      setOpenDialog(true);
    },
    close: () => {
      setOpenDialog(false);
    }
  }));

  // Export HTML and send a POST request
  const exportHtml = () => {
    const unlayer = emailEditorRef.current?.editor;

    unlayer?.exportHtml(async (data) => {
      const { design: jsonBody, html: qbody } = data;

      // Generate random alias and templateId
      const generateRandomAlias = () => Math.random().toString(36).substr(2, 10);
      const generateRandomTemplateId = () => Math.floor(Math.random() * 100000000);

      const payload = {
        alias: generateRandomAlias(),
        templateName,
        subject,
        qbody,
        qsjsonbody: JSON.stringify(jsonBody), // Convert design to JSON string
        qtemplateid: generateRandomTemplateId(),
        qassociatedserverid: 10253143,
        qtype:0,
        qactive:true,

      };

      try {
        const response = await axios.post('/api/admin/emailtemplate', payload);

        if (response.status === 201) {
          toast.success("Email template created successfully!");
          setOpenDialog(false);
          refresh(); // Call parent refresh function if provided
        }
      } catch (error) {
        console.error("Error creating email template:", error);
        toast.error("Failed to create email template. Please try again.");
      }
    });
  };

  // Callback when the editor is ready
  const onReady: EmailEditorProps["onReady"] = (unlayer) => {
    console.log("Editor is ready!");
  };

  // Close the dialog
  const handleClose = () => {
    setOpenDialog(false);
  };

  return (
    <Dialog
      open={openDialog}
      maxWidth="lg"
      fullWidth
      aria-labelledby="email-editor-dialog-title"
    >
      <DialogTitle id="email-editor-dialog-title">Create Email Template</DialogTitle>
      <DialogContent>
        <Grid container spacing={5}>
          {/* Template Name */}
          {/* Template Name */}
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth required variant="outlined">
          <FormLabel style={{ paddingTop: '5px' }}>Template Name</FormLabel>
          <OutlinedInput
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
          />
        </FormControl>
      </Grid>

      {/* Subject */}
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth required variant="outlined">
          <FormLabel style={{ paddingTop: '5px' }}>Subject</FormLabel>
          <OutlinedInput
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </FormControl>
      </Grid>
          {/* Email Editor */}
          <Grid item xs={12}>
            <EmailEditor
              ref={emailEditorRef}
              onReady={onReady}
              minHeight="500px"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={exportHtml} variant="contained" color="primary">
          Save
        </Button>
        <Button onClick={handleClose} variant="outlined" color="secondary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default AddNewAdvertiserDialog;
