export const ESTADOS = {
  borrador: { label: 'Borrador', color: '#95A5A6', bg: '#F0F0F0' },
  pendiente: { label: 'Pendiente', color: '#F39C12', bg: '#FEF3CD' },
  aprobado: { label: 'Aprobado', color: '#2E86C1', bg: '#D6EAF8' },
  rechazado: { label: 'Rechazado', color: '#E74C3C', bg: '#FADBD8' },
  en_proceso: { label: 'En Proceso', color: '#8E44AD', bg: '#E8DAEF' },
  completado: { label: 'Completado', color: '#27AE60', bg: '#D5F5E3' },
  cancelado: { label: 'Cancelado', color: '#7F8C8D', bg: '#E5E8E8' },
};

export const PRIORIDADES = [
  { value: 'baja', label: 'Baja', color: '#27AE60', bg: '#D5F5E3' },
  { value: 'media', label: 'Media', color: '#F39C12', bg: '#FEF3CD' },
  { value: 'alta', label: 'Alta', color: '#E67E22', bg: '#FDEBD0' },
  { value: 'urgente', label: 'Urgente', color: '#E74C3C', bg: '#FADBD8' },
];

export const ROLES = [
  { value: 'admin', label: 'Administrador', color: '#8E44AD' },
  { value: 'aprobador', label: 'Aprobador', color: '#2E86C1' },
  { value: 'operador', label: 'Operador', color: '#27AE60' },
  { value: 'visualizador', label: 'Visualizador', color: '#95A5A6' },
];

export const TIPOS_ENTIDAD = [
  { value: 'entidad', label: 'Entidad' },
  { value: 'tienda', label: 'Tienda' },
];

export const TIPOS_PEDIDO = [
  { value: 'compra', label: 'Compra' },
  { value: 'requerimiento', label: 'Requerimiento' },
  { value: 'servicio', label: 'Servicio' },
];

export const UNIDADES = [
  'unidad', 'caja', 'paquete', 'resma', 'galón', 'litro', 'metro', 'kilogramo', 'servicio', 'hora',
];

export const KANBAN_COLUMNS = ['borrador', 'pendiente', 'aprobado', 'en_proceso', 'completado'];

export const ICONOS_DISPONIBLES = [
  'FileText', 'Monitor', 'Briefcase', 'Sparkles', 'Wrench', 'Package', 'Truck',
  'ShoppingCart', 'Printer', 'Wifi', 'Cpu', 'HardDrive', 'Headphones', 'Phone',
  'Building', 'Home', 'Tool', 'Zap', 'Shield', 'Heart',
];

