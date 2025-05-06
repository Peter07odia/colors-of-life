import Link from 'next/link';
import Search from './Search';

export default function NavBar() {
  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/style-feed" className="flex items-center">
          <div className="w-8 h-8 flex items-center justify-center">
            <img 
              src="/images/logo.png" 
              alt="Colors of Life Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        </Link>
        
        <div className="w-full max-w-md mx-4">
          <Search />
        </div>
        
        <div className="flex items-center space-x-4">
          <Link href="/style-feed" className="hover:text-primary">Styles</Link>
          <Link href="/dashboard" className="hover:text-primary">Dashboard</Link>
          <Link href="/try-on" className="hover:text-primary">Try On</Link>
          <Link href="/profile" className="hover:text-primary">Profile</Link>
        </div>
      </div>
    </nav>
  );
} 