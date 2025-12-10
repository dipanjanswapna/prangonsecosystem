export default function AuthPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="auth-page-active">{children}</div>;
}
