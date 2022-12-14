import { User } from '@src/models/user';
import AuthService from '@src/services/Auth';

describe('Users test functional', () => {
  beforeEach(async () => await User.deleteMany({}));
  describe('When create a new user', () => {
    it('Should successfully create a new user with encrypted password', async () => {
      const newUser = {
        name: 'John doe',
        email: 'john@mail.com',
        password: '1234',
      };

      const response = await global.testRequest.post('/users').send(newUser);

      expect(response.status).toBe(201);
      await expect(
        AuthService.comparePasswords(newUser.password, response.body.password)
      ).resolves.toBeTruthy();
      expect(response.body).toEqual(
        expect.objectContaining({
          ...newUser,
          ...{ password: expect.any(String) },
        })
      );
    });
  });

  it('Should return 422 when there is a validation error', async () => {
    const newUser = {
      email: 'john@mail.com',
      password: '1234',
    };
    const response = await global.testRequest.post('/users').send(newUser);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      code: 422,
      error: 'User validation failed: name: Path `name` is required.',
    });
  });

  it('should return 409 when email already exist', async () => {
    const newUser = {
      name: 'John Doe',
      email: 'john@mail.com',
      password: '1234',
    };
    await global.testRequest.post('/users').send(newUser);
    const response = await global.testRequest.post('/users').send(newUser);

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      code: 409,
      error: 'User validation failed: email: already exists in the database.',
    });
  });
});
