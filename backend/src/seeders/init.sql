-- Seed inicial para Docker entrypoint
-- Se ejecuta automáticamente al crear el contenedor MySQL

USE sistema_pedidos;

-- Insertar usuario admin
INSERT IGNORE INTO usuarios (nombre, email, password_hash, rol, tipo_entidad, activo, created_at, updated_at)
VALUES (
  'Administrador del Sistema',
  'admin@sistema.com',
  '$2a$12$LJ3m4ys7Gzf2GmB4gGh5/.2v9x8qkXLKjS6FD4Q5E5IV3.D5LfLy2',
  'admin',
  'entidad',
  TRUE,
  NOW(),
  NOW()
);

INSERT IGNORE INTO usuarios (nombre, email, password_hash, rol, tipo_entidad, activo, created_at, updated_at)
VALUES (
  'Carlos Mendoza',
  'aprobador@sistema.com',
  '$2a$12$LJ3m4ys7Gzf2GmB4gGh5/.2v9x8qkXLKjS6FD4Q5E5IV3.D5LfLy2',
  'aprobador',
  'entidad',
  TRUE,
  NOW(),
  NOW()
);

INSERT IGNORE INTO usuarios (nombre, email, password_hash, rol, tipo_entidad, activo, created_at, updated_at)
VALUES (
  'María García',
  'operador@sistema.com',
  '$2a$12$LJ3m4ys7Gzf2GmB4gGh5/.2v9x8qkXLKjS6FD4Q5E5IV3.D5LfLy2',
  'operador',
  'tienda',
  TRUE,
  NOW(),
  NOW()
);

-- Categorías
INSERT IGNORE INTO categorias (nombre, descripcion, icono, activo) VALUES
('Insumos de Oficina', 'Papelería, útiles de escritorio y suministros generales de oficina', 'FileText', TRUE),
('Tecnología', 'Equipos de cómputo, software, periféricos y accesorios tecnológicos', 'Monitor', TRUE),
('Servicios', 'Servicios profesionales, consultorías y contrataciones externas', 'Briefcase', TRUE),
('Limpieza', 'Productos y servicios de limpieza e higiene', 'Sparkles', TRUE),
('Mantenimiento', 'Reparaciones, mantenimiento preventivo y correctivo de instalaciones', 'Wrench', TRUE);

-- Proveedores
INSERT IGNORE INTO proveedores (nombre, ruc_nit, email, telefono, direccion, activo, created_at) VALUES
('Distribuidora Papelera Nacional S.A.', '20451236987', 'ventas@papeleranacional.com', '+51 1 234-5678', 'Av. Industrial 1250, Lima, Perú', TRUE, NOW()),
('TechSolutions Corp.', '20789456123', 'contacto@techsolutions.com', '+51 1 987-6543', 'Jr. Tecnológico 890, San Isidro, Lima', TRUE, NOW()),
('CleanPro Servicios Integrales', '20321654987', 'info@cleanpro.pe', '+51 1 456-7890', 'Calle Los Olivos 234, Miraflores, Lima', TRUE, NOW());
