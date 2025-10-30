import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhuma imagem foi enviada' },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não suportado. Use JPEG, PNG ou WebP.' },
        { status: 400 }
      );
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 5MB.' },
        { status: 400 }
      );
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const filename = `event-${timestamp}-${randomString}.${extension}`;

    // Verificar se há token do Vercel Blob configurado
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    
    if (blobToken && blobToken !== 'your-vercel-blob-token-here') {
      // Upload para Vercel Blob (produção)
      const blob = await put(filename, file, {
        access: 'public',
        multipart: true,
        addRandomSuffix: false,
      });

      return NextResponse.json({
        success: true,
        url: blob.url,
        filename: filename
      });
    } else {
      // Salvar localmente (desenvolvimento)
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Criar diretório uploads se não existir
      const uploadsDir = join(process.cwd(), 'public', 'uploads');
      try {
        await mkdir(uploadsDir, { recursive: true });
      } catch (error) {
        // Diretório já existe
      }

      // Salvar arquivo
      const filePath = join(uploadsDir, filename);
      await writeFile(filePath, new Uint8Array(buffer));

      // Retornar URL local
      const localUrl = `/uploads/${filename}`;
      
      return NextResponse.json({
        success: true,
        url: localUrl,
        filename: filename
      });
    }

  } catch (error) {
    console.error('Erro no upload:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
