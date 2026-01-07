export type Organization = {
  uuid: string
  name: string
  denomination?: string
  language?: string
  parentOrganization?: string
  website?: string
  email?: string
  phone?: string
  address?: {
    street?: string
    city?: string
    province?: string
    postalCode?: string
    country?: string
  }
  coordinates?: object
  logo?: string
  licenses: License[]
  template?: Template
}

export type Template = {
  uuid: string
  bundels: BundleTemplate[]
  documents: DocumentTemplate[]
}

export type BundleTemplate = {}
export type DocumentTemplate = {}

export type License = {
  uuid: string
  name: string
  code: string
}