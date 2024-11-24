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

  const changeTax = (tax: number) => { invoiceRef.current?.setTax(tax) }
  const saveInvoice = () => { invoiceRef.current?.save(); }
  const sendInvoice = () => { invoiceRef.current?.send(); }
  const download = () => { invoiceRef.current?.download(); }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} md={9} >
        {id && <Content ref={invoiceRef} id={id} />}
      </Grid>
      <Grid item xs={12} md={3} >
        {id && <Action id={id} changeTax={changeTax} save={saveInvoice} send={sendInvoice} download={download}  />}
      </Grid>
    </Grid>
  )
}

export default CreateInvoice
