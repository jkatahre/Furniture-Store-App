import { User } from '../utils/data/users';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface AuthResponse {
	user: Omit<User, 'password'>;
	token?: string;
}

async function parseErrorResponse(response: Response) {
	try {
		const contentType = response.headers.get('content-type') || '';
		if (contentType.includes('application/json')) {
			const body = await response.json();
			if (!body) return `Server error ${response.status}`;
			if (typeof body === 'string') return body;
			if (typeof body.message === 'string') return body.message;
			if (typeof body.error === 'string') return body.error;
			if (Array.isArray(body.errors)) {
				return body.errors
					.map((e: any) => (typeof e === 'string' ? e : e.msg || e.message || JSON.stringify(e)))
					.join('; ');
			}
			if (body.data && (typeof body.data.message === 'string' || typeof body.data.error === 'string')) {
				return body.data.message || body.data.error;
			}
			if (typeof body === 'object') {
				// Pull first meaningful string from object values
				for (const key of Object.keys(body)) {
					const val = (body as any)[key];
					if (typeof val === 'string') return val;
					if (Array.isArray(val)) {
						const strs = val.filter((v: any) => typeof v === 'string');
						if (strs.length) return strs.join('; ');
					}
				}
			}
			return `Server error ${response.status}`;
		}

		const text = await response.text();
		return text || `Server error ${response.status}`;
	} catch (e) {
		return `Server error ${response.status}`;
	}
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
	const res = await fetch(`${BASE_URL}/api/auth/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email, password }),
	});

	if (!res.ok) {
		const msg = await parseErrorResponse(res);
		throw new Error(msg);
	}

	const result = await res.json();
	// Accept multiple common response shapes: { token, user } | { data: { token, user } } | { accessToken, user }
	if (!result) throw new Error('Invalid server response for login');
	const token = (result.token || result.accessToken || result.data?.token || result.data?.accessToken) as string | undefined;
	const user = (result.user || result.data?.user || result.data?.profile || result.data?.me) as Omit<User, 'password'> | undefined;
	if (!user) throw new Error('Invalid server response for login');
	if (token) localStorage.setItem('token', token);
	localStorage.setItem('user', JSON.stringify(user));
	return { user, token };
};

export const register = async (name: string, email: string, password: string): Promise<AuthResponse> => {
	// POST new user to /api/auth as requested
	const res = await fetch(`${BASE_URL}/api/auth/register`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ name, email, password }),
	});

	if (!res.ok) {
		const msg = await parseErrorResponse(res);
		throw new Error(msg);
	}

	const result = await res.json();
	if (!result) throw new Error('Invalid server response for register');
	const token = (result.token || result.accessToken || result.data?.token || result.data?.accessToken) as string | undefined;
	const user = (result.user || result.data?.user || result.data?.profile || result.data?.me) as Omit<User, 'password'> | undefined;
	if (!user) throw new Error('Invalid server response for register');
	if (token) localStorage.setItem('token', token);
	localStorage.setItem('user', JSON.stringify(user));
	return { user, token };
};

export const logout = (): void => {
	localStorage.removeItem('user');
	localStorage.removeItem('token');
};

export const getCurrentUser = (): Omit<User, 'password'> | null => {
	const s = localStorage.getItem('user');
	return s ? (JSON.parse(s) as Omit<User, 'password'>) : null;
};

export const getToken = (): string | null => {
	return localStorage.getItem('token');
};

export const getProfile = async (): Promise<Omit<User, 'password'>> => {
	const token = getToken();
	if (!token) throw new Error('No auth token available');

	const res = await fetch(`${BASE_URL}/api/auth/profile`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
	});

	if (!res.ok) {
		const msg = await parseErrorResponse(res);
		throw new Error(msg);
	}

	const result = await res.json();
	if (!result || !result.data || !result.data.user) {
		throw new Error('Invalid server response for profile');
	}

	return result.data.user as Omit<User, 'password'>;
};

export default {
	login,
	register,
	logout,
	getCurrentUser,
	getToken,
	getProfile,
};

