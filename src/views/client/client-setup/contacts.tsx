'use client'

// React Imports
import { useState, useMemo, useEffect, useRef } from 'react'

// MUI Imports
import { useSearchParams } from 'next/navigation'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import classnames from 'classnames'

// Third-party Imports
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

import { type Session, type User } from "@supabase/supabase-js"

import { Button, Checkbox, CircularProgress, Divider, Skeleton, TablePagination, Tooltip } from '@mui/material'

import { toast } from 'react-toastify'

import { supabase } from '@/utils/supabase'

import type { ContactType } from '@/types/apps/client/contact'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import CustomIconButton from '@/@core/components/mui/IconButton'
import type { ContactDialogHandle } from './addContactDialog';
import AddContactDialog from './addContactDialog'
import type { ContactDataType } from './clientDataTypes'
import { USER_ROLE } from '@/@core/roles'
import OptionMenu from '@/@core/components/option-menu'


// Style Imports

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

type ContactTypeWithAction = ContactType & {
  action?: string
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({
    itemRank
  })

  return itemRank.passed
}

interface ContactsPropsType {
  session?: Session | null
  userInfo?: User | null;
}

// Column Definitions
const columnHelper = createColumnHelper<ContactTypeWithAction>()

const CompanyContact: React.FC<ContactsPropsType> = ({ userInfo, session }) => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  const [searchData, setSearchData] = useState<any[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [loading, setLoading] = useState(true);
  const [perPage, setPerpage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const searchParams = useSearchParams()
  const [currentSession, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [showPassword, setShowPassword] = useState(false);
  const [contact, setContact] = useState<ContactDataType | null>(null)
  const childRef = useRef<ContactDialogHandle>(null);

  useEffect(() => {
    if (userInfo && session) {
      setUser(userInfo)
      setSession(session)
    }
  }, [userInfo, session])

  const fetchContact = async () => {
    if (user === null) return

    try {
      console.log(loading)

      const { data: companyData, error: companyError } = await supabase
        .from('advertisers')
        .select('company_id')
        .eq('auth_id', user.id)
        .single()

      if (companyError) throw companyError
      console.log(companyData.company_id)
      let query = supabase
        .from('advertisers')
        .select(`
        *,
        contracts (status)
        `
          , { count: 'exact' });

      query = query
        .eq('company_id', companyData.company_id)
        .neq('auth_id', user.id)

      query = query
        .range(pageIndex * perPage, (pageIndex + 1) * perPage - 1)
        .order('created_date', { ascending: false })
      const { data: contacts, count, error } = await query;

      if (error) throw error;
      setTotalCount(Number(count))
      setSearchData(contacts);
      console.log(contacts)
    } catch (error: any) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  }


  // Hooks
  useEffect(() => {
    fetchContact()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, perPage, pageIndex, searchParams])

  useEffect(() => {
    setPageIndex(0)
  }, [perPage, searchParams])

  const columns = useMemo<ColumnDef<ContactTypeWithAction, any>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler()
            }}
          />
        )
      },
      columnHelper.accessor('first_name', {
        header: 'First Name',
        cell: ({ row }) => (row.original.first_name !== null) && <Typography>{row.original.first_name}</Typography>
      }),
      columnHelper.accessor('last_name', {
        header: 'Last Name',
        cell: ({ row }) => (row.original.last_name !== null) && <Typography>{row.original.last_name}</Typography>
      }),
      columnHelper.accessor('phone', {
        header: 'Phone',
        cell: ({ row }) => (row.original.phone !== null) && <Typography>{row.original.phone}</Typography>
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: ({ row }) => (row.original.email !== null) && <Typography>{row.original.email}</Typography>
      }),
      columnHelper.accessor('contracts', {
        header: 'Contract',
        cell: ({ row }) => (row.original.email !== null) && (
          <>
            <div className='flex'>
              <Typography
                className='text-wrap'
                color='text.primary'
              >
                {`(${row.original.contracts.filter((contract: { status: string }) => contract.status === 'Expired').length || 0}/${row.original.contracts.length || 0})`}
              </Typography>
            </div>
          </>
        )
      }),


      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <OptionMenu
            iconButtonProps={{ size: 'medium' }}
            iconClassName='text-textSecondary text-[22px]'
            options={[
              {
                text: 'Edit',
                menuItemProps: {
                  onClick: () => {
                  },
                  className: 'flex items-center gap-2'
                }
              },
              {
                text: 'Assign',
                menuItemProps: {
                  onClick: () => {

                  },
                  className: 'flex items-center gap-2'
                }
              }
            ]}
          />
        )
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchData]
  )

  const deleteContact = async () => {
    try {
      setProcessing(true)
      const { error } = await supabase.from('contacts').delete().eq('email', contact?.email)

      if (error) throw error
      await fetchContact();
    } catch (error) {
      console.log(error)
    } finally {
      setProcessing(false)
      setOpenConfirm(false)
    }
  }

  const passwordDialog = (
    <Dialog
      maxWidth='sm'
      open={showPassword}
      onClose={() => setShowPassword(false)}
      aria-labelledby='alert-dialog-title'
      className='m-2'
    >
      <DialogContent>
        {contact?.password}
      </DialogContent>
    </Dialog>
  )

  const confirmDialog = (
    <Dialog
      maxWidth='sm'
      open={openConfirm}
      aria-labelledby='alert-dialog-title'
    >
      <DialogTitle id='alert-dialog-title'>Delete Contact?</DialogTitle>
      <DialogActions>
        <Button onClick={() => setOpenConfirm(false)} disabled={processing} variant='outlined' color='secondary'>
          Cancel
        </Button>
        <Button type='button' disabled={processing} variant='contained' color='error' onClick={deleteContact}>
          {processing && <CircularProgress thickness={5} variant={processing ? 'indeterminate' : 'determinate'} className='mr-2' color='success' size={15} />}
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  )

  const table = useReactTable({
    data: searchData as any,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: perPage
      }
    },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  const columnCount = table.getVisibleFlatColumns().length;
  const skeletonTableRow = [];
  const skeletonTableRows = [];

  for (let i = 0; i < columnCount; i++) {
    skeletonTableRow.push(<td key={`td-${i}`}><Skeleton key={`skeleton-${i}`} /></td>);
  }

  for (let i = 0; i < perPage; i++) {
    skeletonTableRows.push(<tr key={`tr-${i}`}>{skeletonTableRow}</tr>);
  }

  const deleteAction = (contact: ContactDataType) => {
    // setOpenConfirm(true)
    // setContact(contact)
  }


  const AddContactAction = () => {
    return (
      <>
        <Tooltip title={
          <Typography variant='body2' component='span' className='text-inherit' >
            Add Contact
          </Typography>
        }>
          <CustomIconButton aria-label='add-contact' color={'success'} onClick={() => childRef.current?.open()} >
            <i className='ri-user-add-line' />
          </CustomIconButton>
        </Tooltip>
      </>
    )
  }

  const AddContact = async (formData: ContactDataType) => {
    if (user === null) return;
    if (currentSession === null) return;

    const addContact = async () => {
      try {
        childRef.current?.start()

        const { data: companyData, error: companyError } = await supabase
          .from('advertisers')
          .select('company_id')
          .eq('auth_id', user.id)
          .single()

        if (companyError) throw companyError

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              userName: formData.first_name + " " + formData.last_name,
              role_id: USER_ROLE.ROLE_SUB_CLIENT
            }
          }
        })

        if (authError) throw authError
        console.log(authData.user?.id,session?.user.id)

        const { data: contactData, error: contactError } = await supabase
          .from('advertisers')
          .insert({
            auth_id: authData.user?.id,
            company_id: companyData.company_id,
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            phone: formData.phoneNumber,
            role_id: USER_ROLE.ROLE_SUB_CLIENT
          })

        if (contactError) throw contactError

        await supabase.auth.setSession(currentSession)

        toast.success(`Add Contacts success!`, {
          autoClose: 3000,
          type: 'success'
        })
        fetchContact()

      } catch (error: any) {
        toast.error(`${error.message}`, {
          type: 'error'
        })
      } finally {
        childRef.current?.end()
      }
    }

    addContact();

  }

  return (
    <Card>
      <CardHeader title='Contacts'
        action={<AddContactAction />}
      />
      <Divider />
      <div className='scrollbar-custom overflow-x-auto '>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : (
                      <>
                        <div
                          className={classnames({
                            'flex items-center': header.column.getIsSorted(),
                            'cursor-pointer select-none': header.column.getCanSort()
                          })}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <i className='ri-arrow-up-s-line text-xl' />,
                            desc: <i className='ri-arrow-down-s-line text-xl' />
                          }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                        </div>
                      </>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          {
            loading ? (
              <>
                <tbody>
                  {skeletonTableRows}
                </tbody>
              </>) :
              table.getFilteredRowModel().rows.length === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                      No data available
                    </td>
                  </tr>
                </tbody>
              ) :
                (
                  <tbody className='scrollbar-custom overflow-y-scroll '>
                    {table
                      .getRowModel()
                      .rows
                      .map(row => {
                        return (
                          <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                            {row.getVisibleCells().map(cell => (
                              <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                            ))}
                          </tr>
                        )
                      })}
                  </tbody>
                )}
        </table>
      </div>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component='div'
        className='border-bs'
        count={totalCount}
        rowsPerPage={perPage}
        page={pageIndex}

        SelectProps={{
          inputProps: { 'aria-label': 'rows per page' }
        }}
        onPageChange={(_, page) => {
          setPageIndex(page)
        }}
        onRowsPerPageChange={e => {
          setPerpage(Number(e.target.value))
          table.setPageSize(Number(e.target.value))
          setPageIndex(0)
        }}
      />
      <AddContactDialog addClient={AddContact} ref={childRef} />
      {confirmDialog}
      {passwordDialog}
    </Card>
  )
}

export default CompanyContact
