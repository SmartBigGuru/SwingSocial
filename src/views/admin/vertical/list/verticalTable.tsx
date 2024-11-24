'use client'

// React Imports
import { useState, useMemo, useEffect, useRef } from 'react'

// MUI Imports
import { useSearchParams, useRouter } from 'next/navigation'

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

import { type Session, type User } from "@supabase/supabase-js"

import { Button, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, LinearProgress, Skeleton, TablePagination, TextField } from '@mui/material'

import { toast } from 'react-toastify'

import { supabase } from '@/utils/supabase'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

import type { VerticalTableCellType } from './types'


import OptionMenu from '@/@core/components/option-menu'
import type { VerticalEditDialogHandle } from '../edit';
import VerticalEditDialog from '../edit'


declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

type VerticalTypeWithAction = VerticalTableCellType & {
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

interface VerticalType {
  verticalName: string
  verticalSummary: string
  verticalDescription: string
}

const initialVerticalData: VerticalType = {
  verticalName: '',
  verticalSummary: '',
  verticalDescription: '',
}

// Column Definitions
const columnHelper = createColumnHelper<VerticalTypeWithAction>()

const VerticalTable: React.FC<ContactsPropsType> = () => {
  // States

  const searchParams = useSearchParams()
  const router = useRouter()

  const [rowSelection, setRowSelection] = useState({})
  const [searchData, setSearchData] = useState<any[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [deleting, setDeleting] = useState(false);
  const [perPage, setPerpage] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [newVerticalDialog, setNewVerticalDialog] = useState(false)
  const [newVerticalData, setNewVerticalData] = useState<VerticalType>(initialVerticalData);
  const [addState, setAddState] = useState(false);
  const [visibleSkeleton, setVisibleSkeleton] = useState(true);
  const editRef = useRef<VerticalEditDialogHandle>(null)

  useEffect(() => {
    setPageIndex(0)
  }, [perPage])

  const fetchVertical = async () => {
    try {
      const { data, count, error } = await supabase
        .from('verticals')
        .select(`
          *, contracts (status)
          `, { count: 'exact' })
        .range(pageIndex * perPage, (pageIndex + 1) * perPage - 1)
        .order('created_date', { ascending: false })

      if (error) throw error;

      const vertical = data.map(item => ({
        name: item.name,
        summary: item.summary,
        created_date: item.created_date,
        total_contract: item.contracts.length,
        ended_contract: item.contracts.filter((contract: { status: string }) => contract.status === 'Expired').length,
        vertical_id: item.vertical_id
      }))

      setTotalCount(count || 0)
      setSearchData(vertical || []);
    } catch (error: any) {
      console.log(error.message);
    } finally {
      setVisibleSkeleton(false)
    }
  }

  useEffect(() => {
    console.log(searchParams.values())
    fetchVertical()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perPage, pageIndex])


  const DeleteVertical = async (id: string) => {
    setDeleting(true)
    if(id===null) return

    try {
      const {error:contractError} = await supabase
      .from('contracts')
      .delete()
      .eq('vertical_id', id)
      
      if(contractError) throw contractError

      const {data, error } = await supabase
        .from("verticals")
        .delete()
        .eq('vertical_id', id)

      if (error) throw error
      console.log(data)
      fetchVertical()
    } catch (error: any) {
      toast.error(`${error.message}`, {
        autoClose: 3000,
        type: 'error'
      })
    } finally {
      setDeleting(false)
    }
  }

  const openVerticalDialog = (mode: string, id: string) => {
    const searchParams = new URLSearchParams()

    searchParams.set(mode, id)
    const queryString = searchParams.toString()

    router.push(`/admin/sp/vertical/${queryString ? `?${queryString}` : ''}`)
  }

  const columns = useMemo<ColumnDef<VerticalTypeWithAction, any>[]>(
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
      columnHelper.accessor('name', {
        header: 'Vertical',
        cell: ({ row }) => {
          return <div className='flex flex-col gap-1'>
            <Typography className='font-medium blod' color='text.primary'>
              <span className='hover:cursor-pointer' onClick={() => openVerticalDialog('id', row.original.vertical_id)}>
                {row.original.name}
              </span>
            </Typography>
            <Typography variant='body2' className='text-wrap'>
              {row.original.summary}
            </Typography>
          </div>
        }
      }),

      columnHelper.accessor('created_date', {
        header: 'Date',
        cell: ({ row }) => {
          const date = new Date(row.original.created_date).toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
          })

          return <Typography>{date}</Typography>
        }
      }),
      columnHelper.accessor('total_contract', {
        header: 'Contract',
        cell: ({ row }) => (
          <div className='flex flex-col gap-2 min-is-36'>
            <div className='flex gap-2' >
              <Typography
                className='font-medium'
                color='text.primary'
              >
                {`${Math.floor((row.original.ended_contract / row.original.total_contract) * 100) || 0}%`}
              </Typography>
              <Typography
                className='text-wrap'
                color='text.primary'
              >
                {`  (${row.original.ended_contract || 0}/${row.original.total_contract || 0})`}
              </Typography>
            </div>
            <LinearProgress
              color='primary'
              value={Math.floor((row.original.ended_contract / row.original.total_contract) * 100 || 0)}
              variant='determinate'
              className='is-full bs-2'
            />
          </div>
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
                text: 'View',
                menuItemProps: {
                  onClick: () => openVerticalDialog('id', row.original.vertical_id),
                  className: 'flex items-center gap-2'
                }
              },
              {
                text: 'Edit',
                menuItemProps: {
                  onClick: () => { editRef.current?.open(row.original.vertical_id) },
                  className: 'flex items-center gap-2'
                }
              },
              {
                text: 'Delete',
                menuItemProps: {
                  onClick: () => DeleteVertical(row.original.vertical_id),
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

  const AddContactAction = () => {
    return (
      <>
        <Button variant='outlined'
          color='success'
          startIcon={<i className='ri-apps-2-add-line' />}
          onClick={() => {
            setNewVerticalDialog(true)
            setNewVerticalData(initialVerticalData)
          }
          }
        >
          Create Vertical
        </Button>
      </>
    )
  }

  const newVerticalSubmit = async () => {
    setAddState(true)

    const { error: contactError } = await supabase
      .from('verticals')
      .insert({
        name: newVerticalData.verticalName,
        summary: newVerticalData.verticalSummary,
        description: newVerticalData.verticalDescription
      })

    setNewVerticalDialog(false)

    if (contactError) {
      toast.error(contactError.message)

      return
    }

    toast.success(`Add vertical success!`, {
      autoClose: 3000,
      type: 'success',
    })
    setAddState(false)
    fetchVertical();
  }

  const CreateVerticalDialog = (
    <Dialog
      open={newVerticalDialog}
      maxWidth='md'
      fullWidth
      aria-labelledby='max-width-dialog-title'>
      <DialogTitle>New Vertical</DialogTitle>
      <Divider />
      <DialogContent>
        <Grid container spacing={6} className='overflow-visible pbs-0 sm:pli-16'>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label='Vertical Name'
              value={newVerticalData.verticalName}
              onChange={e => setNewVerticalData({ ...newVerticalData, verticalName: e.target.value })}
              placeholder=''
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label='Summary'
              value={newVerticalData.verticalSummary}
              onChange={e => setNewVerticalData({ ...newVerticalData, verticalSummary: e.target.value })}
              placeholder=''
            />
          </Grid>
          <Grid item xs={12} md={12}>
            <TextField
              fullWidth
              rows={6}
              multiline
              value={newVerticalData.verticalDescription}
              onChange={e => setNewVerticalData({ ...newVerticalData, verticalDescription: e.target.value })}
              label='Description'
              className='scrollbar-custom'
            />
          </Grid>
        </Grid>
      </DialogContent>
      <Divider />
      <DialogActions className='justify-center pbs-0 sm:pbe-6 sm:pli-6'>
        <Button variant='contained' className="mt-6" type='button' color='error' disabled={addState}
          onClick={newVerticalSubmit}
        >
          {addState ? <CircularProgress color="inherit" size={15} className='mr-2'/> : null}
          Submit
        </Button>
        <Button variant='contained' className="mt-6" onClick={() => setNewVerticalDialog(false)} type='button'>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )

  return (
    <Card>
      <CardHeader title='Vertical'
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

            visibleSkeleton ? (
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
      {CreateVerticalDialog}
      <VerticalEditDialog ref={editRef} refresh={fetchVertical} />
    </Card>
  )
}

export default VerticalTable
