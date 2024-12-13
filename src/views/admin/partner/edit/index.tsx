'use client'

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Autocomplete, Button, CircularProgress, Dialog, DialogActions, DialogContent, Divider, FormControl, FormControlLabel, Grid,TextField, Typography } from "@mui/material"
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
    // Ensure required fields are provided
    // const {id, promoCodeText, description, displayMessage, freeDays, expireDate } = eventData;
    // if (!promoCodeText || !freeDays || !expireDate) {
    //     setEmptyError(true);
    //     toast.error('Complete Promocode info!', {
    //         autoClose: 5000,
    //         type: 'error',
    //     });
    //     return;
    // }

    // // Validate for any empty fields
    // const hasEmptyFields = [id,promoCodeText, freeDays, expireDate].some(field => field === '');
    // if (hasEmptyFields) {
    //     setEmptyError(true);
    //     toast.error('Complete Promocode info!', {
    //         autoClose: 5000,
    //         type: 'error',
    //     });
    //     return;
    // }

    // try {
    //     // Call the API with promo code data
    //     const response = await fetch('/api/admin/promocode/update', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({
    //             id,
    //             promoCodeText,
    //             description,
    //             displayMessage,
    //             freeDays,
    //             expireDate,
    //             active:true
    //         }),
    //     });

    //     // Handle response
    //     if (response.ok) {
    //         const responseData = await response.json();
    //         toast.success('Promo code added successfully!', {
    //             autoClose: 5000,
    //             type: 'success',
    //         });
    //         setOpenDialog(false);
    //         console.log('Response:', responseData);
    //     } else {
    //         const errorData = await response.json();
    //         toast.error(errorData.message || 'Failed to add promo code!', {
    //             autoClose: 5000,
    //             type: 'error',
    //         });
    //         console.error('Error Response:', errorData);
    //     }
    // } catch (error) {
    //     console.error('Error submitting form:', error);
    //     toast.error('An error occurred while adding the promo code!', {
    //         autoClose: 5000,
    //         type: 'error',
    //     });
    // }
};
useImperativeHandle(ref, () => ({
  open: () => {
    setOpenDialog(true);
  },
}));

useEffect(() => {
  console.log(eventDetail,"=====eventDetail");
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
          <TextField
            fullWidth
            name="coverImageUrl"
            label="Cover Image URL"
            autoComplete="off"
            placeholder="Enter Cover Image URL"
            value={eventData.coverImageUrl}
            onChange={(e) => setEventData({ ...eventData, coverImageUrl: e.target.value })}
          />
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
                const files = e.target.files ? Array.from(e.target.files).map((file) => URL.createObjectURL(file)) : [];
                setEventData({ ...eventData, images: [...(eventData.images || []), ...files] });
              }}
            />
          </Button>
          <Grid container spacing={2} style={{ marginTop: 10 }}>
            {(eventData.images || []).map((image:any, index:Number) => (
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
