require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, Usuario, Categoria, Proveedor } = require('../models');

async function seed() {
  try {
    console.log('Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('Sincronizando tablas...');
    await sequelize.sync({ alter: true });

    // === USUARIOS ===
    const passwordAdmin = await bcrypt.hash('Admin1234!', 12);
    const passwordAprobador = await bcrypt.hash('Aprobador1!', 12);
    const passwordOperador = await bcrypt.hash('Operador1!', 12);

    const usuarios = [
      {
        nombre: 'Administrador del Sistema',
        email: 'admin@sistema.com',
        password_hash: passwordAdmin,
        rol: 'admin',
        tipo_entidad: 'entidad',
        activo: true,
      },
      {
        nombre: 'Carlos Mendoza',
        email: 'aprobador@sistema.com',
        password_hash: passwordAprobador,
        rol: 'aprobador',
        tipo_entidad: 'entidad',
        activo: true,
      },
      {
        nombre: 'María García',
        email: 'operador@sistema.com',
        password_hash: passwordOperador,
        rol: 'operador',
        tipo_entidad: 'tienda',
        activo: true,
      },
    ];

    for (const u of usuarios) {
      const [user, created] = await Usuario.findOrCreate({
        where: { email: u.email },
        defaults: u,
      });
      console.log(`Usuario ${u.email}: ${created ? 'creado' : 'ya existía'}`);
    }

    // === CATEGORÍAS ===
    const categorias = [
      { nombre: 'Insumos de Oficina', descripcion: 'Papelería, útiles de escritorio y suministros generales de oficina', icono: 'FileText' },
      { nombre: 'Tecnología', descripcion: 'Equipos de cómputo, software, periféricos y accesorios tecnológicos', icono: 'Monitor' },
      { nombre: 'Servicios', descripcion: 'Servicios profesionales, consultorías y contrataciones externas', icono: 'Briefcase' },
      { nombre: 'Limpieza', descripcion: 'Productos y servicios de limpieza e higiene', icono: 'Sparkles' },
      { nombre: 'Mantenimiento', descripcion: 'Reparaciones, mantenimiento preventivo y correctivo de instalaciones', icono: 'Wrench' },
    ];

    for (const c of categorias) {
      const [cat, created] = await Categoria.findOrCreate({
        where: { nombre: c.nombre },
        defaults: c,
      });
      console.log(`Categoría "${c.nombre}": ${created ? 'creada' : 'ya existía'}`);
    }

    // === PROVEEDORES ===
    const proveedores = [
      {
        nombre: 'Distribuidora Papelera Nacional S.A.',
        ruc_nit: '20451236987',
        email: 'ventas@papeleranacional.com',
        telefono: '+51 1 234-5678',
        direccion: 'Av. Industrial 1250, Lima, Perú',
      },
      {
        nombre: 'TechSolutions Corp.',
        ruc_nit: '20789456123',
        email: 'contacto@techsolutions.com',
        telefono: '+51 1 987-6543',
        direccion: 'Jr. Tecnológico 890, San Isidro, Lima',
      },
      {
        nombre: 'CleanPro Servicios Integrales',
        ruc_nit: '20321654987',
        email: 'info@cleanpro.pe',
        telefono: '+51 1 456-7890',
        direccion: 'Calle Los Olivos 234, Miraflores, Lima',
      },
    ];

    for (const p of proveedores) {
      const [prov, created] = await Proveedor.findOrCreate({
        where: { nombre: p.nombre },
        defaults: p,
      });
      console.log(`Proveedor "${p.nombre}": ${created ? 'creado' : 'ya existía'}`);
    }

    console.log('\n✅ Seed completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
}

seed();
