'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

import { Divider } from '@mui/material'

import { Menu, MenuItem, SubMenu } from '@menu/vertical-menu'


import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

import useVerticalNav from '@menu/hooks/useVerticalNav'

import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

import { supabase } from '@/utils/supabase'
import { USER_ROLE } from '@/@core/roles'

type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

type Props = {
  scrollMenu: (container: any, isPerfectScrollbar: boolean) => void
}

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ scrollMenu }: Props) => {
  // Hooks
  const router = useRouter()
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const { isBreakpointReached } = useVerticalNav()

  // Vars
  const { transitionDuration } = verticalNavOptions

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const getUserRole = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      setRole(session?.user.user_metadata?.role_id || null)

    }

    getUserRole()
  }, [])

  const QAMenu = (
    <>
      <MenuItem href={(`/admin/qa/dashboard`)}
        exactMatch={false}
        icon={<i className='ri-home-smile-line' />}
        activeUrl='/admin/qa/dashboard'
      >
        Reports
      </MenuItem>
      {/* <MenuItem href={(`/admin/qa/user-manage`)}
        icon={<i className='ri-shield-user-line' />}
        exactMatch={false}
        activeUrl='/admin/qa/user-manage'
      >
        Admin Manager
      </MenuItem> */}
      <MenuItem href={(`/admin/qa/advertiser-manage`)}
        icon={<i className='ri-account-circle-line' />}
        exactMatch={false}
        activeUrl='/admin/qa/advertiser-manage'
      >
        Profile Manager
      </MenuItem>
      <MenuItem href={(`/admin/qa/partner-manage`)}
        icon={<i className='ri-calendar-event-line' />}
        exactMatch={false}
        activeUrl='/admin/qa/partner-manage'
      >
        Event Manager
      </MenuItem>
      <MenuItem href={(`/admin/qa/promocode-manage`)}
        icon={<i className='ri-calendar-event-line' />}
        exactMatch={false}
        activeUrl='/admin/qa/promocode-manage'
      >
        Promocode Manager
      </MenuItem>
      <MenuItem href={(`/admin/qa/invoice`)}
        icon={<i className='ri-spam-line' />}
        exactMatch={false}
        activeUrl='/admin/qa/invoice'
      >
        Deleted Profiles
      </MenuItem>
      <MenuItem href={(`/admin/qa/email-template`)}
        icon={<i className='ri-calendar-event-line' />}
        exactMatch={false}
        activeUrl='/admin/qa/email-template'
      >
        Email Templates
      </MenuItem>
    </>
  )

  const SuperAdminMenu = (
    <>
      <MenuItem href={(`/admin/sp/dashboard`)}
        icon={<i className='ri-home-smile-line' />}
        exactMatch={false}
        activeUrl='/admin/sp/dashboard'
      >
        Reports
      </MenuItem>

      {/* <MenuItem href={(`/admin/sp/user-manage`)}
        icon={<i className='ri-shield-user-line' />}
        exactMatch={false}
        activeUrl='/admin/sp/user-manage'
      >
        Admin Manager
      </MenuItem> */}
      <MenuItem href={(`/admin/sp/advertiser-manage`)}
        icon={<i className='ri-account-circle-line' />}
        exactMatch={false}
        activeUrl='/admin/sp/advertiser-manage'
      >
        Profile Manager
      </MenuItem>
      <MenuItem href={(`/admin/sp/partner-manage`)}
        icon={<i className='ri-calendar-event-line' />}
        exactMatch={false}
        activeUrl='/admin/sp/partner-manage'
      >
        Event Manager
      </MenuItem>
      <MenuItem href={(`/admin/sp/promocode-manage`)}
        icon={<i className='ri-coupon-3-line' />}
        exactMatch={false}
        activeUrl='/admin/sp/promocode-manage'
      >
        Promocode Manager
      </MenuItem>
      <MenuItem href={(`/admin/sp/invoice`)}
        icon={<i className='ri-spam-line' />}
        exactMatch={false}
        activeUrl='/admin/sp/invoice'
      >
        Deleted Profiles
      </MenuItem>
      <MenuItem href={(`/admin/sp/email-template`)}
        icon={<i className='ri-mail-line' />}
        exactMatch={false}
        activeUrl='/admin/sp/email-template'
      >
        Email Templates
      </MenuItem>
      {/*<MenuItem href={(`/admin/sp/contract`)}
        icon={<i className='ri-shake-hands-line' />}
        exactMatch={false}
        activeUrl='/admin/sp/contract'
      >
        Contract
      </MenuItem>
      <MenuItem href={(`/admin/sp/invoice`)}
        icon={<i className="ri-article-line"></i>}
        exactMatch={false}
        activeUrl='/admin/sp/invoice'
      >
        Invoice
      </MenuItem> */}
      {/* <SubMenu label='System Setting' icon={<i className='ri-settings-2-line' />}>
        <MenuItem>
          Integration
        </MenuItem>
        <MenuItem>
          Notification
        </MenuItem>
        <MenuItem>
          Data Sync
        </MenuItem>
        <MenuItem>
          Security
        </MenuItem>
      </SubMenu> */}
      {/* <Divider>Other</Divider>
      <MenuItem href={(`/admin/sp/qa`)}
        icon={<i className='ri-question-answer-line ' />}
        exactMatch={false}
        activeUrl='/admin/sp/qa'
      >
        Q & A
      </MenuItem> */}
    </>
  )

  const UserManagerMenu = (
    <>
      <MenuItem href={(`/admin/um/dashboard`)}
        icon={<i className='ri-home-smile-line' />}
        exactMatch={false}
        activeUrl='/admin/um/dashboard'
      >
        DashBoard
      </MenuItem>
      <MenuItem href={(`/admin/um/user-manage`)}
        icon={<i className='ri-shield-user-line' />}
        exactMatch={false}
        activeUrl='/admin/um/user-manage'
      >
        Admin Manage
      </MenuItem>
      <MenuItem href={(`/admin/um/advertiser-manage`)}
        icon={<i className='ri-account-circle-line' />}
        exactMatch={false}
        activeUrl='/admin/um/advertiser-manage'
      >
        Profile Manage
      </MenuItem>
      <MenuItem href={(`/admin/um/partner-manage`)}
        icon={<i className='ri-calendar-event-line' />}
        exactMatch={false}
        activeUrl='/admin/um/partner-manage'
      >
        Event Manage
      </MenuItem>
      <MenuItem href={(`/admin/um/promocode-manage`)}
        icon={<i className='ri-calendar-event-line' />}
        exactMatch={false}
        activeUrl='/admin/um/promocode-manage'
      >
        Promocode Manager
      </MenuItem>
      <MenuItem href={(`/admin/um/email-template`)}
        icon={<i className='ri-calendar-event-line' />}
        exactMatch={false}
        activeUrl='/admin/um/email-template'
      >
        Email Templates
      </MenuItem>
    </>
  )

  const PartnerMenu = (
    <>
      <MenuItem href={(`/user/partner/dashboard`)}
        icon={<i className='ri-home-smile-line' />}
        exactMatch={false}
        activeUrl='/user/partner/dashboard'
      >
        DashBoard
      </MenuItem>
      <MenuItem href={(`/user/partner/campaign`)}
        icon={<i className='ri-contacts-book-2-line' />}
        exactMatch={false}
        activeUrl='/user/partner/campaign'
      >
        Campaign
      </MenuItem>
      <MenuItem href={(`/user/partner/communication-center`)}
        icon={<i className='ri-wechat-line' />}
        exactMatch={false}
        activeUrl='/user/partner/communication-center'
      >
        Communication
      </MenuItem>
      <MenuItem href={(`/user/partner/payment-report`)}
        icon={<i className='ri-bank-card-line' />}
        exactMatch={false}
        activeUrl='/user/partner/payment-report'
      >
        Payment
      </MenuItem>
    </>
  )

  const ClientMenu = (
    <>
      <MenuItem href={(`/user/client/dashboard`)}
        icon={<i className='ri-home-smile-line' />}
        exactMatch={false}
        activeUrl='/user/client/dashboard'
      >
        DashBoard
      </MenuItem>
      <MenuItem href={(`/user/client/budget-report`)}
        icon={<i className='ri-money-dollar-circle-line' />}
        exactMatch={false}
        activeUrl='/user/client/budget-report'
      >
        Budget
      </MenuItem>
      <MenuItem href={(`/user/client/communication-center`)}
        icon={<i className='ri-wechat-line' />}
        exactMatch={false}
        activeUrl='/user/client/communication-center'
      >
        Communication
      </MenuItem>
      <MenuItem href={(`/user/client/contract`)}
        icon={<i className='ri-contract-line' />}
        exactMatch={false}
        activeUrl='/user/client/contract'
      >
        Contract
      </MenuItem>
      <MenuItem href={(`/user/client/return`)}
        icon={<i className='ri-share-forward-line' />}
        exactMatch={false}
        activeUrl='/user/client/return'
      >
        Return
      </MenuItem>
    </>
  )

  return (
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
          className: 'bs-full overflow-y-auto overflow-x-hidden',
          onScroll: container => scrollMenu(container, false)
        }
        : {
          options: { wheelPropagation: false, suppressScrollX: true },
          onScrollY: container => scrollMenu(container, true)
        })}
    >
      <Menu
        popoutMenuOffset={{ mainAxis: 10 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-line' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        {role == USER_ROLE.ROLE_SUPER_ADMIN && SuperAdminMenu}
        {role == USER_ROLE.ROLE_QA && QAMenu}
        {role == USER_ROLE.ROLE_USER_MANAGER && UserManagerMenu}
        {role == USER_ROLE.ROLE_CLIENT && ClientMenu}
        {role == USER_ROLE.ROLE_SUB_CLIENT && ClientMenu}
        {role == USER_ROLE.ROLE_PARTNER && PartnerMenu}

      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
