'use client'
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

import { CardContent, Card, Chip, Dialog, Divider, Grid, Typography, useMediaQuery, Button, FormControl, Select, MenuItem, InputLabel, DialogTitle, DialogContent, TextField, DialogActions, Autocomplete, CircularProgress, AutocompleteInputChangeReason } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Email, Delete, FileDownload } from "@mui/icons-material";
import type { Theme } from "@mui/material/styles/createTheme";
import { IconButton } from '@mui/material';
import Close from "@/@menu/svg/Close";
import * as Papa from 'papaparse';
import { jsPDF } from "jspdf";
import "jspdf-autotable";

import dynamic from 'next/dynamic';

// Dynamically import a rich-text editor (like React Quill)
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';
import { any } from "valibot";
import axios from 'axios';

export interface DetailViewHandle {
  open: (id: string) => void;
}

interface RefreshAction {
  refresh: () => void
}

interface Attendee {
  Avatar: string;
  Email: string;
  Name: string;
  Phone: string;
  Price: number | string; // Price can be a number or string
  ProfileId: string;
  TicketType: string;
  Username: string;
}

interface CompanyType {
  company_name: string;
  company_address: string;
  company_phone: string;
  company_url: string;
}

interface AdvertiserType {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  companies: CompanyType;
  Images: any;
  EndTime: string;
  StartTime: string;
  EmailDescription: string;
  Description: string;
  Category: string;
  Venue: string;
  Name: string;
  CoverImageUrl: string;

}

interface OfferType {
  name: string
}

interface ContractType {
  contract_id: number
  contract_name: string
  contract_term: string
  budget_limit: number
  created_date: string
  start_date: string
  end_date: string
  payment_term: string
  status: string
  retainers: number
  return_rate: number
  advertisers: AdvertiserType
  offer: OfferType[]
}

