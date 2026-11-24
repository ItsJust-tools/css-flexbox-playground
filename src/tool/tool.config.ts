export const toolConfig = {
  id: 'css-flexbox-playground',
  name: 'CSS Flexbox Playground',
  category: 'Design',
  description:
    'Interactive playground to compose CSS flexbox container and item properties with live preview and generated CSS.',
  version: '1.0.0',
  exportFormats: ['png', 'jpeg', 'webp', 'pdf'] as import('@itsjust/core').ExportFormat[],
  features: {
    export: true,
    autoSave: true,
    undoRedo: true,
    sidebar: true,
    statusBar: true,
    darkMode: true,
  },
  theme: {
    brand: 'CSS Flexbox Playground',
  },
  ogImage: '/og.svg',
};

export default toolConfig;
