import HomeIcon from '@/assets/home.svg';
import UsersIcon from '@/assets/users.svg';
import MessageIcon from '@/assets/message-simple.svg';
import CommunityIcon from '@/assets/community.svg';
import ConsultIcon from '@/assets/bulb.svg';
import NotificationIcon from '@/assets/notification.svg';
import ManagementIcon from '@/assets/gestiones.svg';

export const MENU_ITEMS = [
  {
    id: 'inicio',
    icon: HomeIcon,
    label: 'Inicio'
  },
  {
    id: 'red',
    icon: UsersIcon,
    label: 'Mi Red'
  },
  {
    id: 'mensajes',
    icon: MessageIcon,
    label: 'Mensajes'
  },
  {
    id: 'comunidades',
    icon: CommunityIcon,
    label: 'Comunidades'
  },
  {
    id: 'consultoria',
    icon: ConsultIcon,
    label: 'Negocios APIA'
  },
  {
    id: 'notificaciones',
    icon: NotificationIcon,
    label: 'Notificaciones'
  }
];

export const MENU_ITEMS_ADMIN = [
  {
    id: 'inicio',
    icon: HomeIcon,
    label: 'Inicio'
  },
  {
    id: 'mensajes',
    icon: MessageIcon,
    label: 'Mensajes'
  },
  {
    id: 'comunidades',
    icon: CommunityIcon,
    label: 'Comunidades'
  },
  {
    id: 'gestion',
    icon: ManagementIcon,
    label: 'Gestión'
  },
  // {
  //   id: 'notificaciones',
  //   icon: NotificationIcon,
  //   label: 'Notificaciones'
  // }
];
