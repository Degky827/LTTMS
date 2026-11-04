const Category = require('../models/Category');
const Service = require('../models/Service');
const logger = require('../utils/logger');

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Checks if targetParentId is a descendant of categoryId to prevent circular loops
 */
const wouldCreateCircularLoop = async (categoryId, candidateParentId) => {
  if (!candidateParentId) return false;
  if (categoryId.toString() === candidateParentId.toString()) return true;

  let current = await Category.findById(candidateParentId);
  const visited = new Set([categoryId.toString()]);

  while (current && current.parentCategory) {
    const parentIdStr = current.parentCategory.toString();
    if (visited.has(parentIdStr)) {
      return true; // Cycle detected
    }
    visited.add(parentIdStr);
    current = await Category.findById(current.parentCategory);
  }

  return false;
};

// @desc    Get all categories (flat or tree view)
// @route   GET /api/v1/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const filter = {};
    const isAdmin = req.user && ['admin', 'super_admin'].includes(req.user.role);

    if (!isAdmin) {
      filter.isActive = true;
    } else if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    if (req.query.parent === 'null') {
      filter.parentCategory = null;
    } else if (req.query.parent) {
      filter.parentCategory = req.query.parent;
    }

    const categories = await Category.find(filter)
      .sort({ displayOrder: 1, name: 1 })
      .populate('parentCategory', 'name slug');

    if (req.query.tree === 'true') {
      // Build hierarchical tree structure: root categories with their subcategories array
      const allCategories = await Category.find(isAdmin ? {} : { isActive: true })
        .sort({ displayOrder: 1, name: 1 })
        .lean();

      const roots = allCategories.filter((c) => !c.parentCategory);
      const tree = roots.map((root) => ({
        ...root,
        subcategories: allCategories.filter(
          (c) => c.parentCategory && c.parentCategory.toString() === root._id.toString()
        )
      }));

      return res.status(200).json({
        success: true,
        count: tree.length,
        data: tree
      });
    }

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get single category by id or slug
// @route   GET /api/v1/categories/:id
// @access  Public
exports.getCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);

    const category = isObjectId
      ? await Category.findById(id).populate('parentCategory', 'name slug')
      : await Category.findOne({ slug: id.toLowerCase() }).populate('parentCategory', 'name slug');

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const subcategories = await Category.find({
      parentCategory: category._id,
      isActive: true
    }).sort({ displayOrder: 1, name: 1 });

    res.status(200).json({
      success: true,
      data: {
        ...category.toObject(),
        subcategories
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Create category or subcategory
// @route   POST /api/v1/categories
// @access  Private (Admin, Super Admin)
exports.createCategory = async (req, res, next) => {
  try {
    const payload = { ...req.body };

    if (!payload.slug) {
      payload.slug = slugify(payload.name);
    } else {
      payload.slug = slugify(payload.slug);
    }

    const existing = await Category.findOne({
      $or: [{ name: payload.name }, { slug: payload.slug }]
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A category with this name or slug already exists'
      });
    }

    if (payload.parentCategory) {
      const parent = await Category.findById(payload.parentCategory);
      if (!parent) {
        return res.status(400).json({ success: false, message: 'Parent category not found' });
      }
    }

    const category = await Category.create(payload);

    logger.info({
      action: 'category.create',
      categoryId: category._id,
      name: category.name,
      adminId: req.user._id
    }, 'Category created by admin');

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update category
// @route   PATCH /api/v1/categories/:id
// @access  Private (Admin, Super Admin)
exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    let category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const payload = { ...req.body };

    if (payload.slug) {
      payload.slug = slugify(payload.slug);
      const conflict = await Category.findOne({
        slug: payload.slug,
        _id: { $ne: category._id }
      });
      if (conflict) {
        return res.status(400).json({ success: false, message: 'Category slug already in use' });
      }
    }

    // Check for circular relationship
    if (payload.parentCategory !== undefined) {
      if (payload.parentCategory) {
        const isCircular = await wouldCreateCircularLoop(category._id, payload.parentCategory);
        if (isCircular) {
          return res.status(400).json({
            success: false,
            message: 'Invalid parent category: would create a circular reference',
            code: 'CIRCULAR_CATEGORY_RELATIONSHIP'
          });
        }
      }
    }

    category = await Category.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true
    });

    logger.info({
      action: 'category.update',
      categoryId: category._id,
      adminId: req.user._id
    }, 'Category updated by admin');

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete category (safe deletion rules)
// @route   DELETE /api/v1/categories/:id
// @access  Private (Admin, Super Admin)
exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Rule 1: Check for subcategories
    const childCategoriesCount = await Category.countDocuments({
      parentCategory: category._id
    });

    if (childCategoriesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category: ${childCategoriesCount} subcategory(ies) belong to this category. Delete or reassign subcategories first.`,
        code: 'CATEGORY_HAS_CHILDREN'
      });
    }

    // Rule 2: Check for active tourism services referencing this category
    const servicesCount = await Service.countDocuments({
      $or: [
        { categoryRef: category._id },
        { subcategory: category._id },
        { category: category.slug }
      ]
    });

    if (servicesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category: ${servicesCount} tourism service(s) currently reference this category.`,
        code: 'CATEGORY_IN_USE'
      });
    }

    await category.deleteOne();

    logger.info({
      action: 'category.delete',
      categoryId: id,
      adminId: req.user._id
    }, 'Category safely deleted');

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
      data: {}
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Toggle category active status
// @route   PATCH /api/v1/categories/:id/status
// @access  Private (Admin, Super Admin)
exports.toggleCategoryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    category.isActive = req.body.isActive !== undefined ? Boolean(req.body.isActive) : !category.isActive;
    await category.save();

    res.status(200).json({
      success: true,
      message: `Category ${category.isActive ? 'activated' : 'deactivated'}`,
      data: category
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
