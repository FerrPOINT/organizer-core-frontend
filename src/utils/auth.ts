import { OpenAPI } from '../client/core/OpenAPI'; // путь скорректирован
import type { ApiRequestOptions } from '../client/core/ApiRequestOptions';

export const getToken = async (): Promise<string | undefined> => {
    const token = OpenAPI.TOKEN;
    if (typeof token === 'function') {
        const dummyOptions: ApiRequestOptions = {
            method: 'GET',
            url: '/',
        };
        return token(dummyOptions);
    }
    return token;
};
