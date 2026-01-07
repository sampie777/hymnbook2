import { mockLicenses } from "./licenses.ts";
import { Organization } from "../db/models/organizations/Organizations.ts";
import Db from "../db/db.tsx";
import { OrganizationSchema } from "../db/models/organizations/OrganizationsSchema.ts";
import { rollbar } from "../rollbar.ts";
import { sanitizeErrorForRollbar } from "../utils/utils.ts";

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
    logo: "https://rehobothkerkwoerden.nl/static/resources/images/logo-wit-compact-50.png",
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
    logo: 'https://logo.com/image-cdn/images/kts928pd/production/ac1215da2e15775a6fd8888e1055c001ec13845f-1082x1084.webp?w=1080&q=70&fm=webp',
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
    logo: 'https://www.vgk.org.za/sites/default/files/pictures/logo-af.png',
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
    // todo...


    // Join locally
    try {
      Db.settings.realm().write(() => {
        Db.settings.realm().create(OrganizationSchema.name, organization);
      })
    }catch (error) {
      rollbar.error(`Failed to store organization`, {
        ...sanitizeErrorForRollbar(error),
        organization: { ...organization, parentOrganization: undefined } as Organization,
      });
      throw Error(`Failed to store organization: ${error}`);
    }
  }
}
