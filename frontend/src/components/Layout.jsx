import { Outlet, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './nav/MobileNav';

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-darkest">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <MobileNav />
        <div className="hidden md:block">
          <Header />
        </div>
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
