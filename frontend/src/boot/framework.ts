import { defineBoot } from '#q-app';
import { Dark } from 'quasar';

// Import Quasar Icon Fonts
import '@quasar/extras/material-icons/material-icons.css';
import '@quasar/extras/material-icons-outlined/material-icons-outlined.css';
import '@quasar/extras/material-icons-round/material-icons-round.css';

// Import Core Quasar Stylesheet
import 'quasar/src/css/index.sass';

// Import Design System Tokens, Tailwind CSS, and Enterprise Application Styles
import '../css/tokens.css';
import '../css/tailwind.css';
import '../css/app.scss';

import AppLoadingOverlay from '../components/AppLoadingOverlay.vue';

export default defineBoot(({ app }) => {
  // Ensure enterprise dark mode is active by default
  Dark.set(true);

  // Register shared enterprise components
  app.component('AppLoadingOverlay', AppLoadingOverlay);
});
