export interface ApiResponse<T> {
    status: number;
    error: boolean;
    message: string;
    data: T;
}