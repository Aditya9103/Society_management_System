import { jest } from '@jest/globals';
import request from 'supertest';
import { OTP_CONFIG } from '../src/config/constants.js';

// Mock the auth service BEFORE importing app
jest.unstable_mockModule('../src/modules/auth/auth.service.js', () => ({
  sendOtp: jest.fn(),
  verifyOtp: jest.fn(),
  loginWithPassword: jest.fn(),
}));

const authService = await import('../src/modules/auth/auth.service.js');
const app = (await import('../src/app.js')).default;

describe('Auth Controller (Integration)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/otp/send', () => {
    it('should successfully send an OTP', async () => {
      authService.sendOtp.mockResolvedValue();

      const res = await request(app)
        .post('/api/v1/auth/otp/send')
        .send({
          email: 'test@example.com',
          purpose: OTP_CONFIG.PURPOSES.LOGIN,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/OTP sent successfully/);
      expect(authService.sendOtp).toHaveBeenCalledWith('test@example.com', OTP_CONFIG.PURPOSES.LOGIN);
    });

    it('should fail validation with invalid email address', async () => {
      const res = await request(app)
        .post('/api/v1/auth/otp/send')
        .send({
          email: 'invalid-email', // Invalid email
          purpose: OTP_CONFIG.PURPOSES.LOGIN,
        });

      expect(res.statusCode).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('VALIDATION_ERROR');
      expect(authService.sendOtp).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/auth/otp/verify', () => {
    it('should successfully verify an OTP', async () => {
      authService.verifyOtp.mockResolvedValue();

      const res = await request(app)
        .post('/api/v1/auth/otp/verify')
        .send({
          email: 'test@example.com',
          otp: '123456',
          purpose: OTP_CONFIG.PURPOSES.REGISTER,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.verified).toBe(true);
      expect(authService.verifyOtp).toHaveBeenCalledWith('test@example.com', '123456', OTP_CONFIG.PURPOSES.REGISTER);
    });
  });

  describe('POST /api/v1/auth/login/password', () => {
    it('should login successfully with password and return tokens', async () => {
      const mockUser = { _id: 'user123', firstName: 'John', role: 'RESIDENT' };
      authService.loginWithPassword.mockResolvedValue({
        accessToken: 'access_token_mock',
        refreshToken: 'refresh_token_mock',
        user: mockUser,
      });

      const res = await request(app)
        .post('/api/v1/auth/login/password')
        .send({
          identifier: 'test@example.com',
          password: 'Password@123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBe('access_token_mock');
      expect(res.body.data.user.firstName).toBe('John');
      expect(authService.loginWithPassword).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return 401 if no token is provided', async () => {
      const res = await request(app).get('/api/v1/auth/me');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('UNAUTHORIZED');
    });
  });
});
