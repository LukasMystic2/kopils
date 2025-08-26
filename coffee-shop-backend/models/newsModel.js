const mongoose = require('mongoose');
const slugify = require('slugify');

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  isTopNews: { type: Boolean, default: false },
  thumbnailUrl: { type: String },
  author: { type: String, required: true }, 
  lastUpdatedBy: { type: String }, 
}, { timestamps: true }); 

newsSchema.pre('validate', function(next) {
  if (this.title && this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

const News = mongoose.model('News', newsSchema);
module.exports = News;
