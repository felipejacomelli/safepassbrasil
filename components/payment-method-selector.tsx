"use client"

import type React from "react"

import { useState } from "react"
import { CreditCard, Landmark, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface PaymentMethodSelectorProps {
  onSelect?: (method: string, details: any) => void
  buttonText?: string
  buttonVariant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link"
  buttonClassName?: string
}

export function PaymentMethodSelector({
  onSelect,
  buttonText = "Adicionar método de pagamento",
  buttonVariant = "outline",
  buttonClassName = "",
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>("pix")
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    pixKey: "",
    bankName: "",
    accountType: "checking",
    agency: "",
    account: "",
    holderName: "",
    holderCpf: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = () => {
    if (onSelect) {
      onSelect(selectedMethod, formData)
    }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant as any} className={buttonClassName}>
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle>Método de Pagamento</DialogTitle>
          <DialogDescription className="text-gray-400">Escolha como deseja receber seus pagamentos.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 py-4">
          <div
            className={`flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer border ${
              selectedMethod === "pix" ? "border-primary bg-blue-900 bg-opacity-20" : "border-zinc-700 bg-zinc-800"
            }`}
            onClick={() => setSelectedMethod("pix")}
          >
            <QrCode className={`w-8 h-8 mb-2 ${selectedMethod === "pix" ? "text-primary" : "text-gray-400"}`} />
            <span className={`text-sm ${selectedMethod === "pix" ? "text-primary" : "text-gray-300"}`}>PIX</span>
          </div>

          <div
            className={`flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer border ${
              selectedMethod === "bank" ? "border-primary bg-blue-900 bg-opacity-20" : "border-zinc-700 bg-zinc-800"
            }`}
            onClick={() => setSelectedMethod("bank")}
          >
            <Landmark className={`w-8 h-8 mb-2 ${selectedMethod === "bank" ? "text-primary" : "text-gray-400"}`} />
            <span className={`text-sm ${selectedMethod === "bank" ? "text-primary" : "text-gray-300"}`}>
              Conta Bancária
            </span>
          </div>

          <div
            className={`flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer border ${
              selectedMethod === "card" ? "border-primary bg-blue-900 bg-opacity-20" : "border-zinc-700 bg-zinc-800"
            }`}
            onClick={() => setSelectedMethod("card")}
          >
            <CreditCard className={`w-8 h-8 mb-2 ${selectedMethod === "card" ? "text-primary" : "text-gray-400"}`} />
            <span className={`text-sm ${selectedMethod === "card" ? "text-primary" : "text-gray-300"}`}>
              Cartão de Crédito
            </span>
          </div>
        </div>

        {selectedMethod === "pix" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pixKey">Chave PIX</Label>
              <Input
                id="pixKey"
                name="pixKey"
                value={formData.pixKey}
                onChange={handleInputChange}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="CPF, Email, Telefone ou Chave Aleatória"
              />
            </div>
          </div>
        )}

        {selectedMethod === "bank" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Banco</Label>
              <Input
                id="bankName"
                name="bankName"
                value={formData.bankName}
                onChange={handleInputChange}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="Nome do Banco"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountType">Tipo de Conta</Label>
              <select
                id="accountType"
                name="accountType"
                value={formData.accountType}
                onChange={handleInputChange}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md p-2"
              >
                <option value="checking">Conta Corrente</option>
                <option value="savings">Conta Poupança</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="agency">Agência</Label>
                <Input
                  id="agency"
                  name="agency"
                  value={formData.agency}
                  onChange={handleInputChange}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account">Conta</Label>
                <Input
                  id="account"
                  name="account"
                  value={formData.account}
                  onChange={handleInputChange}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="00000-0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="holderName">Nome do Titular</Label>
              <Input
                id="holderName"
                name="holderName"
                value={formData.holderName}
                onChange={handleInputChange}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="Nome completo do titular"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="holderCpf">CPF do Titular</Label>
              <Input
                id="holderCpf"
                name="holderCpf"
                value={formData.holderCpf}
                onChange={handleInputChange}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="000.000.000-00"
              />
            </div>
          </div>
        )}

        {selectedMethod === "card" && (
          <div className="p-4 bg-zinc-800 rounded-lg text-center">
            <p className="text-gray-300">
              Para receber via cartão de crédito, você será redirecionado para nossa plataforma de pagamentos parceira.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} className="border-zinc-700 text-white">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="bg-primary hover:bg-blue-600 text-black">
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
