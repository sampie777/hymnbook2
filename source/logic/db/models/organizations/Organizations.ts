export class Organization {
  uuid: string
  name: string
  denomination?: string
  language?: string
  _parent?: Organization[]
  website?: string
  email?: string
  phone?: string
  address?: Address
  coordinates?: Coordinates
  logo?: string
  licenses: License[]

  constructor(
    uuid: string,
    name: string,
    licenses?: License[],
    denomination?: string,
    language?: string,
    _parent?: Organization,
    website?: string,
    email?: string,
    phone?: string,
    address?: Address,
    coordinates?: Coordinates,
    logo?: string,
  ) {
    this.uuid = uuid
    this.name = name
    this.licenses = licenses ?? []
    this.denomination = denomination
    this.language = language
    this._parent = _parent == undefined ? [] : [_parent]
    this.website = website
    this.email = email
    this.phone = phone
    this.address = address
    this.coordinates = coordinates
    this.logo = logo
  }

  static getParent(target?: Organization): Organization | undefined {
    if (target === undefined) {
      return undefined;
    }

    if (target._parent === undefined || target._parent.length === 0) {
      return undefined;
    }

    return target._parent[0];
  }
}

export class License {
  uuid: string
  name: string
  code?: string

  constructor(uuid: string, name: string, code: string) {
    this.uuid = uuid
    this.name = name
    this.code = code
  }
}

export class Address {
  street?: string
  city?: string
  province?: string
  postalCode?: string
  country?: string

  constructor(
    street?: string,
    city?: string,
    province?: string,
    postalCode?: string,
    country?: string,
  ) {
    this.street = street
    this.city = city
    this.province = province
    this.postalCode = postalCode
    this.country = country
  }
}

export class Coordinates {
  lat: string
  long: string

  constructor(lat: string, long: string) {
    this.lat = lat
    this.long = long
  }
}