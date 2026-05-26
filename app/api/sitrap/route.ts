import { NextRequest, NextResponse } from 'next/server';

const SITRAP_API_URL =
  process.env.SITRAP_API_URL ||
  'https://script.google.com/macros/s/AKfycbyctd9F81-qKYeLOBjvcFYjs45YZoUJfSjZyT3233MRqI7js5qeL6swg7HCuSQ_VlPh/exec';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const view = searchParams.get('view') || 'kpis';
  const id = searchParams.get('id');

  const url = new URL(SITRAP_API_URL);
  url.searchParams.set('view', view);
  if (id) url.searchParams.set('id', id);

  try {
    const response = await fetch(url.toString(), { cache: 'no-store' });
    const text = await response.text();
    const data = JSON.parse(text);

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: 'No se pudo conectar con la API SITRAP', detail: String(error) },
      { status: 500 }
    );
  }
}
