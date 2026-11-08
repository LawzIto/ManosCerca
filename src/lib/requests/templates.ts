export interface QuickTemplate {
  label: string;
  title: string;
  description: string;
}

export const CATEGORY_TEMPLATES: Record<string, QuickTemplate[]> = {
  plomeria: [
    {
      label: "Fuga o goteo de agua",
      title: "Fuga de agua en tubería / grifo",
      description: "Tengo una fuga constante de agua en la tubería/grifo. Necesito revisión para reparar o reemplazar la pieza antes de que cause daños mayores.",
    },
    {
      label: "Tubería tapada",
      title: "Desagüe tapado en baño / cocina",
      description: "El agua no baja bien y se devuelve por el sifón. Ya intenté destapar con métodos caseros y no funciona, se requiere desobstrucción profesional.",
    },
    {
      label: "Instalación de grifería/sanitario",
      title: "Instalación de sanitario / lavamanos nuevo",
      description: "Compré un juego nuevo de grifería/sanitario y necesito desmontar el anterior e instalar y sellar el nuevo correctamente.",
    },
  ],
  cerrajeria: [
    {
      label: "Apertura de puerta trabada",
      title: "Apertura urgente de puerta bloqueada",
      description: "La llave no gira o se quedó adentro de la vivienda. Se requiere apertura sin dañar la puerta lo antes posible.",
    },
    {
      label: "Cambio de chapa / cilindro",
      title: "Cambio de cerradura / chapa de seguridad",
      description: "Necesito cambiar la cerradura principal por seguridad. Requiere suministro o instalación de nueva cerradura de seguridad.",
    },
    {
      label: "Reparación de cerrojo",
      title: "Cerradura atascada o desalineada",
      description: "El cerrojo o pestillo roza contra el marco y cuesta mucho cerrar con llave. Necesito ajustarlo y lubricarlo.",
    },
  ],
  electricidad: [
    {
      label: "Cortocircuito / Se baja el breaker",
      title: "Cortocircuito o breaker que se dispara constantemente",
      description: "Se fue la luz en una parte de la casa y al subir el interruptor vuelve a saltar. Necesito diagnosticar y corregir el cortocircuito.",
    },
    {
      label: "Instalación de lámparas / tomas",
      title: "Instalación de lámparas / tomas / interruptores",
      description: "Necesito instalar nuevas luminarias/ventilador y cambiar un par de tomas corrientes desgastados.",
    },
    {
      label: "Revisión de cableado",
      title: "Revisión de cableado o caja de tacos",
      description: "Siento olor a quemado o chispazos cerca a un enchufe o caja de distribución. Requiere revisión técnica de seguridad.",
    },
  ],
  carpinteria: [
    {
      label: "Puerta o cajón rozando",
      title: "Ajuste de puerta / cajonera descuadrada",
      description: "La puerta roza el piso al abrir/cerrar y las bisagras están flojas. Necesito cepillar o reajustar los marcos y herrajes.",
    },
    {
      label: "Armado de mueble nuevo",
      title: "Armado de mueble modular / clóset",
      description: "Tengo un mueble nuevo en caja para armar (closet/escritorio) y necesito servicio de ensamble profesional con sus fijaciones.",
    },
    {
      label: "Reparación de madera",
      title: "Reparación o refuerzo de mueble de madera",
      description: "Mueble/estante con piezas desajustadas o quebradas que necesita refuerzo, encolado y restauración.",
    },
  ],
  pintura: [
    {
      label: "Pintar habitación / interior",
      title: "Pintura de paredes y techos interiores",
      description: "Necesito pintar las paredes de 1 o 2 habitaciones, incluyendo resane de grietas menores y preparación de la superficie.",
    },
    {
      label: "Retoque de humedad / manchas",
      title: "Reparación de manchas de humedad y repintado",
      description: "Pared con pintura levantada o manchas por humedad anterior ya secada. Requiere raspado, sellador antihumedad y pintura.",
    },
    {
      label: "Pintura de fachada / rejas",
      title: "Pintura exterior para rejas / fachada",
      description: "Pintura antioxidante para rejas metálicas y aplicación de pintura resistente a la intemperie en el exterior.",
    },
  ],
  albanileria: [
    {
      label: "Resane de grietas / huecos",
      title: "Resane y pañete de pared / cielo falso",
      description: "Tengo huecos y grietas en paredes o techo tras una modificación. Necesito resanar con estuco/cemento y dejar listo para pintar.",
    },
    {
      label: "Cambio de baldosas rotas",
      title: "Reparación / reposición de baldosas o cerámica",
      description: "Tengo baldosas sueltas o quebradas en el piso/muro del baño o cocina que necesitan ser retiradas y reinstaladas.",
    },
    {
      label: "Reparación de goteras en techo",
      title: "Impermeabilización o arreglo de tejado",
      description: "Goteras y filtraciones por el techo cuando llueve. Necesito ubicar la teja rota o aplicar manto impermeabilizante.",
    },
  ],
  gasfiteria: [
    {
      label: "Olor a gas / fuga",
      title: "Revisión urgente de posible fuga de gas",
      description: "Hay un leve olor a gas cerca a la estufa o calentador. Requiere prueba de hermeticidad y ajuste de conexiones por seguridad.",
    },
    {
      label: "Instalación de estufa / calentador",
      title: "Instalación y conexión de estufa / calentador a gas",
      description: "Necesito conectar una estufa o calentador nuevo a la red de gas con su manguera certificada y verificar la combustión.",
    },
    {
      label: "Mantenimiento de calentador",
      title: "Mantenimiento y limpieza de calentador de paso",
      description: "El calentador no enciende o el agua no calienta suficiente. Requiere limpieza de quemadores, cambio de diafragma o calibración.",
    },
  ],
  limpieza: [
    {
      label: "Limpieza profunda de hogar",
      title: "Jornada de limpieza profunda para casa / apartamento",
      description: "Se requiere servicio de limpieza general y profunda de cocina, baños, pisos, ventanas y superficies en toda la vivienda.",
    },
    {
      label: "Limpieza post-obra o remodelación",
      title: "Limpieza general tras obra o remodelación",
      description: "Acabamos de terminar una remodelación y hay restos de polvo fino, pintura y escombros menores que requieren aseo minucioso.",
    },
    {
      label: "Lavado de muebles / colchón",
      title: "Lavado en seco / vapor de sofá o colchones",
      description: "Limpieza y desinfección profunda para juego de sala o colchón para eliminar manchas y ácaros.",
    },
  ],
};
