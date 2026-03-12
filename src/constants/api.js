const BASE_URL = "/api";

const API = {
    AUTH: {
        LOGIN: `${BASE_URL}/auth/login`,
        REGISTER: `${BASE_URL}/auth/register`,
        ME: `${BASE_URL}/auth/me`,
        METADATA: `${BASE_URL}/auth/metadata`,
        ADDRESS: `${BASE_URL}/auth/address`,
        ADDRESS_BY_ID: (id) => `${BASE_URL}/auth/address/${id}`,
        CHANGE_PASSWORD: `${BASE_URL}/auth/change-password`,
        FORGOT_PASSWORD: `${BASE_URL}/auth/forgot-password`,
        RESET_PASSWORD: `${BASE_URL}/auth/reset-password-token`,
    },
    PRODUCT: {
        GET_ALL: `${BASE_URL}/product`,
        GET_BY_ID: (id) => `${BASE_URL}/product/${id}`,
        SEARCH: `${BASE_URL}/product/search`,
        CATEGORIES: `${BASE_URL}/product/categories/all`,
    },
    CART: {
        GET: `${BASE_URL}/cart`,
        ADD: `${BASE_URL}/cart`,
        UPDATE: (id) => `${BASE_URL}/cart/${id}`,
        REMOVE: (id) => `${BASE_URL}/cart/${id}`,
    },
    ORDER: {
        GET_ALL: `${BASE_URL}/orders`,
        GET_BY_ID: (id) => `${BASE_URL}/orders/${id}`,
        CREATE: `${BASE_URL}/orders`,
        UPDATE: (id) => `${BASE_URL}/orders/${id}`,
        CANCEL: (id) => `${BASE_URL}/orders/${id}`,
    },
    BLOG: {
        POSTS: `${BASE_URL}/posts`,
        POST_BY_SLUG: (slug) => `${BASE_URL}/posts/${slug}`,
        COMMENTS: (postId) => `${BASE_URL}/posts/${postId}/comments`,
        ADD_COMMENT: `${BASE_URL}/posts/comments`,
    },
    ADMIN: {
        DASHBOARD: `${BASE_URL}/management/dashboard`,
        USERS: {
            LIST: `${BASE_URL}/management/users`,
            GET_BY_ID: (id) => `${BASE_URL}/management/users/${id}`,
            CHANGE_ROLE: (id) => `${BASE_URL}/management/users/${id}/role`,
        },
        ORDERS: {
            LIST: `${BASE_URL}/management/orders`,
            CHANGE_STATUS: (id) => `${BASE_URL}/management/orders/${id}/status`,
        },
        POSTS: {
            LIST: `${BASE_URL}/management/posts`,
            CREATE: `${BASE_URL}/management/posts`,
            UPDATE: (id) => `${BASE_URL}/management/posts/${id}`,
            DELETE: (id) => `${BASE_URL}/management/posts/${id}`,
        },
        PRODUCT: {
            CREATE: `${BASE_URL}/product`,
            UPDATE: (id) => `${BASE_URL}/product/${id}`,
            DELETE: (id) => `${BASE_URL}/product/${id}`,
            CREATE_CATEGORY: `${BASE_URL}/product/categories`,
        }
    }
}

export { API }
