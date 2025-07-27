export interface Content {
    status: string;
    data:   Data;
}

export interface Data {
    List:               List;
    NumOfDatabase:      number;
    NumOfResults:       number;
    free_requests_left: number;
    price:              number;
    "search time":      number;
}

export interface List {
    Apollo:                  Apollo;
    BukalaPak:               BukalaPak;
    DonJuji:                 DonJuji;
    Dukcapil:                Dukcapil;
    IndonesiaCarOwner:       IndonesiaCarOwner;
    "LinkedIn Scraped Data": LinkedInScrapedData;
    "Instagram Parsing":     InstagramParsing;
    MyPertamina:             MyPertamina;
    PeopleDataLabs:          PeopleDataLabs;
    Pizap:                   Pizap;
    RedDoorz:                RedDoorz;
    "Tk.indoscreen.com":     TkIndoscreenCOM;
    Tokopedia:               Tokopedia;
    Trello:                  Trello;
    "Twitter 200M":          Twitter200M;
    "Wahana Express":        WahanaExpress;
    Wattpad:                 Wattpad;
}

export interface InstagramParsing {
    Data:         InstagramData[];
    InfoLeak:     string;
    NumOfResults: number;
}

export interface InstagramData {
    Address:     string;
    Email:       string;
    FullName:    string;
    InstagramID: string;
    NickName:    string;
    Phone:       string;
}

export interface Apollo {
    Data:         ApolloDatum[];
    InfoLeak:     string;
    NumOfResults: number;
}

export interface ApolloDatum {
    Country:      string;
    Email:        string;
    FullName:     string;
    ID:           string;
    JobStartDate: Date;
    LinkedinURL:  string;
    Title:        string;
    Work:         string;
}

export interface BukalaPak {
    Data:         BukalaPakDatum[];
    InfoLeak:     string;
    NumOfResults: number;
}

export interface BukalaPakDatum {
    Email:              string;
    FullName:           string;
    NickName:           string;
    "Password(bcrypt)": string;
    Salt:               string;
}

export interface DonJuji {
    Data:         DonJujiDatum[];
    InfoLeak:     string;
    NumOfResults: number;
}

export interface DonJujiDatum {
    Data:     string;
    Email:    string;
    LeakBase: string;
}

export interface Dukcapil {
    Data:         DukcapilDatum[];
    InfoLeak:     string;
    NumOfResults: number;
}

export interface DukcapilDatum {
    Address:  string;
    BDay:     string;
    District: string;
    FullName: string;
    Gender:   Gender;
    Location: string;
    Passport: string;
    Phone?:   string;
    Region:   string;
}

export enum Gender {
    Female = "female",
    Male = "male",
}

export interface IndonesiaCarOwner {
    Data:         IndonesiaCarOwnerDatum[];
    InfoLeak:     string;
    NumOfResults: number;
}

export interface IndonesiaCarOwnerDatum {
    Address:      string;
    AutoBrand:    AutoBrand;
    AutoNumber:   string;
    Color:        string;
    EngineNumber: string;
    FullName:     string;
    Type:         string;
    VIN:          string;
    VehicleYear:  string;
    BPKB?:        string;
    NIK?:         string;
}

export enum AutoBrand {
    Honda = "HONDA",
    Nissan = "NISSAN",
    Yamaha = "YAMAHA",
}

export interface LinkedInScrapedData {
    Data:         LinkedInScrapedDataDatum[];
    InfoLeak:     string;
    NumOfResults: number;
}

export interface LinkedInScrapedDataDatum {
    CompanyName?:    string;
    Continent:       string;
    Country:         string;
    FullName:        string;
    Gender:          Gender;
    JobCompanyName?: string;
    JobTitle:        string;
    Title:           string;
    UserName:        string;
    CompanyRegion?:  string;
    CompanySize?:    string;
    Industry?:       string;
    LinkedinID?:     string;
    LoginCount?:     string;
    Location?:       string;
    Region?:         string;
    Email?:          string;
    JobStartDate?:   string;
    Skills?:         string;
    Summary?:        string;
    GeoLocation?:    string;
    Locality?:       string;
}

