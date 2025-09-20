'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, User, Shield, MapPin } from 'lucide-react';
import { adminApi, AdminUser } from '@/lib/api';

interface UserFormData {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  location: string;
  country: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
}

export default function UserEditPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  
  const [user, setUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    location: '',
    country: '',
    is_active: true,
    is_staff: false,
    is_superuser: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      
      // Preencher o formulário com os dados do usuário
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        cpf: userData.cpf || '',
        phone: userData.phone || '',
        location: userData.location || '',
        country: userData.country || '',
        is_active: userData.active || userData.is_active || false,
        is_staff: userData.is_staff || false,
        is_superuser: userData.is_superuser || false,
      });
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      setError('Erro ao carregar dados do usuário. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Validação em tempo real para o campo nome
    if (field === 'name' && typeof value === 'string' && value.trim()) {
      const names = value.trim().split(/\s+/);
      if (names.length < 2) {
        setError("Digite pelo menos nome e sobrenome");
      } else if (names.some(name => name.length < 2)) {
        setError("Cada nome deve ter pelo menos 2 caracteres");
      } else if (value.trim().length < 5) {
        setError("Nome deve ter pelo menos 5 caracteres");
      } else {
        setError(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação completa do nome seguindo o padrão do projeto
    if (!formData.name.trim()) {
      setError('Nome é obrigatório');
      return;
    }

    const names = formData.name.trim().split(/\s+/);
    if (names.length < 2) {
      setError('Digite pelo menos nome e sobrenome');
      return;
    }

    if (names.some(name => name.length < 2)) {
      setError('Cada nome deve ter pelo menos 2 caracteres');
      return;
    }

    if (formData.name.trim().length < 5) {
      setError('Nome deve ter pelo menos 5 caracteres');
      return;
    }

    if (!formData.email.trim()) {
      setError('Email é obrigatório');
      return;
    }

    // Validação de email seguindo o padrão do projeto
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      setError('Digite um email válido');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      await adminApi.users.update(userId, formData);
      
      alert('Usuário atualizado com sucesso!');
      router.push(`/admin/users/${userId}`);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      setError('Erro ao atualizar usuário. Verifique os dados e tente novamente.');
    } finally {
      setSaving(false);
    }
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

  if (error && !user) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="container mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <User className="w-16 h-16 mx-auto mb-2" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Usuário não encontrado</h2>
              <p className="text-gray-400 mb-4">{error}</p>
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
              onClick={() => router.push(`/admin/users/${userId}`)} 
              variant="ghost" 
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Editar Usuário</h1>
              <p className="text-gray-400">Modificar informações do usuário</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Básicas
              </CardTitle>
              <CardDescription className="text-gray-400">
                Dados pessoais do usuário
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-white">Nome *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email" className="text-white">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cpf" className="text-white">CPF</Label>
                  <Input
                    id="cpf"
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => handleInputChange('cpf', e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    placeholder="000.000.000-00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone" className="text-white">Telefone</Label>
                  <Input
                    id="phone"
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    placeholder="(00) 00000-0000"
                  />
                </div>
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
              <CardDescription className="text-gray-400">
                Informações de localização do usuário
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location" className="text-white">Localização</Label>
                  <Input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    placeholder="Cidade, Estado"
                  />
                </div>
                
                <div>
                  <Label htmlFor="country" className="text-white">País</Label>
                  <Input
                    id="country"
                    type="text"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    placeholder="Brasil"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permissões e Status */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Permissões e Status
              </CardTitle>
              <CardDescription className="text-gray-400">
                Configurações de acesso e status do usuário
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_active" className="text-white font-medium">Usuário Ativo</Label>
                  <p className="text-sm text-gray-400">Permite que o usuário faça login no sistema</p>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_staff" className="text-white font-medium">Acesso Staff</Label>
                  <p className="text-sm text-gray-400">Permite acesso ao painel administrativo</p>
                </div>
                <Switch
                  id="is_staff"
                  checked={formData.is_staff}
                  onCheckedChange={(checked) => handleInputChange('is_staff', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_superuser" className="text-white font-medium">Super Usuário</Label>
                  <p className="text-sm text-gray-400">Acesso total a todas as funcionalidades</p>
                </div>
                <Switch
                  id="is_superuser"
                  checked={formData.is_superuser}
                  onCheckedChange={(checked) => handleInputChange('is_superuser', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push(`/admin/users/${userId}`)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}