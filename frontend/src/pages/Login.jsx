import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { login as loginService } from '../services/authService';
import Button from '../components/ui/Button';

const schema = z.object({
  email: z.string().min(1, 'Email es requerido').email('Email inválido'),
  password: z.string().min(1, 'Contraseña es requerida'),
});

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await loginService(data);
      setAuth(res.token, res.usuario);
      toast.success(`Bienvenido, ${res.usuario.nombre}`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel – image */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1664575602554-2087b04935a5?w=1200&q=80"
          alt="Fondo"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary/60" />
        <div className="relative z-10 max-w-md text-white px-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center mb-8">
              <FileText size={28} className="text-white" />
            </div>
            <h2 className="text-4xl font-display font-bold mb-4">
              Sistema de Pedidos y Requerimientos
            </h2>
            <p className="text-white/80 text-lg leading-relaxed">
              Gestiona tus pedidos internos de forma eficiente. Control de estados, aprobaciones, reportes y más.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <FileText size={22} className="text-white" />
            </div>
            <span className="text-xl font-display font-bold text-gray-800">SisPedidos</span>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-2xl font-display font-bold text-gray-900 mb-1">Iniciar Sesión</h1>
            <p className="text-gray-500 text-sm mb-8">Ingresa tus credenciales para acceder al sistema</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  {...register('email')}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                  }`}
                  placeholder="admin@sistema.com"
                  autoComplete="email"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    className={`w-full px-4 py-2.5 pr-11 rounded-xl border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${
                      errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <Button type="submit" loading={loading} className="w-full" size="lg">
                <LogIn size={18} />
                Iniciar Sesión
              </Button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            © {new Date().getFullYear()} Sistema de Pedidos y Requerimientos
          </p>
        </motion.div>
      </div>
    </div>
  );
}
