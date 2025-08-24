import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { getAuth } from "@/lib/auth"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface RequestOptions {
  method: string,
  url: string,
  body: Record<string, any>,
}

interface HeadersAuth {
  'Content-Type': string;
  'Authorization'?: string;
}

export async function request({
  method,
  url,
  body,
} : RequestOptions): Promise<any> {
  let requestUrl = `http://127.0.0.1:8000/${url}`;
  if (method === 'GET') {
    const params = new URLSearchParams();

    for (const key in body) {
      const value = body[key];
      if (typeof value === 'object') {
        params.append(key, JSON.stringify(value));
      } else {
        params.append(key, String(value));
      }
    }

    requestUrl = `${requestUrl}?${params.toString()}`;
  }

  let headers: HeadersAuth = {
    'Content-Type': 'application/json',
  }
  const isLogged = getAuth()

  if (isLogged) {
    headers['Authorization'] = `Token ${isLogged}`
  }

  const response = await fetch(requestUrl,{
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: method === 'POST' ? JSON.stringify(body) : undefined,
  })
    .then(async res => {
      if (!res.ok) return {success: false, data: null};
      const data = await res.json();
      return {
        success: true,
        data: data,
      };
    })
    .catch(error => {
      console.error('Fetch error:', error);
    });

  return response
}