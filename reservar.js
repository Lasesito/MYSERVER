document.addEventListener('DOMContentLoaded', () => {
  const planes = {
    basico: {
      nombre: 'Plan Básico',
      precio: 1999,
      caracteristicas: [
        'Vuelo Madrid-Vanuatu',
        '7 días de alojamiento',
        'Pensión completa',
        'Clases de inglés',
        'Material didáctico',
        'Actividades básicas'
      ]
    },
    premium: {
      nombre: 'Plan Premium',
      precio: 2499,
      caracteristicas: [
        'Todo lo del plan básico',
        'Traslados VIP',
        'Todas las excursiones',
        'Equipo de snorkel y deportivo',
        'Seguro premium internacional',
        'Kit de bienvenida exclusivo'
      ]
    }
  };

  const descuentosGrupo = [
    { min: 3, max: 4, descuento: 5 },
    { min: 5, max: 7, descuento: 10 },
    { min: 8, max: 10, descuento: 15 }
  ];

  const fechasDisponibles = [
    { inicio: '2025-07-01', fin: '2025-07-07', plazasDisponibles: 10 },
    { inicio: '2025-07-15', fin: '2025-07-21', plazasDisponibles: 10 },
    { inicio: '2025-08-01', fin: '2025-08-07', plazasDisponibles: 10 },
    { inicio: '2025-08-15', fin: '2025-08-21', plazasDisponibles: 10 }
  ];

  // Obtener elementos del DOM
  const planDetails = document.getElementById('plan-details');
  const numPersonas = document.getElementById('num-personas');
  const fechaSelect = document.getElementById('fecha');
  const resumenDetalles = document.getElementById('resumen-detalles');
  const precioTotal = document.getElementById('precio-total');
  const form = document.getElementById('reserva-form');

  // Verificar que todos los elementos necesarios existen
  if (planDetails && numPersonas && fechaSelect && resumenDetalles && precioTotal && form) {
    // Obtener el tipo de plan de la URL
    const params = new URLSearchParams(window.location.search);
    const planType = params.get('plan') || 'basico';
    const plan = planes[planType];

    // Mostrar detalles del plan con animación de descuentos
    planDetails.innerHTML = `
      <h2>${plan.nombre}</h2>
      <p class="price">${plan.precio}€ por persona</p>
      <ul>
        ${plan.caracteristicas.map(c => `<li>${c}</li>`).join('')}
      </ul>
      <div class="descuentos-grupo">
        <h3>🎉 ¡Descuentos por Grupo! 🎉</h3>
        <div class="descuentos-cards">
          ${descuentosGrupo.map(d => `
            <div class="descuento-card">
              <div class="descuento-icon">👥 ${d.min}-${d.max} personas</div>
              <div class="descuento-value">-${d.descuento}%</div>
              <div class="descuento-save">¡Ahorra hasta ${(plan.precio * d.max * d.descuento / 100).toFixed(0)}€!</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Poblar el selector de fechas
    fechasDisponibles.forEach(fecha => {
      const option = document.createElement('option');
      const fechaInicio = new Date(fecha.inicio);
      const fechaFin = new Date(fecha.fin);
      const formatoFecha = new Intl.DateTimeFormat('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      option.value = fecha.inicio;
      option.text = fecha.plazasDisponibles > 0 
        ? `${formatoFecha.format(fechaInicio)} - ${formatoFecha.format(fechaFin)} (${fecha.plazasDisponibles} plazas)`
        : `${formatoFecha.format(fechaInicio)} - ${formatoFecha.format(fechaFin)} (COMPLETO - Lista de espera)`;
      option.disabled = false; // Permitimos seleccionar fechas completas para lista de espera
      fechaSelect.appendChild(option);
    });

    // Función para calcular el descuento
    function calcularDescuento(numPersonas) {
      for (const descuento of descuentosGrupo) {
        if (numPersonas >= descuento.min && numPersonas <= descuento.max) {
          return descuento.descuento;
        }
      }
      return 0;
    }

    // Actualizar resumen cuando cambie el número de personas o la fecha
    function actualizarResumen() {
      const personas = parseInt(numPersonas.value);
      const fechaSeleccionada = fechaSelect.value;
      const fecha = fechasDisponibles.find(f => f.inicio === fechaSeleccionada);
      const descuento = calcularDescuento(personas);
      const precioBase = personas * plan.precio;
      const ahorro = (precioBase * descuento / 100);
      const total = precioBase - ahorro;
      
      if (fecha) {
        let estadoPlazas = '';
        if (fecha.plazasDisponibles === 0) {
          estadoPlazas = '<p class="lista-espera">⚠️ Esta fecha está completa - Entrarás en lista de espera</p>';
        } else if (personas > fecha.plazasDisponibles) {
          estadoPlazas = `<p class="lista-espera">⚠️ Solo quedan ${fecha.plazasDisponibles} plazas disponibles - Las plazas restantes entrarán en lista de espera</p>`;
        }

        resumenDetalles.innerHTML = `
          <p><strong>Plan:</strong> ${plan.nombre}</p>
          <p><strong>Personas:</strong> ${personas}</p>
          <p><strong>Fecha:</strong> ${new Date(fecha.inicio).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })} - ${new Date(fecha.fin).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}</p>
          ${estadoPlazas}
          <p><strong>Precio por persona:</strong> ${plan.precio}€</p>
          ${descuento > 0 ? `
            <div class="descuento-aplicado">
              <p><strong>¡Descuento del ${descuento}% aplicado!</strong></p>
              <p>Ahorro total: ${ahorro.toFixed(0)}€</p>
            </div>
          ` : ''}
        `;
        precioTotal.innerHTML = `
          <span class="precio-original ${descuento > 0 ? 'tachado' : ''}">${precioBase}€</span>
          <span class="precio-final">${total.toFixed(0)}€</span>
        `;
      }
    }

    numPersonas.addEventListener('change', actualizarResumen);
    fechaSelect.addEventListener('change', actualizarResumen);
    actualizarResumen(); // Llamada inicial

    // Manejar envío del formulario
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const formData = {
        plan: plan.nombre,
        personas: numPersonas.value,
        fecha: fechaSelect.value,
        nombre: document.getElementById('nombre')?.value || '',
        email: document.getElementById('email')?.value || '',
        telefono: document.getElementById('telefono')?.value || '',
        total: parseInt(precioTotal.textContent.replace(/\D+/g, ''))
      };

      const fechaSeleccionada = fechasDisponibles.find(f => f.inicio === formData.fecha);
      const enListaEspera = fechaSeleccionada.plazasDisponibles === 0 || 
                           parseInt(formData.personas) > fechaSeleccionada.plazasDisponibles;

      const notification = document.createElement('div');
      notification.className = 'toast-notification success';
      notification.innerHTML = `
        <h4>${enListaEspera ? '¡Solicitud en Lista de Espera! 📝' : '¡Reserva Confirmada! 🎉'}</h4>
        <p>¡Gracias ${formData.nombre}! ${enListaEspera ? 'Te hemos añadido a la lista de espera.' : 'Tu aventura en Vanuatu está en camino.'}</p>
        <p>Detalles de la ${enListaEspera ? 'solicitud' : 'reserva'}:</p>
        <ul style="margin: 10px 0">
          <li>Plan: ${formData.plan}</li>
          <li>Personas: ${formData.personas}</li>
          <li>Fecha: ${new Date(formData.fecha).toLocaleDateString('es-ES')}</li>
          <li>Total: ${formData.total}€</li>
        </ul>
        <p>${enListaEspera ? 'Te contactaremos si se liberan plazas.' : 'Te hemos enviado un email con todos los detalles.'} ¡Nos vemos pronto! 🌴</p>
      `;
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.style.animation = 'slideOutToast 0.5s ease forwards';
        setTimeout(() => {
          notification.remove();
          window.location.href = 'index.html';
        }, 500);
      }, 5000);
    });
  }
});