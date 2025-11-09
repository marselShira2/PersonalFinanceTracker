export interface UserDetailsDTO {
  id: string;
  fullName: string;
  email: string;
  roles: string[];
  address: string;
  rolesString: string;
  twoFactorAuthenticationEnabled: boolean;
  phoneNumberConfirmed: boolean;
  accessFailedCount: number;
  firstName: string;
  lastName: string;
  nid_nipt: string;
  birthday: string;
  startdate: string;
  gender: string;
  status: string;
  phoneNumber: string;
  isInGroup: boolean;
  hasPdf: boolean;
  profileImageBase64: string;
  representative: string;
  createdDate: Date;
  subjectActivity: string;
  type: string;
  individSubject: string;
}

export interface usersListDTO {
  name?: string;
  profilePhoto?: string;
  type?: string;
}



export interface SelfDeclarationODTO {
  idskvselfdeclaration: number;
  code: string;
  description: string;
  createdDate: string | Date;
  idskvtemplate: number;
  selfdeclarations :boolean;
  name :string;
}


export interface SDDocumentsDTO {
  idSelfdeclaration?: number;
  code?: string;
  content?: string;
  contentString?: string;
  contentType?: string;
  file?: File;
  name?: string;
  createdOn?: Date;
  userName?: string;
  description?: number;
  idUser?: string;
  idTemplate: string

}


export interface OperatorsdDTO {
  id: number;
  fullname: string;
}
