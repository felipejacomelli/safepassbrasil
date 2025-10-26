"use client"

import Link from "next/link"
import { ArrowLeft, MessageCircle, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { SearchInput } from "@/components/ui/search-input"
import { SearchResults } from "@/components/ui/search-results"
import { useFAQSearch } from "@/hooks/useFAQSearch"
import Header from "@/components/Header"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"

interface FAQItem {
  question: string
  answer: string
}

interface FAQSection {
  title: string
  icon: React.ReactNode
  items: FAQItem[]
}

export default function FAQPage() {
  const faqSections: FAQSection[] = [
    {
      title: "Revenda de Ingressos",
      icon: <MessageCircle className="w-6 h-6" />,
      items: [
        {
          question: "Como posso revender meu ingresso na Safe Pass?",
          answer: "Para revender seu ingresso, acesse sua conta, vá em 'Meus Ingressos', selecione o ingresso que deseja vender e clique em 'Anunciar'. Você precisará definir o preço e aguardar a aprovação da nossa equipe."
        },
        {
          question: "Existe alguma taxa para vender ingressos?",
          answer: "Sim, cobramos uma taxa de serviço de 8% sobre o valor da venda para cobrir os custos de processamento, segurança e suporte. Esta taxa é descontada automaticamente quando a venda é concluída."
        },
        {
          question: "Quanto tempo leva para meu ingresso ser aprovado para venda?",
          answer: "Nossa equipe analisa todos os ingressos em até 24 horas. Verificamos a autenticidade e as informações do evento para garantir a segurança de todos os usuários."
        },
        {
          question: "Posso cancelar a venda do meu ingresso?",
          answer: "Sim, você pode cancelar a venda a qualquer momento antes que alguém compre seu ingresso. Basta acessar 'Meus Anúncios' e clicar em 'Cancelar Venda'."
        },
        {
          question: "Como recebo o pagamento pela venda?",
          answer: "O pagamento é processado automaticamente após a confirmação da compra. O valor é depositado em sua conta Safe Pass e você pode solicitar o saque para sua conta bancária."
        },
        {
          question: "Posso vender ingresso por um preço maior que o original?",
          answer: "Permitimos a venda por até 20% acima do valor original do ingresso, respeitando as leis de revenda e garantindo preços justos para os compradores."
        }
      ]
    },
    {
      title: "Taxas e Pagamentos",
      icon: <Phone className="w-6 h-6" />,
      items: [
        {
          question: "Quais são as taxas cobradas pela Safe Pass?",
          answer: "Cobramos 5% de taxa de serviço para compradores e 8% para vendedores. Estas taxas cobrem processamento de pagamento, segurança, suporte e garantias da plataforma."
        },
        {
          question: "Quais formas de pagamento são aceitas?",
          answer: "Aceitamos cartões de crédito (Visa, Mastercard, Elo), cartões de débito e PIX. Todos os pagamentos são processados com segurança."
        },
        {
          question: "Posso parcelar minha compra?",
          answer: "Sim, oferecemos parcelamento em até 12x sem juros no cartão de crédito para compras acima de R$ 100,00."
        },
        {
          question: "Como funciona o sistema de garantia?",
          answer: "Oferecemos 100% de garantia em todas as transações. Se houver qualquer problema com seu ingresso, você recebe o reembolso integral ou um ingresso equivalente."
        },
        {
          question: "Quando o vendedor recebe o pagamento?",
          answer: "O vendedor recebe o pagamento 24 horas após a confirmação da compra, garantindo tempo para verificações de segurança."
        },
        {
          question: "Posso solicitar reembolso?",
          answer: "Sim, oferecemos reembolso integral em casos de cancelamento do evento, ingresso inválido ou problemas técnicos. O prazo para reembolso é de até 5 dias úteis."
        }
      ]
    },
    {
      title: "Problemas Técnicos e Suporte",
      icon: <Mail className="w-6 h-6" />,
      items: [
        {
          question: "Não consigo acessar minha conta, o que fazer?",
          answer: "Tente redefinir sua senha usando a opção 'Esqueci minha senha' na tela de login. Se o problema persistir, entre em contato com nosso suporte."
        },
        {
          question: "Meu ingresso não aparece na minha conta, o que fazer?",
          answer: "Verifique se você está logado com o email correto usado na compra. Se o problema persistir, envie o comprovante de pagamento para nosso suporte."
        },
        {
          question: "Como posso alterar meus dados pessoais?",
          answer: "Acesse 'Minha Conta' > 'Dados Pessoais' e faça as alterações necessárias. Algumas alterações podem precisar de verificação adicional."
        },
        {
          question: "O site está lento ou não carrega, o que fazer?",
          answer: "Tente limpar o cache do navegador, usar outro navegador ou verificar sua conexão com a internet. Se o problema persistir, pode ser uma manutenção temporária."
        },
        {
          question: "Como posso excluir minha conta?",
          answer: "Entre em contato com nosso suporte solicitando a exclusão da conta. Por questões de segurança, este processo deve ser feito via suporte."
        },
        {
          question: "Recebi um email suspeito da Safe Pass, é verdadeiro?",
          answer: "Sempre verifique se o email veio de @safepass.com.br. Em caso de dúvida, entre em contato conosco diretamente. Nunca clique em links suspeitos."
        }
      ]
    }
  ]

  // Hook de busca
  const {
    query,
    isLoading,
    filteredSections,
    hasResults,
    hasQuery,
    handleSearch,
    handleClear
  } = useFAQSearch({ faqSections })

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumbs 
              items={[
                { label: "Suporte", current: true }
              ]}
            />
          </div>

          {/* Header */}
          <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-4 transition-colors duration-200">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao início
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Perguntas Frequentes
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Encontre respostas para as dúvidas mais comuns sobre nossa plataforma
          </p>
          
          {/* Campo de Busca */}
          <div className="max-w-2xl mx-auto">
            <SearchInput
              placeholder="Buscar perguntas frequentes..."
              value={query}
              onChange={handleSearch}
              onClear={handleClear}
              isLoading={isLoading}
              className="w-full"
            />
          </div>
        </div>

        {/* Resultados da Busca ou FAQ Sections */}
        {hasQuery ? (
          <SearchResults
            query={query}
            hasQuery={hasQuery}
            isLoading={isLoading}
            hasResults={hasResults}
            onClear={handleClear}
          >
            <div className="space-y-8">
              {filteredSections.map((section, sectionIndex) => (
                <Card key={sectionIndex} className="shadow-lg dark:shadow-xl dark:shadow-black/20">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      {section.icon}
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <Accordion type="multiple" className="w-full">
                      {section.items.map((item, itemIndex) => (
                        <AccordionItem 
                          key={`${sectionIndex}-${itemIndex}`} 
                          value={`${sectionIndex}-${itemIndex}`}
                          className="border-gray-200 dark:border-gray-700"
                        >
                          <AccordionTrigger className="text-left font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {item.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>
          </SearchResults>
        ) : (
          <div className="space-y-8">
            {faqSections.map((section, sectionIndex) => (
            <Card key={sectionIndex} className="shadow-lg dark:shadow-xl dark:shadow-black/20 dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <CardTitle className="flex items-center gap-3 text-xl">
                  {section.icon}
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 dark:bg-gray-800">
                <Accordion type="multiple" className="w-full">
                  {section.items.map((item, itemIndex) => (
                    <AccordionItem 
                      key={`${sectionIndex}-${itemIndex}`} 
                      value={`${sectionIndex}-${itemIndex}`}
                      className="border-gray-200 dark:border-gray-700"
                    >
                      <AccordionTrigger className="text-left font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
        )}

        {/* Contact Support Section */}
        <Card className="mt-12 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl text-green-800 dark:text-green-300 flex items-center gap-3">
              <MessageCircle className="w-6 h-6" />
              Ainda precisa de ajuda?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-green-700 dark:text-green-300">
              Nossa equipe de suporte está sempre pronta para ajudar você. Entre em contato conosco:
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                asChild
                className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white transition-colors duration-200"
              >
                <a 
                  href="https://wa.me/5551999999999?text=Olá! Preciso de ajuda com a Safe Pass" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              </Button>
              <Button 
                variant="outline" 
                asChild
                className="border-green-600 text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900/20 transition-colors duration-200"
              >
                <a 
                  href="mailto:suporte@safepass.com.br" 
                  className="flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Email: suporte@safepass.com.br
                </a>
              </Button>
            </div>
            <div className="text-sm text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 p-3 rounded-lg border dark:border-green-800">
              <strong>Horário de atendimento:</strong> Segunda a sexta, das 9h às 18h
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  )
}