import { forwardRef, useImperativeHandle, useState } from "react"

import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, IconButton, InputAdornment, TextField } from "@mui/material"

import type { ContactDataType } from "./clientDataTypes"

const initialFormData: ContactDataType = {
  first_name: '',
  last_name: '',
  phoneNumber: '',
  email: '',
  password: '',
  isPasswordShown: false,
};

interface AddContactDialogProps {
  addClient: (data: ContactDataType) => void;
}

export interface ContactDialogHandle {
  open: () => void;
  start: () => void;
  end: () => void;
  close: () => void;
}

const AddContactDialog = forwardRef<ContactDialogHandle, AddContactDialogProps>((props, ref) => {
  const { addClient } = props;
  const [openState, setOpenState] = useState(false)

  const [formData, setFormData] = useState<ContactDataType>({
    first_name: '',
    last_name: '',
    phoneNumber: '',
    email: '',
    password: '',
    isPasswordShown: false,
  })

  const [formDataError, setFormDataError] = useState(false)
  const [companyDataProcessing, setCompanyDataProcessing] = useState(false);

  useImperativeHandle(ref, () => ({
    start: () => startProcessing(),
    end: () => endProcessing(),
    open: () => openDialog(),
    close: () => CloseDialog()
  }))

  const startProcessing = () => {
    setCompanyDataProcessing(true)
  }

  const endProcessing = () => {
    setCompanyDataProcessing(false)
    CloseDialog()
  }

  const openDialog = () => {
    console.log("open")
    setOpenState(true)
  }

  const CloseDialog = () => {
    setFormData(initialFormData)
    setOpenState(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.email == '' || formData.first_name == '' || formData.last_name == '' || formData.phoneNumber == '' || formData.password == '') {
      setFormDataError(true)

      return null
    } else
      setFormDataError(false)

    addClient(formData)
  };


  const handleClose = () => {
    CloseDialog()
  }

  return (
    <Dialog
      maxWidth='sm'
      open={openState}
      aria-labelledby='alert-dialog-title'
    >
      <DialogTitle id='alert-dialog-title'>Add Contact</DialogTitle>
      <Divider />
      <img
        src='/images/illustrations/characters/2.png'
        className='max-md:hidden is-24 mx-auto'
        alt='john image'
      />
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={5} className='w-96 '>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='First Name'
                placeholder='Doug'
                value={formData.first_name}
                onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                {...formData.first_name === "" && formDataError && { error: true, helperText: 'This field is required' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='ri-user-3-line' />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Last Name'
                placeholder='Jones'
                value={formData.last_name}
                onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                {...formData.last_name === "" && formDataError && { error: true, helperText: 'This field is required' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='ri-user-3-line' />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <TextField
                fullWidth
                label='Phone'
                placeholder=' (917) 543-9876'
                value={formData.phoneNumber}
                onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                {...formData.phoneNumber === "" && formDataError && { error: true, helperText: 'This field is required' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='ri-phone-fill' />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <TextField
                fullWidth
                label='Email'
                type="email"
                placeholder='byteboss125@gmail.com'
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                {...formData.email === "" && formDataError && { error: true, helperText: 'This field is required' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='ri-mail-line' />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <TextField
                fullWidth
                label='Password'
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                {...formData.password === "" && formDataError && { error: true, helperText: 'This field is required' }}
                type={formData.isPasswordShown ? 'text' : 'password'}
                placeholder='············'
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='ri-lock-password-line' />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        size='small'
                        edge='end'
                        onClick={() => setFormData(show => ({ ...show, isPasswordShown: !show.isPasswordShown }))}
                        onMouseDown={e => e.preventDefault()}
                        aria-label='toggle password visibility'
                      >
                        <i className={formData.isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={companyDataProcessing} variant='outlined' color='secondary'>
            Cancel
          </Button>
          <Button type='submit' disabled={companyDataProcessing} variant='contained' color='error'>
            {companyDataProcessing && <CircularProgress thickness={5} className="mr-2" variant={companyDataProcessing ? 'indeterminate' : 'determinate'} color='success' size={15} />}
            Confirm
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
)

export default AddContactDialog
