import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    // Navigation
    'Home': 'Home',
    'Browse': 'Browse',
    'Following': 'Following',
    'Categories': 'Categories',
    'Creator Studio': 'Creator Studio',
    'Settings': 'Settings',
    'Admin Panel': 'Admin Panel',
    'Logout': 'Logout',
    'Profile': 'Profile',
    'Sign In': 'Sign In',
    'Sign Up': 'Sign Up',
    'Go Live': 'Go Live',
    
    // Landing Page
    'Your Gateway to Live Entertainment': 'Your Gateway to Live Entertainment',
    'Discover amazing streamers': 'Discover amazing streamers, connect with communities, and share your passion with the world.',
    'Why Choose StreamVibe?': 'Why Choose StreamVibe?',
    'Everything you need': 'Everything you need for the ultimate streaming experience',
    'HD Streaming': 'HD Streaming',
    'Crystal clear video': 'Crystal clear video quality with adaptive bitrate streaming',
    'Live Chat': 'Live Chat',
    'Interactive real-time': 'Interactive real-time chat with moderation tools',
    'Community': 'Community',
    'Join thousands': 'Join thousands of creators and viewers worldwide',
    'Analytics': 'Analytics',
    'Track your growth': 'Track your growth with detailed insights and metrics',
    'Get Started Today': 'Get Started Today',
    'Join millions': 'Join millions of users and start your streaming journey',
    
    // Admin Panel
    'Admin Settings': 'Admin Settings',
    'Platform Settings': 'Platform Settings',
    'User Management': 'User Management',
    'Reports & Analytics': 'Reports & Analytics',
    'System Logs': 'System Logs',
    'Refresh Data': 'Refresh Data',
    'Export PDF': 'Export PDF',
    'Live Analytics Dashboard': 'Live Analytics Dashboard',
    'System Activity Logs': 'System Activity Logs',
    'User Activity Report': 'User Activity Report',
    
    // Common Actions
    'Save': 'Save',
    'Cancel': 'Cancel',
    'Delete': 'Delete',
    'Edit': 'Edit',
    'Reset Password': 'Reset Password',
    'Loading': 'Loading',
    'Error': 'Error',
    'Success': 'Success',
    
    // Creator Studio - Advanced Features  
    'Live Stream': 'Live Stream',
    'Encoding': 'Encoding',
    'RTMP Setup': 'RTMP Setup',
    'Tools': 'Tools',
    'Stream Status': 'Stream Status',
    'Status': 'Status',
    'Live': 'Live',
    'Offline': 'Offline',
    'Viewers': 'Viewers',
    'Bitrate': 'Bitrate',
    'FPS': 'FPS',
    'Update Stream': 'Update Stream',
    'Stream Configuration': 'Stream Configuration',
    'Configure your stream settings and metadata': 'Configure your stream settings and metadata',
    'Stream Title': 'Stream Title',
    'Enter your stream title...': 'Enter your stream title...',
    'Select category': 'Select category',
    'Language': 'Language',
    'Description': 'Description',
    'Describe your stream...': 'Describe your stream...',
    'Tags': 'Tags',
    'gaming, tutorial, music (comma separated)': 'gaming, tutorial, music (comma separated)',
    'Video Encoding': 'Video Encoding',
    'Configure video quality and encoding settings': 'Configure video quality and encoding settings',
    'Resolution': 'Resolution',
    'Frame Rate': 'Frame Rate',
    'Recommended: 3000-6000 for 1080p': 'Recommended: 3000-6000 for 1080p',
    'Encoder': 'Encoder',
    'Auto-Conversion': 'Auto-Conversion',
    'Automatically convert streams to multiple formats': 'Automatically convert streams to multiple formats',
    'Auto-Convert Enabled': 'Auto-Convert Enabled',
    'Automatically process streams for web playback': 'Automatically process streams for web playback',
    'HLS Output': 'HLS Output',
    'HTTP Live Streaming for web browsers': 'HTTP Live Streaming for web browsers',
    'DASH Output': 'DASH Output',
    'Dynamic Adaptive Streaming over HTTP': 'Dynamic Adaptive Streaming over HTTP',
    'Auto-Conversion Benefits': 'Auto-Conversion Benefits',
    'Multiple quality levels (adaptive bitrate)': 'Multiple quality levels (adaptive bitrate)',
    'Cross-platform compatibility': 'Cross-platform compatibility',
    'Reduced bandwidth usage': 'Reduced bandwidth usage',
    'Better viewer experience': 'Better viewer experience',
    'RTMP Configuration': 'RTMP Configuration',
    'Connect your streaming software to our RTMP server': 'Connect your streaming software to our RTMP server',
    'RTMP Server URL': 'RTMP Server URL',
    'Stream Key': 'Stream Key',
    'Keep your stream key private. Don\'t share it with anyone.': 'Keep your stream key private. Don\'t share it with anyone.',
    'Security Notice': 'Security Notice',
    'Your stream key is like a password. Never share it publicly or include it in screenshots.': 'Your stream key is like a password. Never share it publicly or include it in screenshots.',
    'Streaming Software Setup': 'Streaming Software Setup',
    'Configure popular streaming applications': 'Configure popular streaming applications',
    'OBS Studio': 'OBS Studio',
    'Open OBS Studio': 'Open OBS Studio',
    'Go to Settings → Stream': 'Go to Settings → Stream',
    'Service: Custom': 'Service: Custom',
    'Server:': 'Server:',
    'Stream Key: [Your stream key above]': 'Stream Key: [Your stream key above]',
    'Click Apply and OK': 'Click Apply and OK',
    'XSplit': 'XSplit',
    'Open XSplit Broadcaster': 'Open XSplit Broadcaster',
    'Click Broadcast → Add Channel': 'Click Broadcast → Add Channel',
    'Select Custom RTMP': 'Select Custom RTMP',
    'RTMP URL:': 'RTMP URL:',
    'Quick Test': 'Quick Test',
    'Use the test stream feature in your software to verify the connection before going live.': 'Use the test stream feature in your software to verify the connection before going live.',
    'Total Stream Time': 'Total Stream Time',
    'Average Viewers': 'Average Viewers',
    'Total Followers': 'Total Followers',
    'Monthly Growth': 'Monthly Growth',
    'Stream Tools': 'Stream Tools',
    'Helpful tools for managing your streams': 'Helpful tools for managing your streams',
    'Stream Health Monitor': 'Stream Health Monitor',
    'VOD Manager': 'VOD Manager',
    'Download Stream Archive': 'Download Stream Archive',
    'Stream Optimizer': 'Stream Optimizer',
    'API Integration': 'API Integration',
    'Integrate StreamVibe with your applications': 'Integrate StreamVibe with your applications',
    'API Endpoint': 'API Endpoint',
    'View API Documentation': 'View API Documentation',
    'Webhook Settings': 'Webhook Settings',
    'Advanced streaming platform with live encoding, auto-conversion and RTMP integration': 'Advanced streaming platform with live encoding, auto-conversion and RTMP integration',
    'Stream Configuration Updated': 'Stream Configuration Updated',
    'Your stream settings have been saved. You can now start streaming with OBS or your preferred software.': 'Your stream settings have been saved. You can now start streaming with OBS or your preferred software.',
    'Failed to update stream configuration': 'Failed to update stream configuration',
    'Copied!': 'Copied!',
    'copied to clipboard': 'copied to clipboard',
    'RTMP URL': 'RTMP URL',
    
    // Additional Streaming Software
    'vMix': 'vMix',
    'Streamlabs Mobile': 'Streamlabs Mobile',
    'Wirecast': 'Wirecast',
    'FFmpeg CLI': 'FFmpeg CLI',
    'Open vMix': 'Open vMix',
    'Go to Settings → Streaming': 'Go to Settings → Streaming',
    'Destination: Custom RTMP Server': 'Destination: Custom RTMP Server',
    'URL:': 'URL:',
    'Stream Name or Key: [Your stream key]': 'Stream Name or Key: [Your stream key]',
    'Click OK and Start Stream': 'Click OK and Start Stream',
    'Platform: Custom RTMP': 'Platform: Custom RTMP',
    'Server URL:': 'Server URL:',
    'Window → Output Settings': 'Window → Output Settings',
    'Destination: RTMP Server': 'Destination: RTMP Server',
    'Address:': 'Address:',
    'Stream: [Your stream key]': 'Stream: [Your stream key]',
    'Command line streaming:': 'Command line streaming:',
    'Replace [KEY] with your stream key': 'Replace [KEY] with your stream key',

    // RTMP Preview
    'creator.rtmp.preview.title': 'Stream Preview',
    'creator.rtmp.preview.connected': 'Connected',
    'creator.rtmp.preview.connecting': 'Connecting...',
    'creator.rtmp.preview.disconnected': 'Disconnected',
    'creator.rtmp.preview.noStream': 'No active stream found. Start streaming first.',
    'creator.rtmp.preview.notSupported': 'Your browser does not support video playback.',
    'creator.rtmp.preview.noPreview': 'No preview available',
    'creator.rtmp.preview.hide': 'Hide Preview',
    'creator.rtmp.preview.show': 'Show Preview',
    'creator.rtmp.preview.stop': 'Stop Stream',
    'creator.rtmp.preview.start': 'Start Stream',
    'creator.rtmp.preview.streaming': 'Streaming',
    'creator.rtmp.preview.offline': 'Offline',
    'creator.rtmp.preview.server': 'Server',
    'creator.rtmp.preview.key': 'Stream Key',
    'RTMP server is live and ready to receive your stream': 'RTMP server is live and ready to receive your stream',
    'RTMP server is ready. Start streaming to go live.': 'RTMP server is ready. Start streaming to go live.',
    'Connection Status': 'Connection Status',
    'Configure popular streaming applications with step-by-step guides': 'Configure popular streaming applications with step-by-step guides',
    'Embed': 'Embed',
    'Embed Configuration': 'Embed Configuration',
    'Preview': 'Preview',
  },
  es: {
    // Navigation
    'Home': 'Inicio',
    'Browse': 'Explorar',
    'Following': 'Siguiendo',
    'Categories': 'Categorías',
    'Creator Studio': 'Estudio de Creador',
    'Settings': 'Configuración',
    'Admin Panel': 'Panel de Admin',
    'Logout': 'Cerrar Sesión',
    'Profile': 'Perfil',
    'Sign In': 'Iniciar Sesión',
    'Sign Up': 'Registrarse',
    'Go Live': 'Transmitir',
    
    // Landing Page
    'Your Gateway to Live Entertainment': 'Tu Puerta de Entrada al Entretenimiento en Vivo',
    'Discover amazing streamers': 'Descubre streamers increíbles, conecta con comunidades y comparte tu pasión con el mundo.',
    'Why Choose StreamVibe?': '¿Por Qué Elegir StreamVibe?',
    'Everything you need': 'Todo lo que necesitas para la experiencia de streaming definitiva',
    'HD Streaming': 'Streaming HD',
    'Crystal clear video': 'Calidad de video cristalina con streaming de bitrate adaptativo',
    'Live Chat': 'Chat en Vivo',
    'Interactive real-time': 'Chat interactivo en tiempo real con herramientas de moderación',
    'Community': 'Comunidad',
    'Join thousands': 'Únete a miles de creadores y espectadores en todo el mundo',
    'Analytics': 'Analíticas',
    'Track your growth': 'Rastrea tu crecimiento con insights detallados y métricas',
    'Get Started Today': 'Comienza Hoy',
    'Join millions': 'Únete a millones de usuarios y comienza tu viaje de streaming',
    
    // Admin Panel
    'Admin Settings': 'Configuración de Admin',
    'Platform Settings': 'Configuración de Plataforma',
    'User Management': 'Gestión de Usuarios',
    'Reports & Analytics': 'Reportes y Analíticas',
    'System Logs': 'Registros del Sistema',
    'Refresh Data': 'Actualizar Datos',
    'Export PDF': 'Exportar PDF',
    'Live Analytics Dashboard': 'Panel de Analíticas en Vivo',
    'System Activity Logs': 'Registros de Actividad del Sistema',
    'User Activity Report': 'Reporte de Actividad de Usuario',
    
    // Common Actions
    'Save': 'Guardar',
    'Cancel': 'Cancelar',
    'Delete': 'Eliminar',
    'Edit': 'Editar',
    'Reset Password': 'Restablecer Contraseña',
    'Loading': 'Cargando',
    'Error': 'Error',
    'Success': 'Éxito',
    
    // Creator Studio - Advanced Features
    'Live Stream': 'Transmisión en Vivo',
    'Encoding': 'Codificación',
    'RTMP Setup': 'Configuración RTMP',
    'Tools': 'Herramientas',
    'Stream Status': 'Estado de Transmisión',
    'Status': 'Estado',
    'Live': 'En Vivo',
    'Offline': 'Desconectado',
    'Viewers': 'Espectadores',
    'Bitrate': 'Bitrate',
    'FPS': 'FPS',
    'Update Stream': 'Actualizar Transmisión',
    'Stream Configuration': 'Configuración de Transmisión',
    'Configure your stream settings and metadata': 'Configura los ajustes y metadatos de tu transmisión',
    'Stream Title': 'Título de Transmisión',
    'Enter your stream title...': 'Ingresa el título de tu transmisión...',
    'Select category': 'Seleccionar categoría',
    'Language': 'Idioma',
    'Description': 'Descripción',
    'Describe your stream...': 'Describe tu transmisión...',
    'Tags': 'Etiquetas',
    'gaming, tutorial, music (comma separated)': 'juegos, tutorial, música (separados por comas)',
    'Video Encoding': 'Codificación de Video',
    'Configure video quality and encoding settings': 'Configura la calidad de video y ajustes de codificación',
    'Resolution': 'Resolución',
    'Frame Rate': 'Tasa de Fotogramas',
    'Recommended: 3000-6000 for 1080p': 'Recomendado: 3000-6000 para 1080p',
    'Encoder': 'Codificador',
    'Auto-Conversion': 'Auto-Conversión',
    'Automatically convert streams to multiple formats': 'Convierte automáticamente las transmisiones a múltiples formatos',
    'Auto-Convert Enabled': 'Auto-Conversión Habilitada',
    'Automatically process streams for web playback': 'Procesa automáticamente las transmisiones para reproducción web',
    'HLS Output': 'Salida HLS',
    'HTTP Live Streaming for web browsers': 'HTTP Live Streaming para navegadores web',
    'DASH Output': 'Salida DASH',
    'Dynamic Adaptive Streaming over HTTP': 'Transmisión Adaptativa Dinámica sobre HTTP',
    'Auto-Conversion Benefits': 'Beneficios de la Auto-Conversión',
    'Multiple quality levels (adaptive bitrate)': 'Múltiples niveles de calidad (bitrate adaptativo)',
    'Cross-platform compatibility': 'Compatibilidad multiplataforma',
    'Reduced bandwidth usage': 'Uso reducido de ancho de banda',
    'Better viewer experience': 'Mejor experiencia del espectador',
    'RTMP Configuration': 'Configuración RTMP',
    'Connect your streaming software to our RTMP server': 'Conecta tu software de transmisión a nuestro servidor RTMP',
    'RTMP Server URL': 'URL del Servidor RTMP',
    'Stream Key': 'Clave de Transmisión',
    'Keep your stream key private. Don\'t share it with anyone.': 'Mantén tu clave de transmisión privada. No la compartas con nadie.',
    'Security Notice': 'Aviso de Seguridad',
    'Your stream key is like a password. Never share it publicly or include it in screenshots.': 'Tu clave de transmisión es como una contraseña. Nunca la compartas públicamente o la incluyas en capturas de pantalla.',
    'Streaming Software Setup': 'Configuración de Software de Transmisión',
    'Configure popular streaming applications': 'Configura aplicaciones de transmisión populares',
    'OBS Studio': 'OBS Studio',
    'Open OBS Studio': 'Abrir OBS Studio',
    'Go to Settings → Stream': 'Ir a Configuración → Transmisión',
    'Service: Custom': 'Servicio: Personalizado',
    'Server:': 'Servidor:',
    'Stream Key: [Your stream key above]': 'Clave de Transmisión: [Tu clave de transmisión de arriba]',
    'Click Apply and OK': 'Hacer clic en Aplicar y OK',
    'XSplit': 'XSplit',
    'Open XSplit Broadcaster': 'Abrir XSplit Broadcaster',
    'Click Broadcast → Add Channel': 'Hacer clic en Transmitir → Agregar Canal',
    'Select Custom RTMP': 'Seleccionar RTMP Personalizado',
    'RTMP URL:': 'URL RTMP:',
    'Quick Test': 'Prueba Rápida',
    'Use the test stream feature in your software to verify the connection before going live.': 'Usa la función de transmisión de prueba en tu software para verificar la conexión antes de transmitir en vivo.',
    'Total Stream Time': 'Tiempo Total de Transmisión',
    'Average Viewers': 'Espectadores Promedio',
    'Total Followers': 'Seguidores Totales',
    'Monthly Growth': 'Crecimiento Mensual',
    'Stream Tools': 'Herramientas de Transmisión',
    'Helpful tools for managing your streams': 'Herramientas útiles para gestionar tus transmisiones',
    'Stream Health Monitor': 'Monitor de Salud de Transmisión',
    'VOD Manager': 'Gestor de VOD',
    'Download Stream Archive': 'Descargar Archivo de Transmisión',
    'Stream Optimizer': 'Optimizador de Transmisión',
    'API Integration': 'Integración de API',
    'Integrate StreamVibe with your applications': 'Integra StreamVibe con tus aplicaciones',
    'API Endpoint': 'Endpoint de API',
    'View API Documentation': 'Ver Documentación de API',
    'Webhook Settings': 'Configuración de Webhooks',
    'Advanced streaming platform with live encoding, auto-conversion and RTMP integration': 'Plataforma de transmisión avanzada con codificación en vivo, auto-conversión e integración RTMP',
    'Stream Configuration Updated': 'Configuración de Transmisión Actualizada',
    'Your stream settings have been saved. You can now start streaming with OBS or your preferred software.': 'Tus configuraciones de transmisión se han guardado. Ahora puedes comenzar a transmitir con OBS o tu software preferido.',
    'Failed to update stream configuration': 'Error al actualizar la configuración de transmisión',
    'Copied!': '¡Copiado!',
    'copied to clipboard': 'copiado al portapapeles',
    'RTMP URL': 'URL RTMP',
    
    // Additional Streaming Software
    'vMix': 'vMix',
    'Streamlabs Mobile': 'Streamlabs Mobile',
    'Wirecast': 'Wirecast',
    'FFmpeg CLI': 'FFmpeg CLI',
    'Open vMix': 'Abrir vMix',
    'Go to Settings → Streaming': 'Ir a Configuración → Streaming',
    'Destination: Custom RTMP Server': 'Destino: Servidor RTMP Personalizado',
    'URL:': 'URL:',
    'Stream Name or Key: [Your stream key]': 'Nombre o Clave de Stream: [Tu clave de stream]',
    'Click OK and Start Stream': 'Hacer clic en OK e Iniciar Stream',
    'Platform: Custom RTMP': 'Plataforma: RTMP Personalizado',
    'Server URL:': 'URL del Servidor:',
    'Window → Output Settings': 'Ventana → Configuración de Salida',
    'Destination: RTMP Server': 'Destino: Servidor RTMP',
    'Address:': 'Dirección:',
    'Stream: [Your stream key]': 'Stream: [Tu clave de stream]',
    'Command line streaming:': 'Streaming por línea de comandos:',
    'Replace [KEY] with your stream key': 'Reemplaza [KEY] con tu clave de stream',
  },
  fr: {
    // Navigation
    'Home': 'Accueil',
    'Browse': 'Parcourir',
    'Following': 'Abonnements',
    'Categories': 'Catégories',
    'Creator Studio': 'Studio Créateur',
    'Settings': 'Paramètres',
    'Admin Panel': 'Panneau Admin',
    'Logout': 'Déconnexion',
    'Profile': 'Profil',
    'Sign In': 'Se Connecter',
    'Sign Up': 'S\'inscrire',
    'Go Live': 'Diffuser',
    
    // Landing Page
    'Your Gateway to Live Entertainment': 'Votre Passerelle vers le Divertissement en Direct',
    'Discover amazing streamers': 'Découvrez des streamers incroyables, connectez-vous avec des communautés et partagez votre passion avec le monde.',
    'Why Choose StreamVibe?': 'Pourquoi Choisir StreamVibe?',
    'Everything you need': 'Tout ce dont vous avez besoin pour l\'expérience de streaming ultime',
    'HD Streaming': 'Streaming HD',
    'Crystal clear video': 'Qualité vidéo cristalline avec streaming à débit adaptatif',
    'Live Chat': 'Chat en Direct',
    'Interactive real-time': 'Chat interactif en temps réel avec outils de modération',
    'Community': 'Communauté',
    'Join thousands': 'Rejoignez des milliers de créateurs et spectateurs dans le monde',
    'Analytics': 'Analytiques',
    'Track your growth': 'Suivez votre croissance avec des insights détaillés et des métriques',
    'Get Started Today': 'Commencez Aujourd\'hui',
    'Join millions': 'Rejoignez des millions d\'utilisateurs et commencez votre parcours de streaming',
    
    // Admin Panel
    'Admin Settings': 'Paramètres Admin',
    'Platform Settings': 'Paramètres de Plateforme',
    'User Management': 'Gestion des Utilisateurs',
    'Reports & Analytics': 'Rapports et Analytiques',
    'System Logs': 'Journaux Système',
    'Refresh Data': 'Actualiser les Données',
    'Export PDF': 'Exporter PDF',
    'Live Analytics Dashboard': 'Tableau de Bord Analytiques en Direct',
    'System Activity Logs': 'Journaux d\'Activité Système',
    'User Activity Report': 'Rapport d\'Activité Utilisateur',
    
    // Common Actions
    'Save': 'Enregistrer',
    'Cancel': 'Annuler',
    'Delete': 'Supprimer',
    'Edit': 'Modifier',
    'Reset Password': 'Réinitialiser le Mot de Passe',
    'Loading': 'Chargement',
    'Error': 'Erreur',
    'Success': 'Succès',
  },
  de: {
    // Navigation
    'Home': 'Startseite',
    'Browse': 'Durchsuchen',
    'Following': 'Folgende',
    'Categories': 'Kategorien',
    'Creator Studio': 'Creator Studio',
    'Settings': 'Einstellungen',
    'Admin Panel': 'Admin Panel',
    'Logout': 'Abmelden',
    'Profile': 'Profil',
    'Sign In': 'Anmelden',
    'Sign Up': 'Registrieren',
    'Go Live': 'Live Gehen',
    
    // Landing Page
    'Your Gateway to Live Entertainment': 'Ihr Tor zur Live-Unterhaltung',
    'Discover amazing streamers': 'Entdecken Sie erstaunliche Streamer, verbinden Sie sich mit Communities und teilen Sie Ihre Leidenschaft mit der Welt.',
    'Why Choose StreamVibe?': 'Warum StreamVibe Wählen?',
    'Everything you need': 'Alles was Sie für das ultimative Streaming-Erlebnis brauchen',
    'HD Streaming': 'HD Streaming',
    'Crystal clear video': 'Kristallklare Videoqualität mit adaptivem Bitrate-Streaming',
    'Live Chat': 'Live Chat',
    'Interactive real-time': 'Interaktiver Echtzeit-Chat mit Moderationstools',
    'Community': 'Gemeinschaft',
    'Join thousands': 'Schließen Sie sich Tausenden von Erstellern und Zuschauern weltweit an',
    'Analytics': 'Analytik',
    'Track your growth': 'Verfolgen Sie Ihr Wachstum mit detaillierten Insights und Metriken',
    'Get Started Today': 'Heute Beginnen',
    'Join millions': 'Schließen Sie sich Millionen von Nutzern an und beginnen Sie Ihre Streaming-Reise',
    
    // Admin Panel
    'Admin Settings': 'Admin Einstellungen',
    'Platform Settings': 'Plattform Einstellungen',
    'User Management': 'Benutzerverwaltung',
    'Reports & Analytics': 'Berichte & Analytik',
    'System Logs': 'System Protokolle',
    'Refresh Data': 'Daten Aktualisieren',
    'Export PDF': 'PDF Exportieren',
    'Live Analytics Dashboard': 'Live Analytik Dashboard',
    'System Activity Logs': 'System Aktivitätsprotokolle',
    'User Activity Report': 'Benutzeraktivitätsbericht',
    
    // Common Actions
    'Save': 'Speichern',
    'Cancel': 'Abbrechen',
    'Delete': 'Löschen',
    'Edit': 'Bearbeiten',
    'Reset Password': 'Passwort Zurücksetzen',
    'Loading': 'Lädt',
    'Error': 'Fehler',
    'Success': 'Erfolg',
  },
  pt: {
    // Navigation
    'Home': 'Início',
    'Browse': 'Explorar',
    'Following': 'Seguindo',
    'Categories': 'Categorias',
    'Creator Studio': 'Estúdio do Criador',
    'Settings': 'Configurações',
    'Admin Panel': 'Painel Admin',
    'Logout': 'Sair',
    'Profile': 'Perfil',
    'Sign In': 'Entrar',
    'Sign Up': 'Cadastrar',
    'Go Live': 'Transmitir',
    
    // Landing Page
    'Your Gateway to Live Entertainment': 'Sua Porta de Entrada para Entretenimento ao Vivo',
    'Discover amazing streamers': 'Descubra streamers incríveis, conecte-se com comunidades e compartilhe sua paixão com o mundo.',
    'Why Choose StreamVibe?': 'Por Que Escolher StreamVibe?',
    'Everything you need': 'Tudo que você precisa para a experiência de streaming definitiva',
    'HD Streaming': 'Streaming HD',
    'Crystal clear video': 'Qualidade de vídeo cristalina com streaming de bitrate adaptativo',
    'Live Chat': 'Chat ao Vivo',
    'Interactive real-time': 'Chat interativo em tempo real com ferramentas de moderação',
    'Community': 'Comunidade',
    'Join thousands': 'Junte-se a milhares de criadores e espectadores no mundo todo',
    'Analytics': 'Análise',
    'Track your growth': 'Acompanhe seu crescimento com insights detalhados e métricas',
    'Get Started Today': 'Comece Hoje',
    'Join millions': 'Junte-se a milhões de usuários e comece sua jornada de streaming',
    
    // Admin Panel
    'Admin Settings': 'Configurações Admin',
    'Platform Settings': 'Configurações da Plataforma',
    'User Management': 'Gerenciamento de Usuários',
    'Reports & Analytics': 'Relatórios e Análises',
    'System Logs': 'Logs do Sistema',
    'Refresh Data': 'Atualizar Dados',
    'Export PDF': 'Exportar PDF',
    'Live Analytics Dashboard': 'Painel de Análises ao Vivo',
    'System Activity Logs': 'Logs de Atividade do Sistema',
    'User Activity Report': 'Relatório de Atividade do Usuário',
    
    // Common Actions
    'Save': 'Salvar',
    'Cancel': 'Cancelar',
    'Delete': 'Excluir',
    'Edit': 'Editar',
    'Reset Password': 'Redefinir Senha',
    'Loading': 'Carregando',
    'Error': 'Erro',
    'Success': 'Sucesso',
  },
  zh: {
    // Navigation
    'Home': '首页',
    'Browse': '浏览',
    'Following': '关注',
    'Categories': '分类',
    'Creator Studio': '创作者工作室',
    'Settings': '设置',
    'Admin Panel': '管理面板',
    'Logout': '登出',
    'Profile': '个人资料',
    'Sign In': '登录',
    'Sign Up': '注册',
    'Go Live': '开始直播',
    
    // Landing Page
    'Your Gateway to Live Entertainment': '您的实时娱乐门户',
    'Discover amazing streamers': '发现优秀的主播，与社区互动，与世界分享您的热情。',
    'Why Choose StreamVibe?': '为什么选择StreamVibe？',
    'Everything you need': '您需要的一切，获得终极流媒体体验',
    'HD Streaming': '高清直播',
    'Crystal clear video': '具有自适应比特率流的晶莹清晰视频质量',
    'Live Chat': '实时聊天',
    'Interactive real-time': '具有审核工具的交互式实时聊天',
    'Community': '社区',
    'Join thousands': '加入全球数千名创作者和观众',
    'Analytics': '分析',
    'Track your growth': '通过详细的洞察和指标跟踪您的增长',
    'Get Started Today': '立即开始',
    'Join millions': '加入数百万用户，开始您的流媒体之旅',
    
    // Admin Panel
    'Admin Settings': '管理员设置',
    'Platform Settings': '平台设置',
    'User Management': '用户管理',
    'Reports & Analytics': '报告和分析',
    'System Logs': '系统日志',
    'Refresh Data': '刷新数据',
    'Export PDF': '导出PDF',
    'Live Analytics Dashboard': '实时分析仪表板',
    'System Activity Logs': '系统活动日志',
    'User Activity Report': '用户活动报告',
    
    // Common Actions
    'Save': '保存',
    'Cancel': '取消',
    'Delete': '删除',
    'Edit': '编辑',
    'Reset Password': '重置密码',
    'Loading': '加载中',
    'Error': '错误',
    'Success': '成功',
  },
};

interface TranslationContextType {
  t: (key: string) => string;
  currentLanguage: string;
  changeLanguage: (languageCode: string) => void;
}

const TranslationContext = createContext<TranslationContextType | null>(null);

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('streamvibe-language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  const changeLanguage = (languageCode: string) => {
    setCurrentLanguage(languageCode);
    localStorage.setItem('streamvibe-language', languageCode);
  };

  const t = (key: string): string => {
    const translation = translations[currentLanguage as keyof typeof translations];
    return translation?.[key as keyof typeof translation] || key;
  };

  return (
    <TranslationContext.Provider value={{ t, currentLanguage, changeLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}