import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const login = async (username, password) => {
    return await axios.post(`${API_URL}/sessions`, {
        user_id: username,
        password: password,
    });
};

// Diğer API işlevleri de burada tanımlanabilir
