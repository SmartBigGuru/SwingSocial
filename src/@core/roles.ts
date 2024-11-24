type RoleType = {
  [key: string]: string
}

type RoleRoutes = {
  [key: string]: string
}

export const ROLE_ROUTES: RoleRoutes = {
  "107f25b5-9046-41e5-9abf-580e9638e08c": "/user/partner",
  "15c59148-585a-4617-83c2-8687bd94d634": "/user/client",
  "dd0bfde1-6f6e-4da8-9929-173fe974b295": "/user/client",
  "ebd63b96-fc4e-4222-b2cc-55f31d05e6e0": "/admin/qa",
  "47ac0121-c33b-44a6-be05-4715265f0bd9": "/admin/sp",
  "fe7fa1d2-b5fc-4da4-8dca-ea17c22d0c1b": "/admin/um",
}

export const USER_ROLE: RoleType = {
  ROLE_PARTNER:"107f25b5-9046-41e5-9abf-580e9638e08c",
  ROLE_CLIENT:"15c59148-585a-4617-83c2-8687bd94d634",
  ROLE_SUB_CLIENT:"dd0bfde1-6f6e-4da8-9929-173fe974b295",
  ROLE_QA:"ebd63b96-fc4e-4222-b2cc-55f31d05e6e0",
  ROLE_SUPER_ADMIN:"47ac0121-c33b-44a6-be05-4715265f0bd9",
  ROLE_USER_MANAGER:"fe7fa1d2-b5fc-4da4-8dca-ea17c22d0c1b",
}
