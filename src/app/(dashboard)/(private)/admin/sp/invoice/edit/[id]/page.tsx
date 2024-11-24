'use client'

import { useParams } from 'next/navigation'

import EditInvoice from '@/views/admin/invoice/edit'

const Recharts = () => {
  const {id} = useParams<{ id: string }>();

  
return (
    <>
      <EditInvoice id={id} />
    </>
  )
}

export default Recharts