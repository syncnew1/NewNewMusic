const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// 确保上传目录存在
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// 生成唯一文件名
const generateFileName = (originalName) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const ext = path.extname(originalName);
  return `${timestamp}_${randomString}${ext}`;
};

// 音频文件存储配置
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/audio');
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, generateFileName(file.originalname));
  }
});

// 封面图片存储配置
const coverStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/covers');
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, generateFileName(file.originalname));
  }
});

// 头像存储配置
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/avatars');
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, generateFileName(file.originalname));
  }
});

// 文件过滤器
const audioFileFilter = (req, file, cb) => {
  const allowedMimes = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/flac',
    'audio/aac',
    'audio/ogg'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('只支持音频文件格式: MP3, WAV, FLAC, AAC, OGG'), false);
  }
};

const imageFileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('只支持图片文件格式: JPEG, JPG, PNG, WEBP'), false);
  }
};

// 文件大小限制
const limits = {
  audio: { fileSize: 50 * 1024 * 1024 }, // 50MB
  image: { fileSize: 5 * 1024 * 1024 }   // 5MB
};

// 创建上传中间件
const uploadAudio = multer({
  storage: audioStorage,
  fileFilter: audioFileFilter,
  limits: limits.audio
});

const uploadCover = multer({
  storage: coverStorage,
  fileFilter: imageFileFilter,
  limits: limits.image
});

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFileFilter,
  limits: limits.image
});

// 组合上传中间件（用于歌曲上传，同时处理音频和封面）
const uploadSong = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      let uploadPath;
      if (file.fieldname === 'audio') {
        uploadPath = path.join(__dirname, '../../uploads/audio');
      } else if (file.fieldname === 'cover') {
        uploadPath = path.join(__dirname, '../../uploads/covers');
      }
      ensureDirectoryExists(uploadPath);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      cb(null, generateFileName(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'audio') {
      audioFileFilter(req, file, cb);
    } else if (file.fieldname === 'cover') {
      imageFileFilter(req, file, cb);
    } else {
      cb(new Error('未知的文件字段'), false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 最大文件大小
    files: 2 // 最多2个文件
  }
});

// 删除文件的工具函数
const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    if (!filePath || !fs.existsSync(filePath)) {
      resolve();
      return;
    }
    
    fs.unlink(filePath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// 获取文件完整路径
const getFilePath = (filename, type) => {
  if (!filename) return null;
  
  const baseDir = path.join(__dirname, '../../uploads');
  switch (type) {
    case 'audio':
      return path.join(baseDir, 'audio', filename);
    case 'cover':
    case 'image':
      return path.join(baseDir, 'covers', filename);
    case 'avatar':
      return path.join(baseDir, 'avatars', filename);
    default:
      return null;
  }
};

// 获取文件URL
const getFileUrl = (filename, type) => {
  if (!filename) return null;
  
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  switch (type) {
    case 'audio':
      return `${baseUrl}/uploads/audio/${filename}`;
    case 'cover':
    case 'image':
      return `${baseUrl}/uploads/covers/${filename}`;
    case 'avatar':
      return `${baseUrl}/uploads/avatars/${filename}`;
    default:
      return null;
  }
};

module.exports = {
  uploadAudio,
  uploadCover,
  uploadAvatar,
  uploadSong,
  deleteFile,
  getFilePath,
  getFileUrl,
  generateFileName
};