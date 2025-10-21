export function getDatabaseConfig() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined');
  }

  // Para Railway, agregar parámetros de conexión limitada
  if (databaseUrl.includes('railway.app') || process.env.NODE_ENV === 'production') {
    const url = new URL(databaseUrl);
    
    // Configurar parámetros de conexión para Railway
    url.searchParams.set('connection_limit', '3');
    url.searchParams.set('pool_timeout', '20');
    url.searchParams.set('connect_timeout', '60');
    url.searchParams.set('socket_timeout', '60');
    
    return {
      url: url.toString(),
      // Configuración adicional para Railway
      connectionLimit: 3,
      poolTimeout: 20000,
      connectTimeout: 60000,
    };
  }

  return {
    url: databaseUrl,
    connectionLimit: 10,
    poolTimeout: 20000,
    connectTimeout: 60000,
  };
}
