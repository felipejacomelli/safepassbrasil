"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { useMediaQuery } from "@/hooks/use-media-query"

export default function SellTicketPage({ params }: { params: { slug: string } }) {
  const { slug } = use(params as any)
  const isDesktop = useMediaQuery("(min-width: 640px)")
  const router = useRouter()

  // Find the event data based on the slug
  const event = events.find((e) => e.slug === slug) || events[0]

  // State for form
  const [ticketType, setTicketType] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      return params.get("type") || "pista-premium"
    }
    return "pista-premium"
  })

  const [price, setPrice] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      return params.get("price") || ""
    }
    return ""
  })
  const [quantity, setQuantity] = useState("1")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")

    // Validate price
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      setError("Por favor, insira um preço válido")
      return
    }

    // Simulate form submission
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setSuccess(true)

      // Redirect after success
      setTimeout(() => {
        router.push(`/event/${params.slug}`)
      }, 3000)
    }, 1500)
  }

  return (
    <div
      style={{
        backgroundColor: "black",
        color: "white",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header/Navigation */}
      <header
        style={{
          padding: "16px",
          borderBottom: "1px solid #333",
          position: "sticky",
          top: 0,
          backgroundColor: "rgba(0,0,0,0.9)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            maxWidth: "1200px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          {/* Logo */}
          <a
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
            }}
          >
            <div
              style={{
                backgroundColor: "#3B82F6",
                padding: "6px",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  backgroundColor: "black",
                  borderRadius: "4px",
                }}
              />
            </div>
            <span
              style={{
                color: "white",
                fontSize: "20px",
                fontWeight: "bold",
              }}
            >
              reticket
            </span>
          </a>

          {/* Navigation Links */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            {isDesktop && (
              <>
                <a
                  href="#"
                  style={{
                    color: "white",
                    textDecoration: "none",
                    fontSize: "14px",
                  }}
                >
                  Como Funciona
                </a>
                <a
                  href="#"
                  style={{
                    color: "white",
                    textDecoration: "none",
                    fontSize: "14px",
                  }}
                >
                  WhatsApp
                </a>
              </>
            )}
            <button
              style={{
                backgroundColor: "transparent",
                border: "1px solid #3B82F6",
                color: "white",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              Cadastrar
            </button>
            <button
              style={{
                backgroundColor: "transparent",
                border: "1px solid #3B82F6",
                color: "white",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              Acessar
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          padding: "24px 16px",
          maxWidth: "1200px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* Breadcrumb */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "24px",
            color: "#A1A1AA",
            fontSize: "14px",
          }}
        >
          <a
            href="/"
            style={{
              color: "#A1A1AA",
              textDecoration: "none",
            }}
          >
            Início
          </a>
          <span>›</span>
          <a
            href={`/event/${event.slug}`}
            style={{
              color: "#A1A1AA",
              textDecoration: "none",
            }}
          >
            {event.title}
          </a>
          <span>›</span>
          <span style={{ color: "#3B82F6" }}>Vender Ingressos</span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isDesktop ? "1fr 1.5fr" : "1fr",
            gap: "32px",
          }}
        >
          {/* Event Info */}
          <div>
            <h1
              style={{
                fontSize: isDesktop ? "28px" : "24px",
                fontWeight: "bold",
                marginBottom: "16px",
              }}
            >
              Vender Ingressos: {event.title}
            </h1>

            {/* Event Image */}
            <div
              style={{
                position: "relative",
                paddingTop: "56.25%", // 16:9 aspect ratio
                backgroundColor: "#27272A",
                borderRadius: "12px",
                marginBottom: "24px",
                overflow: "hidden",
              }}
            >
              <img
                src={event.image || "/placeholder.svg"}
                alt={event.title}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>

            {/* Event Details */}
            <div
              style={{
                backgroundColor: "#18181B",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "12px",
                  color: "#D4D4D8",
                }}
              >
                <span style={{ marginRight: "8px" }}>📅</span>
                <span>{event.date}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "12px",
                  color: "#D4D4D8",
                }}
              >
                <span style={{ marginRight: "8px" }}>📍</span>
                <span>{event.location}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "#D4D4D8",
                }}
              >
                <span style={{ marginRight: "8px" }}>⏰</span>
                <span>{event.time || "19:00 - 23:00"}</span>
              </div>
            </div>

            {/* Seller Guidelines */}
            <div
              style={{
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                borderRadius: "12px",
                padding: "16px",
                border: "1px solid rgba(59, 130, 246, 0.3)",
              }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  marginBottom: "12px",
                  color: "#3B82F6",
                }}
              >
                Dicas para vendedores
              </h3>
              <ul
                style={{
                  color: "#D4D4D8",
                  paddingLeft: "20px",
                  fontSize: "14px",
                  lineHeight: "1.6",
                }}
              >
                <li>Defina um preço justo para aumentar suas chances de venda</li>
                <li>Descreva detalhes importantes sobre o ingresso (setor, fileira, etc.)</li>
                <li>Responda rapidamente às perguntas dos compradores</li>
                <li>Você receberá o pagamento após a validação do ingresso</li>
              </ul>
            </div>
          </div>

          {/* Sell Form */}
          <div>
            {success ? (
              <div
                style={{
                  backgroundColor: "#18181B",
                  borderRadius: "12px",
                  padding: "24px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px auto",
                  }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M5 13L9 17L19 7"
                      stroke="#10B981"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h2
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    marginBottom: "16px",
                  }}
                >
                  Ingresso publicado com sucesso!
                </h2>
                <p
                  style={{
                    color: "#A1A1AA",
                    marginBottom: "24px",
                  }}
                >
                  Seu ingresso para {event.title} foi publicado e já está disponível para compradores.
                </p>
                <a
                  href={`/event/${event.slug}`}
                  style={{
                    display: "inline-block",
                    backgroundColor: "#3B82F6",
                    color: "black",
                    padding: "12px 24px",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    textDecoration: "none",
                  }}
                >
                  Voltar para o evento
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div
                  style={{
                    backgroundColor: "#18181B",
                    borderRadius: "12px",
                    padding: "24px",
                    marginBottom: "24px",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "20px",
                      fontWeight: "bold",
                      marginBottom: "24px",
                    }}
                  >
                    Detalhes do Ingresso
                  </h2>

                  {/* Ticket Type */}
                  <div
                    style={{
                      marginBottom: "16px",
                    }}
                  >
                    <label
                      htmlFor="ticket-type"
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "500",
                      }}
                    >
                      Tipo de Ingresso
                    </label>
                    <select
                      id="ticket-type"
                      value={ticketType}
                      onChange={(e) => setTicketType(e.target.value)}
                      style={{
                        width: "100%",
                        backgroundColor: "#27272A",
                        color: "white",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid #3F3F46",
                        fontSize: "16px",
                      }}
                    >
                      <option value="pista-premium">Pista Premium</option>
                      <option value="pista">Pista</option>
                      <option value="cadeira-inferior">Cadeira Inferior</option>
                      <option value="cadeira-superior">Cadeira Superior</option>
                      <option value="camarote">Camarote</option>
                    </select>
                  </div>

                  {/* Price */}
                  <div
                    style={{
                      marginBottom: "16px",
                    }}
                  >
                    <label
                      htmlFor="price"
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "500",
                      }}
                    >
                      Preço (R$)
                    </label>
                    <div
                      style={{
                        position: "relative",
                      }}
                    >
                      <input
                        id="price"
                        type="text"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0,00"
                        style={{
                          width: "100%",
                          backgroundColor: "#27272A",
                          color: "white",
                          padding: "12px 12px 12px 40px",
                          borderRadius: "8px",
                          border: "1px solid #3F3F46",
                          fontSize: "16px",
                        }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          left: "16px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#A1A1AA",
                        }}
                      >
                        R$
                      </span>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div
                    style={{
                      marginBottom: "16px",
                    }}
                  >
                    <label
                      htmlFor="quantity"
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "500",
                      }}
                    >
                      Quantidade
                    </label>
                    <select
                      id="quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      style={{
                        width: "100%",
                        backgroundColor: "#27272A",
                        color: "white",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid #3F3F46",
                        fontSize: "16px",
                      }}
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6">6</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label
                      htmlFor="description"
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "500",
                      }}
                    >
                      Descrição (opcional)
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Adicione informações relevantes sobre o ingresso (setor, fileira, assento, etc.)"
                      style={{
                        width: "100%",
                        backgroundColor: "#27272A",
                        color: "white",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid #3F3F46",
                        fontSize: "16px",
                        minHeight: "120px",
                        resize: "vertical",
                      }}
                    />
                  </div>
                </div>

                {/* Upload Section */}
                <div
                  style={{
                    backgroundColor: "#18181B",
                    borderRadius: "12px",
                    padding: "24px",
                    marginBottom: "24px",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "20px",
                      fontWeight: "bold",
                      marginBottom: "16px",
                    }}
                  >
                    Comprovante do Ingresso
                  </h2>
                  <p
                    style={{
                      color: "#A1A1AA",
                      marginBottom: "16px",
                      fontSize: "14px",
                    }}
                  >
                    Faça upload de uma foto ou PDF do seu ingresso para verificação. Não se preocupe, ocultaremos
                    informações sensíveis como códigos de barras e QR codes.
                  </p>
                  <div
                    style={{
                      border: "2px dashed #3F3F46",
                      borderRadius: "8px",
                      padding: "32px 16px",
                      textAlign: "center",
                      cursor: "pointer",
                    }}
                  >
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ margin: "0 auto 16px auto" }}
                    >
                      <path d="M7 16.2V14.2H17V16.2H7ZM7 11.5V9.5H17V11.5H7ZM7 6.8V4.8H17V6.8H7Z" fill="#A1A1AA" />
                      <path
                        d="M3 20.5V3.5C3 2.4 3.9 1.5 5 1.5H19C20.1 1.5 21 2.4 21 3.5V20.5C21 21.6 20.1 22.5 19 22.5H5C3.9 22.5 3 21.6 3 20.5ZM5 20.5H19V3.5H5V20.5Z"
                        fill="#A1A1AA"
                      />
                    </svg>
                    <p
                      style={{
                        color: "#A1A1AA",
                        marginBottom: "8px",
                      }}
                    >
                      Arraste e solte arquivos aqui ou
                    </p>
                    <button
                      type="button"
                      style={{
                        backgroundColor: "#27272A",
                        color: "white",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      Selecionar Arquivo
                    </button>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div
                  style={{
                    backgroundColor: "#18181B",
                    borderRadius: "12px",
                    padding: "24px",
                    marginBottom: "24px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                    }}
                  >
                    <input
                      type="checkbox"
                      id="terms"
                      style={{
                        marginTop: "4px",
                      }}
                      required
                    />
                    <label
                      htmlFor="terms"
                      style={{
                        color: "#D4D4D8",
                        fontSize: "14px",
                        lineHeight: "1.6",
                      }}
                    >
                      Eu confirmo que sou o proprietário legítimo deste ingresso e concordo com os{" "}
                      <a
                        href="#"
                        style={{
                          color: "#3B82F6",
                          textDecoration: "none",
                        }}
                      >
                        Termos e Condições
                      </a>{" "}
                      e{" "}
                      <a
                        href="#"
                        style={{
                          color: "#3B82F6",
                          textDecoration: "none",
                        }}
                      >
                        Política de Privacidade
                      </a>{" "}
                      da ReTicket.
                    </label>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div
                    style={{
                      backgroundColor: "rgba(220, 38, 38, 0.1)",
                      color: "#EF4444",
                      padding: "12px",
                      borderRadius: "8px",
                      marginBottom: "16px",
                      border: "1px solid rgba(220, 38, 38, 0.3)",
                    }}
                  >
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: "#3B82F6",
                    color: "black",
                    border: "none",
                    borderRadius: "8px",
                    padding: "16px",
                    fontSize: "16px",
                    fontWeight: "bold",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    width: "100%",
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? "Publicando..." : "Publicar Ingresso"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: "#18181B",
          borderTop: "1px solid #27272A",
          padding: "32px 16px",
          marginTop: "auto",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          <div
            style={{
              marginBottom: "24px",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                marginBottom: "12px",
              }}
            >
              Sobre
            </h3>
            <p
              style={{
                color: "#A1A1AA",
                fontSize: "14px",
                lineHeight: "1.6",
                marginBottom: "12px",
              }}
            >
              ReTicket é uma plataforma confiável para compra e venda de ingressos diretamente entre fãs.
            </p>
            <p
              style={{
                color: "#A1A1AA",
                fontSize: "14px",
                lineHeight: "1.6",
              }}
            >
              Nossa missão é conectar pessoas, que desejam revender seus ingressos devido a imprevistos, com compradores
              que procuram as melhores ofertas de última hora.
            </p>
          </div>

          <p
            style={{
              color: "#71717A",
              fontSize: "12px",
              textAlign: "center",
              marginTop: "24px",
            }}
          >
            © 2023 ReTicket. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}

// Mock event data (same as in other files)
const events = [
  {
    slug: "festival-de-verao",
    title: "Festival de Verão",
    date: "15 de Dezembro, 2023",
    time: "16:00 - 02:00",
    location: "Praia de Copacabana, Rio de Janeiro",
    attendance: "50.000+ pessoas",
    price: "A partir de R$ 150",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop&q=60",
    description: [
      "O Festival de Verão é um dos eventos mais aguardados da temporada, reunindo grandes nomes da música brasileira e internacional em um cenário paradisíaco.",
      "Com uma programação diversificada que vai do pop ao rock, do samba ao eletrônico, o festival promete agradar a todos os gostos musicais.",
      "Além dos shows, o evento conta com áreas de alimentação, lounges e diversas atividades para tornar sua experiência ainda mais completa.",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    ],
  },
  {
    slug: "rock-in-rio-2025",
    title: "Rock in Rio 2025",
    date: "19-28 de Setembro, 2025",
    time: "14:00 - 00:00",
    location: "Cidade do Rock, Rio de Janeiro",
    attendance: "100.000+ pessoas",
    price: "A partir de R$ 650",
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&auto=format&fit=crop&q=60",
    description: [
      "O Rock in Rio é um dos maiores festivais de música do mundo, reunindo artistas nacionais e internacionais em performances inesquecíveis. Em 2025, o evento promete ser ainda mais grandioso, com uma lineup diversificada e cheia de estrelas.",
      "Durante os dias de festival, a Cidade do Rock se transforma em um verdadeiro parque de diversões para os amantes da música, com várias atrações além dos shows principais, incluindo a famosa roda gigante, tirolesa, e diversas opções gastronômicas.",
      "Não perca a chance de fazer parte deste evento histórico e viver momentos únicos ao som de seus artistas favoritos!",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    ],
  },
  {
    slug: "lollapalooza-brasil-2025",
    title: "Lollapalooza Brasil 2025",
    date: "28-30 de Março, 2025",
    time: "11:00 - 23:00",
    location: "Autódromo de Interlagos, São Paulo",
    attendance: "80.000+ pessoas",
    price: "A partir de R$ 750",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60",
    description: [
      "O Lollapalooza Brasil retorna em 2025 para sua décima edição no país, trazendo o melhor da música alternativa, rock, hip-hop, música eletrônica e muito mais.",
      "Distribuído em diversos palcos no Autódromo de Interlagos, o festival oferece uma experiência completa com atrações para todos os gostos, além de áreas de descanso, praça de alimentação com opções diversificadas e espaços instagramáveis.",
      "Prepare-se para três dias intensos de música, arte e cultura em um dos festivais mais aguardados do calendário brasileiro.",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    ],
  },
]
