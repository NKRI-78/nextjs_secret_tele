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

export const dummyCompanyDocs: CompanyDoc[] = [
  {
    id: 1,
    nama: "Acme Corp",
    url: "https://acme.com",
    prefix: "ACME",
  },
  {
    id: 2,
    nama: "Globex Inc",
    url: "https://globex.com",
    prefix: "GLOBEX",
  },
  {
    id: 3,
    nama: "Initech",
    url: "https://initech.com",
    prefix: "INIT",
  },
  {
    id: 4,
    nama: "Acme Corp",
    url: "https://acme.com",
    prefix: "ACME",
  },
  {
    id: 5,
    nama: "Acme Corp",
    url: "https://acme.com/nama.pdf",
    prefix: "ACME",
  },
  {
    id: 6,
    nama: "Acme Corp",
    url: "https://acme.com",
    prefix: "ACME",
  },
  {
    id: 7,
    nama: "Acme Corp",
    url: "https://acme.com",
    prefix: "ACME",
  },
  {
    id: 8,
    nama: "Acme Corp",
    url: "https://acme.com",
    prefix: "ACME",
  },
  {
    id: 6,
    nama: "Acme Corp",
    url: "https://acme.com",
    prefix: "ACME",
  },
  {
    id: 7,
    nama: "Acme Corp",
    url: "https://acme.com",
    prefix: "ACME",
  },
  {
    id: 8,
    nama: "Acme Corp",
    url: "https://acme.com",
    prefix: "ACME",
  },
  {
    id: 6,
    nama: "Acme Corp",
    url: "https://acme.com",
    prefix: "ACME",
  },
  {
    id: 7,
    nama: "Acme Corp",
    url: "https://acme.com",
    prefix: "ACME",
  },
  {
    id: 8,
    nama: "Acme Corp",
    url: "https://acme.com",
    prefix: "ACME",
  },
];

export const dummyCompanyDocsResponse: CompanyDocsResponse = {
  data: dummyCompanyDocs,
  error: null,
};
