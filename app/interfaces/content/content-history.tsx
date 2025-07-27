export interface ContentHistory {
    message: string;
    data:    ContentHistoryData;
}

export interface ContentHistoryData {
    page:      number;
    limit:     number;
    data:      ContentHistoryDataItem[];
    total:     number;
    totalPage: number;
}

export interface ContentHistoryDataItem {
    id:         number;
    query:      string;
    user_id:    number | null;
    created_at: Date;
    updated_at: Date;
    user:       User | null;
}

export interface User {
    id:             number;
    username:       string;
    email:          string;
    phone:          string;
    password:       string;
    latitude:       number;
    longitude:      number;
    otp:            null;
    email_verified: null;
    fcm_token:      null;
    balance:        number;
    role:           string;
    created_at:     Date;
    updated_at:     Date;
    deleted_at:     null;
}