'use client'

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Autocomplete, Button, CircularProgress, Dialog, DialogActions, DialogContent, Divider, FormControl, FormControlLabel, Grid, TextField, Typography } from "@mui/material"
import { toast } from "react-toastify";
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
  useEffect(() => {
    console.log(eventDetail, "=====eventDetail");
    if (eventDetail) {
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
            <TextField
              fullWidth
              multiline
              rows={4}
              name="description"
              label="Description"
              autoComplete="off"
              placeholder="Enter Description"
              value={eventData.description}
              onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
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
            <div style={{ textAlign: 'center' }}>
              {/* Image Preview */}
              {eventData.coverImageUrl ? (
                <img
                  src={eventData.coverImageUrl}
                  alt="Cover Preview"
                  style={{ width: '200px', height: '200px', objectFit: 'cover', marginBottom: '16px' }}
                />
              ) : (
                <p>No Image Selected</p>
              )}
              {/* File Input */}
              <Button variant="contained" component="label" color="primary">
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
            </div>
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              component="label"
              color="primary"
            >
              Upload Multiple Images
              <input
                type="file"
                hidden
                multiple
                accept="image/*"
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
            </Button>
            <Grid container spacing={2} style={{ marginTop: 10 }}>
              {(eventData.images || []).map((image: any, index: Number) => (
                <Grid item xs={3}>
                  <img
                    src={image}
                    alt={`Gallery ${index}`}
                    style={{ width: '100%', height: 'auto', borderRadius: 8 }}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Email and User Details */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Additional Details
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              name="emailDescription"
              label="Email Description"
              autoComplete="off"
              placeholder="Enter Email Description"
              value={eventData.emailDescription}
              onChange={(e) => setEventData({ ...eventData, emailDescription: e.target.value })}
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
