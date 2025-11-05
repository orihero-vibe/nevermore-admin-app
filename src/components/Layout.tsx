import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const Layout = () => {
  return (
    <div className="flex h-screen bg-neutral-950">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden bg-neutral-950">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
