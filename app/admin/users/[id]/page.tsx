'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2, Shield, Mail, Phone, MapPin, Calendar, User } from 'lucide-react';
import { adminApi, AdminUser } from '@/lib/api';

export default function UserViewPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadUser();
    }
  }, [userId]);

  const loadUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await adminApi.users.getById(userId);
      setUser(userData);
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      setError('Erro ao carregar dados do usuário. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/admin/users/${userId}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    
    try {
      await adminApi.users.delete(userId);
      router.push('/admin/users');
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      alert('Erro ao excluir usuário. Tente novamente.');
    }
  };

  const getStatusBadge = (user: AdminUser) => {
    const isActive = user.active || user.is_active;
    return (
      <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-green-600" : "bg-gray-600"}>
        {isActive ? 'Ativo' : 'Inativo'}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="container mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Carregando dados do usuário...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="container mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <User className="w-16 h-16 mx-auto mb-2" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Usuário não encontrado</h2>
              <p className="text-gray-400 mb-4">{error || 'O usuário solicitado não foi encontrado.'}</p>
              <Button onClick={() => router.push('/admin/users')} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Usuários
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => router.push('/admin/users')} 
              variant="ghost" 
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Detalhes do Usuário</h1>
              <p className="text-gray-400">Visualizar informações completas do usuário</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleEdit} variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button onClick={handleDelete} variant="destructive" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          </div>
        </div>

        {/* User Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informações Básicas */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Nome</label>
                <p className="text-white font-medium">{user.name || 'N/A'}</p>
              </div>
              
              <div>
                <label className="text-sm text-gray-400">Email</label>
                <p className="text-white font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {user.email || 'N/A'}
                </p>
              </div>
              
              <div>
                <label className="text-sm text-gray-400">CPF</label>
                <p className="text-white font-medium">{user.cpf || 'N/A'}</p>
              </div>
              
              <div>
                <label className="text-sm text-gray-400">Telefone</label>
                <p className="text-white font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {user.phone || 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Status e Permissões */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Status e Permissões
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Status</label>
                <div className="mt-1">
                  {getStatusBadge(user)}
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-400">Tipo de Usuário</label>
                <div className="mt-1 flex gap-2">
                  {user.is_superuser && (
                    <Badge variant="destructive">Super Admin</Badge>
                  )}
                  {user.is_staff && (
                    <Badge variant="secondary">Staff</Badge>
                  )}
                  {!user.is_staff && !user.is_superuser && (
                    <Badge variant="outline">Usuário</Badge>
                  )}
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-400">ID do Usuário</label>
                <p className="text-white font-medium">{user.id}</p>
              </div>
            </CardContent>
          </Card>

          {/* Localização */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Localização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Localização</label>
                <p className="text-white font-medium">{user.location || 'N/A'}</p>
              </div>
              
              <div>
                <label className="text-sm text-gray-400">País</label>
                <p className="text-white font-medium">{user.country || 'N/A'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Datas */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Informações de Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Data de Cadastro</label>
                <p className="text-white font-medium">{formatDate(user.created_at || user.date_joined)}</p>
              </div>
              
              {user.last_login && (
                <div>
                  <label className="text-sm text-gray-400">Último Login</label>
                  <p className="text-white font-medium">{formatDate(user.last_login)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}