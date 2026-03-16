import axios from 'axios';

const GRAPHQL_URL = 'http://localhost:3000/graphql';

export const pacientesApi = axios.create({
    baseURL: GRAPHQL_URL,
    headers: { 'Content-Type': 'application/json' }
});
