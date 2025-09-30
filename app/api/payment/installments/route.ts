import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Obter parâmetros da query string
    const { searchParams } = new URL(request.url);
    const amount = searchParams.get('amount');
    
    if (!amount) {
      return NextResponse.json(
        { error: 'Parâmetro amount é obrigatório' },
        { status: 400 }
      );
    }

    // Obter token de autorização do header
    const authHeader = request.headers.get('Authorization');
    
    // Fazer requisição para o backend Django
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/api/payment/installments/?amount=${amount}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Erro ao obter opções de parcelamento' },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Erro ao obter opções de parcelamento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}