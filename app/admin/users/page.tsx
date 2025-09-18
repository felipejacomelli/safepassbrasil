'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal, 
  UserPlus,
  RefreshCw,
  AlertCircle,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { adminApi, AdminUser } from '@/lib/api';

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadUsers = async (page: number = 1, search: string = '', status: string = 'all') => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = { page };
      if (search) params.search = search;
      if (status !== 'all') {
        if (status === 'active') params.is_active = true;
        else if (status === 'inactive') params.is_active = false;
      }
      
      const response = await adminApi.users.getAll(params);
      setUsers(response.users || []);
      setTotalPages(Math.ceil((response.count || 0) / 10));
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setError('Erro ao carregar usuários. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(currentPage, searchTerm, statusFilter);
  }, [currentPage, searchTerm, statusFilter]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    
    try {
      await adminApi.users.delete(userId);
      await loadUsers(currentPage, searchTerm, statusFilter);
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      alert('Erro ao excluir usuário. Tente novamente.');
    }
  };

  const handleViewUser = (userId: number) => {
    router.push(`/admin/users/${userId}`);
  };

  const handleEditUser = (userId: number) => {
    router.push(`/admin/users/${userId}/edit`);
  };

  const getStatusBadge = (user: AdminUser) => {
    // Usar 'active' do backend que corresponde ao is_active
    const isActive = user.active !== undefined ? user.active : user.is_active;
    if (isActive) {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Ativo</Badge>;
    } else {
      return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Inativo</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Invalid Date';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Carregando usuários...</span>
        </div>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="text-red-600">{error}</p>
        <Button onClick={() => loadUsers()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie usuários registrados na plataforma
          </p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Filtros e Busca */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Filtros</CardTitle>
          <CardDescription className="text-gray-400">
            Use os filtros abaixo para encontrar usuários específicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email ou CPF..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8 bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="all" className="text-white hover:bg-zinc-700">Todos os Status</SelectItem>
                  <SelectItem value="active" className="text-white hover:bg-zinc-700">Ativo</SelectItem>
                  <SelectItem value="inactive" className="text-white hover:bg-zinc-700">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={() => loadUsers(currentPage, searchTerm, statusFilter)} 
              variant="outline"
              disabled={loading}
              className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Usuários */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Usuários ({users.length})</CardTitle>
          <CardDescription className="text-gray-400">
            Lista de todos os usuários registrados na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-zinc-700">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-700 hover:bg-zinc-800/50">
                  <TableHead className="text-gray-300">Nome</TableHead>
                  <TableHead className="text-gray-300">Email</TableHead>
                  <TableHead className="text-gray-300">CPF</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Data de Cadastro</TableHead>
                  <TableHead className="text-right text-gray-300">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow className="border-zinc-700 hover:bg-zinc-800/50">
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <Users className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {searchTerm || statusFilter !== 'all' 
                            ? 'Nenhum usuário encontrado com os filtros aplicados'
                            : 'Nenhum usuário cadastrado'
                          }
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} className="border-zinc-700 hover:bg-zinc-800/50">
                      <TableCell className="font-medium text-white">{user.name}</TableCell>
                      <TableCell className="text-gray-300">{user.email}</TableCell>
                      <TableCell className="text-gray-300">{user.cpf || 'N/A'}</TableCell>
                      <TableCell>{getStatusBadge(user)}</TableCell>
                      <TableCell className="text-gray-300">{formatDate(user.created_at || user.date_joined)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-zinc-700">
                              <span className="sr-only">Abrir menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700">
                            <DropdownMenuLabel className="text-white">Ações</DropdownMenuLabel>
                            <DropdownMenuItem 
                              className="text-gray-300 hover:bg-zinc-700 hover:text-white"
                              onClick={() => handleViewUser(Number(user.id))}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-gray-300 hover:bg-zinc-700 hover:text-white"
                              onClick={() => handleEditUser(Number(user.id))}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-zinc-700" />
                            <DropdownMenuItem 
                               className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
                               onClick={() => handleDeleteUser(Number(user.id))}
                             >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-gray-400">
                Página {currentPage} de {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1 || loading}
                  className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || loading}
                  className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}