import { License, Organization } from "../db/models/organizations/Organizations.ts";

export const mockLicenses = [
  { uuid: 'lic-1', name: 'CCLI', code: '24364643' },
  { uuid: 'lic-2', name: 'BybelMedia', code: '76454535' },
  { uuid: 'lic-3', name: 'Public Domain', code: '2345246' },
];

export namespace Licenses {
  export const isSongBundleAllowed = (
    bundle: { licenses?: string[] },
    licenses: License[],
  ): boolean => {
    console.log(bundle.licenses);
    if (!bundle.licenses || bundle.licenses.length == 0) return true;

    for (const licenseUuid of bundle.licenses) {
      if (licenses.some(license => license.uuid === licenseUuid)) return true;
    }

    return false;
  };

  export const collectAllLicenses = (organizations: Organization[]): License[] => {
    const licenses: License[] = [];
    organizations.forEach(organization => {
      organization.licenses.forEach(license => {
        if (licenses.some(it => it.uuid == license.uuid)) return;
        licenses.push(license);
      })
    })
    return licenses;
  }
}