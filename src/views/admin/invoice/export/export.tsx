import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Register the fonts
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import { supabase } from "@/utils/supabase"


interface CompanyType {
  company_name: string
  company_address: string
  company_phone: string
}

interface AdvertiserType {
  first_name: string
  last_name: string
  companies: CompanyType
  email: string
}

interface PartnerType {
  first_name: string
  last_name: string
  companies: CompanyType
  email: string
}

interface InvoiceItemType {
  retainer: number
  unit_price: number
  contracts: ContractType
}

interface VerticalType {
  name: string
}

interface ContractType {
  verticals: VerticalType
  contract_name: string
}

interface InvoiceType {
  invoice_id: number
  issued_date: Date;
  due_date: Date;
  total_amount: number;
  payment_term: string;
  note: string;
  tax: number;
}

const generatePdf = async (invoice: InvoiceType, advertiser: AdvertiserType,
  partner: PartnerType, items: InvoiceItemType[]
) => {
  console.log(invoice)

  const docDefinition = {
    content: [
      { text: 'Invoice', style: 'title', alignment: 'center' },
      {
        table: {
          widths: ['auto', 'auto'],
          body: [
            [{ text: 'Invoice ID:', bold: true }, `#${invoice.invoice_id.toString()}`],
            [{ text: 'Issued Date:', bold: true }, `${new Date(invoice!.issued_date).toLocaleDateString('en-US', {
              month: 'short',
              day: '2-digit',
              year: 'numeric',
            })}`],
            [{ text: 'Due Date:', bold: true }, `${new Date(invoice!.due_date).toLocaleDateString('en-US', {
              month: 'short',
              day: '2-digit',
              year: 'numeric',
            })}`],
          ]
        },
        layout: 'noBorders',
        margin: [0, 10, 0, 20]
      },

      {
        table: {
          widths: ['45%', '10%', '45%'], // Two equal columns
          body: [
            [
              {
                text: `Bill To:`,
                style: 'header'
              },
              {},
              {
                text: `Invoice To:`,
                style: 'header'
              }
            ],
            [
              {
                text: `${advertiser.first_name} ${advertiser.last_name}\n${advertiser.companies.company_name}\n${advertiser.companies.company_address}\nPhone: ${advertiser.companies.company_phone}\nEmail: ${advertiser.email}`,
                style: 'subheader'
              },
              {},
              {
                text: `${partner.first_name} ${partner.last_name}\n${partner.companies.company_name}\n${partner.companies.company_address}\nPhone: ${partner.companies.company_phone}\nEmail: ${partner.email}`,
                style: 'subheader'
              }
            ]
          ]
        },
        layout: 'noBorders', // No borders for the table
        margin: [0, 0, 0, 20] // Add some margin below
      },
      { text: `Line Items`, bold: true },
      {
        style: 'tableStyle',
        table: {
          widths: ['*', 'auto', 'auto', 'auto', 'auto'],
          body: [
            [{ text: 'Vertical', style: 'tableHeader' },
            { text: 'Contract Name', style: 'tableHeader' },
            { text: 'Retainer', style: 'tableHeader' },
            { text: 'Cost ($)', style: 'tableHeader' },
            { text: 'Total ($)', style: 'tableHeader' }
            ],
            ...items.map(item => [
              item.contracts.verticals.name,
              item.contracts.contract_name,
              item.retainer,
              item.unit_price.toFixed(2),
              (item.retainer * item.unit_price).toFixed(2)
            ])
          ]
        },
      },
      {
        table: {
          widths: ['auto', 'auto', '*', '15%', '10%'], // Two equal columns
          body: [
            [
              {
                text: `Payment Term: `,
                bold: true
              },
              {
                text: invoice.payment_term,
                alignment: 'left'
              },
              {},
              {
                text: `Subtotal: `,
                bold: true
              },
              {
                text: `$${invoice.total_amount}`
              }
            ],
            [
              {
              },
              {
              },
              {},
              {
                text: `Tax: `,
                bold: true,
              },
              {
                text: `${invoice.tax}%`,
              }
            ],
            [
              {
              },
              {
              },
              {},
              {
                text: `Total: `,
                bold: true
              },
              {
                text: `$${(invoice.tax * (100 - invoice.tax) / 100).toFixed(2)}`,
              }
            ],
          ]
        },
        layout: 'noBorders', // No borders for the table
        margin: [0, 0, 0, 20] // Add some margin below
      },
      { text: `Notes: ${invoice.note}` },
    ],
    styles: {
      header: {
        fontSize: 14,
        bold: true,
        margin: [0, 10, 0, 0]
      },
      subheader: {
        fontSize: 12,
        margin: [0, 5, 0, 10]
      },
      title: {
        fontSize: 22,
        bold: true,
        margin: [0, 10, 0, 10]
      },
      tableHeader: {
        bold: true,
        fontSize: 12,
        color: 'white',
        fillColor: 'gray',
        alignment: 'center'
      },
      tableStyle: {
        margin: [0, 5, 0, 15]
      }
    }
  };

  pdfMake.createPdf(docDefinition).download(`invoice_${invoice.invoice_id}.pdf`);
}

const InvoicetoPdf = async (id: string) => {

  const fetchData = async () => {
    try {
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('invoice_id', id)
        .single()

      if (invoiceError) throw invoiceError

      const { data: advertiserData, error: advertiserError } = await supabase
        .from('advertisers')
        .select(`*,
          companies (company_name, company_address, company_phone)`)
        .eq('advertiser_id', invoiceData.advertiser_id)
        .single()

      if (advertiserError) throw advertiserError

      const { data: partnerData, error: partnerError } = await supabase
        .from('partners')
        .select(`*,
          companies (company_name, company_address, company_phone)`)
        .eq('partner_id', invoiceData.partner_id)
        .single()

      if (partnerError) throw partnerError

      const { data: lineItemData, error: lineItemError } = await supabase
        .from('invoice_items')
        .select(`*,
          contracts (contract_name,
          verticals (name))`)
        .eq('invoice_id', invoiceData.invoice_id)

      if (lineItemError) throw lineItemError

      generatePdf(invoiceData, advertiserData, partnerData, lineItemData)
    } catch (error: any) {
      console.log(error.message)
    } finally {

    }
  }

  await fetchData()


}

export default InvoicetoPdf