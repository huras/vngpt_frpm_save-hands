class BaseService {
  constructor(model, includes = []) {
    this.model = model;
    this.includes = includes;
  }

  async findAll(query = {}, includeAdditional = []) {
    return this.model.findAll({
      where: query,
      include: [...this.includes, ...includeAdditional],
    });
  }

  async findById(id, includeAdditional = []) {
    const item = await this.model.findByPk(id, {
      include: [...this.includes, ...includeAdditional],
    });
    if (!item) throw new Error(`Item with ID ${id} not found.`);
    return item;
  }

  async create(data) {
    return this.model.create(data);
  }

  async update(id, data) {
    const item = await this.findById(id);
    return item.update(data);
  }

  async delete(id) {
    const item = await this.findById(id);
    return item.destroy();
  }
}

module.exports = BaseService;
