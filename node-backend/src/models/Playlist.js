const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Playlist name is required'],
    trim: true,
    minlength: [1, 'Playlist name cannot be empty'],
    maxlength: [100, 'Playlist name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner ID is required']
  },
  songs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song'
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }]
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

// Get playlist response format
playlistSchema.methods.toResponse = function(ownerName = '') {
  const playlist = this.toObject();
  return {
    id: playlist.id,
    name: playlist.name,
    description: playlist.description,
    ownerId: playlist.ownerId,
    ownerName: ownerName,
    songs: playlist.songs || [],
    isPublic: playlist.isPublic,
    tags: playlist.tags || [],
    createdAt: playlist.createdAt,
    updatedAt: playlist.updatedAt
  };
};

// Indexes for better performance
playlistSchema.index({ ownerId: 1 });
playlistSchema.index({ isPublic: 1 });
playlistSchema.index({ name: 'text', description: 'text' });
playlistSchema.index({ tags: 1 });
playlistSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Playlist', playlistSchema);