export interface MyPertamina {
    Data:         MyPertaminaDatum[];
    InfoLeak:     string;
    NumOfResults: number;
}

export interface MyPertaminaDatum {
    Email:       string;
    FullName:    string;
    Income:      string;
    Phone:       string;
    Phone2:      string;
    RegDate:     Date;
    LastActive?: Date;
}

export interface PeopleDataLabs {
    Data:         PeopleDataLabsDatum[];
    InfoLeak:     string;
    NumOfResults: number;
}

export interface PeopleDataLabsDatum {
    Address:  string;
    Email?:   string;
    FullName: string;
}

export interface Pizap {
    Data:         PizapDatum[];
    InfoLeak:     string;
    NumOfResults: number;
}

export interface PizapDatum {
    Email:           string;
    FacebookID:      string;
    FullName:        string;
    NickName:        string;
    Points:          string;
    "RegDate(UNIX)": string;
}

export interface RedDoorz {
    Data:         RedDoorzDatum[];
    InfoLeak:     string;
    NumOfResults: number;
}

export interface RedDoorzDatum {
    Email:              string;
    FullName:           string;
    "Password(bcrypt)": string;
    Provider:           string;
    RegDate:            Date;
}

export interface TkIndoscreenCOM {
    Data:         TkIndoscreenCOMDatum[];
    InfoLeak:     string;
    NumOfResults: number;
}

export interface TkIndoscreenCOMDatum {
    Email:     string;
    FullName?: string;
}

export interface Tokopedia {
    Data:         TokopediaDatum[];
    InfoLeak:     string;
    NumOfResults: number;
}

export interface TokopediaDatum {
    Email:                 string;
    FullName:              string;
    Gender:                string;
    LastActive?:           Date;
    "Password(SHA2-384)"?: string;
    Phone?:                string;
    RegDate:               Date;
    Salt?:                 string;
    BDay?:                 Date;
    Lang?:                 string;
}

export interface Trello {
    Data:         TrelloDatum[];
    InfoLeak:     string;
    NumOfResults: number;
}

export interface TrelloDatum {
    Avatar:   string;
    Email:    string;
    FullName: string;
    NickName: string;
    Url:      string;
}

export interface Twitter200M {
    Data:         Twitter200MDatum[];
    InfoLeak:     string;
    NumOfResults: number;
}

export interface Twitter200MDatum {
    Email:     string;
    Followers: string;
    FullName:  string;
    NickName:  string;
    RegDate:   string;
}

export interface WahanaExpress {
    Data:         WahanaExpressDatum[];
    InfoLeak:     string;
    NumOfResults: number;
}

export interface WahanaExpressDatum {
    Address:            string;
    Category:           string;
    City:               string;
    Company:            string;
    CompanyName:        string;
    Date:               Date;
    District:           string;
    FullName:           string;
    "LastActive(UNIX)": Date;
    Location:           string;
    NickName:           string;
    Phone:              string;
    Phone2:             string;
    Price:              string;
    Region:             string;
    ShippingAddress:    string;
    Size:               string;
    Status:             string;
    Type:               Type;
    Description?:       string;
}

export enum Type {
    MTATtkAktif = "mta_ttk_aktif",
    Missingterkirimsj = "missingterkirimsj",
    Updagingttk = "updagingttk",
}

export interface Wattpad {
    Data:         WattpadDatum[];
    InfoLeak:     string;
    NumOfResults: number;
}

export interface WattpadDatum {
    BDay?:               Date;
    Country:             string;
    Date:                Date;
    Email:               string;
    FullName:            string;
    Gender?:             string;
    NickName:            string;
    "Password(bcrypt)"?: string;
    FacebookID?:         string;
    IP?:                 string;
    Location?:           string;
}

function l(typ: any) {
    return { literal: typ };
}

function a(typ: any) {
    return { arrayItems: typ };
}

function u(...typs: any[]) {
    return { unionMembers: typs };
}

function o(props: any[], additional: any) {
    return { props, additional };
}

function m(additional: any) {
    return { props: [], additional };
}

function r(name: string) {
    return { ref: name };
}
