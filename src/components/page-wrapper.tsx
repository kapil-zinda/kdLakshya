import { ReactNode } from 'react';
import { NewSideBar } from './sidebar/MainNav';

export default function PageWrapper({ children }: { children: ReactNode }) {
  return (
    // <div className="flex flex-col pt-2 px-4 space-y-2 flex-grow pb-4">
      <NewSideBar>
      {children}
      </NewSideBar>
    // </div>
  );
}
