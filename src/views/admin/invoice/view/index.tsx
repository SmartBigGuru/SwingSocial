'use client'

// MUI Imports
import { useRef } from 'react'

import Grid from '@mui/material/Grid'


import type { InvoiceHandle } from './content';
import Content from './content'

import Action from './actions'

const CreateInvoice = (props: { id: string; }) => {
  const { id } = props
  const invoiceRef = useRef<InvoiceHandle>(null)

  const send = () => { invoiceRef.current?.send(); }
  const download = () => { invoiceRef.current?.download(); }
  const edit = () => { invoiceRef.current?.edit(); }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} md={9} >
        {id && <Content ref={invoiceRef} id={id} />}
      </Grid>
      <Grid item xs={12} md={3} >
        {id && <Action id={id} send={send} download={download} edit={edit}/>}
      </Grid>
    </Grid>
  )
}

export default CreateInvoice
