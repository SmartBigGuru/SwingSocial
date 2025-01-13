'use client';

import { forwardRef, useEffect, useImperativeHandle, useState, useRef } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Grid } from "@mui/material";
import EmailEditor, { EditorRef, EmailEditorProps } from "react-email-editor";
import { toast } from "react-toastify";

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

  // Imperative handle for parent components to control the modal
  useImperativeHandle(ref, () => ({
    open: () => {
      setOpenDialog(true);
    },
    close: () => {
      setOpenDialog(false);
    }
  }));

  // Export HTML and log the result
  const exportHtml = () => {
    const unlayer = emailEditorRef.current?.editor;

    unlayer?.exportHtml((data) => {
      const { design, html } = data;
      console.log("exportHtml", html);
      toast.success("Email template exported successfully!");

      // Optionally, you can save `design` or `html` to a server/database
    });
  };

  // Callback when the editor is ready
  const onReady: EmailEditorProps["onReady"] = (unlayer) => {
    console.log("Editor is ready!");

    // Optionally load a pre-defined design template
    // const templateJson = { YOUR_TEMPLATE_JSON };
    // unlayer.loadDesign(templateJson);
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
          <Grid item xs={12}>
            {/* Email Editor */}
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
          Export Template
        </Button>
        <Button onClick={handleClose} variant="outlined" color="secondary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default AddNewAdvertiserDialog;
