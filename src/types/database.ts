// Types pour la base de données Supabase

export type PaymentStatus = 'trial' | 'active' | 'pending' | 'late'
export type ModificationStatus = 'pending' | 'processing' | 'completed'

// Table: clients
export interface Client {
  id: string
  name: string
  activity: string
  city: string
  address: string
  whatsapp: string
  slug: string
  trial_ends_at: string
  payment_status: PaymentStatus
  created_at: string
  updated_at: string
}

// Table: payments
export interface Payment {
  id: string
  client_id: string
  amount: number
  status: PaymentStatus
  created_at: string
}

// Table: modifications
export interface Modification {
  id: string
  client_id: string
  request: string
  status: ModificationStatus
  created_at: string
}

// Table: site_contents
export interface SiteContent {
  id: string
  client_id: string
  html_content: string
  css_content: string
  generated_at: string
}

// Pour créer un nouveau client
export interface CreateClientInput {
  name: string
  activity: string
  city: string
  address: string
  whatsapp: string
  slug: string
}

// Pour créer un paiement
export interface CreatePaymentInput {
  client_id: string
  amount: number
  status?: PaymentStatus
}

// Pour créer une modification
export interface CreateModificationInput {
  client_id: string
  request: string
}

// Relations
export interface ClientWithPayments extends Client {
  payments: Payment[]
}

export interface ClientWithModifications extends Client {
  modifications: Modification[]
}

export interface ClientFull extends Client {
  payments: Payment[]
  modifications: Modification[]
}
