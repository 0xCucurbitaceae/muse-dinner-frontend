import { NextRequest, NextResponse } from 'next/server';
import { EXTERNAL_API_URL } from '@/config';

// Hardcoded API key - replace with your actual API key
const API_KEY = 'muse-dinners-api-key-123';

// Handle all HTTP methods
export async function GET(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  const params = await Promise.resolve(context.params);
  return handleRequest(request, params.path);
}

export async function POST(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  const params = await Promise.resolve(context.params);
  return handleRequest(request, params.path);
}

export async function PUT(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  const params = await Promise.resolve(context.params);
  return handleRequest(request, params.path);
}

export async function DELETE(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  const params = await Promise.resolve(context.params);
  return handleRequest(request, params.path);
}

/**
 * Generic handler for all HTTP methods that proxies requests to the actual API server
 * while adding the X-API-Key header
 */
async function handleRequest(request: NextRequest, pathSegments: string[]) {
  try {
    // Construct the path from the segments
    const apiPath = pathSegments.join('/');

    // Construct the URL to the actual API server
    const url = new URL(`/api/${apiPath}`, EXTERNAL_API_URL);

    // Forward query parameters
    request.nextUrl.searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });

    // Create a new request with the same method, body, and headers
    const fetchOptions: RequestInit = {
      method: request.method,
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': request.headers.get('content-type') || 'application/json',
      },
    };

    // Forward the body for non-GET requests
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const contentType = request.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        // Clone the request to read its body
        const requestClone = request.clone();
        const body = await requestClone.json();
        fetchOptions.body = JSON.stringify(body);
      } else {
        // For non-JSON content types, pass the body as-is
        const requestClone = request.clone();
        fetchOptions.body = await requestClone.text();
      }
    }

    // Forward the request to the actual API server
    const response = await fetch(url.toString(), fetchOptions);

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      // Create a new response with the same status, body, and headers
      const responseData = await response.json().catch(() => null);

      return NextResponse.json(responseData, {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    // For non-JSON responses, return the raw response
    const responseText = await response.text();

    return new NextResponse(responseText, {
      status: response.status,
      headers: {
          'Content-Type': contentType || 'text/plain',
        },
      });
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: (error as Error).message },
      { status: 500 }
    );
  }
}
