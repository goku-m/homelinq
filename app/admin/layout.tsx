export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      <style>{`
        body > footer {
          display: none;
        }
      `}</style>
      {children}
    </>
  );
}
