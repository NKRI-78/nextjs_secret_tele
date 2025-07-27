export interface LoginModel {
    message: string;
    data:    Data;
}

export interface Data {
    id:             number;
    username:       string;
    email:          string;
    phone:          string;
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
    profile:        Profile;
    authorized:     boolean;
    token:          string;
    refreshToken:   string;
}

export interface Profile {
    id:             number;
    fullname:       string;
    avatar_link:    null;
    detail_address: null;
    gender:         string;
    user_id:        number;
    created_at:     Date;
    updated_at:     Date;
}
