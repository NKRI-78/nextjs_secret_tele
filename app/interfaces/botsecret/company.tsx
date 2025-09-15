export interface CompanyDoc {
  id: number;
  nama: string;
  url: string;
  prefix: string;
}

export interface CompanyDocsResponse {
  data: CompanyDoc[];
  error: string | null;
}