const DetailView = forwardRef<DetailViewHandle, RefreshAction>((props, ref) => {
  const { refresh } = props
  const [open, setOpen] = useState(false)
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [attLoading, setAttLoading] = useState(false);
  const [event, setEvent] = useState<AdvertiserType | undefined>(undefined)
  const [rsvp, setRSVP] = useState<any[]>([]);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [eventId, setEventId] = useState('');

  const [contract, setContract] = useState<ContractType[] | undefined>(undefined)
  const isSmScreen = useMediaQuery((theme: Theme) => theme.breakpoints.only('sm'))
  const isMdScreen = useMediaQuery((theme: Theme) => theme.breakpoints.only('md'))
  const isLgScreen = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'))
  const [attendeeUserProfiles, setAttendeeProfiles] = useState<any[]>([]); // User profiles state
  const [rsvpUserProfiles, setRsvpUserProfiles] = useState<any[]>([]);
  const [selectedProfileRsvp, setSelectedProfileRSVP] = useState(''); // Selected user profile
  const [selectedProfileAttendee, setSelectedProfileAttendee] = useState(''); // Selected user profile

  const [openDialog, setOpenDialog] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [rsvpSearchTerm, setRsvpSearchTerm] = useState<string>('');
  const [attendeeSearchTerm, setAttendeeSearchTerm] = useState<string>('');
  const [page, setPage] = useState(1);

  const [selectedRsvpProfile, setSelectedRsvpProfile] = useState<any>(null);
  const [selectedAttendeeProfile, setSelectedAttendeeProfile] = useState<any>(null);
  const [selectedEmail,setSelectedEmail]=useState<any>(null);
  const [emailType,setEmailType]=useState<any>(null);

  const handleOpenDialog = (type:any) => {
    setEmailType(type);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEmailSubject('');
    setEmailBody('');
  };

  const handleSendEmail = async () => {
    console.log('Email Subject:', emailSubject);
    console.log('Email Body:', emailBody);
    // Add API call here to send the email
    // handleCloseDialog();
    if(emailType=='single'){
      handleSendSigleUser(selectedEmail)
    }else{
      await handleSend(rsvp);
    }
  };

  const [loading, setLoading] = useState<boolean>(false);
  const handleSendSigleUser = async (email: any): Promise<void> => {
    setLoading(true);
    try {
      const response = await axios.post('/api/admin/email/test', {
        email,
        subject: emailSubject,
        htmlBody: emailBody,
      });

      console.log('Response:', response.data);
      alert('Emails sent successfully!');
    } catch (error: any) {
      console.error('Error sending bulk email:', error);
      alert('Failed to send emails.');
    } finally {
      setLoading(false)
      setOpenDialog(false);
      setEmailSubject('');
    }
  };
  const handleSend = async (recipients: any): Promise<void> => {
    setLoading(true);
    try {
      const response = await axios.post('/api/admin/events/rsvp/email', {
        recipients,
        subject: emailSubject,
        htmlBody: emailBody,
      });

      console.log('Response:', response.data);
      alert('Emails sent successfully!');
    } catch (error: any) {
      console.error('Error sending bulk email:', error);
      alert('Failed to send emails.');
    } finally {
      setLoading(false)
      setOpenDialog(false);
      setEmailSubject('');
    }
  };
  useImperativeHandle(ref, () => ({
    open: (id) => {
      setOpen(true)
      fetchData(id);
      setEventId(id)

      fetchUserProfiles(rsvpSearchTerm, page, "rsvp");
      fetchUserProfiles(rsvpSearchTerm, page, "attendee");
    }
  }))

  const fetchData = async (eventId: string) => {
    console.log(eventId, "======eventId in view");

    try {
      // Fetch event data using the custom API
      const response = await fetch(`/api/admin/events?id=${eventId}`);
      if (!response.ok) {
        console.error('Failed to fetch event data:', response.statusText);
        setEvent(undefined);
        setRSVP([]);
        setAttendees([]);
        setTickets([]); // Clear tickets data in case of error
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { event, rsvp, attendees, tickets } = await response.json();

      attendees.forEach((item: Attendee) => {
        item.Price = "$159.00"; // Change the price to "$159.00"
      });

      if (!event) {
        console.error('Event not found');
        setEvent(undefined);
        setRSVP([]);
        setAttendees([]);
        setTickets([]); // Clear tickets data if event not found
      } else {
        console.log(event, "=========event data");
        console.log(attendees, "=========attendees data");
        setEvent(event);
        setRSVP(rsvp || []); // Set RSVP data if available
        setAttendees(attendees || []); // Set Attendees data if available
        setTickets(tickets || []); // Set Tickets data if available
        setEmailBody(event?.EmailDescription);
      }

    } catch (error: any) {
      console.error('Error fetching data:', error.message);
    } finally {
      setRsvpLoading(false);
      setAttLoading(false);
    }
  };


  const handleRemoveRSVP = async (profileId: string) => {
    try {
      const response = await fetch(`/api/admin/events/rsvp?profileId=${profileId}&id=${eventId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        console.error('Failed to remove RSVP:', response.statusText);
        return;
      }

      // Remove the RSVP from the local state
      setRSVP(prevRSVP => prevRSVP.filter(user => user.ProfileId !== profileId));
      console.log('RSVP removed successfully');
    } catch (error: any) {
      console.error('Error removing RSVP:', error.message);
    }
  };

  const handleAddRSVP = async (event: React.MouseEvent<HTMLButtonElement>) => {
    try {
      event.preventDefault();

      if (selectedRsvpProfile) {
        console.log('Selected RSVP Profile:', selectedRsvpProfile);
      }

      const profileId = selectedRsvpProfile.Id;
      const response = await fetch(`/api/admin/events/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId, profileId }),
      });

      if (!response.ok) {
        console.error('Failed to add RSVP:', response.statusText);
        return;
      }

      const newRSVP = await response.json();

      // Update the local state by adding the new RSVP
      setRSVP(prevRSVP => [...prevRSVP, { ProfileId: selectedProfileRsvp, ...newRSVP }]);
      console.log('RSVP added successfully');
    } catch (error: any) {
      console.error('Error adding RSVP:', error.message);
    }
  };

  const handleAddAttendees = async (event: React.MouseEvent<HTMLButtonElement>) => {
    try {
      event.preventDefault();

      if (selectedAttendeeProfile) {
        console.log('Selected RSVP Profile:', selectedAttendeeProfile);
      }

      const profileId = selectedAttendeeProfile.Id;
      const response = await fetch(`/api/admin/events/attendee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId, profileId }),
      });

      if (!response.ok) {
        console.error('Failed to add RSVP:', response.statusText);
        return;
      }

      const newAttendees = await response.json();

      // Update the local state by adding the new RSVP
      setAttendees(prevAttendees => [...prevAttendees, { ProfileId: selectedAttendeeProfile, ...newAttendees }]);
      console.log('RSVP added successfully');
    } catch (error: any) {
      console.error('Error adding RSVP:', error.message);
    }
  }

  const handleExportCSV = () => {
    console.log("Exporting RSVP/Attendees as CSV");

    if (rsvp.length === 0) {
      alert("No RSVP data available to export.");
      return;
    }

    // Format data for CSV
    const csvData = rsvp.map((entry) => ({
      ProfileId: entry.ProfileId,
      Name: entry.Name,
      Email: entry.Email,
      RSVPStatus: entry.RSVPStatus,
    }));

    // Convert to CSV and trigger download
    const csvContent = Papa.unparse(csvData);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", "RSVP_List.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const handleExportPDF = () => {
    console.log("Exporting RSVP/Attendees as PDF");

    if (rsvp.length === 0) {
      alert("No RSVP data available to export.");
      return;
    }

    const doc: any = new jsPDF();
    const tableColumnHeaders = ["Profile ID", "Name", "Email", "RSVP Status"];
    const tableRows = rsvp.map((entry) => [
      entry.ProfileId,
      entry.Username,
      entry.Email,
      entry.RSVPStatus,
    ]);

    // Add a title
    doc.text("RSVP List", 14, 15);

    // Add table
    // doc.autoTable({
    //   head: [tableColumnHeaders],
    //   body: tableRows,
    //   startY: 20,
    // });

    // Save the PDF
    doc.save("RSVP_List.pdf");
  };



  const handleExportCSVAtten = () => {
    console.log("Exporting RSVP/Attendees as CSV");

    if (attendees.length === 0) {
      alert("No RSVP data available to export.");
      return;
    }

    // Format data for CSV
    const csvData = attendees.map((entry) => ({
      ProfileId: entry.ProfileId,
      Name: entry.Name,
      Email: entry.Email,
      RSVPStatus: entry.RSVPStatus,
    }));

    // Convert to CSV and trigger download
    const csvContent = Papa.unparse(csvData);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", "Attendees_List.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const handleExportPDFAtten = () => {
    console.log("Exporting RSVP/Attendees as PDF");

    if (attendees.length === 0) {
      alert("No RSVP data available to export.");
      return;
    }

    const doc: any = new jsPDF();
    const tableColumnHeaders = ["Profile ID", "Name", "Email", "Attendees Status"];
    const tableRows = attendees.map((entry) => [
      entry.ProfileId,
      entry.Username,
      entry.Email,
      entry.RSVPStatus,
    ]);

    // Add a title
    doc.text("Attendees List", 14, 15);

    // Add table
    doc.autoTable({
      head: [tableColumnHeaders],
      body: tableRows,
      startY: 20,
    });

    // Save the PDF
    doc.save("Attendees_List.pdf");
  };

  const rsvpColumns = [
    { field: "Username", headerName: "Name", flex: 1 },
    { field: "Email", headerName: "Email", flex: 1 },
    {
      field: "Actions",
      headerName: "Actions",
      flex: 0.5,
      sortable: false,
      renderCell: (params: any) => (
        <>
          <IconButton color="primary" aria-label="send-email" onClick={()=>{handleOpenDialog('single');setSelectedEmail(params.row.Email)}}>
            <Email />
          </IconButton>
          <IconButton color="error" aria-label="remove-rsvp" onClick={() => handleRemoveRSVP(params.row.ProfileId)}>
            <Delete />
          </IconButton>
        </>
      ),
    },
  ];

  const attendeeColumns = [
    { field: "Username", headerName: "Name", flex: 1 },
    { field: "Email", headerName: "Email", flex: 1 },
    { field: "Phone", headerName: "Phone", flex: 1 },
    { field: "TicketType", headerName: "TicketType", flex: 1 },
    { field: "Price", headerName: "Price", flex: 1 },
    {
      field: "Actions",
      headerName: "Actions",
      flex: 0.5,
      sortable: false,
      renderCell: (params: any) => (
        <>
          <IconButton color="primary" aria-label="send-email" onClick={() => console.log(`Sending email to ${params.row.Email}`)}>
            <Email />
          </IconButton>
          <IconButton color="error" aria-label="remove-attendee" onClick={() => console.log("remove c")}>
            <Delete />
          </IconButton>
        </>
      ),
    },
  ];

  // Fetch user profiles
  // Function to fetch user profiles with search and pagination
  const fetchUserProfiles = async (search: string, page: number, flag: string) => {
    try {
      if (flag === "rsvp") {
        setRsvpLoading(true);
      }
      else {
        setAttLoading(true);
      }
      const response = await fetch(
        `/api/admin/user?search=${search}&page=${page}&size=100&type=Username`
      );
      if (!response.ok) {
        console.error('Failed to fetch user profiles:', response.statusText);
        return;
      }
      const data: any = await response.json();

      if (page === 1) {
        if (flag === "rsvp") {
          setRsvpUserProfiles(data?.profiles || []);
        } else {
          setAttendeeProfiles(data?.profiles || []);
        }
      } else {
        // Append results for pagination
        if (flag === "rsvp") {
          setRsvpUserProfiles((prevProfiles: any) => {
            return [...prevProfiles, ...(data?.profiles || [])];
          });
        }
        else {
          setAttendeeProfiles((prevProfiles: any) => {
            return [...prevProfiles, ...(data?.profiles || [])];
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user profiles:', error);
    } finally {
      setAttLoading(false);
      setRsvpLoading(false);
    }
  };


  // Load more data when the dropdown is scrolled to the bottom
  const handleScroll = (event: React.SyntheticEvent) => {
    const listboxNode = event.currentTarget;
    if (
      listboxNode.scrollTop + listboxNode.clientHeight >=
      listboxNode.scrollHeight
    ) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  // Call this on component mount
  useEffect(() => {
    fetchUserProfiles(rsvpSearchTerm, page, "rsvp");
  }, [rsvpSearchTerm, page]);

  useEffect(() => {
    fetchUserProfiles(attendeeSearchTerm, page, "attendee");
  }, [attendeeSearchTerm, page])

  const [openTicketModal, setTicketModal] = useState(false);
  const [formData, setFormData] = useState({
    ticketName: "",
    ticketType: "",
    price: "",
    quantity: "",
    eventId: "",
  });

  useEffect(() => {
    if (eventId) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        eventId: eventId,
      }));
    }
  }, [eventId]);
  // Handle dialog open/close
  const handleOpenTicketModal = () => setTicketModal(true);
  const handleTicketModalClose = () => setTicketModal(false);

  // Handle form field changes
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handle form submission
  const handleSubmitTicket = async () => {
    try {
      const response = await fetch("/api/admin/events/ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Ticket created successfully:", data);
      // Optionally, refresh ticket list here
      handleTicketModalClose();
    } catch (error) {
      console.error("Error creating ticket:", error);
    }
  };



  return (
    <>
      <Dialog
        open={open}
        scroll="paper"
        onClose={() => {
          setEvent(undefined);
          setContract(undefined);
          setOpen(false);
        }}
        maxWidth="lg"
        fullWidth
        aria-labelledby="event-dialog-title"
      >
        <Grid container className="scrollbar-custom overflow-y-auto p-6">
          <Grid item lg={12} md={12}>
            {event && (
              <CardContent className="flex flex-col gap-6">
                <Grid container spacing={4}>
                  {/* Left side: Event Image, Title, RSVP, and Attendees */}
                  <Grid item lg={5} md={5} xs={12} className="flex flex-col items-center">
                    <div className="flex flex-col gap-6 items-center">
                      <img
                        src={event?.CoverImageUrl || '/images/default-event.png'}
                        alt="event-cover"
                        className="w-full rounded-lg shadow-lg"
                      />
                      <Typography variant="h4" className="font-semibold mt-4">
                        {event?.Name}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" className="text-center">
                        {event?.Venue}
                      </Typography>
                      <Chip
                        label={event?.Category}
                        color="primary"
                        size="small"
                        variant="outlined"
                        className="mt-2"
                      />


                      <div className="flex flex-col gap-4">
                        <Typography variant="h6" className="font-medium">Images</Typography>
                        <Grid container spacing={2}>
                          {event?.Images?.map((image: any, index: number) => (
                            <Grid item xs={4} key={index}>
                              <img
                                src={image}
                                alt={`event-image-${index}`}
                                className="w-full h-auto rounded-lg shadow-sm"
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </div>

                      {/* Ticket Section */}
                      <div className="w-full mt-6">
                        <Typography variant="h6" className="font-medium mb-4">
                          Tickets
                        </Typography>
                        {/* Create Ticket Button */}
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleOpenTicketModal}
                          className="mb-4"
                        >
                          Create Ticket
                        </Button>

                        <Grid container spacing={3}>
                          {tickets.length > 0 ? (
                            tickets.map((ticket, index) => (
                              <Grid item xs={12} sm={6} md={4} key={index}>
                                <Card className="shadow-lg hover:shadow-2xl transition-shadow duration-300">
                                  <CardContent className="flex flex-col gap-4">
                                    <Typography variant="h6" className="font-semibold">
                                      {ticket.Name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      Type: {ticket.Type}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      Description: {ticket.Description || 'No description available'}
                                    </Typography>
                                    <Typography variant="body1" color="primary" className="font-medium">
                                      Price: ${ticket.Price}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color={ticket.Quantity > 0 ? 'success.main' : 'error.main'}
                                    >
                                      Quantity: {ticket.Quantity > 0 ? `${ticket.Quantity} Available` : 'Sold Out'}
                                    </Typography>
                                    {/* Refund Button */}
                                    <Button
                                      variant="contained"
                                      color="secondary"
                                      onClick={() => console.log("refund click")}
                                      disabled={ticket.Quantity === 0}
                                    >
                                      Refund
                                    </Button>
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No tickets available for this event.
                            </Typography>
                          )}
                        </Grid>

                      </div>
                    </div>
                  </Grid>

                  {/* Right side: Event Details and Tickets */}
                  <Grid item lg={7} md={7} xs={12}>
                    <div className="flex flex-col gap-6">
                      <Typography variant="h5" className="font-semibold">
                        Event Details
                      </Typography>
                      <Divider className="mb-4" />

                      <div className="flex flex-col gap-4">
                        <Typography variant="h6" className="font-medium">Description</Typography>
                        <div
                          className="text-sm"
                          dangerouslySetInnerHTML={{ __html: event?.Description }}
                        />
                      </div>

                      <div className="flex flex-col gap-4">
                        <Typography variant="h6" className="font-medium">Email Description</Typography>
                        <div
                          className="text-sm"
                          dangerouslySetInnerHTML={{ __html: event?.EmailDescription }}
                        />
                      </div>

                      <div className="flex items-center gap-4">
                        <Typography className="font-medium" color="text.primary">
                          Start Time:
                        </Typography>
                        <Typography>{new Date(event?.StartTime).toLocaleString()}</Typography>
                      </div>

                      <div className="flex items-center gap-4">
                        <Typography className="font-medium" color="text.primary">
                          End Time:
                        </Typography>
                        <Typography>{new Date(event?.EndTime).toLocaleString()}</Typography>
                      </div>
                    </div>
                  </Grid>
                </Grid>
                <Grid container spacing={4}>
                  <Grid item lg={12} md={12} xs={12}>
                    {/* RSVP Section */}
                    <div className="w-full mt-6">
                      <Typography variant="h6" className="font-medium mb-2">
                        RSVP List
                      </Typography>
                      <div className="flex gap-2 mb-3">
                        <Button
                          variant="outlined"
                          startIcon={<FileDownload />}
                          onClick={handleExportCSV}
                        >
                          Export CSV
                        </Button>
                        {/* <Button
                          variant="outlined"
                          startIcon={<FileDownload />}
                          onClick={handleExportPDF}
                        >
                          Export PDF
                        </Button> */}

                        <Button
                          variant="outlined"
                          startIcon={<Email />}
                          onClick={()=>handleOpenDialog('multiple')}
                        >
                          Send Email
                        </Button>
                      </div>
                      {/* Dropdown and Add Button */}
                      <div className="flex gap-3 mb-4">
                        <FormControl fullWidth>
                          <Autocomplete
                            options={rsvpUserProfiles}
                            getOptionLabel={(option: any) => option.Username || ''}
                            value={selectedRsvpProfile}
                            inputValue={rsvpSearchTerm}
                            onChange={(event, newValue) => {
                              setSelectedRsvpProfile(newValue);
                              setSelectedProfileRSVP(newValue?.ProfileId || '');
                            }}
                            onInputChange={(event, value) => {
                              setRsvpSearchTerm(value);
                              setPage(1);
                            }}
                            ListboxProps={{
                              onScroll: handleScroll,
                            }}
                            loading={rsvpLoading}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Select User Profile"
                                InputProps={{
                                  ...params.InputProps,
                                  endAdornment: (
                                    <>
                                      {rsvpLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                      {params.InputProps.endAdornment}
                                    </>
                                  ),
                                }}
                              />
                            )}
                          />

                        </FormControl>
                        <Button variant="contained" color="primary" onClick={(e) => handleAddRSVP(e)}>
                          Add RSVP
                        </Button>
                      </div>
                      <DataGrid
                        rows={rsvp}
                        columns={rsvpColumns}
                        initialState={{
                          pagination: {
                            paginationModel: {
                              pageSize: 5,
                            },
                          },
                        }}
                        pageSizeOptions={[5]}
                        checkboxSelection
                        disableRowSelectionOnClick
                        getRowId={(row: any) => row.ProfileId}
                      />
                    </div>

                    <div className="w-full mt-6">
                      <Typography variant="h6" className="font-medium mb-2">
                        Attendees List
                      </Typography>
                      <div className="flex gap-2 mb-3">
                        <Button
                          variant="outlined"
                          startIcon={<FileDownload />}
                          onClick={handleExportCSVAtten}
                        >
                          Export CSV
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<Email />}
                          onClick={handleOpenDialog}
                        >
                          Send Email
                        </Button>
                      </div>
                      <div className="flex gap-3 mb-4">

                        <FormControl fullWidth>
                          <Autocomplete
                            options={attendeeUserProfiles}
                            getOptionLabel={(option: any) => option.Username || ''}
                            value={selectedAttendeeProfile}
                            inputValue={attendeeSearchTerm}
                            onChange={(event, newValue) => {
                              setSelectedAttendeeProfile(newValue);
                              setSelectedProfileAttendee(newValue?.ProfileId || '');
                            }}
                            onInputChange={(event, value) => {
                              setAttendeeSearchTerm(value);
                              setPage(1);
                            }}
                            ListboxProps={{
                              onScroll: handleScroll,
                            }}
                            loading={attLoading}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Select User Profile"
                                InputProps={{
                                  ...params.InputProps,
                                  endAdornment: (
                                    <>
                                      {attLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                      {params.InputProps.endAdornment}
                                    </>
                                  ),
                                }}
                              />
                            )}
                          />

                        </FormControl>
                        <Button variant="contained" color="primary" onClick={(e) => handleAddAttendees(e)}>
                          Add Attendees
                        </Button>
                      </div>
                      <DataGrid
                        rows={attendees}
                        columns={attendeeColumns}
                        initialState={{
                          pagination: {
                            paginationModel: {
                              pageSize: 5,
                            },
                          },
                        }}
                        pageSizeOptions={[5]}
                        checkboxSelection
                        disableRowSelectionOnClick
                        getRowId={(row: any) => row.ProfileId}
                      />
                    </div>
                  </Grid>
                </Grid>
                
              </CardContent>
            )}
          </Grid>

          {/* Create Ticket Dialog */}
          <Dialog open={openTicketModal} onClose={handleTicketModalClose}>
            <DialogTitle>Create Ticket</DialogTitle>
            <DialogContent>
              <TextField
                margin="dense"
                name="ticketName"
                label="Ticket Name"
                fullWidth
                variant="outlined"
                value={formData.ticketName}
                onChange={handleChange}
              />
              <FormControl fullWidth margin="dense" variant="outlined">
                <InputLabel id="ticket-type-label">Ticket Type</InputLabel>
                <Select
                  labelId="ticket-type-label"
                  name="ticketType"
                  value={formData.ticketType}
                  onChange={handleChange}
                  label="Ticket Type"
                >
                  <MenuItem value="Man">Man</MenuItem>
                  <MenuItem value="Woman">Woman</MenuItem>
                  <MenuItem value="Couple">Couple</MenuItem>
                  <MenuItem value="Throuple">Throuple</MenuItem>
                </Select>
              </FormControl>

              <TextField
                margin="dense"
                name="price"
                label="Price"
                fullWidth
                variant="outlined"
                type="number"
                value={formData.price}
                onChange={handleChange}
              />
              <TextField
                margin="dense"
                name="quantity"
                label="Quantity"
                fullWidth
                variant="outlined"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
              />

            </DialogContent>
            <DialogActions>
              <Button onClick={handleTicketModalClose} color="secondary">
                Cancel
              </Button>
              <Button onClick={handleSubmitTicket} color="primary" variant="contained">
                Submit
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
            <DialogTitle>Send Email</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                label="Subject"
                variant="outlined"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                margin="normal"
              />
              <ReactQuill
                theme="snow"
                value={emailBody}
                onChange={(e) => setEmailBody(e)}
                placeholder="Write your email here..."
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="secondary">
                Cancel
              </Button>
              <Button onClick={handleSendEmail} variant="contained" color="primary">
                Send
              </Button>
            </DialogActions>
          </Dialog>
        </Grid>
      </Dialog>


    </>
  )
})

export default DetailView;
