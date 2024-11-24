// Type Imports
type contractType = {
  status:string
}

export type ContactType = {
  first_name: string
  last_name:string
  phone: string
  email: string
  password: string
  phoneNumber: string
  isPasswordShown: boolean
  contracts: contractType[]
}
