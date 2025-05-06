import NavBar from '../../components/NavBar';

export default function StyleFeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="style-feed-layout flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
} 