const request = require('supertest');
const app = require('../app.js');

describe('GET /admin/', () => {
  it('should return 200 OK', (done) => {
    request(app)
      .get('/admin/')
      .expect(200, done());
  });
});

describe('GET /admin/login', () => {
  it('should return 200 OK', (done) => {
    request(app)
      .get('/admin/login')
      .expect(200, done());
  });
});

describe('GET /admin/signup', () => {
  it('should return 200 OK', (done) => {
    request(app)
      .get('/admin/signup')
      .expect(200, done());
  });
});

describe('GET /admin/api', () => {
  it('should return 200 OK', (done) => {
    request(app)
      .get('/admin/api')
      .expect(200, done());
  });
});

describe('GET /admin/contact', () => {
  it('should return 200 OK', (done) => {
    request(app)
      .get('/admin/contact')
      .expect(200, done());
  });
});

describe('GET /admin/random-url', () => {
  it('should return 404', (done) => {
    request(app)
      .get('/admin/reset')
      .expect(404, done());
  });
});
