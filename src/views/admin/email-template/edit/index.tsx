'use client';

import { forwardRef, useImperativeHandle, useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Grid,
  TextField,
  FormControl,
  FormLabel,
  OutlinedInput,
} from "@mui/material";
import EmailEditor, { EditorRef, EmailEditorProps } from "react-email-editor";
import { toast } from "react-toastify";

export interface EditPromocodeHandle {
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
    Alias?: string; // Template alias
    AssociatedServerId:any;
    TemplateId:any
  };
}

const EditPromocodeDialogue = forwardRef<EditPromocodeHandle, RefreshProps>((props, ref) => {
  const { refresh, id, templateDetail } = props;
  const [openDialog, setOpenDialog] = useState(false);
  const [name, setName] = useState(templateDetail?.Name || ""); // Name field
  const [templateId, setTemplate] = useState(templateDetail?.TemplateId || ""); // TemplateId field
  const [associatedServerId, setAssociatedServerId] = useState(templateDetail?.AssociatedServerId || ""); // TemplateId field
  const [subject, setSubject] = useState(templateDetail?.Subject || ""); // Subject field
  const [alias, setAlias] = useState(templateDetail?.Alias || ""); // Alias field
  const emailEditorRef = useRef<EditorRef>(null);

  useEffect(() => {
    setName(templateDetail?.Name || "");
    setSubject(templateDetail?.Subject || "");
    setAlias(templateDetail?.Alias || "");
    setTemplate(templateDetail?.TemplateId || "");
    setAssociatedServerId(templateDetail?.AssociatedServerId || "");
  }, [templateDetail]);

  useImperativeHandle(ref, () => ({
    open: () => {
      console.log(templateDetail,"===============templateDetail");

      setOpenDialog(true);
    },
    close: () => {
      setOpenDialog(false);
    },
  }));

  const updateTemplate = async (design: any) => {
    try {
      const response = await fetch("/api/admin/emailtemplate/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,
          alias,
          subject,
          templateName: name,
          qbody: JSON.stringify(design), // Save design as JSON string
          qsjsonbody: JSON.stringify(design),
          qactive: true, // Default to true
          qtype: 1, // Default type
          qtemplateid: templateId, // Example template ID
          qassociatedserverid: associatedServerId, // Optional
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update the template.");
      }

      const data = await response.json();
      toast.success("Template updated successfully!");
      setOpenDialog(false);
      refresh(); // Refresh the parent component or data
    } catch (error: any) {
      console.error("Error updating template:", error);
      toast.error(error.message || "Something went wrong!");
    }
  };

  const exportHtml = () => {
    const unlayer = emailEditorRef.current?.editor;

    if (!unlayer) {
      toast.error("Editor is not initialized!");
      return;
    }

    unlayer.exportHtml((data) => {
      const { design } = data; // Exported design
      if (!design) {
        toast.error("Failed to export design!");
        return;
      }

      updateTemplate(design); // Call API to update template
    });
  };

  const onReady: EmailEditorProps["onReady"] = (unlayer) => {
    if (templateDetail?.JsonBody) {
      try {
        const design = JSON.parse(templateDetail.JsonBody); // Parse JSON safely
        unlayer.loadDesign(design);
      } catch (error) {
        console.error("Invalid JSON body:", error);
        toast.error("Failed to load the template. Invalid JSON format.");
      }
    }
  };

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
          {/* Template Alias Field */}
          {/* Template Alias */}
      <Grid item xs={12} sm={4}>
        <FormControl fullWidth variant="outlined">
          <FormLabel style={{ paddingTop: '5px' }}>Template Alias</FormLabel>
          <OutlinedInput
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
          />
        </FormControl>
      </Grid>

      {/* Template Name */}
      <Grid item xs={12} sm={4}>
        <FormControl fullWidth variant="outlined">
          <FormLabel style={{ paddingTop: '5px' }}>Template Name</FormLabel>
          <OutlinedInput
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </FormControl>
      </Grid>

      {/* Template Subject */}
      <Grid item xs={12} sm={4}>
        <FormControl fullWidth variant="outlined">
          <FormLabel style={{ paddingTop: '5px' }}>Template Subject</FormLabel>
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
          Update
        </Button>
        <Button onClick={handleClose} variant="outlined" color="secondary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default EditPromocodeDialogue;
