"use client"

export default function LoginLoading() {
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
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          border: "4px solid rgba(255, 255, 255, 0.1)",
          borderTopColor: "#3B82F6",
          borderRadius: "50%",
          marginBottom: "16px",
        }}
      ></div>
      <p>Carregando página de login...</p>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        div {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  )
}
