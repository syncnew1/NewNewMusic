// 测试环境设置
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-for-testing-only';
process.env.MONGODB_URI = 'mongodb://localhost:27017/newnewmusic_test';
process.env.PORT = '3001';
process.env.HOST = 'localhost';

// 设置测试超时
jest.setTimeout(10000);

// 全局测试钩子
beforeAll(async () => {
  // 测试开始前的全局设置
});

afterAll(async () => {
  // 测试结束后的全局清理
});

beforeEach(() => {
  // 每个测试前的设置
});

afterEach(() => {
  // 每个测试后的清理
});