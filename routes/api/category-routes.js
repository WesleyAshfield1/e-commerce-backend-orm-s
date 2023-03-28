const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [
        {
          model: Product,
          as: 'products' 
        }
      ]
    });

    res.json(categories);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [
        {
          model: Product,
          as: 'products' 
        }
      ]
    });

    res.json(category);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.post('/', (req, res) => {
  // create a new category
  Category.create({
    category_name: req.body.category_name 
  })
  .then(category => {
    res.status(200).json(category);
  })
  .catch(err => {
    console.log(err);
    res.status(500).json(err);
  });
});

router.put('/:id', (req, res) => {
  const categoryId = req.params.id;

  Category.update(req.body, {
    where: {
      id: categoryId
    }
  })
  .then((updatedCategory) => {
    if (updatedCategory[0] === 0) {
      res.status(404).json({ message: 'Category not found' });
    } else {
      
      res.status(200).json({ message: 'Category updated successfully' });
    }
  })
  .catch((err) => {
    console.log(err);
    res.status(500).json({ message: 'Server error' });
  });
});

router.delete('/:id', (req, res) => {
  Category.destroy({
    where: {
      id: req.params.id
    }
  })
  .then (() => {
    console.log('Item has been deleted from Categories')
    res.status(204);
  })
  .catch (err => {
    console.error(err)
    res.status(500).json(err)
  });
});

module.exports = router;