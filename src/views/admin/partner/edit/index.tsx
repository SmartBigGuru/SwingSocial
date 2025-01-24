'use client'

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Autocomplete, CardContent, CardActions, Box, Button, Card, CardMedia, CircularProgress, Dialog, DialogActions, DialogContent, Divider, FormControl, FormControlLabel, Grid, TextField, Typography, IconButton } from "@mui/material"
import { toast } from "react-toastify";
import { AddCircleOutline } from "@mui/icons-material";
import dynamic from 'next/dynamic';

// Dynamically import a rich-text editor (like React Quill)
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';
// MUI Imports
export interface EditEventHandle {
  open: () => void;
}

interface RefreshProps {
  refresh: () => void;
  id: any;
  eventDetail?: any; // Add this line
}

interface EventData {
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  category: string;
  venue: string;
  address: string;
  coverImageUrl: string;
  emailDescription: string;
  username: string;
  images: string[]; // Add images as an array of strings
}

const EditEventDialogue = forwardRef<EditEventHandle, RefreshProps>((props, ref) => {
  const { refresh, id, eventDetail } = props;
  const [openDialog, setOpenDialog] = useState(false);
  const [adding, setAdding] = useState(false);
  const [emptyError, setEmptyError] = useState(false);

  const [eventData, setEventData] = useState<any>({
    id: '',
    startTime: '',
    endTime: '',
    name: '',
    description: '',
    category: '',
    venue: '',
    address: '',
    isVenueHidden: false,
    coverImageUrl: '',
    images: [],
    isCancelled: false,
    isSoldOut: false,
    isFree: false,
    likes: 0,
    shares: 0,
    rating: 0,
    organizerId: '',
    emailDescription: '',
    allowBuyingForFreeUsers: false,
    username: '',
  });

  const updatePromoCode = async () => {
    //Ensure required fields are provided
    const { id, name, startTime, endTime } = eventData;
    if (!name || !startTime || !endTime) {
      setEmptyError(true);
      toast.error('Complete Event info!', {
        autoClose: 5000,
        type: 'error',
      });
      return;
    }

    // Validate for any empty fields
    const hasEmptyFields = [id, name, startTime, endTime].some(field => field === '');
    if (hasEmptyFields) {
      setEmptyError(true);
      toast.error('Complete Event info!', {
        autoClose: 5000,
        type: 'error',
      });
      return;
    }

    try {
      const uploadImage = async (imageData: string): Promise<string | null> => {
        try {
          // Convert Base64 imageData to a Blob
          const formData = new FormData();

          // Append the image Blob with a unique name
          formData.append("image", imageData);

          // Send the FormData via fetch
          const response = await fetch('/api/admin/events/upload', {
            method: 'POST',
            body: formData,
          });

          // Parse the JSON response
          const data = await response.json();

          // Handle response errors
          if (!response.ok) {
            throw new Error(data.message || 'Failed to upload image');
          }

          console.log("Upload response:", data);
          return data?.blobUrl || null; // Return the uploaded image's URL
        } catch (error) {
          console.error("Error during image upload:", error);
          return null; // Return null in case of an error
        }
      };
      // Call the API with promo code data
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qeventid: id,
          qname: name,
          start: startTime,
          qend: endTime,
        }),
      });

      // Handle response
      if (response.ok) {
        const responseData = await response.json();
        if (eventCoverImage) {
          const qcoverimage = await uploadImage(eventCoverImage);
          // Call the API with promo code data
          const response = await fetch('/api/admin/events/cover', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              qeventid: id,
              qcoverimage: qcoverimage
            }),
          });
        }
        if (selectedFiles?.length > 0) {
          for (let i = 0; i < selectedFiles?.length; i++) {
            let imageUrl = await uploadImage(selectedFiles[0]);
            // Call the API with promo code data
            const response = await fetch('/api/admin/events/images', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                qeventid: id,
                qimage: imageUrl
              }),
            });
          }
        }
        toast.success('Event updated successfully!', {
          autoClose: 5000,
          type: 'success',
        });
        setOpenDialog(false);
        console.log('Response:', responseData);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to add promo code!', {
          autoClose: 5000,
          type: 'error',
        });
        console.error('Error Response:', errorData);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred while adding the promo code!', {
        autoClose: 5000,
        type: 'error',
      });
    }
  };
  useImperativeHandle(ref, () => ({
    open: () => {
      setOpenDialog(true);
    },
  }));
  const [eventCoverImage, setEventCoverImage] = useState<any>(null)
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [description, setDescription] = useState<any>('');
  const [emailDescription, setEmailDescription] = useState<any>('');

  const handleRemoveImage = (index: number) => {
    // Remove image from both the preview and the file list
    const updatedImages = [...eventData.images];
    updatedImages.splice(index, 1);

    const updatedFiles = [...selectedFiles];
    updatedFiles.splice(index, 1);

    setEventData({ ...eventData, images: updatedImages });
    setSelectedFiles(updatedFiles);
  };
  useEffect(() => {
    console.log(eventDetail, "=====eventDetail");
    if (eventDetail) {
      setDescription(eventDetail.Description);
      setEmailDescription(eventDetail.EmailDescription);
      setEventData({
        id: eventDetail.Id || '',
        startTime: eventDetail.StartTime || '',
        endTime: eventDetail.EndTime || '',
        name: eventDetail.Name || '',
        description: eventDetail.Description || '',
        category: eventDetail.Category || '',
        venue: eventDetail.Venue || '',
        address: eventDetail.Address || '',
        isVenueHidden: eventDetail.IsVenueHidden || false,
        coverImageUrl: eventDetail.CoverImageUrl || '',
        images: eventDetail.Images || [],
        isCancelled: eventDetail.IsCancelled || false,
        isSoldOut: eventDetail.IsSoldOut || false,
        isFree: eventDetail.IsFree || false,
        likes: eventDetail.Likes || 0,
        shares: eventDetail.Shares || 0,
        rating: eventDetail.Rating || 0,
        organizerId: eventDetail.OrganizerId || '',
        emailDescription: eventDetail.EmailDescription || '',
        allowBuyingForFreeUsers: eventDetail.AllowBuyingForFreeUsers || false,
        username: eventDetail.Username || '',
      });
    }
  }, [eventDetail]);

  return (
    <Dialog
      open={openDialog}
      maxWidth="lg"
      fullWidth
      aria-labelledby="max-width-dialog-title"
    >
      <DialogContent>
        <Grid container spacing={5}>
          {/* Event Details */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Event Details
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="name"
              label="Event Name"
              autoComplete="off"
              placeholder="Enter Event Name"
              value={eventData.name}
              onChange={(e) => setEventData({ ...eventData, name: e.target.value })}
            />
          </Grid>
          <Grid item xs={12}>
            <ReactQuill
              theme="snow"
              value={description}
              onChange={setDescription}
              placeholder="Write your Description here..."
            />

          </Grid>

          {/* Timing Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Timing Information
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              name="startTime"
              label="Start Time"
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              value={eventData.startTime}
              onChange={(e) => setEventData({ ...eventData, startTime: e.target.value })}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              name="endTime"
              label="End Time"
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              value={eventData.endTime}
              onChange={(e) => setEventData({ ...eventData, endTime: e.target.value })}
            />
          </Grid>

          {/* Location Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Location Information
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              name="venue"
              label="Venue"
              autoComplete="off"
              placeholder="Enter Venue"
              value={eventData.venue}
              onChange={(e) => setEventData({ ...eventData, venue: e.target.value })}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              name="address"
              label="Address"
              autoComplete="off"
              placeholder="Enter Address"
              value={eventData.address}
              onChange={(e) => setEventData({ ...eventData, address: e.target.value })}
            />
          </Grid>

          {/* Categories and Tags */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Categories and Tags
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              name="category"
              label="Category"
              autoComplete="off"
              placeholder="Enter Category"
              value={eventData.category}
              onChange={(e) => setEventData({ ...eventData, category: e.target.value })}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              name="tags"
              label="Tags (comma-separated)"
              autoComplete="off"
              placeholder="e.g., Music, Festival, Outdoor"
              value={eventData.tags}
              onChange={(e) => setEventData({ ...eventData, tags: e.target.value.split(',') })}
            />
          </Grid>

          {/* Media Uploads */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Media Uploads
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Card sx={{ maxWidth: 300, mx: "auto", boxShadow: 3 }}>
              {/* Image Preview */}
              <CardMedia
                component="img"
                image={eventData.coverImageUrl || "/placeholder-image.png"} // Placeholder for no image
                alt="Cover Preview"
                sx={{
                  height: 200,
                  objectFit: "cover",
                  borderBottom: "1px solid #ddd",
                }}
              />

              {/* Card Content */}
              <CardContent>
                <Typography variant="h6" align="center" gutterBottom>
                  Cover Image
                </Typography>
                <Typography variant="body2" color="textSecondary" align="center">
                  Upload an image to set as the cover for your event.
                </Typography>
              </CardContent>

              {/* Footer with Upload Button */}
              <CardActions sx={{ justifyContent: "center", padding: "16px" }}>
                <Button
                  variant="contained"
                  component="label"
                  color="primary"
                  fullWidth
                  sx={{ textTransform: "none" }}
                >
                  Upload Cover Image
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setEventCoverImage(file);
                        const imageUrl = URL.createObjectURL(file);
                        setEventData({ ...eventData, coverImageUrl: imageUrl });
                      }
                    }}
                  />
                </Button>
              </CardActions>
            </Card>
          </Grid>


          <Grid item xs={12}>
            {/* Image Grid */}
            <Grid container spacing={2}>
              {/* Existing Images */}
              {(eventData.images || []).map((image: any, index: number) => (
                <Grid item xs={3} key={index}>
                  <Card sx={{ borderRadius: 8 }}>
                    {/* Image Preview */}
                    <CardMedia
                      component="img"
                      image={image}
                      alt={`Gallery ${index}`}
                      sx={{
                        height: 150,
                        objectFit: "cover",
                      }}
                    />
                    {/* Card Actions (Footer) */}
                    <CardActions sx={{ justifyContent: "center" }}>
                      <Button
                        size="small"
                        color="secondary"
                        variant="outlined"
                        onClick={() => handleRemoveImage(index)}
                      >
                        Remove
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}

              {/* Upload Box */}
              <Grid item xs={3}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px dashed #ccc",
                    borderRadius: 8,
                    height: "85%",
                    marginLeft: 3,
                    aspectRatio: "1",
                    cursor: "pointer",
                    position: "relative",
                  }}
                  onClick={() => document.getElementById("file-input")?.click()}
                >
                  <input
                    id="file-input"
                    type="file"
                    multiple
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      if (e.target.files) {
                        const filesArray = Array.from(e.target.files);
                        const previewUrls = filesArray.map((file) => URL.createObjectURL(file));

                        // Update preview in eventData
                        setEventData({
                          ...eventData,
                          images: [...(eventData.images || []), ...previewUrls],
                        });

                        // Update the selected files state
                        setSelectedFiles((prevFiles) => [...prevFiles, ...filesArray]);
                      }
                    }}
                  />
                  <IconButton color="primary" size="large" sx={{ p: 0 }}>
                    <AddCircleOutline fontSize="large" />
                  </IconButton>
                </Box>
              </Grid>
            </Grid>
          </Grid>

          {/* Email and User Details */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Additional Details
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <ReactQuill
              theme="snow"
              value={emailDescription}
              onChange={(e) => { setEmailDescription(e); }}
              placeholder="Write your Email Description here..."
            />

          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              name="username"
              label="Username"
              autoComplete="off"
              placeholder="Enter Username"
              value={eventData.username}
              onChange={(e) => setEventData({ ...eventData, username: e.target.value })}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <Divider />
      <DialogActions className="justify-center pbs-0 sm:pbe-6 sm:pli-6">
        <Button
          variant="contained"
          className="mt-6"
          type="button"
          color="error"
          disabled={adding}
          onClick={updatePromoCode}
        >
          {adding ? <CircularProgress color="inherit" className="mr-2" size={20} /> : null}
          Save
        </Button>
        <Button
          variant="contained"
          className="mt-6"
          onClick={() => setOpenDialog(false)}
          type="button"
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>

  )
})

export default EditEventDialogue
