/**
 * Demo scans taken from the Corporate Profile PDF. They stand in until the media library
 * stores a file on each document. Licences are keyed by the stable document slug.
 * ISO certificates also accept the short standard code, which is not a translated title.
 */
export type CredentialScan = {
  readonly src: string;
  readonly width: number;
  readonly height: number;
};

function scan(src: string, width: number, height: number): CredentialScan {
  return { src, width, height };
}

const iso45001 = scan("/images/credentials/iso-45001.jpg", 411, 540);
const iso14001 = scan("/images/credentials/iso-14001.jpg", 411, 540);
const iso27001 = scan("/images/credentials/iso-27001.jpg", 410, 540);
const iso9001 = scan("/images/credentials/iso-9001.jpg", 411, 540);
const iso21500 = scan("/images/credentials/iso-21500.jpg", 348, 520);
const iso41001 = scan("/images/credentials/iso-41001.jpg", 367, 514);
const iso26000 = scan("/images/credentials/iso-26000.jpg", 331, 496);
const iso31000 = scan("/images/credentials/iso-31000.jpg", 326, 495);

const classification = scan("/images/credentials/classification.jpg", 610, 431);
const commercialRegistration = scan("/images/credentials/commercial-registration.jpg", 636, 482);
const professionalLicence = scan("/images/credentials/professional-practice.jpg", 637, 496);
const commercialActivity = scan("/images/credentials/commercial-activity.jpg", 449, 661);
const civilDefence = scan("/images/credentials/civil-defense.jpg", 454, 662);

const SCANS: Record<string, CredentialScan> = {
  "iso-45001": iso45001,
  "ISO 45001": iso45001,
  "iso-14001": iso14001,
  "ISO 14001": iso14001,
  "iso-27001": iso27001,
  "ISO/IEC 27001": iso27001,
  "iso-9001": iso9001,
  "ISO 9001": iso9001,
  "iso-21500": iso21500,
  "ISO 21500": iso21500,
  "iso-41001": iso41001,
  "ISO 41001": iso41001,
  "iso-26000": iso26000,
  "ISO 26000": iso26000,
  "iso-31000": iso31000,
  "ISO 31000": iso31000,
  "classification-certificate": classification,
  "commercial-registration": commercialRegistration,
  "professional-licence": professionalLicence,
  "commercial-activity-licence": commercialActivity,
  "civil-defence-licence": civilDefence,
};

export function certificateScan(code: string): CredentialScan | undefined {
  return SCANS[code];
}

export function licenseScan(slug: string): CredentialScan | undefined {
  return SCANS[slug];
}
