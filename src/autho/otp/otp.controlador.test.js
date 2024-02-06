const { conMysql, closeConnection } = require('../../DB/mysql');
const { verifyOTP, sendOTP } = require('./controlador');
const nodemailer = require('nodemailer');
const { hashData, verificarHashedData } = require('../index');



//  "mock" de las dependencias
jest.mock('../../DB/mysql',() => ({
  findOTPByEmail: jest.fn(),
  agregar: jest.fn(),
  deleteOTPByEmail: jest.fn().mockResolvedValue(), // Agrega esto si deleteOTPByEmail es una promesa
  closeConnection: jest.fn(), 
}));
jest.mock('../index', () => ({
  hashData: jest.fn(),
  verificarHashedData: jest.fn(),
}));
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({}),
    verify: jest.fn().mockResolvedValue({}),
  }),
}));
const db = require('../../DB/mysql'); //  importamo el mock de la base de datos

describe('verifyOTP', () => {
  beforeEach(() => {
    // Reseteamos los mocks antes de cada prueba
    db.findOTPByEmail.mockReset();
    verificarHashedData.mockReset();
  });

  it('debería validar un OTP correcto', async () => {
    // Configuro los mocks para esta prueba
    const fakeOTP = '1234';
    const hashedOTP = await hashData(fakeOTP);
    db.findOTPByEmail.mockResolvedValue({ otp: hashedOTP, expiresAt: new Date(Date.now() + 10000) }); // 10 segundos en el futuro
    verificarHashedData.mockResolvedValue(true);

    // Ejecuto la función a probar
    const result = await verifyOTP('test@example.com', fakeOTP);

    // Verifo los resultados esperados
    expect(result).toBe(true);
    expect(db.findOTPByEmail).toHaveBeenCalledWith('test@example.com');
    expect(verificarHashedData).toHaveBeenCalledWith(fakeOTP, hashedOTP);
  });

  it('debería lanzar un error si el OTP ha expirado', async () => {
    // Configuro los mocks para simular un OTP expirado
    const expiredOTP = '1234';
    const hashedOTP = await hashData(expiredOTP);
    db.findOTPByEmail.mockResolvedValue({ otp: hashedOTP, expiresAt: new Date(Date.now() - 10000) }); // 10 segundos en el pasado

    // Verifico que la función lance un error
    await expect(verifyOTP('test@example.com', expiredOTP)).rejects.toThrow('Codigo expirado, solicite otro');
  });


});
afterAll(() => {
    // Cierra la conexión a la base de datos después de todas las pruebas
    db.closeConnection(); 
  });