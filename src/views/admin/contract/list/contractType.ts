// Type Imports

export type ContractType = {
  contract_id: string
  contract_name: string
  advertiser:string
  verticals:string
  start_date: string
  end_date: string
  offer:number
  status: string
  budget: number
  cost:number
  payment_term: string
  partner:number
}



export type DBType = {
  contract_id: string
  vertical:string
  start_date: string
  end_date: string
  status: string
  budget: number
  payment_term: string
}
