const BaseService = require('./BaseService');
const { Model, Gallery, Picture, GalleryCategory } = require('../models');

class ModelService extends BaseService {
  constructor() {
    super(Model, [
      { model: Gallery, as: 'galleries', include: [{ model: Picture, as: 'pictures' }] },
      { model: GalleryCategory, as: 'categories' },
    ]);
  }

  async addCategory(modelId, categoryId) {
    const model = await this.findById(modelId);
    const category = await GalleryCategory.findByPk(categoryId);
    if (!category) throw new Error('Category not found.');
    const associated = await model.hasCategory(category);
    if (associated) return model;
    await model.addCategory(category);
    return this.findById(modelId);
  }

  async removeCategory(modelId, categoryId) {
    const model = await this.findById(modelId);
    const category = await GalleryCategory.findByPk(categoryId);
    if (!category) throw new Error('Category not found.');
    await model.removeCategory(category);
    return this.findById(modelId);
  }

  async addGallery(modelId, galleryId) {
    const model = await this.findById(modelId);
    const gallery = await Gallery.findByPk(galleryId);
    if (!gallery) throw new Error('Gallery not found.');
    const associated = await model.hasGallery(gallery);
    if (associated) return model;
    await model.addGallery(gallery);
    return this.findById(modelId);
  }

  async findAllPaginated(filters, paginationArgs) {
    const { page, perPage } = paginationArgs;
    const { offset, limit } = this.getPagination(page, perPage);

    const paginatedModels = await this.model.findAndCountAll({
      where: filters,
      offset,
      limit,
      include: this.includes,
    });

    const totalItems = paginatedModels.count;
    const totalPages = Math.ceil(totalItems / perPage);

    return {
      data: paginatedModels.rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
      },
    };
  }
}

module.exports = new ModelService();
