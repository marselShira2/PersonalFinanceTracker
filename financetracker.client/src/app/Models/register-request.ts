export interface PersonDTO {
  personID: string | null;
  FirstName?: string | null;
  Address?: string | null;
  LastName?: string | null;
  NID_NIPT?: string | null;
  PhoneNumber?: string | null;
  Email?: string | null;
  Birthdate: string | null;
  StartDate: string | null;
  gender?: string | null;
  status?: string | null;
  type?: string | null;
  perfaqesuesi?: string;
  aktiviteti_Subjektit?: string;
  sectorId?: string;
}
export interface PersonDTOResult {
  isSuccess: boolean;
  message: string;
  personID: string;
  userId?: string;

}
export interface PersonDTOEmail {
  EmailId: string | null;
  Email: string | null;
  PrimaryString:  string | null;
  StatusString: string | null;
}

export interface newEmailDTO {
  personID: string | null;
  Email: string | null;
  PrimaryState: string | null;
  Status: string | null;
}

export interface EmailDTOResult {
  isSuccess: boolean;
  message: string;
}
export interface editEmail {
  EmailId: string | null;
  personID: string | null;
  Email: string | null;
  PrimaryState: string | null;
  Status: string | null;
}
export interface newPassword {
  personID: string | null;
  actualPassword: string | null;
  newPassword: string | null;
}
export interface PasswordDTOResult {
  isSuccess: boolean;
  message: string;
}

export interface PersonDTOEdit {
  personID: string | null;
  firstName?: string | null;
  address?: string | null;
  lastName?: string | null;
  niD_NIPT?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  birthdate: string | null;
  startdate: string | null;
  gender?: string | null;
  status?: string | null;
  type?: string | null;
  twoFactorAuthenticationEnabled: number | false;
  password: string | null;
  perfaqesuesi?: string;
  aktiviteti_Subjektit?: string;
  sectorId?: string;
}
export interface PersonDTOPhoneNumbers {
  UserPhoneNumberId: string | null;
  PhoneNumber: string | null;
  PrimaryString: string | null;
  StatusString: string | null;
}
export interface newPhoneNumberDTO {
  personID: string | null;
  phoneNumber?: string | null;
  PrimaryState: string | null;
  Status: string | null;
}
export interface editPhoneNumber {
  UserPhoneNumberId: string | null;
  personID: string | null;
  PhoneNumber?: string | null;
  PrimaryState: string | null;
  Status: string | null;
}

export interface SubjectOperatorDTO {
  emri: string;
  nipt: string;
  adresa: string;
  email: string;
  perfaqesuesi: string;
  date: string;
  phoneNumber: string;
  message: string;
  aktiviteti_Subjektit?: string;
}

export interface OperatorDTO {
  emri: string;
  mbiemri: string;
  nipt: string;
  adresa: string;
  perfaqesuesi: string;
  datelindja: string;
  gjinia: string;
  message: string;
}

export interface SectorDropdown {
  sectorId?: number;
  sectorName?: string;
  checked?: boolean;
}




export interface OrganigramDTO {
  organigramID?: number;
}


export interface AddOrganizationalStructureUserDTO {
  userId: string | null;
  organizationalStructureIds?: number[];
}

export interface eventsDTO {
  operatorId?: string;
  operatorName?: string;
  eventStartDate?: Date | null;
  eventEndDate?: Date | null;
}

export interface operatorsDropdown {
  operatorId: string;
  operatorName: string;
}
export interface eventsHistoryDTO {
  message?: string;
  englishMessage?: string;
  timestamp?: Date;
  operatorName?: string;
}
