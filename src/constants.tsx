import { Icon } from '@iconify/react';

import { SideNavItem } from './types';

export const SIDENAV_ITEMS: SideNavItem[] = [
  {
    title: 'Home',
    path: '/',
    icon: <Icon icon="lucide:home" width="24" height="24" />,
  },
  {
    title: 'TODO',
    path: '/todo',
    icon: <Icon icon="lucide:folder" width="24" height="24" />,
    submenu: true,
    subMenuItems: [
      { title: 'All', path: '/todo' },
      { title: 'Create Todo', path: '/todo/create' },
      { title: 'Create Challange', path: '/todo/challanges' },
    ],
  },
  {
    title: 'Subject',
    path: '/subject',
    icon: <Icon icon="lucide:mail" width="24" height="24" />,
  },
];
