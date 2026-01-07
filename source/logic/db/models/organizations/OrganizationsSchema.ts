import Realm from "realm";

export const LicenseSchema: Realm.ObjectSchema = {
  name: "License",
  properties: {
    uuid: { type: "string", indexed: true },
    name: "string",
    code: "string",
  },
  primaryKey: "uuid"
};

export const AddressSchema: Realm.ObjectSchema = {
  name: 'Address',
  embedded: true,
  properties: {
    street: 'string?',
    city: 'string?',
    province: 'string?',
    postalCode: 'string?',
    country: 'string?',
  },
};

export const CoordinatesSchema: Realm.ObjectSchema = {
  name: 'Coordinates',
  embedded: true,
  properties: {
    lat: 'string',
    long: 'string',
  },
};

export const OrganizationSchema: Realm.ObjectSchema = {
  name: "Organization",
  properties: {
    uuid: { type: "string", indexed: true },
    name: "string",
    denomination: "string?",
    language: "string?",
    website: "string?",
    email: "string?",
    phone: "string?",
    address: AddressSchema.name + "?",
    coordinates: CoordinatesSchema.name + "?",
    logo: "string?",
    licenses: LicenseSchema.name + "[]",
    _children: "Organization[]",
    _parent: {
      type: "linkingObjects",
      objectType: "Organization",    // OrganizationSchema.name
      property: "_children"
    },
  },
  primaryKey: "uuid"
};

