
const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)

module.exports.trailsSchema = Joi.object({
    trail: Joi.object({
      title: Joi.string().min(3).required().escapeHTML(),
      // image: Joi.string(),
      difficulty: Joi.number().min(1).max(5).required(),
      description: Joi.string().min(8).required().escapeHTML(),
      location: Joi.string().min(2).required().escapeHTML()
    }).required(),
    deleteImages: Joi.array()
});

module.exports.commentSchema = Joi.object({
    comment: Joi.object({
      body: Joi.string().min(4).required().escapeHTML(),
      rating: Joi.number().min(1).max(5).required()
    }).required()
});