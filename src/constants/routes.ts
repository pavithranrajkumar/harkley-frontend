import { BarChart3, Video, CheckSquare } from 'lucide-react';

export interface SidebarRoute {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
}

export const SIDEBAR_ROUTES: SidebarRoute[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: BarChart3,
    isActive: true, // Dashboard is currently active
  },
  {
    id: 'meetings',
    label: 'Meetings',
    path: '/meetings',
    icon: Video,
  },
  {
    id: 'action-items',
    label: 'Action Items',
    path: '/action-items',
    icon: CheckSquare,
  },
];

export const getActiveRoute = (currentPath: string): string => {
  const route = SIDEBAR_ROUTES.find((route) => route.path === currentPath);
  return route?.id || 'dashboard';
};

export const updateActiveRoute = (routes: SidebarRoute[], activeId: string): SidebarRoute[] => {
  return routes.map((route) => ({
    ...route,
    isActive: route.id === activeId,
  }));
};
