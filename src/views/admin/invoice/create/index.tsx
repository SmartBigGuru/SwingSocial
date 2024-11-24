'use client'

// MUI Imports
import { useRef } from 'react'

import Grid from '@mui/material/Grid'


import type { InvoiceHandle } from './content';
import Content from './content'

import Action from './actions'



const CreateInvoice = () => {
  const invoiceRef = useRef<InvoiceHandle>(null)

  const changeTax = (tax: number) => { invoiceRef.current?.setTax(tax) }
  const saveInvoice = () => { invoiceRef.current?.save(); }
  const sendInvoice = () => { invoiceRef.current?.send(); }
  const download = () => { invoiceRef.current?.download(); }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} md={9} >
        <Content ref={invoiceRef} />
      </Grid>
      <Grid item xs={12} md={3} >
        <Action changeTax={changeTax} save={saveInvoice} send={sendInvoice} download={download} />
      </Grid>
    </Grid>
  )
}

export default CreateInvoice
