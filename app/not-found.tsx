"use client"

import Link from "next/link"

export default function NotFound() {
  return (
    <div
      style={{
        backgroundColor: "black",
        color: "white",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontSize: "32px",
          fontWeight: "bold",
          marginBottom: "16px",
        }}
      >
        404
      </h1>
      <p
        style={{
          fontSize: "18px",
          marginBottom: "24px",
        }}
      >
        Página não encontrada
      </p>
      <Link
        href="/"
        style={{
          backgroundColor: "#3B82F6",
          color: "black",
          padding: "12px 24px",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: "bold",
          fontSize: "16px",
        }}
      >
        Voltar para a página inicial
      </Link>
    </div>
  )
}
