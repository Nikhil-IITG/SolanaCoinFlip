export default function Layout({ children }) {
  return (
    <div className="layout_container">
      <header className="layout_header">/* Your header here */</header>
      <main className="layout_main">{children}</main>
      <footer className="layout_footer">/* Your footer here */</footer>
    </div>
  );
}
