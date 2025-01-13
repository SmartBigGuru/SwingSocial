'use client';

import { forwardRef, useImperativeHandle, useState, useRef } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Grid } from "@mui/material";
import EmailEditor, { EditorRef, EmailEditorProps } from "react-email-editor";
import { toast } from "react-toastify";

export interface EditPromocodeHandle {
  open: () => void;
  close: () => void;
}

interface RefreshProps {
  refresh: () => void;
  id: any;
  promocodeDetail?: {
    JsonBody?: any; // JSON body of the template design
  };
}

const EditPromocodeDialogue = forwardRef<EditPromocodeHandle, RefreshProps>((props, ref) => {
  const { refresh, id, promocodeDetail } = props;
  const [openDialog, setOpenDialog] = useState(false);
  const emailEditorRef = useRef<EditorRef>(null);

  useImperativeHandle(ref, () => ({
    open: () => {
      setOpenDialog(true);
    },
    close: () => {
      setOpenDialog(false);
    },
  }));

  // Export HTML and log the result
  const exportHtml = () => {
    const unlayer = emailEditorRef.current?.editor;

    if (!unlayer) {
      toast.error("Editor is not initialized!");
      return;
    }

    unlayer.exportHtml((data) => {
      const { design, html } = data;
      console.log("Exported HTML:", html);
      console.log("Exported Design JSON:", design);
      toast.success("Email template exported successfully!");

      // Optionally, send `html` and `design` to your server
      // saveTemplate({ id, html, design });
    });
  };

  // Load template JSON into the editor when it's ready
  const onReady: EmailEditorProps["onReady"] = (unlayer) => {
    console.log("Editor is ready!");

    if (promocodeDetail?.JsonBody) {
      try {
        const design = JSON.parse(promocodeDetail.JsonBody); // Parse JSON safely
        unlayer.loadDesign(design);
      } catch (error) {
        console.error("Invalid JSON body:", error);
        toast.error("Failed to load the template. Invalid JSON format.");
      }
    }
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
      <DialogTitle id="email-editor-dialog-title">Edit Email Template</DialogTitle>
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

export default EditPromocodeDialogue;
