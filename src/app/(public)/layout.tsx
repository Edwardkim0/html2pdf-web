export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: "100vh", background: "#0b1120" }}>
      {children}
    </div>
  );
}
