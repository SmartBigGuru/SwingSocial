'use client'

// Next Imports
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { format } from 'date-fns';
import { rankItem, type RankingInfo } from '@tanstack/match-sorter-utils'
import Grid from '@mui/material/Grid'
import CustomAvatar from '@/@core/components/mui/Avatar'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardHeader, Skeleton, TablePagination, Typography, Button, IconButton, Chip, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material'
import { createColumnHelper, flexRender, getCoreRowModel, getFacetedMinMaxValues, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, type ColumnDef, type FilterFn } from '@tanstack/react-table'
import OptionMenu from '@/@core/components/option-menu'
import tableStyles from '@core/styles/table.module.css'
import classNames from 'classnames'

const colors = [
  'rgba(255, 99, 132, 0.1)',
  'rgba(54, 162, 235, 0.1)',
  'rgba(255, 206, 86, 0.1)',
  'rgba(75, 192, 192, 0.1)',
  'rgba(153, 102, 255, 0.1)',
  'rgba(255, 159, 64, 0.1)',
  'rgba(255, 99, 132, 0.1)',
  'rgba(255, 205, 86, 0.1)',
  'rgba(75, 192, 192, 0.1)',
  'rgba(54, 162, 235, 0.1)',
];

interface UserType {
  yr: string;
  monchar: string;
  free: string;
  paid: string;
  totalsubs: string;
}

type TableAction = UserType & {
  action?: string;
  Id: string;
}

const Recharts = () => {
  const [searchData, setSearchData] = useState<UserType[]>([]);

  const columnHelper = createColumnHelper<TableAction>()

  const searchParams = useSearchParams();
  const [size, setSize] = useState(Number(searchParams.get('size') ?? 10));
  const [totalCount, setTotalCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(Number(searchParams.get('page') ?? 0));
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchData = async () => {
    try {
      let query = '/api/admin/reports';
      const apiUrl = `${query}`
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error('Failed to fetch the report data');
      }

      const data = await response.json();
      setSearchData(data?.reports);
      console.log(data)
      setTotalCount(Number(data.totalCount))
      setLoading(false)
      // setUser(data.user)
      // console.log(user[0]);

    } catch (error: any) {

    }
  }

  const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
    const itemRank = rankItem(row.getValue(columnId), value)

    addMeta({
      itemRank
    })

    return itemRank.passed
  }

  const changeParam = () => {
    const searchParams = new URLSearchParams()

    console.log(String(size));
    searchParams.set('size', String(size))
    searchParams.set('page', String(pageIndex))
    const queryString = searchParams.toString()

    router.push(`/admin/sp/dashboard/${queryString ? `?${queryString}` : ''}`)
  }

  useEffect(() => {

    changeParam()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, pageIndex])

  useEffect(() => {
    const debouncedFetch = setTimeout(() => {
      fetchData()
    }, 500)

    return () => clearTimeout(debouncedFetch)
  }, [searchParams]);

  const columns = useMemo<ColumnDef<TableAction, any>[]>(

    () => [
      {
        id: 'no',
        header: ({ table }) => (
          <>No</>
        ),
        cell: ({ row }) => (
          <>{size * pageIndex + row.index + 1}</>
        )
      },
      columnHelper.accessor('yr', {
        header: 'Year',
        cell: ({ row }) => row.original.yr && <Typography>{row.original.yr}</Typography>
      }),
      columnHelper.accessor('monchar', {
        header: 'Month',
        cell: ({ row }) => row.original.monchar && <Typography>{row.original.monchar}</Typography>
      }),
      columnHelper.accessor('free', {
        header: 'Free',
        cell: ({ row }) => row.original.free && <Typography>{row.original.free}</Typography>
      }),
      columnHelper.accessor('paid', {
        header: 'Paid',
        cell: ({ row }) => row.original.paid && <Typography>{row.original.paid}</Typography>
      }),
      columnHelper.accessor('totalsubs', {
        header: 'TotalSubs',
        cell: ({ row }) => row.original.totalsubs && <Typography>{row.original.totalsubs}</Typography>
      })
    ],

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchData]
  )

  const table = useReactTable({
    data: searchData as any,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,

    },
    state: {
      rowSelection,
      globalFilter,
      columnPinning: { right: ['action'] }
    },
    initialState: {
      pagination: {
        pageSize: size
      },
      columnPinning: {
        right: ['action']
      }
    },
    enableColumnPinning: true,
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
    skeletonTableRow.push(<td key={`td-${i}`}><Skeleton /></td>);
  }

  for (let i = 0; i < size; i++) {
    skeletonTableRows.push(<tr key={`tr-${i}`}>{skeletonTableRow}</tr>);
  }

  return (
    <Grid>
      <Card>
        <div className='scrollbar-custom overflow-x-auto '>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}
                    >
                      {header.isPlaceholder ? null : (
                        <>
                          <div
                            className={classNames({
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
                table.getRowModel().rows.length === 0 ? (
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
                            <tr key={row.id} className={classNames({ selected: row.getIsSelected() })}>
                              {row.getVisibleCells().map(cell => (
                                <td key={cell.id}
                                >
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
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
          rowsPerPage={size}
          page={pageIndex}

          SelectProps={{
            inputProps: { 'aria-label': 'rows per page' }
          }}
          onPageChange={(_, page) => {
            setPageIndex(page)
          }}
          onRowsPerPageChange={e => {
            setSize(Number(e.target.value))
            table.setPageSize(Number(e.target.value))
            setPageIndex(0)
          }}
        />
      </Card>
    </Grid>
  )
}

export default Recharts
