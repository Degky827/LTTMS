const express = require('express');
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus
} = require('../controllers/categoryController');

const router = express.Router();
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  categoryQuerySchema,
  createCategorySchema,
  updateCategorySchema
} = require('../validation/categorySchemas');

/**
 * @openapi
 * /categories:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Discover and list tourism categories and subcategories
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema: { type: string, enum: ['true', 'false'] }
 *       - in: query
 *         name: parent
 *         schema: { type: string }
 *       - in: query
 *         name: tree
 *         schema: { type: string, enum: ['true', 'false'] }
 *     responses:
 *       200:
 *         description: List or hierarchical tree of tourism categories
 *   post:
 *     tags:
 *       - Categories
 *     summary: Create new category or subcategory (Admin only)
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, example: 'Boat Tours' }
 *               description: { type: string, example: 'Lake Tana boat charters and monastery cruises' }
 *               icon: { type: string, example: 'boat' }
 *               parentCategory: { type: string, nullable: true }
 *     responses:
 *       201:
 *         description: Category created
 *       400:
 *         description: Duplicate name or invalid parent
 */
router
  .route('/')
  .get(optionalAuth, validate(categoryQuerySchema), getCategories)
  .post(protect, authorize('admin', 'super_admin'), validate(createCategorySchema), createCategory);

/**
 * @openapi
 * /categories/{id}:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Get single category details with subcategories
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Category details with populated subcategories
 *       404:
 *         description: Category not found
 *   patch:
 *     tags:
 *       - Categories
 *     summary: Update category information (Admin only)
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Category updated
 *       400:
 *         description: Circular category relationship detected or validation error
 *   delete:
 *     tags:
 *       - Categories
 *     summary: Delete category (Safe deletion rules)
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Category deleted
 *       400:
 *         description: Cannot delete category if subcategories or services reference it
 */
router
  .route('/:id')
  .get(getCategory)
  .patch(protect, authorize('admin', 'super_admin'), validate(updateCategorySchema), updateCategory)
  .delete(protect, authorize('admin', 'super_admin'), deleteCategory);

/**
 * @openapi
 * /categories/{id}/status:
 *   patch:
 *     tags:
 *       - Categories
 *     summary: Toggle category active status (Admin only)
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Category status toggled
 */
router.patch('/:id/status', protect, authorize('admin', 'super_admin'), toggleCategoryStatus);

module.exports = router;
