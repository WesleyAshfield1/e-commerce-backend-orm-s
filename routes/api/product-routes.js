const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  // find all products
  try {
    const products = await Product.findAll({
      include: [
        {
          model: Category,
          as: 'category' 
        },
        {
          model: Tag,
          through: ProductTag,
          as: 'tags'
        }
      ]
    });

    res.json(products);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
  
});

// get one product
router.get('/:id', async (req, res) => {
  // find a single product by its `id`
  try {
    const products = await Product.findByPk(req.params.id, {
      include: [
        {
          model: Category,
          as: 'category' 
        },
        {
          model: Tag,
          through: ProductTag,
          as: 'tags'
        }
      ]
    });

    res.json(products);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
  
});

// create new product
router.post('/', (req, res) => {
  
  Product.create(req.body)
    .then((product) => {
      
      if (req.body.tagIds && req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr)
          .then(() => res.status(200).json(product))
          .catch((err) => {
            console.log(err);
            res.status(400).json(err);
          });
      } else {
        
        res.status(200).json(product);
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put('/:id', (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then(() => {
      
      return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    .then((productTags) => {
      
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
      
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

     
      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      res.status(400).json(err);
    });
});

router.delete('/:id', (req, res) => {
  // delete one product by its `id` value
  Product.destroy({
    where: {
      id: req.params.id
    }
  })
  .then (() => {
    console.log('Item has been deleted from Products')
    res.status(204);
  })
  .catch (err => {
    console.error(err)
    res.status(500).json(err)
  });
});

module.exports = router;