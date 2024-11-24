'use client'

import { useEffect, useState } from 'react'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'

// Type Imports
import { Riple } from 'react-loading-indicators'

import type { ChildrenType } from '@core/types'

import { supabase } from '@/utils/supabase'
import { ROLE_ROUTES, USER_ROLE } from '@/@core/roles'

export default function AuthGuard({ children }: ChildrenType) {

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const currentPath = usePathname()

  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const getUserRole = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      setRole(session?.user.user_metadata?.role_id || null)
    }

    getUserRole()
  }, [])

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) throw error
        setIsAuthenticated(!!session)
        setRole(session?.user.user_metadata?.role_id || null)
      } catch (error) {
        console.error('Error fetching session:', error)
        setIsAuthenticated(false)
      }
    }

    checkSession()
  }, [])

  useEffect(() => {

    if (isAuthenticated && role) {
      const defaultRoute = ROLE_ROUTES[role]

      if (defaultRoute && !currentPath.startsWith(defaultRoute)) {
        const redirectURL = searchParams.get('redirectTo') ?? `${defaultRoute}/dashboard`

        if (redirectURL !== currentPath && router) {
          router.push(redirectURL)
        }
      }

      if (currentPath === "/user/client/setup" && role === USER_ROLE.ROLE_SUB_CLIENT) {
        router.push(ROLE_ROUTES[role] + '/dashboard')
      }

    }
  }, [isAuthenticated, role, currentPath, searchParams, router])

  if (isAuthenticated === null) {
    return <div className={`z-50 absolute h-screen w-screen flex bg-white/80 items-center justify-center `}>
      <Riple color="#ad28f9" size="medium" text="" textColor="" />
    </div>
  }

  if (!isAuthenticated) {
    router.push(`/login`)

    return null
  }

  return <>
    {children}
  </>
}

