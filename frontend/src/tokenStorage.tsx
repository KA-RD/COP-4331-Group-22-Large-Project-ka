export function storeToken(token: string): void {
    try {
        localStorage.setItem('token_data', token);
        console.log('Token stored successfully');
    } catch(e) {
        console.log('Error storing token:', e);
    }
}

export function retrieveToken(): string | null {
    try {
        const token = localStorage.getItem('token_data');
        console.log('Token retrieved:', token ? 'Yes' : 'No');
        return token;
    } catch(e) {
        console.log('Error retrieving token:', e);
        return null;
    }
}