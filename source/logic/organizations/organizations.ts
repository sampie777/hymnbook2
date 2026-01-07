import { Organization } from "./models.ts";
import { mockLicenses } from "./licenses.ts";

export const mockOrganizations: Organization[] = [
  {
    uuid: 'org-1',
    name: 'First Baptist Church of Willow Creek',
    denomination: 'Baptist',
    address: {
      street: '1024 Elm St',
      city: 'Willow Creek',
      province: 'CA',
      postalCode: '90210',
      country: 'USA',
    },
    phone: '+1-310-555-0142',
    website: 'https://www.willowcreekbaptist.org',
    licenses: [{ ...mockLicenses[0] }],
  },
  {
    uuid: 'org-2',
    name: 'Grace Methodist Church',
    denomination: 'Methodist',
    address: {
      street: '58 Maple Avenue',
      city: 'Riverside',
      province: 'TX',
      postalCode: '75001',
      country: 'USA',
    },
    phone: '+1-214-555-0198',
    website: 'https://www.gracemethodist.org',
    licenses: [{ ...mockLicenses[0] }, { ...mockLicenses[2] }],
  },
  {
    uuid: 'org-3',
    name: "St. Mark's Lutheran Church",
    denomination: 'Lutheran',
    address: {
      street: '7 Church Lane',
      city: 'Ashford',
      province: 'MA',
      postalCode: '02108',
      country: 'USA',
    },
    phone: '+1-617-555-0123',
    website: 'https://www.stmarkslutheran.org',
    licenses: [],
  },
  {
    uuid: 'org-4',
    name: 'New Hope Pentecostal Church',
    denomination: 'Pentecostal',
    address: {
      street: '300 Cedar Blvd',
      city: 'Oak Valley',
      province: 'FL',
      postalCode: '33101',
      country: 'USA',
    },
    phone: '+1-305-555-0177',
    website: 'https://www.newhopepentecostal.org',
    licenses: [{ ...mockLicenses[1] }],
  },
  {
    uuid: 'org-5',
    name: 'Trinity Episcopal Church',
    licenses: [{ ...mockLicenses[0] }],
  },
];

export namespace Organizations {
  export const fetchAll = async (): Promise<Organization[]> => {
    return mockOrganizations
  };

  export const join = async (organization: Organization) => {
    // Do request to backend to join organization
  }
}
