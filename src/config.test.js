const config = require('./config'); // Asegúrate de que la ruta sea correcta

describe('Configuración', () => {
  it('debería cargar la configuración correctamente desde las variables de entorno', () => {
    // Verifica que los valores de configuración coincidan con las variables de entorno
    expect(config.app.port).toBe(process.env.PORT || 4000);
    expect(config.jwt.secret).toBe(process.env.JET_SECRET || 'notasecreta!');
    expect(config.mysql.host).toBe(process.env.MYSQL_HOST || 'localhost');
    expect(config.mysql.user).toBe(process.env.MYSQL_USER || 'root');
    expect(config.mysql.password).toBe(process.env.MYSQL_PASSWORD || '');
    expect(config.mysql.database).toBe(process.env.MYSQL_DB || 'plataforma_universidad');
  });

  // Puedes agregar más pruebas para casos específicos, como cuando no se proporciona una variable de entorno.
});
