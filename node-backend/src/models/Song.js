const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Song title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  artist: [{
    type: String,
    required: [true, 'At least one artist is required'],
    trim: true,
    maxlength: [100, 'Artist name cannot exceed 100 characters']
  }],
  album: {
    type: String,
    trim: true,
    maxlength: [200, 'Album name cannot exceed 200 characters']
  },
  genre: {
    type: String,
    trim: true,
    maxlength: [50, 'Genre cannot exceed 50 characters']
  },
  duration: {
    type: Number,
    required: [true, 'Song duration is required'],
    min: [1, 'Duration must be at least 1 second']
  },
  filePath: {
    type: String,
    required: [true, 'File path is required']
  },
  coverImage: {
    type: String,
    default: ''
  },
  releaseDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Get song response format
songSchema.methods.toResponse = function() {
  const song = this.toObject();
  return {
    id: song.id,
    title: song.title,
    artist: song.artist,
    album: song.album,
    genre: song.genre,
    duration: song.duration,
    filePath: song.filePath,
    coverImage: song.coverImage,
    releaseDate: song.releaseDate
  };
};

// Indexes for better search performance
songSchema.index({ title: 'text', artist: 'text', album: 'text' });
songSchema.index({ genre: 1 });
songSchema.index({ artist: 1 });
songSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Song', songSchema);