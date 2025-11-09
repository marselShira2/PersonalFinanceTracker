export interface IncidentResult {
  ListID: number,
  ID: string,
  DocumentNumber?: string,
  Date: string,
  Content: string,
  Json: string,
  User: string,
  ParentId: string,
  ParentNumber: number,
  incidentDate: any,
  id: string
}

export interface IncidentWSResult {
  ListID: number,
  ID: string,
  DocumentNumber?: string,
  Date: string,
  Status: string,
  IncidentCategory: string,
  InfrastructureType: string,
  Operator: string,
  date: any,

  
}
