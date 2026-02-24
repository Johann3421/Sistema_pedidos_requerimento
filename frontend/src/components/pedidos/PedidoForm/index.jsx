import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Send, ArrowLeft, ArrowRight } from 'lucide-react';
import StepperForm from '../../ui/StepperForm';
import Button from '../../ui/Button';
import Paso1Info from './Paso1Info';
import Paso2Items from './Paso2Items';
import Paso3Revision from './Paso3Revision';
import { useCrearPedido, useActualizarPedido } from '../../../hooks/usePedidos';

const STEPS = ['Información General', 'Ítems del Pedido', 'Revisión y Envío'];

export default function PedidoFormIndex({ initialData, isEditing, pedidoId }) {
  const navigate = useNavigate();
  const crearPedido = useCrearPedido();
  const actualizarPedido = useActualizarPedido();

  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    titulo: initialData?.titulo || '',
    tipo: initialData?.tipo || 'pedido',
    descripcion: initialData?.descripcion || '',
    prioridad: initialData?.prioridad || 'media',
    moneda: initialData?.moneda || 'PEN',
    fecha_requerida: initialData?.fecha_requerida || '',
    proveedor_id: initialData?.proveedor_id || '',
  });
  const [items, setItems] = useState(
    initialData?.items?.length
      ? initialData.items.map((it) => ({
          descripcion: it.descripcion || '',
          categoria_id: it.categoria_id || '',
          cantidad: it.cantidad || 1,
          unidad: it.unidad || 'unidad',
          precio_unitario: it.precio_unitario || 0,
          subtotal: it.subtotal || 0,
        }))
      : [{ descripcion: '', cantidad: 1, unidad: 'unidad', precio_unitario: 0, subtotal: 0 }]
  );
  const [impuestoPct, setImpuestoPct] = useState(0);
  const [errors, setErrors] = useState({});

  const validateStep = (s) => {
    const errs = {};
    if (s === 0) {
      if (!data.titulo.trim()) errs.titulo = 'El título es requerido';
    }
    if (s === 1) {
      const validItems = items.filter((it) => it.descripcion?.trim());
      if (validItems.length === 0) errs.items = 'Agrega al menos un ítem con descripción';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, 2));
  };

  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async (estado) => {
    const validItems = items.filter((it) => it.descripcion?.trim());
    const payload = {
      ...data,
      proveedor_id: data.proveedor_id || null,
      items: validItems,
      impuesto_pct: parseFloat(impuestoPct) || 0,
      estado,
    };

    try {
      if (isEditing) {
        await actualizarPedido.mutateAsync({ id: pedidoId, data: payload });
      } else {
        await crearPedido.mutateAsync(payload);
      }
      navigate('/pedidos');
    } catch (err) {
      // Error handled via toast in hooks
    }
  };

  const loading = crearPedido.isPending || actualizarPedido.isPending;

  return (
    <div className="max-w-4xl mx-auto">
      <StepperForm steps={STEPS} currentStep={step} />

      <div className="bg-white rounded-card shadow-card p-6 mb-6">
        {step === 0 && <Paso1Info data={data} onChange={setData} errors={errors} />}
        {step === 1 && (
          <Paso2Items
            items={items}
            onChange={setItems}
            impuestoPct={impuestoPct}
            onImpuestoChange={setImpuestoPct}
            errors={errors}
            moneda={data.moneda}
            setMoneda={(m) => setData((d) => ({ ...d, moneda: m }))}
          />
        )}
        {step === 2 && <Paso3Revision data={data} items={items} impuestoPct={impuestoPct} />}
      </div>

      <div className="flex items-center justify-between">
        <div>
          {step > 0 && (
            <Button variant="secondary" icon={ArrowLeft} onClick={prev}>Anterior</Button>
          )}
        </div>
        <div className="flex gap-3">
          {step < 2 && (
            <Button icon={ArrowRight} onClick={next}>Siguiente</Button>
          )}
          {step === 2 && (
            <>
              <Button variant="secondary" icon={Save} onClick={() => submit('borrador')} loading={loading}>
                Guardar como Borrador
              </Button>
              <Button icon={Send} onClick={() => submit('pendiente')} loading={loading}>
                Enviar para Aprobación
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
