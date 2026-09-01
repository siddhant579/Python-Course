const ApiError = require('../utils/ApiError');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// Generic CRUD builder shared by every content controller (Week/Topic/Lesson/...)
// so create/update/delete/publish/reorder aren't reimplemented per model.
function crudFactory(Model, { populate = [] } = {}) {
  const getAll = asyncHandler(async (req, res) => {
    const filter = { ...req.crudFilter };
    let query = Model.find(filter).sort({ order: 1, createdAt: 1 });
    populate.forEach((p) => { query = query.populate(p); });
    const docs = await query;
    return success(res, docs);
  });

  const getOne = asyncHandler(async (req, res) => {
    let query = Model.findById(req.params.id);
    populate.forEach((p) => { query = query.populate(p); });
    const doc = await query;
    if (!doc) throw new ApiError(`${Model.modelName} not found`, 404);
    return success(res, doc);
  });

  const create = asyncHandler(async (req, res) => {
    const doc = await Model.create(req.body);
    return success(res, doc, 201);
  });

  const update = asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) throw new ApiError(`${Model.modelName} not found`, 404);
    return success(res, doc);
  });

  const remove = asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) throw new ApiError(`${Model.modelName} not found`, 404);
    return success(res, { deleted: true });
  });

  const setPublished = (isPublished) =>
    asyncHandler(async (req, res) => {
      const doc = await Model.findByIdAndUpdate(
        req.params.id,
        { isPublished },
        { new: true }
      );
      if (!doc) throw new ApiError(`${Model.modelName} not found`, 404);
      return success(res, doc);
    });

  const reorder = asyncHandler(async (req, res) => {
    const { items } = req.body; // [{ id, order }]
    if (!Array.isArray(items)) throw new ApiError('items array is required', 400);
    await Promise.all(
      items.map((it) => Model.findByIdAndUpdate(it.id, { order: it.order }))
    );
    return success(res, { reordered: true });
  });

  return { getAll, getOne, create, update, remove, publish: setPublished(true), unpublish: setPublished(false), reorder };
}

module.exports = crudFactory;
